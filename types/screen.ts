/**
 * Two-Tier Screen Architecture Types
 * 
 * Screens are the top-level container that can contain:
 * - Fullscreen plugins (matrix rain, particles, etc.)
 * - Multi-line text displays (current row system)
 * - Single-line text displays
 */

import { LEDRowConfig } from '@/config/led.config';

/**
 * Base configuration for all screen types
 */
interface BaseScreenConfig {
  /** Unique identifier for this screen */
  id: string;
  
  /** Optional display name for UI */
  name?: string;
  
  /** How long to show this screen in milliseconds (0 = infinite) */
  duration?: number;
  
  /** Z-index for layering (lower = behind, higher = in front) */
  zIndex?: number;
}

/**
 * Fullscreen effect screen (matrix rain, particles, etc.)
 * Renders across the entire canvas
 */
export interface FullscreenScreenConfig extends BaseScreenConfig {
  type: 'fullscreen';
  
  /** Plugin ID for the fullscreen effect */
  pluginId: string;
  
  /** Plugin parameters */
  params?: Record<string, any>;
  
  /** Opacity for layering (0-1) */
  opacity?: number;
}

/**
 * Multi-line text screen (current row system)
 * Contains multiple text rows that scroll independently
 */
export interface MultiLineScreenConfig extends BaseScreenConfig {
  type: 'multiline';
  
  /** Array of row configurations (current system) */
  rows: LEDRowConfig[];
  
  /** Optional background effect behind the text */
  backgroundEffect?: {
    pluginId: string;
    params?: Record<string, any>;
    opacity?: number;
  };
}

/**
 * Single-line text screen
 * Simplified single row display
 */
export interface SingleLineScreenConfig extends BaseScreenConfig {
  type: 'singleline';
  
  /** Plugin ID for the text content */
  pluginId: string;
  
  /** Plugin parameters */
  params?: Record<string, any>;
  
  /** Scroll speed */
  stepInterval: number;
  
  /** Text color */
  color?: string;
  
  /** Whether text scrolls */
  scrolling?: boolean;
  
  /** Text alignment (if not scrolling) */
  alignment?: 'left' | 'center' | 'right';
  
  /** Spacing configuration */
  spacing: {
    betweenLetters: number;
    betweenWords: number;
    beforeRepeat: number;
  };
}

/**
 * Union type for all screen configurations
 */
export type ScreenConfig = 
  | FullscreenScreenConfig
  | MultiLineScreenConfig
  | SingleLineScreenConfig;

/**
 * Complete configuration with screens
 */
export interface ScreenBasedConfig {
  /** Array of screens to display */
  screens: ScreenConfig[];
  
  /** Display settings (shared across all screens) */
  displaySettings: {
    dotSize: number;
    dotGap: number;
    dotColor: string;
    rowSpacing: number;
    pageInterval: number;
    brightness: number;
  };
  
  /** Global screen rotation interval (0 = use screen durations) */
  screenInterval?: number;
}

/**
 * Helper type guard functions
 */
export function isFullscreenScreen(screen: ScreenConfig): screen is FullscreenScreenConfig {
  return screen.type === 'fullscreen';
}

export function isMultiLineScreen(screen: ScreenConfig): screen is MultiLineScreenConfig {
  return screen.type === 'multiline';
}

export function isSingleLineScreen(screen: ScreenConfig): screen is SingleLineScreenConfig {
  return screen.type === 'singleline';
}

