import { LEDPlugin } from './types';

interface ClockParams {
    format?: '12h' | '24h';
    showSeconds?: boolean;
    showMilliseconds?: boolean;
    updateInterval?: number;
}

export const ClockPlugin: LEDPlugin<ClockParams> = {
    id: 'clock',
    name: 'Digital Clock',
    description: 'Displays current time with optional milliseconds. For smooth ms display, use 10-100ms update interval. 1ms works but uses more CPU.',
    defaultInterval: 1000, // Default: update every second
    configSchema: [
        {
            key: 'format',
            type: 'select',
            label: 'Time Format',
            defaultValue: '12h',
            options: [
                { value: '12h', label: '12 Hour' },
                { value: '24h', label: '24 Hour' }
            ]
        },
        {
            key: 'showSeconds',
            type: 'boolean',
            label: 'Show Seconds',
            defaultValue: true
        },
        {
            key: 'showMilliseconds',
            type: 'boolean',
            label: 'Show Milliseconds',
            defaultValue: false
        },
        {
            key: 'updateInterval',
            type: 'number',
            label: 'Update Frequency (ms)',
            defaultValue: 1000,
            min: 1,
            max: 60000,
            placeholder: '1000 = 1 second, 100 = smooth ms, 1 = full speed'
        }
    ],

    fetch: async ({ format = '24h', showSeconds = true, showMilliseconds = false }) => {
        const now = new Date();

        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const milliseconds = now.getMilliseconds().toString().padStart(3, '0');

        // Build time string
        let timeStr = '';

        if (format === '12h') {
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'

            timeStr = `${hours}:${minutes}`;

            if (showSeconds) {
                timeStr += `:${seconds}`;

                if (showMilliseconds) {
                    timeStr += `.${milliseconds}`;
                }
            }

            timeStr += ` ${ampm}`;
            return timeStr;
        }

        // 24h format
        const hoursStr = hours.toString().padStart(2, '0');
        timeStr = `${hoursStr}:${minutes}`;

        if (showSeconds) {
            timeStr += `:${seconds}`;

            if (showMilliseconds) {
                timeStr += `.${milliseconds}`;
            }
        }

        return timeStr;
    }
};
