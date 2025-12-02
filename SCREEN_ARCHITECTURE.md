# Two-Tier Screen Architecture Design

## Overview

This document outlines the two-tier architecture for supporting both **fullscreen effects** (like matrix rain) and **multi-line text displays** (current system).

## Architecture

```
Config
└── screens: ScreenConfig[]
    ├── Screen 1: Fullscreen Plugin (Matrix Rain)
    ├── Screen 2: Multi-Line Plugin
    │   └── rows: LEDRowConfig[]  (current system)
    └── Screen 3: Single-Line Plugin (simplified)
```

## Screen Types

### 1. **Fullscreen Plugins** (`type: 'fullscreen'`)
- Render across entire canvas
- Examples: Matrix rain, particle effects, starfield, fire
- No rows - just pure visual effects
- Can be layered behind text

### 2. **Multi-Line Plugin** (`type: 'multiline'`)
- Current row system wrapped in a screen
- Contains `rows: LEDRowConfig[]`
- Supports all existing text plugins
- Can have background effects

### 3. **Single-Line Plugin** (`type: 'singleline'`)
- Simplified single row display
- No row management needed
- Good for simple displays

## Type Definitions

```typescript
// Screen-level configuration
export type ScreenConfig = 
  | FullscreenScreenConfig
  | MultiLineScreenConfig
  | SingleLineScreenConfig;

// Base screen config
interface BaseScreenConfig {
  id: string;  // Unique identifier
  name?: string;  // Optional display name
  duration?: number;  // How long to show this screen (ms), 0 = infinite
  zIndex?: number;  // Layering (lower = behind)
}

// Fullscreen effect screen
interface FullscreenScreenConfig extends BaseScreenConfig {
  type: 'fullscreen';
  pluginId: string;  // e.g., 'matrix-rain', 'particles', 'starfield'
  params?: Record<string, any>;
  opacity?: number;  // 0-1, for layering
}

// Multi-line text screen (current system)
interface MultiLineScreenConfig extends BaseScreenConfig {
  type: 'multiline';
  rows: LEDRowConfig[];  // Current row system
  backgroundEffect?: {
    pluginId: string;  // Optional fullscreen effect behind text
    params?: Record<string, any>;
    opacity?: number;
  };
}

// Single-line text screen
interface SingleLineScreenConfig extends BaseScreenConfig {
  type: 'singleline';
  pluginId: string;  // Text plugin
  params?: Record<string, any>;
  stepInterval: number;
  color?: string;
  scrolling?: boolean;
  alignment?: 'left' | 'center' | 'right';
  spacing: SpacingConfig;
}
```

## Plugin Type System

```typescript
// Extend LEDPlugin interface
interface LEDPlugin {
  // ... existing fields ...
  
  // NEW: Plugin type classification
  screenType?: 'fullscreen' | 'row' | 'both';
  
  // NEW: For fullscreen plugins
  renderFullscreen?: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dotSize: number,
    dotGap: number,
    timestamp: number,
    params: any
  ) => void;
}
```

## Rendering Layers

```
Layer 0 (Background): Fullscreen effects with zIndex < 0
Layer 1 (Midground): Multi-line text rows
Layer 2 (Foreground): Fullscreen effects with zIndex >= 0
```

## Migration Strategy

### Backward Compatibility
- Existing configs with `rows` array automatically become a single `MultiLineScreenConfig`
- Migration function converts old format to new format
- Settings UI shows "Legacy Mode" for old configs

### Migration Function
```typescript
function migrateConfig(oldConfig: OldConfig): NewConfig {
  return {
    screens: [{
      id: 'default',
      type: 'multiline',
      rows: oldConfig.rows,
      duration: 0  // Infinite
    }],
    displaySettings: oldConfig.displaySettings
  };
}
```

## UI Changes

### Settings Structure
```
Settings
├── Screens Manager
│   ├── Screen 1: Matrix Rain [Fullscreen]
│   ├── Screen 2: Main Display [Multi-Line] ⬇️
│   │   └── Rows Manager (current UI)
│   └── Screen 3: Clock [Single-Line]
└── Display Settings
```

### New Components Needed
1. **ScreensManager** - Top-level screen management
2. **ScreenEditor** - Edit individual screens
3. **FullscreenPluginSelector** - Choose fullscreen effects
4. **BackgroundEffectSelector** - Add effects to multi-line screens

## Implementation Phases

### Phase 1: Foundation (Week 1)
1. Add `ScreenConfig` types
2. Create migration function
3. Update `ConfigContext` to support screens
4. Keep backward compatibility

### Phase 2: Fullscreen Plugins (Week 2)
1. Create first fullscreen plugin (Matrix Rain)
2. Update `CanvasLEDTicker` to render fullscreen plugins
3. Add fullscreen plugin registry

### Phase 3: UI Updates (Week 3)
1. Create `ScreensManager` component
2. Update Settings UI
3. Add screen editor

### Phase 4: Effects & Polish (Week 4)
1. Add more fullscreen effects
2. Add background effects to multi-line screens
3. Add screen transitions

## Example Configurations

### Matrix Rain + Text Overlay
```typescript
{
  screens: [
    {
      id: 'matrix-bg',
      type: 'fullscreen',
      pluginId: 'matrix-rain',
      params: { speed: 50, color: '#00ff00' },
      zIndex: -1,  // Behind text
      opacity: 0.3
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

### Multiple Screens (Rotating)
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
  ],
  screenInterval: 0  // Auto-rotate based on duration
}
```

## Benefits

1. **Flexibility**: Mix fullscreen effects with text
2. **Extensibility**: Easy to add new effect types
3. **Backward Compatible**: Existing configs still work
4. **Clean Separation**: Effects vs content clearly separated
5. **Performance**: Can optimize fullscreen effects separately

## Open Questions

1. Should fullscreen plugins support their own data fetching? (e.g., weather-based particle colors)
2. How to handle screen transitions? (fade, slide, etc.)
3. Should we support nested screens? (probably not needed)
4. How to handle remote control with screens? (sync screen order)

