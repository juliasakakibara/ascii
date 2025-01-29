export class StatsWindow {
  constructor() {
    this.elements = {
      window: document.getElementById('stats-window'),
      currentFrame: document.getElementById('current-frame'),
      totalFrames: document.getElementById('total-frames'),
      frameTime: document.getElementById('frame-time'),
      elapsedTime: document.getElementById('elapsed-time'),
      resolution: document.getElementById('resolution')
    }

    this.isMobile = window.matchMedia('(max-width: 768px)').matches
    this.setupMobileToggle()
    this.setupMediaQueryListener()
  }

  setupMobileToggle() {
    if (this.isMobile) {
      const toggleButton = document.createElement('button')
      toggleButton.id = 'stats-toggle'
      toggleButton.innerHTML = '📊'
      toggleButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 70px;
        background: #3182ce;
        color: white;
        border: none;
        border-radius: 8px;
        width: 36px;
        height: 36px;
        font-size: 16px;
        cursor: pointer;
        z-index: 90;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        transition: transform 0.3s ease, background-color 0.3s ease;
      `
      document.body.appendChild(toggleButton)

      toggleButton.addEventListener('click', () => {
        this.elements.window.classList.toggle('visible')
      })
    }
  }

  setupMediaQueryListener() {
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    mediaQuery.addEventListener('change', (e) => {
      this.isMobile = e.matches
      const toggleButton = document.getElementById('stats-toggle')
      
      if (this.isMobile && !toggleButton) {
        this.setupMobileToggle()
      } else if (!this.isMobile && toggleButton) {
        toggleButton.remove()
        this.elements.window.classList.remove('visible')
      }
    })
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
