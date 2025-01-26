import { LoadingSpinner } from '../components/LoadingSpinner.js'

export class DownloadHandler {
  constructor(asciiConverter) {
    this.converter = asciiConverter
    this.spinner = new LoadingSpinner()
    
    this.elements = {
      button: document.getElementById('download-button'),
      dropdown: document.getElementById('download-dropdown'),
      options: document.querySelectorAll('.download-option')
    }
    
    this.setupEventListeners()
  }
  
  setupEventListeners() {
    const { button, dropdown, options } = this.elements
    
    button.addEventListener('click', () => {
      dropdown.classList.toggle('hidden')
      button.setAttribute('aria-expanded', !dropdown.classList.contains('hidden'))
    })

    options.forEach(option => {
      option.addEventListener('click', async (event) => {
        const format = event.target.getAttribute('data-type')
        dropdown.classList.add('hidden')
        button.setAttribute('aria-expanded', 'false')
        await this.handleDownload(format)
      })
    })

    document.addEventListener('click', (event) => {
      if (!button.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden')
        button.setAttribute('aria-expanded', 'false')
      }
    })
  }

  async handleDownload(format) {
    this.spinner.show('Preparing download...')
    try {
      switch (format) {
        case 'gif': await this.downloadGif(); break
        case 'ascii': await this.downloadAscii(); break
        case 'json': await this.downloadJson(); break
        case 'csv': await this.downloadCsv(); break
        case 'canvas': await this.downloadCanvas(); break
        default: console.error('Unknown format:', format)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Error during export. Please try again.')
    } finally {
      this.spinner.hide()
    }
  }

  downloadGif() {
    return new Promise((resolve, reject) => {
      try {
        const { asciiFrames, frameDelay } = this.converter
        const [rows, columns] = [asciiFrames[0].length, asciiFrames[0][0].length]
        const aspectRatio = columns / rows
        
        const [exportWidth, exportHeight] = this.calculateExportDimensions(aspectRatio)
        const gif = this.createGif(exportWidth, exportHeight)
        const tempCanvas = this.createTempCanvas(exportWidth, exportHeight)
        const ctx = tempCanvas.getContext('2d')
        
        const charSize = Math.min(exportWidth / columns, exportHeight / rows)
        ctx.font = `${Math.floor(charSize)}px monospace`
        ctx.textBaseline = 'top'
        
        const [startX, startY] = this.calculateStartPosition(columns, rows, charSize, exportWidth, exportHeight)

        asciiFrames.forEach(frame => {
          this.renderFrameToCanvas(ctx, frame, startX, startY, charSize, exportWidth, exportHeight)
          gif.addFrame(tempCanvas, { delay: Math.round(frameDelay), copy: true })
        })

        gif.on('finished', blob => {
          saveAs(blob, 'ascii-animation.gif')
          resolve()
        })

        gif.on('error', error => reject(new Error('Failed to generate GIF')))
        gif.render()
      } catch (error) {
        reject(error)
      }
    })
  }

  createGif(width, height) {
    return new GIF({
      workers: 2,
      quality: 10,
      width,
      height,
      workerScript: window.gifWorkerPath
    })
  }

  createTempCanvas(width, height) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
  }

  calculateExportDimensions(aspectRatio) {
    return aspectRatio > 1
      ? [1200, Math.round(1200 / aspectRatio)]
      : [Math.round(1200 * aspectRatio), 1200]
  }

  calculateStartPosition(columns, rows, charSize, width, height) {
    const startX = (width - (columns * charSize)) / 2
    const startY = (height - (rows * charSize)) / 2
    return [startX, startY]
  }

  renderFrameToCanvas(ctx, frame, startX, startY, charSize, width, height) {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = 'white'
    
    frame.forEach((row, i) => {
      const y = startY + (i * charSize)
      for (let j = 0; j < row.length; j++) {
        const x = startX + (j * charSize)
        ctx.fillText(row[j], x, y)
      }
    })
  }

  async downloadAscii() {
    const asciiText = this.converter.asciiFrames
      .map(frame => frame.join('\n'))
      .join('\n\n')
    const blob = new Blob([asciiText], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'ascii-animation.txt')
  }

  async downloadJson() {
    const blob = new Blob(
      [JSON.stringify(this.converter.asciiFrames, null, 2)], 
      { type: 'application/json;charset=utf-8' }
    )
    saveAs(blob, 'ascii-frames.json')
  }

  async downloadCsv() {
    const csvContent = this.converter.asciiFrames
      .map(frame => frame.join(','))
      .join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, 'ascii-frames.csv')
  }

  async downloadCanvas() {
    const canvas = document.querySelector('canvas')
    canvas.toBlob(blob => saveAs(blob, 'ascii-canvas.png'))
  }
}
