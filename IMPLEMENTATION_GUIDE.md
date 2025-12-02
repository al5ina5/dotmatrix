# Two-Tier Screen Architecture - Implementation Guide

## Overview

This guide explains how to implement the two-tier screen architecture that supports:
- **Fullscreen effects** (matrix rain, particles, etc.)
- **Multi-line text displays** (current row system)
- **Single-line text displays**

## Architecture Decision: Why Two Tiers?

### Option 1: Row-Level Effects (Rejected)
❌ **Problems:**
- Fullscreen effects don't fit the row model
- Can't layer effects behind text
- Complex to manage effect state per row

### Option 2: Two-Tier System (✅ Chosen)
✅ **Benefits:**
- Clean separation: effects vs content
- Flexible layering (z-index)
- Easy to add new effect types
- Backward compatible with existing configs

## Implementation Steps

### Phase 1: Type System (✅ DONE)

Files created:
- `types/screen.ts` - Screen configuration types
- `plugins/types.ts` - Extended with `FullscreenPlugin` interface
- `lib/screenMigration.ts` - Migration utilities

### Phase 2: Update Config Context

**File:** `context/ConfigContext.tsx`

Changes needed:
1. Add support for `ScreenBasedConfig` alongside `StoredConfig`
2. Auto-migrate old configs on load
3. Support both formats during transition

```typescript
// In ConfigProvider
const [config, setConfig] = useLocalStorage<ScreenBasedConfig | StoredConfig>(
  STORAGE_KEY,
  defaultConfig,
  (data) => {
    // Auto-migrate if legacy format
    if (isLegacyConfig(data)) {
      return migrateToScreenConfig(data);
    }
    return data;
  }
);
```

### Phase 3: Create Fullscreen Plugin Registry

**File:** `plugins/fullscreenRegistry.ts`

```typescript
import { FullscreenPlugin } from './types';
import { MatrixRainPlugin } from './matrixrain';
// ... other fullscreen plugins

export const FULLSCREEN_PLUGIN_REGISTRY: Record<string, FullscreenPlugin> = {
  [MatrixRainPlugin.id]: MatrixRainPlugin,
  // ... add more fullscreen plugins
};
```

### Phase 4: Update Canvas Renderer

**File:** `components/CanvasLEDTicker.tsx`

Changes needed:
1. Accept `screens` instead of `rows`
2. Render screens in z-index order
3. Handle fullscreen plugins
4. Handle multi-line screens (current row system)

**New render flow:**
```typescript
// 1. Sort screens by z-index
const sortedScreens = screens.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

// 2. Render each screen
sortedScreens.forEach(screen => {
  if (screen.type === 'fullscreen') {
    // Render fullscreen effect
    const plugin = FULLSCREEN_PLUGIN_REGISTRY[screen.pluginId];
    if (plugin) {
      ctx.save();
      if (screen.opacity !== undefined) {
        ctx.globalAlpha = screen.opacity;
      }
      plugin.render(ctx, width, height, dotSize, dotGap, timestamp, screen.params || {}, state);
      ctx.restore();
    }
  } else if (screen.type === 'multiline') {
    // Render rows (current system)
    renderRows(screen.rows, ctx, ...);
  } else if (screen.type === 'singleline') {
    // Render single row
    renderSingleRow(screen, ctx, ...);
  }
});
```

### Phase 5: Update Settings UI

**New Component:** `components/config/ScreensManager.tsx`

```typescript
export function ScreensManager() {
  const { screens, addScreen, updateScreen, deleteScreen, moveScreen } = useConfig();
  
  return (
    <div>
      <h2>Screens</h2>
      {screens.map((screen, index) => (
        <ScreenEditor
          key={screen.id}
          screen={screen}
          index={index}
          onUpdate={updateScreen}
          onDelete={deleteScreen}
        />
      ))}
      <button onClick={addScreen}>Add Screen</button>
    </div>
  );
}
```

**Update:** `components/Settings.tsx`
- Replace `RowsManager` with `ScreensManager`
- Show nested `RowsManager` when editing multi-line screens

### Phase 6: Screen Rotation (Optional)

If you want screens to auto-rotate:

```typescript
// In CanvasLEDTicker
const [currentScreenIndex, setCurrentScreenIndex] = useState(0);

useEffect(() => {
  const currentScreen = screens[currentScreenIndex];
  if (currentScreen?.duration && currentScreen.duration > 0) {
    const timer = setTimeout(() => {
      setCurrentScreenIndex((prev) => (prev + 1) % screens.length);
    }, currentScreen.duration);
    return () => clearTimeout(timer);
  }
}, [currentScreenIndex, screens]);
```

## Example Configurations

### Matrix Rain Background + Text Overlay

```typescript
{
  screens: [
    {
      id: 'matrix-bg',
      type: 'fullscreen',
      pluginId: 'matrix-rain',
      params: {
        speed: 2,
        color: '#00ff00',
        density: 0.6,
        opacity: 0.3
      },
      zIndex: -1  // Behind text
    },
    {
      id: 'main-text',
      type: 'multiline',
      rows: [
        { pluginId: 'clock', ... },
        { pluginId: 'weather', ... }
      ],
      zIndex: 0  // In front
    }
  ]
}
```

### Multiple Rotating Screens

```typescript
{
  screens: [
    {
      id: 'screen1',
      type: 'multiline',
      rows: [...],
      duration: 10000  // Show for 10 seconds
    },
    {
      id: 'screen2',
      type: 'fullscreen',
      pluginId: 'particles',
      duration: 5000  // Then show particles for 5 seconds
    }
  ]
}
```

## Backward Compatibility

### Migration Strategy

1. **On Load:** Check if config has `rows` (legacy format)
2. **Auto-Migrate:** Convert to screen-based format
3. **Save:** Save in new format
4. **Export:** Can export in either format

### Migration Function

```typescript
// Already implemented in lib/screenMigration.ts
const newConfig = migrateToScreenConfig(oldConfig);
```

## Testing Checklist

- [ ] Legacy configs load correctly
- [ ] Migration preserves all data
- [ ] Fullscreen plugins render
- [ ] Multi-line screens work (current system)
- [ ] Z-index layering works
- [ ] Screen rotation works (if implemented)
- [ ] Settings UI allows screen management
- [ ] Remote control syncs screens

## Performance Considerations

1. **Fullscreen plugins** run every frame (60fps)
   - Keep render functions optimized
   - Use state objects to cache calculations
   - Consider throttling for complex effects

2. **Layering** adds render overhead
   - Limit number of fullscreen layers
   - Use opacity to reduce visual complexity

3. **State management**
   - Each fullscreen plugin gets its own state object
   - State persists across frames
   - Initialize state on first render

## Next Steps

1. ✅ Type system (DONE)
2. ⏳ Update ConfigContext
3. ⏳ Create fullscreen plugin registry
4. ⏳ Update CanvasLEDTicker
5. ⏳ Update Settings UI
6. ⏳ Add more fullscreen plugins (particles, starfield, etc.)

## Questions to Consider

1. **Should fullscreen plugins support data fetching?**
   - Probably not - keep them pure visual effects
   - If needed, can pass data from text plugins

2. **How to handle screen transitions?**
   - Fade in/out
   - Slide
   - Cross-fade
   - (Start simple, add later)

3. **Nested screens?**
   - Probably not needed
   - Multi-line screens already provide nesting

4. **Remote control with screens?**
   - Sync screen order
   - Sync screen configs
   - Handle screen rotation

