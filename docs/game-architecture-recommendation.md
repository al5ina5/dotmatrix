# Game Architecture Recommendation

## Executive Summary

**Recommendation: Create a completely new codebase for games**

The current system is optimized for **text rendering** (character patterns, scrolling tickers), while games need **pixel-level grid control**. While there's some overlap in rendering code, it's minimal enough that starting fresh is simpler and faster. You can always copy specific pieces (like shader code) if needed, but don't force an architecture split.

---

## Current System Analysis

### ✅ What Works Well for Games
- **WebGL rendering infrastructure** (`lib/shaders.ts`)
  - Retro filters (VCR curve, scanlines, glitch, RGB shift, vignette)
  - Efficient rendering pipeline
- **LED grid visualization**
  - Dot size, spacing, colors
  - Background grid rendering
  - Brightness control
- **Grid calculation utilities**
  - Pitch calculation (dotSize + dotGap)
  - Screen-to-grid coordinate mapping

### ❌ What Doesn't Fit Games
- **Character-based rendering** (`lib/ledRenderer.ts`)
  - Designed for 7x5 character patterns
  - Character positioning and spacing logic
  - Text scrolling/alignment
- **Row-based layout system**
  - Multiple independent text rows
  - Page switching logic
  - Row spacing calculations
- **Plugin system**
  - Data fetching architecture
  - Not needed for games

---

## Recommended Architecture

### Option 1: Completely New Codebase (Recommended) ⭐

```
dotmatrix/              # Current codebase (stays as-is)
  └── ... (text ticker)

led-games/              # New codebase (completely separate)
  ├── src/
  │   ├── renderer.ts   # Simple LED grid renderer
  │   ├── games/
  │   │   ├── snake.ts
  │   │   └── tetris.ts
  │   └── ...
  └── package.json
```

**Benefits:**
- ✅ **No architectural constraints** - optimize for games from day 1
- ✅ **Simpler** - no monorepo complexity, no extraction work
- ✅ **Faster to start** - just create new project and code
- ✅ **Can copy specific pieces** - if you want the shader filters, just copy `lib/shaders.ts`
- ✅ **Different tech choices** - use different framework if it makes sense
- ✅ **Clean slate** - no legacy code to work around

**What to Copy (if needed):**
- `lib/shaders.ts` - WebGL shader code for filters (optional, ~100 lines)
- Grid drawing approach (but simplified for games)
- That's it! Everything else is game-specific.

**Implementation:**
- Create new Next.js/React/Vite project
- Build simple LED renderer optimized for games:
  ```typescript
  // Direct pixel buffer approach
  class GameRenderer {
    render(pixels: boolean[][], colors?: string[][]): void
  }
  ```
- Much simpler than text rendering system

---

### Option 2: Monorepo (If you want code sharing)

```
dotmatrix/              # Current codebase (stays as-is)
led-games/              # New game codebase
  ├── lib/
  │   └── led-renderer/ # Copy/extract rendering code
  └── games/
```

**Benefits:**
- ✅ Complete independence
- ✅ No monorepo complexity

**Drawbacks:**
- ❌ Code duplication
- ❌ Bug fixes need to be applied twice
- ❌ Harder to share improvements

---

### Option 3: Expand Current Codebase (Not Recommended)

Adding games directly to the current codebase would:
- ❌ Mix text rendering and game logic
- ❌ Make codebase harder to maintain
- ❌ Create confusion about what the project is
- ❌ Add unnecessary dependencies to both

---

## What to Extract: LED Framework API

### Core Interface

```typescript
// packages/led-framework/src/types.ts
export interface GridConfig {
  dotSize: number;
  dotGap: number;
  dotColor: string;
  brightness: number;
  inactiveLEDOpacity: number;
  inactiveLEDColor?: string;
}

export interface FilterConfig {
  vcrCurve: boolean;
  scanlines: boolean;
  glitch: boolean;
  rgbShift: boolean;
  vignette: boolean;
}

export interface PixelGrid {
  width: number;
  height: number;
  getPixel(x: number, y: number): { active: boolean; color?: string };
}
```

### Renderer Class

```typescript
// packages/led-framework/src/renderer.ts
export class LEDRenderer {
  constructor(canvas: HTMLCanvasElement, config: GridConfig)
  
  // Main rendering method
  render(pixels: PixelGrid, timestamp: number): void
  
  // Configuration
  setFilters(filters: FilterConfig): void
  setBrightness(brightness: number): void
  resize(): void
  
  // Cleanup
  destroy(): void
}
```

### Grid Utilities

```typescript
// packages/led-framework/src/grid.ts
export function calculateGridDimensions(
  screenWidth: number,
  screenHeight: number,
  dotSize: number,
  dotGap: number
): { cols: number; rows: number; pitch: number }

export function screenToGrid(
  screenX: number,
  screenY: number,
  pitch: number
): { col: number; row: number }
```

---

## Game Implementation Example

### Snake Game Structure

```typescript
// packages/games/games/snake.ts
import { LEDRenderer, PixelGrid } from '@dotmatrix/led-framework';

export class SnakeGame {
  private renderer: LEDRenderer;
  private grid: PixelGrid;
  private snake: Array<{x: number, y: number}>;
  private direction: 'up' | 'down' | 'left' | 'right';
  
  constructor(renderer: LEDRenderer) {
    this.renderer = renderer;
    this.grid = new GamePixelGrid(renderer.getGridSize());
    this.snake = [{x: 10, y: 10}];
    this.direction = 'right';
  }
  
  update(): void {
    // Game logic
    this.moveSnake();
    this.checkCollisions();
    this.render();
  }
  
  private render(): void {
    // Clear grid
    this.grid.clear();
    
    // Draw snake
    this.snake.forEach(segment => {
      this.grid.setPixel(segment.x, segment.y, '#00ff00');
    });
    
    // Draw food
    this.grid.setPixel(this.food.x, this.food.y, '#ff0000');
    
    // Render to LED display
    this.renderer.render(this.grid, performance.now());
  }
}
```

---

## Migration Path

### Phase 1: Extract Framework (1-2 days)
1. Create `packages/led-framework/`
2. Extract WebGL rendering code
3. Extract grid utilities
4. Create clean API
5. Update current codebase to use framework

### Phase 2: Create Game Codebase (1 day)
1. Create `packages/games/`
2. Set up basic game structure
3. Implement simple game (e.g., Snake)

### Phase 3: Refine (ongoing)
1. Add more games
2. Improve framework API based on game needs
3. Share improvements back to ticker

---

## Decision Matrix

| Factor | New Codebase | Monorepo | Expand Current |
|--------|--------------|----------|----------------|
| Speed to Start | ✅ Fastest | ⚠️ Medium | ✅ Fast |
| Simplicity | ✅ Simplest | ⚠️ Medium | ❌ Complex |
| Code Reuse | ⚠️ Copy if needed | ✅ High | ✅ High |
| Maintainability | ✅ Excellent | ✅ Good | ❌ Poor |
| Separation | ✅ Complete | ✅ Clear | ❌ Mixed |
| Flexibility | ✅ Full freedom | ⚠️ Some constraints | ❌ Constrained |
| **Recommendation** | **⭐ Best** | ⚠️ Over-engineered | ❌ Avoid |

---

## Conclusion

**Create a completely new codebase for games. Don't try to extract or share code unless you actually need to.**

### Why This Makes Sense:

1. **The reusable code is minimal** (~200 lines of shaders/grid code)
   - Easy to copy if you want the filters
   - Not worth the complexity of extraction

2. **Games need different architecture anyway**
   - Direct pixel buffers (not character patterns)
   - Game loops (not scrolling text)
   - Input handling (not plugin system)
   - State management (not data fetching)

3. **Starting fresh is faster**
   - No extraction work
   - No architectural decisions
   - Just build what you need

4. **You can always refactor later**
   - If you find yourself copying code between projects
   - If you want to share more
   - But don't optimize prematurely

### What to Do:

1. **Create new project** (`led-games/` or similar)
2. **Build simple LED renderer** for games (much simpler than text renderer)
3. **Copy shader code** if you want the retro filters (optional)
4. **Build games** - Snake, Tetris, etc.

### Simple Game Renderer Example:

```typescript
// Much simpler than text renderer!
class GameLEDRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: { dotSize: number; dotGap: number };
  
  render(pixels: boolean[][], colors?: string[][]): void {
    // Clear
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid
    const pitch = this.config.dotSize + this.config.dotGap;
    for (let y = 0; y < pixels.length; y++) {
      for (let x = 0; x < pixels[y].length; x++) {
        if (pixels[y][x]) {
          const color = colors?.[y]?.[x] || '#00ff00';
          this.ctx.fillStyle = color;
          this.ctx.fillRect(x * pitch, y * pitch, this.config.dotSize, this.config.dotSize);
        }
      }
    }
  }
}
```

**That's it!** No character patterns, no scrolling logic, no plugin system - just direct pixel rendering. Perfect for games.

