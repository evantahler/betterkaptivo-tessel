'use strict'

const fs = require('fs')
const path = require('path')
const tessel = require('tessel')
const av = require('tessel-av')
const Slack = require('node-slack-upload')
const config = require(path.join(__dirname, 'config.json'))
const ImagePath = path.join(__dirname, 'image.jpg')

const camera = new av.Camera({
  width: config.camera.width,
  height: config.camera.height,
  port: 8080
})

let uploading = false

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
  log('saving image to disk')

  let capture = camera.capture()
  let writeStream = fs.createWriteStream(ImagePath)
  capture.pipe(writeStream)

  capture.on('end', () => {
    log('image saved to disk')
    return callback()
  })

  capture.on('error', error => {
    logError(error)
  })
}

function uploadImage (callback) {
  slack.uploadFile({
    file: fs.createReadStream(ImagePath),
    filetype: 'jpg',
    title: `whiteboard @ ${new Date()}`,
    channels: config.channels
  }, function (error, data) {
    if (error) {
      logError(error)
    } else {
      log('Uploaded to Slack!')
    }
    callback()
  })
}

let buttonTimer
function checkButtons () {
  clearTimeout(buttonTimer)

  let counter = 0
  let groups = ['A', 'B']
  let pins = [0, 1, 2, 3, 4, 5, 6, 7]

  if (uploading === true) {
    buttonTimer = setTimeout(checkButtons, 1000)
    return
  }

  groups.forEach((group) => {
    pins.forEach((pinId) => {
      counter++
      let pin = tessel.port[group].pin[pinId]
      pin.read((error, value) => {
        counter--
        if (error) { logError(error) }
        if (value === 0) { buttonPress(group, pinId) }
        if (counter === 0) { buttonTimer = setTimeout(checkButtons, 100) }
      })
    })
  })
}

function buttonPress (group, pinId) {
  uploading = true
  log(`press ${group}#${pinId}`)

  saveImage(() => {
    uploadImage(() => {
      uploading = false
    })
  })
}

// blink to show that the app is running
let lightTimer
function statusLights () {
  clearTimeout(lightTimer)
  tessel.led[2].toggle()
  if (uploading === true) {
    lightTimer = setTimeout(statusLights, 200)
  } else {
    lightTimer = setTimeout(statusLights, 1000)
  }
}

log('*** Starting ***')

statusLights()
checkButtons()
