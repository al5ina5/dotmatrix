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

export interface LEDPlugin<TParams = any> {
    id: string;
    name: string;
    description?: string;
    /**
     * Fetch data for the plugin
     * @param params Configuration parameters for this instance
     * @returns The text string to display on the LED matrix
     */
    fetch: (params: TParams) => Promise<string> | string;
    /**
     * Default refresh interval in milliseconds
     */
    defaultInterval?: number;
    /**
     * Configuration schema for the plugin
     * Defines what inputs are needed and their defaults
     */
    configSchema?: ConfigField[];
}
