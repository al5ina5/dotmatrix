# PWA Icons

## Quick Setup (2 options)

### Option 1: Use Online Converter (Easiest)
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `/public/icon.svg`
3. Convert to PNG at 192x192 → Save as `icon-192.png`
4. Convert to PNG at 512x512 → Save as `icon-512.png`
5. Place both files in `/public/`

### Option 2: Use Node Script (Automated)
```bash
npm install sharp
node scripts/generate-icons.js
```

### Option 3: Use ImageMagick (Command Line)
```bash
# Install ImageMagick
brew install imagemagick  # macOS
# sudo apt install imagemagick  # Linux

# Convert
convert -background none -size 192x192 icon.svg icon-192.png
convert -background none -size 512x512 icon.svg icon-512.png
```

## Current Status

✅ SVG icon created (`icon.svg`)  
⚠️ Need PNG conversions:
  - `icon-192.png` (192x192)
  - `icon-512.png` (512x512)

## The App Will Work Without Icons

The PWA will function without icons, but:
- Won't show an icon when installing
- Some platforms may refuse installation
- Browser will use default favicon

## Custom Icons

Want a different design? Edit `icon.svg` or create your own:

**Requirements:**
- Black background (#000000)
- Size: 512x512 (will be scaled down)
- Format: PNG with transparency
- Design: Simple, recognizable at small sizes

**Recommended:**
- LED matrix pattern (like current design)
- High contrast (bright color on black)
- Centered design
- No text (too small to read)



