export class CanvasManager {
  constructor() {
    this.state = {
      isGrabbed: false,
      mouseX: 0,
      mouseY: 0,
      grabStartX: 0,
      grabStartY: 0,
      grabOffsetX: 0,
      grabOffsetY: 0,
      scale: 1,
      maxScale: 3,
      grabbedMaxScale: 5,
      minScale: 0.5,
      sensitivity: 1.5
    }
  }

  initialize() {
    this.canvas = document.querySelector('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.setupEventListeners()
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
    document.addEventListener('mousemove', this.handleMouseMove.bind(this))
    document.addEventListener('mouseup', this.handleMouseUp.bind(this))
    document.addEventListener('wheel', this.handleWheel.bind(this), { passive: false })
  }

  handleMouseDown(e) {
    if (e.button !== 0) return
    
    this.state.isGrabbed = true
    this.canvas.classList.add('grabbing')
    
    const rect = this.canvas.getBoundingClientRect()
    this.state.grabStartX = e.clientX - rect.left
    this.state.grabStartY = e.clientY - rect.top
    this.state.grabOffsetX = this.state.mouseX
    this.state.grabOffsetY = this.state.mouseY

    const newScale = Math.min(this.state.scale * 1.5, this.state.grabbedMaxScale)
    this.onZoom?.(newScale)
  }

  handleMouseMove(e) {
    if (!e.target.matches('canvas') && !this.state.isGrabbed) return
    
    const rect = this.canvas.getBoundingClientRect()
    
    if (this.state.isGrabbed) {
      const dragX = (e.clientX - rect.left - this.state.grabStartX) / rect.width
      const dragY = (e.clientY - rect.top - this.state.grabStartY) / rect.height
      
      const targetX = this.state.grabOffsetX - dragX
      const targetY = this.state.grabOffsetY - dragY
      
      const maxPan = 0.5 + (this.state.scale - 1) * 0.3
      this.state.mouseX = Math.max(-maxPan, Math.min(maxPan, targetX))
      this.state.mouseY = Math.max(-maxPan, Math.min(maxPan, targetY))
      
      this.onPan?.(this.state.mouseX, this.state.mouseY)
    } else {
      const targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.5
      const targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.5
      
      gsap.to(this.state, {
        mouseX: targetX,
        mouseY: targetY,
        duration: 0.3,
        ease: "power2.out",
        onUpdate: () => this.onPan?.(this.state.mouseX, this.state.mouseY)
      })
    }
  }

  handleMouseUp() {
    if (!this.state.isGrabbed) return
    
    this.state.isGrabbed = false
    this.canvas.classList.remove('grabbing')
    
    const newScale = Math.max(1, this.state.scale * 0.8)
    this.onZoom?.(newScale)
    
    const currentX = this.state.mouseX
    const currentY = this.state.mouseY
    gsap.to(this.state, {
      mouseX: currentX * 0.5,
      mouseY: currentY * 0.5,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => this.onPan?.(this.state.mouseX, this.state.mouseY)
    })
  }

  handleWheel(e) {
    if (!e.target.matches('canvas')) return
    
    e.preventDefault()
    
    const delta = -Math.sign(e.deltaY) * 0.1
    const maxAllowedScale = this.state.isGrabbed ? this.state.grabbedMaxScale : this.state.maxScale
    
    const panDistance = Math.sqrt(this.state.mouseX ** 2 + this.state.mouseY ** 2)
    const minScale = Math.max(this.state.minScale, 1 - panDistance)
    
    const newScale = Math.max(minScale, Math.min(maxAllowedScale, this.state.scale + delta))
    this.onZoom?.(newScale)
    
    if (newScale <= 1) {
      gsap.to(this.state, {
        mouseX: 0,
        mouseY: 0,
        duration: 0.3,
        ease: "power2.out",
        onUpdate: () => this.onPan?.(this.state.mouseX, this.state.mouseY)
      })
    }
  }

  updateScale(scale) {
    this.state.scale = scale
  }

  setCallbacks({ onZoom, onPan }) {
    this.onZoom = onZoom
    this.onPan = onPan
  }

  cleanup() {
    if (this.canvas) {
      this.canvas.classList.remove('grabbing')
    }
    gsap.killTweensOf(this.state)
  }
}
