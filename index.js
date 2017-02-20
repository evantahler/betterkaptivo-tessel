'use strict'

const fs = require('fs')
const path = require('path')
const request = require('request')
const av = require('tessel-av')

const TIMEOUT = 1000 * 5
const ENDPOINT = 'http://192.168.7.25:8080'
const UUID = fs.readFileSync(path.join(__dirname, '.uuid')).toString().trim()
const COMMANDFILE = path.join(__dirname, '.commandFile.json')
const IMAGE = path.join(__dirname, '.image.jpg')

const RUNNERS = {
  'slack': require('./runners/slack.js')
}

const camera = new av.Camera({
  width: 1280,
  height: 720,
  port: 8080
})

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

function main () {
  saveImage()

  log('checking server')

  let lastCommandId = loadLastCommandId()
  let url = `${ENDPOINT}/api/commands/next?deviceUuid=${UUID}&lastCommandId=${lastCommandId}`

  request.get(url, (error, response, body) => {
    if (error) { return logError(error) }
    if (!body) { return logError(new Error('no response from server')) }
    body = JSON.parse(body)
    log('response from server', body)
    if (body.name) { runCommand(body.command) }
  })
}

function saveImage () {
  // log('saving image to disk')
  let capture = camera.capture()
  let writeStream = fs.createWriteStream(IMAGE)
  capture.pipe(writeStream)
  capture.on('end', () => { log('image updated on disk') })
  capture.on('error', error => { logError(error) })
}

function loadLastCommandId () {
  try {
    let body = fs.readFileSync(COMMANDFILE)
    body = JSON.parse(body)
    return body.commandId
  } catch (error) {
    if (error.code !== 'ENOENT') { logError(error) }
    return 0
  }
}

function saveLastCommandId (commandId) {
  let body = JSON.stringify({
    commandId: commandId,
    updatedAt: new Date().getTime()
  })

  fs.writeFileSync(COMMANDFILE, body)
}

function runCommand (command) {
  saveLastCommandId(command.id)
  RUNNERS[command.name](IMAGE, command.params)
}

log('*** Starting ***')
log('uuid', UUID)
log('endpoint', ENDPOINT)
log('timeout', TIMEOUT)
saveImage()
setInterval(main, TIMEOUT)
