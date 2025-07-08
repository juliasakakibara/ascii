class AsciiGifConverter {
  constructor(gifUrl) {
    this.gifUrl = gifUrl;
    this.gif = null;
    this.asciiFrames = [];
    this.currentFrame = 0;
    this.chars = "@%#*+=-:.  ";
    this.frameDelay = 100;
    this.lastFrameTime = 0;
    this.renderWidth = 0;
    this.renderHeight = 0;
    this.scaleFactor = 0.15;
    this.isProcessing = false;
    // Para armazenar deslocamentos animados dos caracteres
    this.charOffsets = [];
  }

  preload() {
    this.isProcessing = true;
    loadImage(this.gifUrl, (img) => {
      this.gif = img;
      this.processGifFrames();
      this.isProcessing = false;
    });
  }

  processGifFrames() {
    this.gif.play();
    this.gif.pause();
    this.asciiFrames = [];
    this.charOffsets = [];
    const scale = this.scaleFactor;
    const w = Math.floor(this.gif.width * scale);
    const h = Math.floor(this.gif.height * scale);
    for (let i = 0; i < this.gif.numFrames(); i++) {
      this.gif.setFrame(i);
      let frame = this.gif.get();
      frame.resize(w, h);
      frame.loadPixels();
      let ascii = [];
      let offsets = [];
      for (let y = 0; y < frame.height; y++) {
        let row = "";
        let rowOffsets = [];
        for (let x = 0; x < frame.width; x++) {
          const idx = 4 * (x + y * frame.width);
          const r = frame.pixels[idx] || 0;
          const g = frame.pixels[idx + 1] || 0;
          const b = frame.pixels[idx + 2] || 0;
          let bright = (r + g + b) / 3;
          const charIdx = Math.floor(map(bright, 0, 255, this.chars.length - 1, 0));
          row += this.chars[charIdx];
          rowOffsets.push({x: 0, y: 0}); // Inicializa deslocamento
        }
        ascii.push(row);
        offsets.push(rowOffsets);
      }
      this.asciiFrames.push(ascii);
      this.charOffsets.push(offsets);
    }
    this.frameDelay = this.gif.frameDelay || 100;
  }

  draw() {
    if (this.isProcessing) return;
    if (this.asciiFrames.length > 0) {
      background(24);
      const currentAsciiFrame = this.asciiFrames[this.currentFrame];
      const currentOffsets = this.charOffsets[this.currentFrame];
      if (currentAsciiFrame) {
        textFont("monospace");
        const rows = currentAsciiFrame.length;
        const columns = currentAsciiFrame[0].length;
        const maxTextWidth = width / columns;
        const maxTextHeight = height / rows;
        const textSizeValue = Math.min(maxTextWidth, maxTextHeight);
        textSize(textSizeValue);
        textAlign(LEFT, TOP);
        noStroke();
        const asciiWidth = columns * textSizeValue;
        const asciiHeight = rows * textSizeValue;
        const startX = (width - asciiWidth) / 2;
        const startY = (height - asciiHeight) / 2;
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < currentAsciiFrame[row].length; col++) {
            const char = currentAsciiFrame[row][col];
            // Repel effect
            const charX = startX + col * textSizeValue;
            const charY = startY + row * textSizeValue;
            const dx = mouseX - charX;
            const dy = mouseY - charY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            let targetOffsetX = 0, targetOffsetY = 0;
            const repelRadius = 100;
            if (dist < repelRadius) {
              const angle = Math.atan2(dy, dx);
              const repelDist = (repelRadius - dist) * 0.4;
              targetOffsetX = -Math.cos(angle) * repelDist;
              targetOffsetY = -Math.sin(angle) * repelDist;
            }
            // Interpolação suave (lerp)
            let prevOffset = currentOffsets[row][col];
            prevOffset.x = lerp(prevOffset.x, targetOffsetX, 0.15);
            prevOffset.y = lerp(prevOffset.y, targetOffsetY, 0.15);
            currentOffsets[row][col] = prevOffset;
            fill(255);
            text(
              char,
              charX + prevOffset.x,
              charY + prevOffset.y
            );
          }
        }
      }
    }
  }

  update() {
    if (this.isProcessing || this.asciiFrames.length === 0) return;
    const now = millis();
    if (now - this.lastFrameTime > this.frameDelay) {
      const nextFrame = (this.currentFrame + 1) % this.asciiFrames.length;
      // Copia offsets do frame atual para o próximo, se as dimensões forem iguais
      if (
        this.charOffsets[this.currentFrame].length === this.charOffsets[nextFrame].length &&
        this.charOffsets[this.currentFrame][0].length === this.charOffsets[nextFrame][0].length
      ) {
        for (let y = 0; y < this.charOffsets[this.currentFrame].length; y++) {
          for (let x = 0; x < this.charOffsets[this.currentFrame][y].length; x++) {
            this.charOffsets[nextFrame][y][x] = { ...this.charOffsets[this.currentFrame][y][x] };
          }
        }
      }
      this.currentFrame = nextFrame;
      this.lastFrameTime = now;
    }
  }
}

let gifConverter;

window.preload = function() {
  gifConverter = new AsciiGifConverter("fire.gif");
  gifConverter.preload();
};

window.setup = function() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
};

window.draw = function() {
  if (gifConverter) {
    gifConverter.update();
    gifConverter.draw();
  }
};

window.windowResized = function() {
  resizeCanvas(windowWidth, windowHeight);
};
