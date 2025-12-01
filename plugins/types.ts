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
}
