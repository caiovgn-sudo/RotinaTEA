const fs = require('fs');
const path = require('path');

// Create a simple 512x512 PNG using a minimal approach
// This creates a basic PNG with the TEA text on a gradient background

// Simple PNG generator for a 512x512 icon
function createPNG(width, height) {
  // Create a canvas-like buffer
  // We'll create a simple solid color PNG with text using a minimal approach
  // For simplicity, we'll create a basic valid PNG file
  
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // Helper to create chunks
  function createChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeBuf = Buffer.from(type);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }
  
  // Simple CRC32
  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c;
    }
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: truecolor
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk('IHDR', ihdrData);
  
  // Create image data (simple gradient background with TEA text would be complex)
  // For now, create a simple solid color image data
  const rowSize = width * 3 + 1; // 3 bytes per pixel + filter byte
  const imgData = Buffer.alloc(rowSize * height);
  
  // Fill with gradient-like color (brownish #8B6F47)
  for (let y = 0; y < height; y++) {
    imgData[y * rowSize] = 0; // filter type: none
    for (let x = 0; x < width; x++) {
      const idx = y * rowSize + 1 + x * 3;
      // Simple gradient
      const r = Math.floor(139 * (1 - y / height) + 166 * (y / height));
      const g = Math.floor(111 * (1 - y / height) + 138 * (y / height));
      const b = Math.floor(71 * (1 - y / height) + 100 * (y / height));
      imgData[idx] = r;
      imgData[idx + 1] = g;
      imgData[idx + 2] = b;
    }
  }
  
  // Compress with zlib (deflate)
  const zlib = require('zlib');
  const idatData = zlib.deflateSync(imgData);
  const idat = createChunk('IDAT', idatData);
  
  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Generate icons
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating PWA icons...');
for (const size of sizes) {
  const png = createPNG(size, size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.png`), png);
  console.log(`  Generated icon-${size}.png`);
}

console.log('Done!');