/**
 * LED Ticker Configuration
 * Customize the appearance and behavior of the LED display here
 */

export const LED_CONFIG = {
    // Display Hardware Settings
    display: {
        dotSize: 8,
        dotColor: '#00ff00',
        dotGap: 2,
    },

    // Layout Settings
    layout: {
        rowSpacing: 4,        // Vertical spacing between text rows (in LED dots)
    },

    // Content Rows (each row scrolls independently)
    rows: [
        {
            type: 'dynamic',
            pluginId: 'clock',
            params: { format: '12h', showSeconds: true },
            refreshInterval: 1000,
            stepInterval: 300,
            scrolling: false,
            alignment: 'center',
            spacing: {
                betweenLetters: 1,
                betweenWords: 4,
                beforeRepeat: 12,
            }
        },
        {
            type: 'dynamic',
            pluginId: 'weather',
            params: { zipCode: '34120', unit: 'F' },
            stepInterval: 60,
            color: '#0099ff',
            spacing: {
                betweenLetters: 1,
                betweenWords: 4,
                beforeRepeat: 12,
            }
        },
        {
            type: 'dynamic',
            pluginId: 'movies',
            params: { limit: 10, },
            stepInterval: 60, // Faster scroll for ticker
            color: '#ffbf00',  // Amber/Gold color for cinema feel
            spacing: {
                betweenLetters: 1,
                betweenWords: 4,
                beforeRepeat: 20,
            }
        },
        {
            type: 'dynamic',
            pluginId: 'crypto',
            params: {
                coins: [
                    { id: 'bitcoin', symbol: 'BTC' },
                    { id: 'ethereum', symbol: 'ETH' },
                    { id: 'sonic-3', symbol: 'S' }
                ]
            },
            stepInterval: 60,
            color: '#00ff00',
            spacing: {
                betweenLetters: 1,
                betweenWords: 4,
                beforeRepeat: 20,
            }
        },
        {
            type: 'dynamic',
            pluginId: 'crypto',
            params: {
                coins: [
                    { id: 'bitcoin', symbol: 'BTC' },
                    { id: 'ethereum', symbol: 'ETH' },
                    { id: 'sonic-3', symbol: 'S' }
                ]
            },
            stepInterval: 60,
            color: '#00ff00',
            spacing: {
                betweenLetters: 1,
                betweenWords: 4,
                beforeRepeat: 20,
            }
        },
    ]
} as const;

// Define the types for our configuration
export type BaseRowConfig = {
    stepInterval: number;
    color?: string;
    scrolling?: boolean; // Default: true
    alignment?: 'left' | 'center' | 'right'; // Default: 'left' (only applies if scrolling is false)
    spacing: {
        betweenLetters: number;
        betweenWords: number;
        beforeRepeat: number;
    };
};

export type StaticRowConfig = BaseRowConfig & {
    type: 'text';
    content: string;
};

export type DynamicRowConfig = BaseRowConfig & {
    type: 'dynamic';
    pluginId: string;
    params?: any;
    refreshInterval?: number;
};

export type LEDRowConfig = StaticRowConfig | DynamicRowConfig;
