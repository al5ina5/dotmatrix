import { LEDPlugin } from './types';

export const ISSPlugin: LEDPlugin = {
    id: 'iss',
    name: 'ISS Tracker',
    description: 'Tracks the International Space Station',
    defaultInterval: 10000, // 10 sec

    fetch: async () => {
        try {
            const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
            if (!res.ok) return 'ISS: Signal Lost';
            const data = await res.json();

            // Reverse geocoding would be cool but requires keys usually.
            // We'll show Lat/Long and Speed.
            const lat = data.latitude.toFixed(2);
            const lon = data.longitude.toFixed(2);
            const speed = Math.round(data.velocity).toLocaleString();

            return `ISS LOCATION: ${lat}, ${lon}  SPEED: ${speed} km/h`;
        } catch (e) {
            return 'ISS: Offline';
        }
    }
};
