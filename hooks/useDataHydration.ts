'use client';

import { usePluginData } from './usePluginData';
import { LEDRowConfig } from '@/config/led.config';

// This type represents the "Hydrated" row that the UI component actually renders
// It's strictly text-based at this point
export type HydratedRow = Omit<LEDRowConfig, 'pluginId' | 'params' | 'refreshInterval'> & {
    content: string;
};

/**
 * Hydrates row configs with actual plugin data
 * 
 * Each row gets its own independent SWR instance with its own refresh interval!
 * This prevents over-fetching:
 * - Clock updates every 1 second ✓
 * - Word of the Day updates every 24 hours ✓
 * - No more fetching slow data at fast intervals!
 * 
 * Note: Pre-allocated for max 20 rows (React hooks must be called same number of times)
 */
export function useDataHydration(rowConfigs: readonly LEDRowConfig[]): HydratedRow[] {
    // Pre-allocate SWR hooks for up to 20 rows (stable hook count requirement)
    const row0 = usePluginData(rowConfigs[0]?.pluginId, rowConfigs[0]?.params, rowConfigs[0]?.refreshInterval);
    const row1 = usePluginData(rowConfigs[1]?.pluginId, rowConfigs[1]?.params, rowConfigs[1]?.refreshInterval);
    const row2 = usePluginData(rowConfigs[2]?.pluginId, rowConfigs[2]?.params, rowConfigs[2]?.refreshInterval);
    const row3 = usePluginData(rowConfigs[3]?.pluginId, rowConfigs[3]?.params, rowConfigs[3]?.refreshInterval);
    const row4 = usePluginData(rowConfigs[4]?.pluginId, rowConfigs[4]?.params, rowConfigs[4]?.refreshInterval);
    const row5 = usePluginData(rowConfigs[5]?.pluginId, rowConfigs[5]?.params, rowConfigs[5]?.refreshInterval);
    const row6 = usePluginData(rowConfigs[6]?.pluginId, rowConfigs[6]?.params, rowConfigs[6]?.refreshInterval);
    const row7 = usePluginData(rowConfigs[7]?.pluginId, rowConfigs[7]?.params, rowConfigs[7]?.refreshInterval);
    const row8 = usePluginData(rowConfigs[8]?.pluginId, rowConfigs[8]?.params, rowConfigs[8]?.refreshInterval);
    const row9 = usePluginData(rowConfigs[9]?.pluginId, rowConfigs[9]?.params, rowConfigs[9]?.refreshInterval);
    const row10 = usePluginData(rowConfigs[10]?.pluginId, rowConfigs[10]?.params, rowConfigs[10]?.refreshInterval);
    const row11 = usePluginData(rowConfigs[11]?.pluginId, rowConfigs[11]?.params, rowConfigs[11]?.refreshInterval);
    const row12 = usePluginData(rowConfigs[12]?.pluginId, rowConfigs[12]?.params, rowConfigs[12]?.refreshInterval);
    const row13 = usePluginData(rowConfigs[13]?.pluginId, rowConfigs[13]?.params, rowConfigs[13]?.refreshInterval);
    const row14 = usePluginData(rowConfigs[14]?.pluginId, rowConfigs[14]?.params, rowConfigs[14]?.refreshInterval);
    const row15 = usePluginData(rowConfigs[15]?.pluginId, rowConfigs[15]?.params, rowConfigs[15]?.refreshInterval);
    const row16 = usePluginData(rowConfigs[16]?.pluginId, rowConfigs[16]?.params, rowConfigs[16]?.refreshInterval);
    const row17 = usePluginData(rowConfigs[17]?.pluginId, rowConfigs[17]?.params, rowConfigs[17]?.refreshInterval);
    const row18 = usePluginData(rowConfigs[18]?.pluginId, rowConfigs[18]?.params, rowConfigs[18]?.refreshInterval);
    const row19 = usePluginData(rowConfigs[19]?.pluginId, rowConfigs[19]?.params, rowConfigs[19]?.refreshInterval);

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
