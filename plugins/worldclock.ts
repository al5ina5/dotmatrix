import { LEDPlugin } from './types';

interface WorldClockParams {
    timezones: { label: string; region: string }[]; // e.g. [{label: 'NYC', region: 'America/New_York'}]
    format?: '12h' | '24h';
}

export const WorldClockPlugin: LEDPlugin<WorldClockParams> = {
    id: 'worldclock',
    name: 'World Clock',
    description: 'Displays time for multiple timezones',
    defaultInterval: 60000, // 1 min update

    fetch: async ({ timezones, format = '24h' }) => {
        try {
            const parts = await Promise.all(timezones.map(async (tz) => {
                const res = await fetch(`http://worldtimeapi.org/api/timezone/${tz.region}`);
                if (!res.ok) return `${tz.label}: Err`;
                const data = await res.json();

                const date = new Date(data.datetime);
                let hours = date.getHours();
                const minutes = date.getMinutes().toString().padStart(2, '0');

                let timeStr = '';
                if (format === '12h') {
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12 || 12;
                    timeStr = `${hours}:${minutes} ${ampm}`;
                } else {
                    timeStr = `${hours.toString().padStart(2, '0')}:${minutes}`;
                }

                return `${tz.label}: ${timeStr}`;
            }));

            return parts.join('   ');
        } catch (e) {
            return 'World Clock Error';
        }
    }
};
