# LED Ticker - Quick Reference

## 🎯 Where to Make Changes

### Want to change text, colors, or add more rows?
**Edit this file:** `/config/led.config.ts`

```typescript
export const LED_CONFIG = {
  // Display Hardware Settings
  display: {
    dotSize: 20,           // ← LED size
    dotColor: '#00ff00',   // ← LED color
    dotGap: 6,             // ← Space between LEDs
  },
  
  // Layout Settings
  layout: {
    rowSpacing: 20,        // ← Vertical space between rows
  },
  
  // Content Rows (add as many as you want!)
  rows: [
    {
      type: 'text',
      content: 'First line',     // ← Your text
      stepInterval: 250,          // ← Speed (lower = faster)
      spacing: {
        betweenLetters: 1,
        betweenWords: 4,
        beforeRepeat: 12,
      }
    },
    // Add more rows here! Copy-paste the block above
  ]
}
```

## 📝 How to Add a New Row

Just copy-paste this into the `rows` array:

```typescript
{
  type: 'text',
  content: 'YOUR MESSAGE HERE',
  stepInterval: 250,
  spacing: {
    betweenLetters: 1,
    betweenWords: 4,
    beforeRepeat: 12,
  }
},
```

## 🎨 Quick Color Changes

Replace `dotColor` with:
- Green: `'#00ff00'`
- Red: `'#ff0000'`
- Amber: `'#ffbf00'`
- Blue: `'#0099ff'`
- White: `'#ffffff'`

## ⚡ Quick Speed Changes

Adjust `stepInterval` for each row:
- Slow: `300`
- Normal: `150`
- Fast: `75`

## 📐 Screen Layout

- **Rows fit on screen**: Automatically centered
- **Too many rows**: Automatically cropped (shows as many as fit)
- **Full screen**: Static LED grid fills entire viewport
- **Click anywhere**: Pause/resume all rows

## 🎯 That's it!

Everything you need is in `/config/led.config.ts` 🎉
