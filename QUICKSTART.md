# LED Ticker - Quick Reference

## 🎯 Where to Make Changes

### Want to change the text, colors, or speed?
**Edit this file:** `/config/led.config.ts`

```typescript
export const LED_CONFIG = {
  text: 'Your message here',     // ← Change your message
  dotSize: 10,                    // ← Make LEDs bigger/smaller
  dotColor: '#00ff00',            // ← Change LED color
  dotGap: 3,                      // ← Adjust spacing between LEDs
  stepInterval: 150,              // ← Speed (lower = faster)
  
  spacing: {
    betweenLetters: 1,            // ← Dots between letters
    betweenWords: 4,              // ← Dots between words
    beforeRepeat: 12,             // ← Gap before text loops
  }
}
```

## 📂 File Overview

| File | Purpose | Should You Edit? |
|------|---------|------------------|
| `/config/led.config.ts` | **All settings** | ✅ **YES** - Edit this! |
| `/app/page.tsx` | Main page | ❌ No need (uses config) |
| `/components/StaticLEDTicker.tsx` | LED component | ❌ No (works automatically) |
| `/lib/patterns.ts` | Character shapes | ⚠️ Only for custom fonts |

## 🎨 Quick Color Changes

Replace `dotColor` in config with:
- Classic green: `'#00ff00'`
- Red: `'#ff0000'`
- Amber: `'#ffbf00'`
- Blue: `'#0099ff'`
- White: `'#ffffff'`

## ⚡ Quick Speed Changes

Adjust `stepInterval` in config:
- Slow: `300`
- Normal: `150`
- Fast: `75`
- Very fast: `50`

## 🎯 That's it!

Everything you need is in `/config/led.config.ts` 🎉
