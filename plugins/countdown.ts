import { LEDPlugin } from './types';
import { withPluginErrorHandling } from '@/lib/pluginHelpers';

interface CountdownPluginParams {
    eventName: string;
    targetDate: string;
    showTime?: boolean;
}

export const CountdownPlugin: LEDPlugin<CountdownPluginParams> = {
    id: 'countdown',
    name: 'Event Countdown',
    description: 'Countdown to any date/event',
    defaultInterval: 1000, // Update every second for accuracy
    configSchema: [
        {
            key: 'eventName',
            label: 'Event Name',
            type: 'text',
            defaultValue: 'New Year',
            placeholder: 'My Birthday, Product Launch, etc.',
        },
        {
            key: 'targetDate',
            label: 'Target Date',
            type: 'text',
            defaultValue: '2026-01-01',
            placeholder: 'YYYY-MM-DD or YYYY-MM-DD HH:MM',
        },
        {
            key: 'showTime',
            label: 'Show Time (HH:MM:SS)',
            type: 'boolean',
            defaultValue: false,
        }
    ],
    fetch: async (params) => withPluginErrorHandling(
        'countdown',
        async () => {
            const eventName = params.eventName || 'Event';
            const targetDate = params.targetDate || '2026-01-01';
            const showTime = params.showTime ?? false;
            
            const target = new Date(targetDate);
            const now = new Date();
            
            if (isNaN(target.getTime())) {
                return `Invalid date format for ${eventName}`;
            }
            
            const diff = target.getTime() - now.getTime();
            
            // Event has passed
            if (diff < 0) {
                const absDiff = Math.abs(diff);
                const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
                return `${eventName} was ${days} day${days !== 1 ? 's' : ''} ago`;
            }
            
            // Calculate time units
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            // Format output
            if (days > 0) {
                if (showTime) {
                    return `${eventName}: ${days}d ${hours}h ${minutes}m ${seconds}s`;
                } else {
                    return `${eventName}: ${days} day${days !== 1 ? 's' : ''}`;
                }
            } else if (hours > 0) {
                return `${eventName}: ${hours}h ${minutes}m ${seconds}s`;
            } else if (minutes > 0) {
                return `${eventName}: ${minutes}m ${seconds}s`;
            } else {
                return `${eventName}: ${seconds}s`;
            }
        },
        'Countdown error'
    )
};

