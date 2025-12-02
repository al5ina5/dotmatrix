import { LEDPlugin } from './types';
import { withPluginErrorHandling } from '@/lib/pluginHelpers';

export const CatFactsPlugin: LEDPlugin = {
    id: 'catfacts',
    name: 'Cat Facts',
    description: 'Random cat facts',
    defaultInterval: 60000, // 1 min

    fetch: async () => withPluginErrorHandling(
        'catfacts',
        async () => {
            const res = await fetch('https://catfact.ninja/fact');
            if (!res.ok) throw new Error('Failed to fetch cat fact');
            const data = await res.json();
            return `CAT FACT: ${data.fact}`;
        },
        'Meow Error'
    )
};
