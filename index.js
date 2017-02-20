'use strict'

const fs = require('fs')
const path = require('path')
const request = require('request')
const av = require('tessel-av')

const TIMEOUT = 1000 * 5
const ENDPOINT = 'http://192.168.7.25:8080'
const UUID = fs.readFileSync(path.join(__dirname, '.uuid')).toString().trim()
const IMAGE = path.join(__dirname, '.image.jpg')

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
  saveImage(() => {
    log('uploading latest image')
    let url = `${ENDPOINT}/api/device/upload`

    request.post({
      url: url,
      formData: {
        file: fs.createReadStream(IMAGE),
        deviceUuid: UUID
      }
    }, (error, response, body) => {
      if (error) { return logError(error) }
      if (!body) { return logError(new Error('no response from server')) }
      body = JSON.parse(body)
      log('response from server', body)
      setTimeout(main, TIMEOUT)
    })
  })
}

function saveImage (callback) {
  // log('saving image to disk')
  let capture = camera.capture()
  let writeStream = fs.createWriteStream(IMAGE)
  capture.pipe(writeStream)
  capture.on('end', () => {
    log('image updated on disk')
    return callback()
  })

  capture.on('error', error => {
    logError(error)
    return callback()
  })
}

log('*** Starting ***')
log('uuid', UUID)
log('endpoint', ENDPOINT)
log('timeout', TIMEOUT)

main()
