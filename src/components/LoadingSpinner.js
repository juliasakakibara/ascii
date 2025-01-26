export class LoadingSpinner {
  constructor() {
    this.element = document.getElementById('loading-overlay')
    this.messageEl = this.element.querySelector('p')
  }

  show(message = 'Processing...') {
    this.messageEl.textContent = message
    this.element.classList.remove('hidden')
  }

  hide() {
    this.element.classList.add('hidden')
  }
}
