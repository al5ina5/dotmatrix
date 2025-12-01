'use client';

import { usePluginData } from './usePluginData';
import { LEDRowConfig } from '@/config/led.config';

// This type represents the "Hydrated" row that the UI component actually renders
// It's strictly text-based at this point
export type HydratedRow = Omit<LEDRowConfig, 'pluginId' | 'params'> & {
    content: string;
};

/**
 * Hydrates row configs with actual plugin data
 * 
 * Update intervals are now auto-managed:
 * - Local plugins (clock): Use plugin's own updateInterval param
 * - Remote plugins (weather, crypto): Use plugin's defaultInterval
 * - All automatic via SWR and setInterval - no manual configuration needed!
 * 
 * Note: Pre-allocated for max 20 rows (React hooks must be called same number of times)
 */
export function useDataHydration(rowConfigs: readonly LEDRowConfig[]): HydratedRow[] {
    // Pre-allocate hooks for up to 20 rows (stable hook count requirement)
    const row0 = usePluginData(rowConfigs[0]?.pluginId, rowConfigs[0]?.params);
    const row1 = usePluginData(rowConfigs[1]?.pluginId, rowConfigs[1]?.params);
    const row2 = usePluginData(rowConfigs[2]?.pluginId, rowConfigs[2]?.params);
    const row3 = usePluginData(rowConfigs[3]?.pluginId, rowConfigs[3]?.params);
    const row4 = usePluginData(rowConfigs[4]?.pluginId, rowConfigs[4]?.params);
    const row5 = usePluginData(rowConfigs[5]?.pluginId, rowConfigs[5]?.params);
    const row6 = usePluginData(rowConfigs[6]?.pluginId, rowConfigs[6]?.params);
    const row7 = usePluginData(rowConfigs[7]?.pluginId, rowConfigs[7]?.params);
    const row8 = usePluginData(rowConfigs[8]?.pluginId, rowConfigs[8]?.params);
    const row9 = usePluginData(rowConfigs[9]?.pluginId, rowConfigs[9]?.params);
    const row10 = usePluginData(rowConfigs[10]?.pluginId, rowConfigs[10]?.params);
    const row11 = usePluginData(rowConfigs[11]?.pluginId, rowConfigs[11]?.params);
    const row12 = usePluginData(rowConfigs[12]?.pluginId, rowConfigs[12]?.params);
    const row13 = usePluginData(rowConfigs[13]?.pluginId, rowConfigs[13]?.params);
    const row14 = usePluginData(rowConfigs[14]?.pluginId, rowConfigs[14]?.params);
    const row15 = usePluginData(rowConfigs[15]?.pluginId, rowConfigs[15]?.params);
    const row16 = usePluginData(rowConfigs[16]?.pluginId, rowConfigs[16]?.params);
    const row17 = usePluginData(rowConfigs[17]?.pluginId, rowConfigs[17]?.params);
    const row18 = usePluginData(rowConfigs[18]?.pluginId, rowConfigs[18]?.params);
    const row19 = usePluginData(rowConfigs[19]?.pluginId, rowConfigs[19]?.params);

    const allRows = [
        row0, row1, row2, row3, row4, row5, row6, row7, row8, row9,
        row10, row11, row12, row13, row14, row15, row16, row17, row18, row19
    ];

    // Map configs to hydrated rows
    return rowConfigs.map((config, index) => ({
        ...config,
        content: allRows[index]?.content || 'Loading...'
    }));
}
