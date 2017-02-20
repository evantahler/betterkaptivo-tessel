'use strict'

const fs = require('fs')
const av = require('tessel-av')
const IMAGE = './image.jpg'
const camera = new av.Camera({
  width: 1280,
  height: 720
})

function saveImage () {
  console.log('saving image to disk')
  let capture = camera.capture()
  let writeStream = fs.createWriteStream(IMAGE)
  capture.pipe(writeStream)
  capture.on('end', () => { console.log('image saved') })
  capture.on('error', error => { console.error(error) })
}

saveImage()
