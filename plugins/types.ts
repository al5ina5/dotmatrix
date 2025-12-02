export type ConfigFieldType =
    | 'text'
    | 'number'
    | 'select'
    | 'boolean'
    | 'color'
    | 'multi-select'
    | 'array'
    | 'object';

export interface ConfigField {
    key: string;
    type: ConfigFieldType;
    label: string;
    defaultValue: any;
    required?: boolean;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>; // For select/multi-select
    min?: number; // For number type
    max?: number; // For number type
    step?: number; // For number type
}

export interface ColoredSegment {
    text: string;
    color: string; // Hex color string
}

export type LEDContent = string | ColoredSegment[];

export interface LEDPlugin<TParams = any> {
    id: string;
    name: string;
    description?: string;
    /**
     * Fetch/compute data for the plugin
     * 
     * For LOCAL plugins (clock, countdown, system):
     * - Should be synchronous/quick computation
     * - No network calls
     * - Called frequently (e.g. every second for clock)
     * 
     * For API plugins (weather, crypto, stocks):
     * - Can be async with network calls
     * - Should handle errors gracefully
     * - Called less frequently (e.g. every 60 seconds)
     * 
     * @param params Configuration parameters for this instance
     * @returns The text string or colored segments to display on the LED matrix
     */
    fetch: (params: TParams) => Promise<LEDContent> | LEDContent;
    /**
     * Default update interval in milliseconds
     * 
     * For local plugins: How often to recompute/update the display (e.g. 1000 for clock)
     * For API plugins: How often to fetch new data from API (e.g. 60000 for weather)
     */
    defaultInterval?: number;
    /**
     * Configuration schema for the plugin
     * Defines what inputs are needed and their defaults
     */
    configSchema?: ConfigField[];
    /**
     * Plugin type classification
     * - 'row': Regular text plugin (default)
     * - 'fullscreen': Fullscreen effect plugin
     * - 'both': Can be used as either
     */
    screenType?: 'row' | 'fullscreen' | 'both';
}

/**
 * Fullscreen plugin interface for effects that render directly to canvas
 * These plugins don't return text content - they draw directly
 */
export interface FullscreenPlugin<TParams = any> {
    id: string;
    name: string;
    description?: string;
    screenType: 'fullscreen';

    /**
     * Default parameters for the plugin
     */
    defaultParams?: Partial<TParams>;

    /**
     * Configuration schema for the plugin
     */
    configSchema?: ConfigField[];

    /**
     * Render function called each animation frame
     * 
     * @param ctx Canvas rendering context
     * @param width Canvas width in pixels
     * @param height Canvas height in pixels
     * @param dotSize Size of each LED dot
     * @param dotGap Gap between dots
     * @param timestamp Current animation timestamp
     * @param params Plugin parameters
     * @param state Persistent state object (initialized on first call)
     */
    render: (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        dotSize: number,
        dotGap: number,
        timestamp: number,
        params: TParams,
        state: any
    ) => void;
}
