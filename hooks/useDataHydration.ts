'use client';

import { usePluginData } from './usePluginData';
import { LEDRowConfig } from '@/config/led.config';
import { LEDContent } from '@/plugins/types';

// This type represents the "Hydrated" row that the UI component actually renders
// It's strictly text-based at this point
export type HydratedRow = Omit<LEDRowConfig, 'pluginId' | 'params'> & {
    content: LEDContent;
};

/**
 * Maximum number of rows supported.
 * Increase this constant if you need more rows.
 */
const MAX_ROWS = 50;

/**
 * Hydrates row configs with actual plugin data
 * 
 * **Why the "ridiculous" pattern?**
 * 
 * React's Rules of Hooks require hooks to be called:
 * 1. In the same order every render
 * 2. At the top level (not in loops, conditions, or callbacks)
 * 
 * Since we can't dynamically call `usePluginData` based on `rowConfigs.length`,
 * we pre-allocate hook calls for up to MAX_ROWS slots. Unused slots pass
 * `undefined` to `usePluginData`, which handles it gracefully by returning
 * a no-op result.
 * 
 * Update intervals are auto-managed:
 * - Local plugins (clock): Use plugin's own updateInterval param
 * - Remote plugins (weather, crypto): Use plugin's defaultInterval
 * - All automatic via SWR and setInterval - no manual configuration needed!
 * 
 * @param rowConfigs Array of row configurations to hydrate
 * @returns Array of hydrated rows with actual content from plugins
 */
export function useDataHydration(rowConfigs: readonly LEDRowConfig[]): HydratedRow[] {
    const safeRowConfigs = rowConfigs || [];

    // Pre-allocate hooks for up to MAX_ROWS slots
    // These must be explicit calls (not in a loop) to satisfy React's Rules of Hooks
    // Each hook call is stable and always executed, even for unused slots
    const row0 = usePluginData(safeRowConfigs[0]?.pluginId, safeRowConfigs[0]?.params);
    const row1 = usePluginData(safeRowConfigs[1]?.pluginId, safeRowConfigs[1]?.params);
    const row2 = usePluginData(safeRowConfigs[2]?.pluginId, safeRowConfigs[2]?.params);
    const row3 = usePluginData(safeRowConfigs[3]?.pluginId, safeRowConfigs[3]?.params);
    const row4 = usePluginData(safeRowConfigs[4]?.pluginId, safeRowConfigs[4]?.params);
    const row5 = usePluginData(safeRowConfigs[5]?.pluginId, safeRowConfigs[5]?.params);
    const row6 = usePluginData(safeRowConfigs[6]?.pluginId, safeRowConfigs[6]?.params);
    const row7 = usePluginData(safeRowConfigs[7]?.pluginId, safeRowConfigs[7]?.params);
    const row8 = usePluginData(safeRowConfigs[8]?.pluginId, safeRowConfigs[8]?.params);
    const row9 = usePluginData(safeRowConfigs[9]?.pluginId, safeRowConfigs[9]?.params);
    const row10 = usePluginData(safeRowConfigs[10]?.pluginId, safeRowConfigs[10]?.params);
    const row11 = usePluginData(safeRowConfigs[11]?.pluginId, safeRowConfigs[11]?.params);
    const row12 = usePluginData(safeRowConfigs[12]?.pluginId, safeRowConfigs[12]?.params);
    const row13 = usePluginData(safeRowConfigs[13]?.pluginId, safeRowConfigs[13]?.params);
    const row14 = usePluginData(safeRowConfigs[14]?.pluginId, safeRowConfigs[14]?.params);
    const row15 = usePluginData(safeRowConfigs[15]?.pluginId, safeRowConfigs[15]?.params);
    const row16 = usePluginData(safeRowConfigs[16]?.pluginId, safeRowConfigs[16]?.params);
    const row17 = usePluginData(safeRowConfigs[17]?.pluginId, safeRowConfigs[17]?.params);
    const row18 = usePluginData(safeRowConfigs[18]?.pluginId, safeRowConfigs[18]?.params);
    const row19 = usePluginData(safeRowConfigs[19]?.pluginId, safeRowConfigs[19]?.params);
    const row20 = usePluginData(safeRowConfigs[20]?.pluginId, safeRowConfigs[20]?.params);
    const row21 = usePluginData(safeRowConfigs[21]?.pluginId, safeRowConfigs[21]?.params);
    const row22 = usePluginData(safeRowConfigs[22]?.pluginId, safeRowConfigs[22]?.params);
    const row23 = usePluginData(safeRowConfigs[23]?.pluginId, safeRowConfigs[23]?.params);
    const row24 = usePluginData(safeRowConfigs[24]?.pluginId, safeRowConfigs[24]?.params);
    const row25 = usePluginData(safeRowConfigs[25]?.pluginId, safeRowConfigs[25]?.params);
    const row26 = usePluginData(safeRowConfigs[26]?.pluginId, safeRowConfigs[26]?.params);
    const row27 = usePluginData(safeRowConfigs[27]?.pluginId, safeRowConfigs[27]?.params);
    const row28 = usePluginData(safeRowConfigs[28]?.pluginId, safeRowConfigs[28]?.params);
    const row29 = usePluginData(safeRowConfigs[29]?.pluginId, safeRowConfigs[29]?.params);
    const row30 = usePluginData(safeRowConfigs[30]?.pluginId, safeRowConfigs[30]?.params);
    const row31 = usePluginData(safeRowConfigs[31]?.pluginId, safeRowConfigs[31]?.params);
    const row32 = usePluginData(safeRowConfigs[32]?.pluginId, safeRowConfigs[32]?.params);
    const row33 = usePluginData(safeRowConfigs[33]?.pluginId, safeRowConfigs[33]?.params);
    const row34 = usePluginData(safeRowConfigs[34]?.pluginId, safeRowConfigs[34]?.params);
    const row35 = usePluginData(safeRowConfigs[35]?.pluginId, safeRowConfigs[35]?.params);
    const row36 = usePluginData(safeRowConfigs[36]?.pluginId, safeRowConfigs[36]?.params);
    const row37 = usePluginData(safeRowConfigs[37]?.pluginId, safeRowConfigs[37]?.params);
    const row38 = usePluginData(safeRowConfigs[38]?.pluginId, safeRowConfigs[38]?.params);
    const row39 = usePluginData(safeRowConfigs[39]?.pluginId, safeRowConfigs[39]?.params);
    const row40 = usePluginData(safeRowConfigs[40]?.pluginId, safeRowConfigs[40]?.params);
    const row41 = usePluginData(safeRowConfigs[41]?.pluginId, safeRowConfigs[41]?.params);
    const row42 = usePluginData(safeRowConfigs[42]?.pluginId, safeRowConfigs[42]?.params);
    const row43 = usePluginData(safeRowConfigs[43]?.pluginId, safeRowConfigs[43]?.params);
    const row44 = usePluginData(safeRowConfigs[44]?.pluginId, safeRowConfigs[44]?.params);
    const row45 = usePluginData(safeRowConfigs[45]?.pluginId, safeRowConfigs[45]?.params);
    const row46 = usePluginData(safeRowConfigs[46]?.pluginId, safeRowConfigs[46]?.params);
    const row47 = usePluginData(safeRowConfigs[47]?.pluginId, safeRowConfigs[47]?.params);
    const row48 = usePluginData(safeRowConfigs[48]?.pluginId, safeRowConfigs[48]?.params);
    const row49 = usePluginData(safeRowConfigs[49]?.pluginId, safeRowConfigs[49]?.params);

    // Collect all hook results in an array for easy indexing
    const allRows = [
        row0, row1, row2, row3, row4, row5, row6, row7, row8, row9,
        row10, row11, row12, row13, row14, row15, row16, row17, row18, row19,
        row20, row21, row22, row23, row24, row25, row26, row27, row28, row29,
        row30, row31, row32, row33, row34, row35, row36, row37, row38, row39,
        row40, row41, row42, row43, row44, row45, row46, row47, row48, row49
    ];

    // Map configs to hydrated rows using the hook results
    return safeRowConfigs.map((config, index) => ({
        ...config,
        content: allRows[index]?.content || 'Loading...'
    }));
}
