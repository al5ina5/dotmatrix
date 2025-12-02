/**
 * Fullscreen Plugin Registry
 * 
 * Registry for plugins that render fullscreen effects (matrix rain, particles, etc.)
 * These plugins render directly to the canvas rather than returning text content.
 */

import { FullscreenPlugin } from './types';
import { MatrixRainPlugin } from './matrixrain';

export const FULLSCREEN_PLUGIN_REGISTRY: Record<string, FullscreenPlugin> = {
    [MatrixRainPlugin.id]: MatrixRainPlugin,
    // Add more fullscreen plugins here as they're created
};

/**
 * Get a fullscreen plugin by ID
 */
export function getFullscreenPlugin(pluginId: string): FullscreenPlugin | undefined {
    return FULLSCREEN_PLUGIN_REGISTRY[pluginId];
}

/**
 * Check if a plugin ID is a fullscreen plugin
 */
export function isFullscreenPlugin(pluginId: string): boolean {
    return pluginId in FULLSCREEN_PLUGIN_REGISTRY;
}

/**
 * Get all available fullscreen plugins
 */
export function getAllFullscreenPlugins(): FullscreenPlugin[] {
    return Object.values(FULLSCREEN_PLUGIN_REGISTRY);
}

