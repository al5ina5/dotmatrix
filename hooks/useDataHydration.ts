'use client';

import { useState, useEffect } from 'react';
import { LEDRowConfig } from '@/config/led.config';
import { PLUGIN_REGISTRY } from '@/plugins/registry';

// This type represents the "Hydrated" row that the UI component actually renders
// It's strictly text-based at this point
export type HydratedRow = Omit<LEDRowConfig, 'type' | 'pluginId' | 'params' | 'refreshInterval'> & {
    type: 'text';
    content: string;
};

export function useDataHydration(rowConfigs: readonly LEDRowConfig[]) {
    const [hydratedRows, setHydratedRows] = useState<HydratedRow[]>([]);

    useEffect(() => {
        // Initialize rows
        const initialRows = rowConfigs.map(config => {
            if (config.type === 'text') {
                return { ...config, type: 'text' as const };
            }
            // For dynamic rows, start with a loading state or empty
            return {
                ...config,
                type: 'text' as const,
                content: 'Loading...'
            };
        });
        setHydratedRows(initialRows);

        // Set up intervals for dynamic rows
        const intervals: NodeJS.Timeout[] = [];

        rowConfigs.forEach((config, index) => {
            if (config.type === 'dynamic') {
                const plugin = PLUGIN_REGISTRY[config.pluginId];
                if (!plugin) {
                    console.warn(`Plugin ${config.pluginId} not found`);
                    return;
                }

                const fetchData = async () => {
                    try {
                        const text = await plugin.fetch(config.params);
                        setHydratedRows(prev => {
                            const newRows = [...prev];
                            // Preserve all other props, just update content
                            newRows[index] = {
                                ...newRows[index],
                                content: text
                            };
                            return newRows;
                        });
                    } catch (error) {
                        console.error(`Error fetching plugin ${config.pluginId}:`, error);
                        setHydratedRows(prev => {
                            const newRows = [...prev];
                            newRows[index] = { ...newRows[index], content: 'Error' };
                            return newRows;
                        });
                    }
                };

                // Initial fetch
                fetchData();

                // Set up interval
                const intervalTime = config.refreshInterval || plugin.defaultInterval || 60000;
                const interval = setInterval(fetchData, intervalTime);
                intervals.push(interval);
            }
        });

        return () => {
            intervals.forEach(clearInterval);
        };
    }, [rowConfigs]);

    return hydratedRows;
}
