export class ZoomControls {
  constructor() {
    this.elements = {
      container: document.getElementById('zoom-controls'),
      status: document.querySelector('.zoom-status'),
      value: document.querySelector('.zoom-value'),
      track: document.querySelector('.zoom-track'),
      handle: document.querySelector('.zoom-handle'),
      fill: document.querySelector('.zoom-fill'),
      resetBtn: document.querySelector('.reset-zoom')
    }

    this.state = {
      isActive: false,
      minScale: 0.5,
      maxScale: 3,
      scale: 1
    }

    this.setupEventListeners()
  }

  setupEventListeners() {
    const { track, handle, resetBtn } = this.elements
    
    track.addEventListener('mousedown', this.handleTrackClick.bind(this))
    handle.addEventListener('mousedown', this.handleHandleGrab.bind(this))
    resetBtn.addEventListener('click', () => this.onReset?.())

    handle.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const delta = e.key === 'ArrowLeft' ? -0.1 : 0.1
        const { minScale, maxScale, scale } = this.state
        this.onZoom?.(Math.max(minScale, Math.min(maxScale, scale + delta)))
      }
    })
  }

  handleTrackClick(e) {
    if (e.target === this.elements.handle) return
    
    const rect = this.elements.track.getBoundingClientRect()
    const percentage = (e.clientX - rect.left) / rect.width
    const { minScale, maxScale } = this.state
    const newScale = minScale + percentage * (maxScale - minScale)
    
    this.onZoom?.(newScale)
  }

  handleHandleGrab(e) {
    e.stopPropagation()
    const startX = e.clientX
    
    const handleMouseMove = (e) => {
      const rect = this.elements.track.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const { minScale, maxScale } = this.state
      const newScale = minScale + percentage * (maxScale - minScale)
      this.onZoom?.(newScale)
    }
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  activate() {
    if (this.state.isActive) return
    
    const { container, status } = this.elements
    this.state.isActive = true
    container.classList.remove('inactive')
    status.textContent = 'Zoom Controls'
    
    gsap.to(container, {
      opacity: 1,
      duration: 0.3,
      ease: "power2.out"
    })
    
    this.updateUI()
  }

  deactivate() {
    const { container, status } = this.elements
    this.state.isActive = false
    container.classList.add('inactive')
    status.textContent = 'Click to activate controls'
    this.updateUI()
  }

  updateScale(scale) {
    this.state.scale = scale
    this.updateUI()
  }

  updateUI() {
    if (!this.state.isActive) return
    
    const { value, handle, fill } = this.elements
    const { scale, minScale, maxScale } = this.state
    
    value.textContent = `${scale.toFixed(1)}x`
    
    const percentage = (scale - minScale) / (maxScale - minScale)
    handle.style.left = `${percentage * 100}%`
    fill.style.width = `${percentage * 100}%`
    
    handle.setAttribute('aria-valuenow', scale.toFixed(1))
  }

  setCallbacks({ onZoom, onReset }) {
    this.onZoom = onZoom
    this.onReset = onReset
  }
}
