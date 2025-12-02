/**
 * Migration utilities for converting old row-based configs to new screen-based configs
 */

import { LEDRowConfig } from '@/config/led.config';
import { StoredConfig } from '@/types/config';
import { ScreenBasedConfig, MultiLineScreenConfig } from '@/types/screen';

/**
 * Migrates old row-based config to new screen-based config
 * Maintains backward compatibility by wrapping existing rows in a multi-line screen
 */
export function migrateToScreenConfig(oldConfig: StoredConfig): ScreenBasedConfig {
  return {
    screens: [
      {
        id: 'default',
        type: 'multiline',
        name: 'Main Display',
        rows: oldConfig.rows,
        duration: 0, // Infinite
        zIndex: 0
      } as MultiLineScreenConfig
    ],
    displaySettings: oldConfig.displaySettings,
    screenInterval: 0
  };
}

/**
 * Checks if a config is in the old format (has rows at top level)
 */
export function isLegacyConfig(config: any): config is StoredConfig {
  return config && Array.isArray(config.rows) && !config.screens;
}

/**
 * Converts screen-based config back to legacy format (for compatibility)
 * Useful when exporting or sharing configs
 */
export function convertToLegacyConfig(screenConfig: ScreenBasedConfig): StoredConfig | null {
  // Find the first multi-line screen (or create one from single-line screens)
  const multiLineScreen = screenConfig.screens.find(
    screen => screen.type === 'multiline'
  ) as MultiLineScreenConfig | undefined;

  if (multiLineScreen) {
    return {
      rows: multiLineScreen.rows,
      displaySettings: screenConfig.displaySettings
    };
  }

  // If no multi-line screen, try to convert single-line screens to rows
  const singleLineScreens = screenConfig.screens.filter(
    screen => screen.type === 'singleline'
  );

  if (singleLineScreens.length > 0) {
    const rows: LEDRowConfig[] = singleLineScreens.map(screen => {
      if (screen.type === 'singleline') {
        return {
          pluginId: screen.pluginId,
          params: screen.params,
          stepInterval: screen.stepInterval,
          color: screen.color,
          scrolling: screen.scrolling,
          alignment: screen.alignment,
          spacing: screen.spacing
        };
      }
      return null;
    }).filter((row): row is LEDRowConfig => row !== null);

    return {
      rows,
      displaySettings: screenConfig.displaySettings
    };
  }

  return null;
}

