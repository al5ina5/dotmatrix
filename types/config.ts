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

