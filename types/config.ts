import { LEDRowConfig } from '@/config/led.config';

/**
 * Display settings for the LED matrix
 */
export interface DisplaySettings {
    /** Size of each LED dot in pixels */
    dotSize: number;
    /** Gap between LED dots in pixels */
    dotGap: number;
    /** Color of the LED dots (hex string) */
    dotColor: string;
    /** Spacing between rows in pixels */
    rowSpacing: number;
    /** Interval between page transitions in milliseconds */
    pageInterval: number;
    /** Brightness level (0-100) */
    brightness: number;
    /** Opacity of inactive LEDs (0-50, representing 0-50%) */
    inactiveLEDOpacity: number;
    /** Color of inactive LEDs (hex string) */
    inactiveLEDColor: string;
    /** Animation speed multiplier (0.25x to 4x, where 1.0 is normal speed) */
    speedMultiplier: number;
}

/**
 * Complete configuration stored in localStorage
 */
export interface StoredConfig {
    /** Array of row configurations */
    rows: LEDRowConfig[];
    /** Display settings */
    displaySettings: DisplaySettings;
}

/**
 * Partial configuration that may be received from remote sources
 */
export interface RemoteConfig {
    rows?: LEDRowConfig[];
    displaySettings?: DisplaySettings;
}

