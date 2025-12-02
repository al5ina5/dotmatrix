import { LEDPlugin } from './types';
import { withPluginErrorHandling } from '@/lib/pluginHelpers';

export const FactsPlugin: LEDPlugin = {
    id: 'facts',
    name: 'Random Facts',
    description: 'Fetches useless random facts',
    defaultInterval: 60000, // 1 min

    fetch: async () => withPluginErrorHandling(
        'facts',
        async () => {
            const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
            if (!res.ok) throw new Error('Failed to fetch fact');
            const data = await res.json();
            return `DID YOU KNOW? ${data.text}`;
        },
        'Fact Error'
    )
};
