export class GifRenderer {
  constructor() {
    this.chars = "@%#*+=-:. "
    this.frameDelay = 100
    this.lastFrameTime = 0
    this.currentFrame = 0
    this.frames = []
    this.dimensions = { width: 0, height: 0 }
    this.isColorMode = false
    this.isProcessing = false
    this.startTime = window.millis()
  }

  async processGif(gif) {
    this.isProcessing = true
    this.frames = []
    this.currentFrame = 0
    this.startTime = window.millis()

    try {
      const frames = await this.extractFrames(gif)
      this.frameDelay = gif.frameDelay || 100
      
      for (const frame of frames) {
        const asciiFrame = this.convertToAscii(frame)
        this.frames.push(asciiFrame)
      }
      
      this.dimensions = {
        width: this.frames[0][0].length,
        height: this.frames[0].length
      }
      
      this.isProcessing = false
      return true
    } catch (error) {
      console.error('Error processing GIF:', error)
      this.isProcessing = false
      return false
    }
  }

  extractFrames(gif) {
    return new Promise((resolve) => {
      const frames = []
      gif.play()
      gif.pause()
      
      const totalFrames = gif.numFrames()
      for (let i = 0; i < totalFrames; i++) {
        gif.setFrame(i)
        const frame = gif.get()
        frames.push(frame)
      }
      gif.play()
      resolve(frames)
    })
  }

  convertToAscii(img) {
    const scaleFactor = 0.1
    const asciiWidth = Math.floor(img.width * scaleFactor)
    const asciiHeight = Math.floor(img.height * scaleFactor)
    
    img.resize(asciiWidth, asciiHeight)
    img.loadPixels()
    
    const asciiFrame = []
    for (let y = 0; y < img.height; y++) {
      const row = []
      for (let x = 0; x < img.width; x++) {
        const index = 4 * (x + y * img.width)
        const r = img.pixels[index] || 0
        const g = img.pixels[index + 1] || 0
        const b = img.pixels[index + 2] || 0
        const brightness = (r + g + b) / 3
        
        const charIndex = window.floor(window.map(brightness, 0, 255, this.chars.length - 1, 0))
        row.push(this.chars[charIndex])
      }
      asciiFrame.push(row)
    }
    
    return asciiFrame
  }

  draw(ctx, { scale = 1, offsetX = 0, offsetY = 0 } = {}) {
    if (this.isProcessing || !this.frames.length) return
    
    window.background(0)
    window.push()
    window.translate(window.width/2, window.height/2)
    window.scale(scale)
    window.translate(-window.width/2, -window.height/2)
    
    if (scale > 1) {
      const sensitivity = 1.5
      window.translate(offsetX * window.width * sensitivity * (scale - 1) / scale, 
                offsetY * window.height * sensitivity * (scale - 1) / scale)
    }

    const frame = this.frames[this.currentFrame]
    if (frame) this.drawFrame(ctx, frame)
    
    window.pop()
  }

  drawFrame(ctx, frame) {
    window.textFont("monospace")
    const rows = frame.length
    const columns = frame[0].length
    const maxTextWidth = window.width / columns
    const maxTextHeight = window.height / rows
    const textSizeValue = Math.min(maxTextWidth, maxTextHeight)
    window.textSize(textSizeValue)
    window.textAlign(window.LEFT, window.TOP)
    window.noStroke()
    
    const asciiWidth = columns * textSizeValue
    const asciiHeight = rows * textSizeValue
    const startX = (window.width - asciiWidth) / 2
    const startY = (window.height - asciiHeight) / 2
    
    frame.forEach((row, i) => {
      [...row].forEach((char, j) => {
        const brightness = this.getCharBrightness(char)
        window.fill(this.isColorMode 
          ? [brightness, 255 - brightness, brightness]
          : 255)
        window.text(char, startX + j * textSizeValue, startY + i * textSizeValue)
      })
    })
  }

  getCharBrightness(char) {
    return window.map(this.chars.indexOf(char), 0, this.chars.length - 1, 0, 255)
  }

  update() {
    if (this.isProcessing || !this.frames.length) return
    
    const currentTime = window.millis()
    if (currentTime - this.lastFrameTime >= this.frameDelay) {
      this.currentFrame = (this.currentFrame + 1) % this.frames.length
      this.lastFrameTime = currentTime
    }
  }

  getStats() {
    return {
      currentFrame: this.currentFrame,
      totalFrames: this.frames.length,
      frameDelay: this.frameDelay,
      startTime: this.startTime,
      dimensions: this.dimensions
    }
  }

  setColorMode(enabled) {
    this.isColorMode = enabled
  }

  reset() {
    this.frames = []
    this.currentFrame = 0
    this.isProcessing = false
    this.startTime = window.millis()
  }
}
