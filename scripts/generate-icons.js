#!/usr/bin/env node

/**
 * Generate PWA Icons
 * 
 * This script generates the required PWA icons for the app.
 * Run with: node scripts/generate-icons.js
 * 
 * Requirements: Install sharp
 * npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is installed
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Sharp is not installed. Install it with: npm install sharp');
  process.exit(1);
}

const sizes = [192, 512];
const publicDir = path.join(__dirname, '..', 'public');

// Create a simple LED matrix icon using SVG
const createSVGIcon = (size) => {
  const dotSize = Math.floor(size / 8);
  const gap = Math.floor(dotSize / 4);
  const color = '#00ff00';
  
  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${size}" height="${size}" fill="#000000"/>`;
  
  // Create LED dot pattern (5x7 character grid)
  const gridRows = 7;
  const gridCols = 5;
  const startX = (size - (gridCols * dotSize + (gridCols - 1) * gap)) / 2;
  const startY = (size - (gridRows * dotSize + (gridRows - 1) * gap)) / 2;
  
  // Simple "D" pattern for DotMatrix
  const pattern = [
    [1, 1, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 0, 0],
  ];
  
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const x = startX + col * (dotSize + gap);
      const y = startY + row * (dotSize + gap);
      const opacity = pattern[row][col] === 1 ? 1 : 0.08;
      
      svg += `<circle cx="${x + dotSize/2}" cy="${y + dotSize/2}" r="${dotSize/2}" fill="${color}" opacity="${opacity}"/>`;
    }
  }
  
  svg += '</svg>';
  return Buffer.from(svg);
};

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');
  
  for (const size of sizes) {
    const svgBuffer = createSVGIcon(size);
    const outputPath = path.join(publicDir, `icon-${size}.png`);
    
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated: icon-${size}.png`);
    } catch (error) {
      console.error(`❌ Error generating icon-${size}.png:`, error.message);
    }
  }
  
  console.log('\n✨ Done! Icons generated in /public/');
  console.log('📱 Your PWA is ready to install!');
}

generateIcons().catch(console.error);


