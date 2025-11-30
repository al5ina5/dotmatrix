import { LEDPlugin } from './types';

interface WeatherParams {
    city?: string;
    unit?: 'C' | 'F';
}

// This is a mock plugin for now, but demonstrates async fetching
export const WeatherPlugin: LEDPlugin<WeatherParams> = {
    id: 'weather',
    name: 'Weather',
    description: 'Displays current weather (Mock)',
    defaultInterval: 600000, // 10 minutes

    fetch: async ({ city = 'New York', unit = 'C' }) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock data - in a real plugin this would fetch from OpenWeatherMap etc.
        const temps = {
            'New York': 22,
            'London': 15,
            'Tokyo': 26,
            'Paris': 18
        };

        const baseTemp = temps[city as keyof typeof temps] || 20;
        const temp = unit === 'F' ? (baseTemp * 9 / 5) + 32 : baseTemp;

        const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Clear'];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];

        return `${city}: ${Math.round(temp)}°${unit} ${condition}`;
    }
};
