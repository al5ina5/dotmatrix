/**
 * LED Ticker Configuration
 * Customize the appearance and behavior of the LED display here
 */

export const LED_CONFIG = {
    // Display Hardware Settings
    display: {
        dotSize: 6,
        dotColor: '#00ff00',
        dotGap: 2,
    },

    // Layout Settings
    layout: {
        rowSpacing: 4,        // Vertical spacing between text rows (in LED dots)
        pageInterval: 10000,  // Time to show each page (ms)
    },

    // Content Rows (each row scrolls independently)
    rows: [
        // --- PAGE 1: Essentials ---
        {
            type: 'dynamic',
            pluginId: 'clock',
            params: { format: '12h', showSeconds: true },
            refreshInterval: 1000,
            stepInterval: 300,
            scrolling: false,
            alignment: 'center',
            spacing: { betweenLetters: 1, betweenWords: 4, beforeRepeat: 12 }
        },
        {
            type: 'dynamic',
            pluginId: 'weather',
            params: { zipCode: '34120', unit: 'F' },
            stepInterval: 120,
            color: '#0099ff',
            spacing: { betweenLetters: 1, betweenWords: 4, beforeRepeat: 12 }
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
            stepInterval: 120,
            color: '#00ff00',
            spacing: { betweenLetters: 1, betweenWords: 4, beforeRepeat: 20 }
        },

        // // --- PAGE 2: News & Info ---
        // {
        //     type: 'dynamic',
        //     pluginId: 'hackernews',
        //     stepInterval: 50,
        //     color: '#ff61200', // HN Orange
        //     spacing: { betweenLetters: 1, betweenWords: 4, beforeRepeat: 20 }
        // },
        // {
        //     type: 'dynamic',
        //     pluginId: 'worldclock',
        //     params: {
        //         timezones: [
        //             { label: 'LON', region: 'Europe/London' },
        //             { label: 'TOK', region: 'Asia/Tokyo' },
        //             { label: 'SYD', region: 'Australia/Sydney' }
        //         ]
        //     },
        //     stepInterval: 100,
        //     color: '#ff00ff',
        //     spacing: { betweenLetters: 1, betweenWords: 4, beforeRepeat: 20 }
        // },
        // {
        //     type: 'dynamic',
        //     pluginId: 'iss',
        //     stepInterval: 80,
        //     color: '#ffffff',
        //     spacing: { betweenLetters: 1, betweenWords: 4, beforeRepeat: 20 }
        // },

        // // --- PAGE 3: Fun & Random ---
        // {
        //     type: 'dynamic',
        //     pluginId: 'jokes',
        //     stepInterval: 120,
        //     color: '#ffff00',
        //     spacing: { betweenLetters: 1, betweenWords: 4, beforeRepeat: 20 }
        // },
        // {
        //     type: 'dynamic',
        //     pluginId: 'facts',
        //     stepInterval: 120,
        //     color: '#00ffff',
        //     spacing: { betweenLetters: 1, betweenWords: 4, beforeRepeat: 20 }
        // },
        // {
        //     type: 'dynamic',
        //     pluginId: 'catfacts',
        //     stepInterval: 120,
        //     color: '#ff9999',
        //     spacing: { betweenLetters: 1, betweenWords: 4, beforeRepeat: 20 }
        // },

        // // --- PAGE 4: System & Misc ---
        // {
        //     type: 'dynamic',
        //     pluginId: 'holidays',
        //     params: { countryCode: 'US' },
        //     stepInterval: 100,
        //     color: '#99ff99',
        //     spacing: { betweenLetters: 1, betweenWords: 4, beforeRepeat: 20 }
        // },
        // {
        //     type: 'dynamic',
        //     pluginId: 'sun',
        //     params: { lat: 40.71, lng: -74.00 }, // NYC
        //     stepInterval: 100,
        //     color: '#ffcc00',
        //     spacing: { betweenLetters: 1, betweenWords: 4, beforeRepeat: 20 }
        // },
        // {
        //     type: 'dynamic',
        //     pluginId: 'system',
        //     stepInterval: 100,
        //     color: '#666666',
        //     spacing: { betweenLetters: 1, betweenWords: 4, beforeRepeat: 20 }
        // },
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
