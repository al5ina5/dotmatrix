import { LEDPlugin } from './types';

interface SunParams {
    lat: number;
    lng: number;
}

export const SunPlugin: LEDPlugin<SunParams> = {
    id: 'sun',
    name: 'Sunrise/Sunset',
    description: 'Displays sunrise and sunset times',
    defaultInterval: 3600000, // 1 hour

    fetch: async ({ lat, lng }) => {
        try {
            const res = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`);
            if (!res.ok) return 'Sun Data Error';
            const data = await res.json();

            if (data.status !== 'OK') return 'Sun Data Error';

            const formatTime = (isoStr: string) => {
                const date = new Date(isoStr);
                return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            };

            const sunrise = formatTime(data.results.sunrise);
            const sunset = formatTime(data.results.sunset);

            return `SUNRISE: ${sunrise}   SUNSET: ${sunset}`;
        } catch (e) {
            return 'Sun Data Error';
        }
    }
};
