import { LEDPlugin } from './types';

interface ClockParams {
    format?: '12h' | '24h';
    showSeconds?: boolean;
}

export const ClockPlugin: LEDPlugin<ClockParams> = {
    id: 'clock',
    name: 'Digital Clock',
    description: 'Displays current time',
    defaultInterval: 1000, // Update every second

    fetch: ({ format = '24h', showSeconds = true }) => {
        const now = new Date();

        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');

        if (format === '12h') {
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'

            if (showSeconds) {
                return `${hours}:${minutes}:${seconds}`;
            }
            return `${hours}:${minutes}`;
        }

        // 24h format
        const hoursStr = hours.toString().padStart(2, '0');
        if (showSeconds) {
            return `${hoursStr}:${minutes}:${seconds}`;
        }
        return `${hoursStr}:${minutes}`;
    }
};
