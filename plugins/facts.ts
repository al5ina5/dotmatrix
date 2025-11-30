import { LEDPlugin } from './types';

export const FactsPlugin: LEDPlugin = {
    id: 'facts',
    name: 'Random Facts',
    description: 'Fetches useless random facts',
    defaultInterval: 60000, // 1 min

    fetch: async () => {
        try {
            const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
            if (!res.ok) return 'Fact Error';
            const data = await res.json();
            return `DID YOU KNOW? ${data.text}`;
        } catch (e) {
            return 'Fact Error';
        }
    }
};
