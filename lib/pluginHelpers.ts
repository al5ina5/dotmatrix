import { LEDContent } from '@/plugins/types';

/**
 * Centralized error handling for plugins
 * Wraps plugin fetch functions with consistent error handling and logging
 * 
 * @param pluginId - The plugin identifier for logging
 * @param fetcher - The async function that fetches/computes plugin data
 * @param fallbackMessage - Optional custom error message
 * @returns The plugin content or an error message string
 * 
 * @example
 * fetch: async (params) => withPluginErrorHandling(
 *   'weather',
 *   async () => {
 *     const response = await fetch(url);
 *     return formatWeatherData(response);
 *   },
 *   'Weather unavailable'
 * )
 */
export async function withPluginErrorHandling(
    pluginId: string,
    fetcher: () => Promise<LEDContent>,
    fallbackMessage?: string
): Promise<LEDContent> {
    try {
        return await fetcher();
    } catch (error) {
        // Log error with context
        console.error(`[${pluginId}] Plugin error:`, error);
        
        // Return user-friendly fallback message
        return fallbackMessage || `${pluginId}: Unable to load data`;
    }
}

/**
 * Type guard to check if an error is a fetch error with a status code
 */
export function isFetchError(error: unknown): error is Response {
    return error instanceof Response;
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'Unknown error';
}

