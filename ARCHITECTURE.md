# Multi-Line LED Architecture

## 📊 Component Structure

```
MultiLineLEDTicker (Container)
├── Static LED Grid (background - all dots dimmed)
│   └── Fills entire viewport with LED dots
│
└── Scrolling Rows (overlay)
    ├── LEDRow 1 (7 rows tall)
    ├── LEDRow 2 (7 rows tall)
    └── LEDRow 3 (7 rows tall)
```

## 🔄 How It Works

### 1. Static Grid Layer
- **Always visible**: Every dot position on screen
- **Always dimmed**: 0.08 opacity (realistic LED-off look)
- **Never moves**: Absolutely positioned grid

### 2. Scrolling Text Layer
- **Overlays the grid**: z-index above static grid
- **Only lights up dots**: Active dots at 1.0 opacity
- **Independent scrolling**: Each row has its own offset

### 3. Layering Effect
```
┌─────────────────────────────────┐
│ Static Grid (dim dots)          │  ← Layer 1
│  .  .  .  .  .  .  .  .  .  .  │
│  .  .  .  .  .  .  .  .  .  .  │
│  .  .  .  .  .  .  .  .  .  .  │
└─────────────────────────────────┘
         ↓ overlaid by ↓
┌─────────────────────────────────┐
│ Row 1: ●  ●  ●     ●  ●         │  ← Layer 2
│        ●     ●     ●     ●      │
│        ●  ●  ●     ●  ●         │
└─────────────────────────────────┘
```

Result: **Static** grid with **dynamic** lighting patterns!

## 📐 Screen Layout Logic

```typescript
// Calculate how many rows fit
const textRowHeight = 7;  // Each row is 7 LED rows
const spacingRows = Math.ceil(rowSpacing / cellSize);
const rowsPerTextRow = textRowHeight + spacingRows;
const maxTextRows = Math.floor(totalGridRows / rowsPerTextRow);

// Show rows (crop if needed)
const visibleRows = rows.slice(0, Math.min(maxTextRows, rows.length));

// Center vertically if they don't fill screen
const totalUsedRows = visibleRows.length * rowsPerTextRow;
const unusedRows = gridDimensions.totalRows - totalUsedRows;
const verticalOffset = Math.floor(unusedRows / 2) * cellSize;
```

## 🎨 Benefits of This Architecture

1. **True LED Effect**: Grid never moves, only lighting changes
2. **Modular**: Easy to add new row types (icons, symbols)
3. **Efficient**: Static grid rendered once
4. **Flexible**: Each row independently configurable
5. **Scalable**: Works on any screen size

## 🔮 Future Extensibility

### Adding Icons
```typescript
// Create an IconPlugin in plugins/icon.ts
export const IconPlugin: LEDPlugin = {
  id: 'icon',
  name: 'Icon Display',
  configSchema: [
    { key: 'iconName', label: 'Icon', type: 'select', options: [...] }
  ],
  fetch: async (params) => {
    return getIconPattern(params.iconName);
  }
};
```

### Adding Custom Symbols
```typescript
// Create a SymbolPlugin
{
  pluginId: 'symbol',
  params: {
    pattern: [
      [1, 0, 1, 0, 1],
      [0, 1, 0, 1, 0],
      // ... 7 rows total
    ]
  }
}
```

### Adding Effects
```typescript
{
  pluginId: 'text',
  params: { 
    content: 'FLASH',
    effect: 'blink'  // Future: blink, wave, ripple, etc.
  }
}
```
