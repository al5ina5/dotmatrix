import { LEDPlugin } from './types';
import { withPluginErrorHandling } from '@/lib/pluginHelpers';

interface WeatherParams {
    zipCode?: string;
    countryCode?: string; // Default 'us'
    unit?: 'C' | 'F';
}

export const WeatherPlugin: LEDPlugin<WeatherParams> = {
    id: 'weather',
    name: 'Weather',
    description: 'Real weather from Open-Meteo (No Key Required)',
    defaultInterval: 600000, // 10 minutes
    configSchema: [
        {
            key: 'zipCode',
            type: 'text',
            label: 'Zip Code',
            defaultValue: '10001',
            placeholder: 'Enter zip code',
            required: true
        },
        {
            key: 'countryCode',
            type: 'text',
            label: 'Country Code',
            defaultValue: 'us',
            placeholder: 'e.g., us, ca, uk'
        },
        {
            key: 'unit',
            type: 'select',
            label: 'Temperature Unit',
            defaultValue: 'F',
            options: [
                { value: 'F', label: 'Fahrenheit' },
                { value: 'C', label: 'Celsius' }
            ]
        }
    ],

    fetch: async ({ zipCode = '10001', countryCode = 'us', unit = 'F' }) => withPluginErrorHandling(
        'weather',
        async () => {
            // 1. Get Lat/Long from Zip Code (No Key)
            const geoRes = await fetch(`https://api.zippopotam.us/${countryCode}/${zipCode}`);
            if (!geoRes.ok) throw new Error('Invalid Zip Code');
            const geoData = await geoRes.json();

            const lat = geoData.places[0].latitude;
            const lon = geoData.places[0].longitude;
            const city = geoData.places[0]['place name'];

            // 2. Get Weather from Open-Meteo (No Key)
            const tempUnit = unit === 'F' ? 'fahrenheit' : 'celsius';
            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=${tempUnit}`
            );
            if (!weatherRes.ok) throw new Error('Weather API Error');
            const weatherData = await weatherRes.json();

            const temp = Math.round(weatherData.current.temperature_2m);
            const code = weatherData.current.weather_code;

            // Map WMO codes to text
            let condition = 'Clear';
            if (code >= 1 && code <= 3) condition = 'Cloudy';
            else if (code >= 45 && code <= 48) condition = 'Fog';
            else if (code >= 51 && code <= 67) condition = 'Rain';
            else if (code >= 71 && code <= 77) condition = 'Snow';
            else if (code >= 80 && code <= 82) condition = 'Rain';
            else if (code >= 95) condition = 'Storm';

            return `${temp}°${unit} ${condition} in ${city}!`;
        },
        'Weather Unavailable'
    )
};
