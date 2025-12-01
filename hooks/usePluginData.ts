import { useState, useEffect } from 'react';
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
 * List of plugins that are computed locally (no network calls)
 * 
 * These plugins:
 * - Use setInterval for re-computation (not SWR)
 * - Update frequently (clock updates every second)
 * - Are synchronous or very fast
 * - Don't need caching or deduplication
 * 
 * Examples:
 * - clock: new Date() every second
 * - countdown: Date calculation every second
 * - system: navigator.userAgent (static)
 * - text: static string (no updates needed)
 * 
 * All other plugins are considered "remote" and use SWR with proper caching.
 */
const LOCAL_PLUGINS = new Set(['clock', 'countdown', 'system', 'text']);

/**
 * Hook for local/computed plugins that need frequent updates
 * Uses setInterval for re-computation instead of SWR
 */
function useLocalPlugin(pluginId: string, params?: any) {
    const plugin = pluginId ? PLUGIN_REGISTRY[pluginId] : undefined;
    const [content, setContent] = useState<string>('');
    
    // Stable params string for dependency array
    const paramsKey = JSON.stringify(params || {});

    useEffect(() => {
        // Skip if no plugin (this is called for all rows due to React hooks rules)
        if (!plugin) {
            return;
        }

        // Initial fetch
        const fetchData = async () => {
            try {
                const result = await plugin.fetch(params || {});
                setContent(result);
            } catch (error) {
                console.error(`Error in plugin ${pluginId}:`, error);
                setContent('Error');
            }
        };

        fetchData();

        // Use plugin's own config for update interval (e.g., clock can configure via params)
        // Priority: params.updateInterval > plugin.defaultInterval > 1000ms
        const interval = params?.updateInterval || plugin.defaultInterval || 1000;
        const timer = setInterval(fetchData, interval);

        return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pluginId, paramsKey]);

    return {
        content,
        isLoading: false,
        error: null,
    };
}

/**
 * Hook to fetch data for a single plugin
 * - Local plugins (clock, countdown): Use setInterval for updates (auto-managed)
 * - Remote plugins (weather, crypto): Use SWR for caching and fetching (auto-managed)
 * 
 * Update intervals are automatically determined by:
 * 1. Plugin's own config (e.g., clock's updateInterval param)
 * 2. Plugin's defaultInterval
 * 3. Fallback defaults
 * 
 * If pluginId is undefined/null, returns a no-op result (for unused row slots)
 */
export function usePluginData(pluginId?: string, params?: any) {
    const plugin = pluginId ? PLUGIN_REGISTRY[pluginId] : undefined;

    // For local plugins, use simple interval timer
    const shouldUseLocal = pluginId && LOCAL_PLUGINS.has(pluginId);
    const localResult = useLocalPlugin(
        shouldUseLocal ? pluginId! : '',
        params
    );

    // For remote plugins, use plugin's default interval
    const intervalTime = plugin?.defaultInterval || 60000;

    // Use consistent cache key across all usages
    // If no pluginId or it's a local plugin, use null key to disable SWR
    const cacheKey = pluginId && !shouldUseLocal ? (['plugin', pluginId, params] as const) : null;

    const { data, error, isLoading } = useSWR(
        cacheKey,
        pluginFetcher,
        {
            refreshInterval: intervalTime,
            fallbackData: undefined,
        }
    );

    // Return local plugin result if applicable
    if (shouldUseLocal) {
        return localResult;
    }

    // Return SWR result for remote plugins
    return {
        content: error ? 'Error loading data' : (data || 'Loading...'),
        isLoading,
        error,
    };
}

