# LED Dot Matrix Ticker

A realistic LED ticker display with static bulbs that only change their on/off state to create the scrolling effect.

## 🎯 Features

- **Static LED Grid** - LED bulbs are fixed in position, only their state changes
- **Authentic Look** - All LEDs are slightly visible when off (like real LED displays)
- **Click to Pause** - Click anywhere on the display to pause/resume
- **Fully Customizable** - Easy configuration for colors, sizing, speed, and spacing

## ⚙️ Configuration

All settings are managed in **`/config/led.config.ts`**

### Available Settings:

```typescript
{
  text: 'Your message here',    // The text to display
  dotSize: 10,                   // LED bulb size in pixels
  dotColor: '#00ff00',           // LED color (hex)
  dotGap: 3,                     // Space between LEDs in pixels
  stepInterval: 150,             // Scroll speed in ms (lower = faster)
  
  spacing: {
    betweenLetters: 1,           // Dots between letters
    betweenWords: 4,             // Dots for word spaces  
    beforeRepeat: 12,            // Dots before text repeats
  }
}
```

## 📁 Project Structure

```
dotmatrix/
├── app/
│   └── page.tsx              # Main page (don't modify - uses config)
├── components/
│   ├── StaticLEDTicker.tsx   # Main LED ticker component
│   └── StaticLEDTicker.module.css
├── config/
│   └── led.config.ts         # ⭐ EDIT THIS FILE for all settings
└── lib/
    └── patterns.ts            # Character dot patterns (5x7 grid)
```

## 🎨 Popular Color Schemes

Try these classic LED colors in `led.config.ts`:

- Green: `'#00ff00'` (classic)
- Red: `'#ff0000'`
- Amber: `'#ffbf00'`
- Blue: `'#0099ff'`
- White: `'#ffffff'`
- Purple: `'#9d00ff'`

## 🚀 Getting Started

1. Edit `/config/led.config.ts` to customize your ticker
2. Run `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)
4. Click anywhere to pause/resume

## 📝 How It Works

Unlike traditional scrolling tickers that move the text, this implementation:

1. Creates a fixed grid of LED bulbs covering the viewport
2. Calculates which LEDs should be "on" based on the text pattern and scroll offset
3. Steps the offset at regular intervals
4. Only updates the on/off state of LEDs (no physical movement)

This creates an authentic LED display effect where the hardware (LEDs) is static and only the lighting pattern changes.
