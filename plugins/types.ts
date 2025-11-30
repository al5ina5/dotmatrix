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
}
