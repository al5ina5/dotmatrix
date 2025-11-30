# LED Dot Matrix Ticker

A realistic multi-line LED ticker display with static bulbs that only change their on/off state to create scrolling text.

## 🎯 Features

- **Fullscreen Static LED Grid** - LEDs fill entire viewport and stay fixed
- **Multi-line Support** - Display multiple independently scrolling text rows
- **Smart Layout** - Rows centered if they fit, cropped if screen is too small
- **Authentic Look** - All LEDs slightly visible when off (like real displays)
- **Click to Pause** - Click anywhere to pause/resume all rows
- **Per-Row Configuration** - Each row can have different text, speed, and spacing

## ⚙️ Configuration

All settings in **`/config/led.config.ts`**

### Basic Structure:

```typescript
export const LED_CONFIG = {
  // Display Hardware
  display: {
    dotSize: 20,          // LED bulb size
    dotColor: '#00ff00',  // LED color
    dotGap: 6,            // Space between LEDs
  },
  
  // Layout
  layout: {
    rowSpacing: 2,        // Space between text rows (in dots)
  },
  
  // Content (add as many rows as you want!)
  rows: [
    {
      pluginId: 'text',
      params: { content: 'First line of text' },
      stepInterval: 250,  // Scroll speed
      color: '#ff0000',   // Optional: Row color
      spacing: {
        betweenLetters: 1,
        betweenWords: 4,
        beforeRepeat: 12,
      }
    },
    // Add more rows...
  ]
}
```

## 📝 Adding More Rows

Copy-paste this block into the `rows` array:

```typescript
{
  pluginId: 'text',
  params: { content: 'YOUR MESSAGE' },
  stepInterval: 250,
  color: '#0099ff', // Optional color
  spacing: {
    betweenLetters: 1,
    betweenWords: 4,
    beforeRepeat: 12,
  }
},
```

## 📁 Project Structure

```
dotmatrix/
├── app/
│   └── page.tsx                       # Main page
├── components/
│   ├── MultiLineLEDTicker.tsx        # Multi-line container
│   ├── MultiLineLEDTicker.module.css
│   ├── LEDRow.tsx                     # Single row component
│   └── LEDRow.module.css
├── config/
│   └── led.config.ts                  # ⭐ EDIT HERE
└── lib/
    └── patterns.ts                     # Character patterns
```

## 🎨 Popular LED Colors

```typescript
dotColor: '#00ff00'  // Classic green
dotColor: '#ff0000'  // Red
dotColor: '#ffbf00'  // Amber
dotColor: '#0099ff'  // Blue
dotColor: '#ffffff'  // White
```

## 🚀 Getting Started

1. Edit `/config/led.config.ts`
2. Run `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)
4. Click anywhere to pause/resume

## 📐 Screen Behavior

- **Rows fit**: Content is vertically centered
- **Too many rows**: Cropped to show max that fits
- **All screens**: Full LED grid fills entire viewport
- **Responsive**: Automatically adjusts to window size

## 🔮 Future Extensions

The modular architecture supports easy additions:

```typescript
// Icons (future)
{ type: 'icon', name: 'arrow-right' }

// Custom symbols (future)
{ type: 'symbol', pattern: [[1,0,1], ...] }
```

## 💡 Examples

### Single Large Message (800x480 screen)
```typescript
rows: [
  {
    pluginId: 'text',
    params: { content: 'NOW OPEN' },
    stepInterval: 200,
    spacing: { betweenLetters: 1, betweenWords: 4, beforeRepeat: 12 }
  }
]
```

### Three Different Messages
```typescript
rows: [
  { pluginId: 'text', params: { content: 'WELCOME' }, stepInterval: 250, ... },
  { pluginId: 'text', params: { content: 'OPEN 24/7' }, stepInterval: 200, ... },
  { pluginId: 'text', params: { content: 'THANK YOU' }, stepInterval: 180, ... },
]
```
