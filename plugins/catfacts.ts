import { LEDPlugin } from './types';

export const CatFactsPlugin: LEDPlugin = {
    id: 'catfacts',
    name: 'Cat Facts',
    description: 'Random cat facts',
    defaultInterval: 60000, // 1 min

    fetch: async () => {
        try {
            const res = await fetch('https://catfact.ninja/fact');
            if (!res.ok) return 'Meow Error';
            const data = await res.json();
            return `CAT FACT: ${data.fact}`;
        } catch (e) {
            return 'Meow Error';
        }
    }
};
