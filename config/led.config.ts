/**
 * LED Ticker Configuration
 * Customize the appearance and behavior of the LED display here
 */

export const LED_CONFIG = {
    // Text to display
    text: 'This is a TEST.',

    // Visual settings
    dotSize: 10,          // Size of each LED bulb in pixels
    dotColor: '#00ff00',  // Color of the LEDs (hex color)
    dotGap: 3,            // Gap between LED bulbs in pixels

    // Animation settings
    stepInterval: 150,    // Time between each scroll step in milliseconds (lower = faster)

    // Spacing settings (in dot columns)
    spacing: {
        betweenLetters: 1,  // Dots between letters
        betweenWords: 4,    // Dots for word spaces
        beforeRepeat: 12,   // Dots before text repeats
    }
} as const;
