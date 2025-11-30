import useSWR from 'swr';
import { PLUGIN_REGISTRY } from '@/plugins/registry';

/**
 * Generate a consistent SWR cache key for a plugin + params combination
 * This ensures the same data is shared across all components
 */
export function getPluginCacheKey(pluginId: string, params?: any): string {
    return `plugin:${pluginId}:${JSON.stringify(params || {})}`;
}

/**
 * Fetcher function for plugin data
 */
async function pluginFetcher([_prefix, pluginId, params]: [string, string, any]) {
    const plugin = PLUGIN_REGISTRY[pluginId];
    if (!plugin) {
        throw new Error(`Plugin ${pluginId} not found`);
    }
    return await plugin.fetch(params || {});
}

/**
 * Hook to fetch data for a single plugin
 * Uses SWR for caching, deduplication, and revalidation
 * 
 * If pluginId is undefined/null, returns a no-op result (for unused row slots)
 * If refreshInterval is 0 or undefined, uses plugin's default interval
 */
export function usePluginData(pluginId?: string, params?: any, refreshInterval?: number) {
    const plugin = pluginId ? PLUGIN_REGISTRY[pluginId] : undefined;

    // Determine refresh interval:
    // - If explicitly set to 0, don't auto-refresh (for previews)
    // - If undefined, use plugin's default
    // - Otherwise use the provided value
    const intervalTime = refreshInterval === 0
        ? 0
        : (refreshInterval || plugin?.defaultInterval || 60000);

    // Use consistent cache key across all usages
    // If no pluginId, use null key to disable SWR
    const cacheKey = pluginId ? (['plugin', pluginId, params] as const) : null;

    const { data, error, isLoading } = useSWR(
        cacheKey,
        pluginFetcher,
        {
            refreshInterval: intervalTime, // Each plugin gets its own interval!
            // Global config handles revalidateOnFocus, revalidateOnReconnect, etc.
            fallbackData: undefined,
        }
    );

    return {
        content: error ? 'Error loading data' : (data || 'Loading...'),
        isLoading,
        error,
    };
}

