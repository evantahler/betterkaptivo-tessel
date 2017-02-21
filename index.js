'use strict'

const fs = require('fs')
const path = require('path')
const tessel = require('tessel')
const av = require('tessel-av')
const Slack = require('node-slack-upload')
const LEDTimeout = 1000
const config = require(path.join(__dirname, 'config.json'))
const ImagePath = path.join(__dirname, '.image.jpg')

const camera = new av.Camera({
  width: 1280,
  height: 720,
  port: 8080
})

let slack = new Slack(config.slackToken)

function log (message, payload) {
  if (payload) {
    console.log(`${new Date()} | ${message}`, payload)
  } else {
    console.log(`${new Date()} | ${message}`)
  }
}

function logError (message) {
  console.error(`[ERROR] ${new Date()} | ${message}`)
}

function saveImage (callback) {
  // log('saving image to disk')
  let capture = camera.capture()
  let writeStream = fs.createWriteStream(ImagePath)
  capture.pipe(writeStream)
  capture.on('end', () => {
    log('image updated on disk')
    return callback()
  })

  capture.on('error', error => {
    logError(error)
  })
}

function uploadImage () {
  slack.uploadFile({
    file: fs.createReadStream(ImagePath),
    filetype: 'jpg',
    title: `whiteboard @ ${new Date()}`,
    channels: config.channels
  }, function (error, data) {
    if (error) {
      logError(error)
    } else {
      log('Uploaded file details', data)
    }
  })
}

function checkButtons () {
  let counter = 0
  let groups = ['A', 'B']
  groups.forEach((group) => {
    [0, 1, 2, 3, 4, 5, 6, 7].forEach((pinId) => {
      counter++
      let pin = tessel.port[group].pin[pinId]
      pin.read((error, value) => {
        counter--
        if (error) { logError(error) }
        if (value === 1) { buttonPress(group, pinId) }
        if (counter === 0) { checkButtons() }
      })
    })
  })
}

function buttonPress (group, pinId) {
  log(`press ${group}#${pinId}`)

  saveImage(() => {
    uploadImage()
  })
}

log('*** Starting ***')

setInterval(() => {
  // blink to show that the app is running
  tessel.led[2].toggle()
}, LEDTimeout)

buttonPress('x', 'x')
// checkButtons()
