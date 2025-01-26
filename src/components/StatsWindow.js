export class StatsWindow {
  constructor() {
    this.elements = {
      currentFrame: document.getElementById('current-frame'),
      totalFrames: document.getElementById('total-frames'),
      frameTime: document.getElementById('frame-time'),
      elapsedTime: document.getElementById('elapsed-time'),
      resolution: document.getElementById('resolution')
    }
  }

  update({ currentFrame, totalFrames, frameDelay, startTime, dimensions }) {
    const { currentFrame: currentEl, totalFrames: totalEl, 
            frameTime: frameEl, elapsedTime: elapsedEl, 
            resolution: resolutionEl } = this.elements

    currentEl.textContent = currentFrame + 1
    totalEl.textContent = totalFrames
    frameEl.textContent = frameDelay
    elapsedEl.textContent = Math.floor((millis() - startTime) / 1000)
    resolutionEl.textContent = `${dimensions.width}x${dimensions.height}`
  }
}
