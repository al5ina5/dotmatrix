import { LEDPlugin } from './types';
import { withPluginErrorHandling } from '@/lib/pluginHelpers';

export const JokesPlugin: LEDPlugin = {
    id: 'jokes',
    name: 'Dad Jokes',
    description: 'Fetches random dad jokes',
    defaultInterval: 60000, // 1 min

    fetch: async () => withPluginErrorHandling(
        'jokes',
        async () => {
            const res = await fetch('https://icanhazdadjoke.com/', {
                headers: { 'Accept': 'application/json' }
            });
            if (!res.ok) throw new Error('Failed to fetch joke');
            const data = await res.json();
            return data.joke;
        },
        'No jokes today...'
    )
};
