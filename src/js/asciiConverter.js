import { LoadingSpinner } from '../components/LoadingSpinner.js'
import { StatsWindow } from '../components/StatsWindow.js'
import { ZoomControls } from '../components/ZoomControls.js'
import { CanvasManager } from '../components/CanvasManager.js'
import { GifRenderer } from '../components/GifRenderer.js'

export class AsciiConverter {
  constructor(gifUrl) {
    this.gifUrl = gifUrl
    this.gif = null
    this.loadTimeout = null
    
    this.components = {
      spinner: new LoadingSpinner(),
      stats: new StatsWindow(),
      zoom: new ZoomControls(),
      canvas: new CanvasManager(),
      renderer: new GifRenderer()
    }
  }

  initialize() {
    this.components.canvas.initialize()
    this.setupComponentCallbacks()
    this.preload()
  }

  setupComponentCallbacks() {
    const { zoom, canvas, renderer } = this.components
    
    zoom.setCallbacks({
      onZoom: (scale) => {
        canvas.updateScale(scale)
        zoom.updateScale(scale)
      },
      onReset: () => {
        canvas.updateScale(1)
        zoom.updateScale(1)
      }
    })
    
    canvas.setCallbacks({
      onZoom: (scale) => {
        zoom.updateScale(scale)
        canvas.updateScale(scale)
      },
      onPan: (x, y) => {
        this.draw({ offsetX: x, offsetY: y })
      }
    })
  }

  async preload() {
    this.components.spinner.show('Loading GIF...')
    
    try {
      this.gif = await this.loadGif(this.gifUrl)
      await this.components.renderer.processGif(this.gif)
      this.components.spinner.hide()
    } catch (error) {
      console.error('Error loading GIF:', error)
      this.components.spinner.hide()
      alert('Error loading GIF. Please try another URL.')
    }
  }

  loadGif(url) {
    return new Promise((resolve, reject) => {
      try {
        const gif = loadImage(url, () => {
          if (this.loadTimeout) clearTimeout(this.loadTimeout)
          resolve(gif)
        }, reject)
      } catch (err) {
        reject(err)
      }
      
      if (this.loadTimeout) clearTimeout(this.loadTimeout)
      
      this.loadTimeout = setTimeout(() => {
        reject(new Error('GIF loading timeout'))
      }, 30000)
    })
  }

  draw({ offsetX = 0, offsetY = 0 } = {}) {
    const { renderer, canvas, stats } = this.components
    
    renderer.draw(canvas.ctx, {
      scale: canvas.state.scale,
      offsetX,
      offsetY
    })
    
    stats.update(renderer.getStats())
  }

  update() {
    this.components.renderer.update()
  }

  cleanup() {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout)
    }
    
    this.components.canvas.cleanup()
    this.components.zoom.deactivate()
    this.components.renderer.reset()
  }

  reset() {
    this.cleanup()
    this.preload()
  }

  set isColorMode(value) {
    this.components.renderer.setColorMode(value)
  }

  get asciiFrames() {
    return this.components.renderer.frames
  }

  get frameDelay() {
    return this.components.renderer.frameDelay
  }
}
