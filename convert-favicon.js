const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function convertSvgToPng(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(0, 0, size, size);
    
    // Draw @ symbol
    ctx.fillStyle = 'white';
    ctx.font = `${Math.floor(size * 0.75)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('@', size/2, size/2);
    
    return canvas;
}

async function generateIcons() {
    const sizes = {
        'favicon-16x16.png': 16,
        'favicon-32x32.png': 32,
        'apple-touch-icon.png': 180
    };
    
    for (const [filename, size] of Object.entries(sizes)) {
        const canvas = await convertSvgToPng(size);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(filename, buffer);
        console.log(`Generated ${filename}`);
    }
}

generateIcons().catch(console.error);
