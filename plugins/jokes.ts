import { LEDPlugin } from './types';

export const JokesPlugin: LEDPlugin = {
    id: 'jokes',
    name: 'Dad Jokes',
    description: 'Fetches random dad jokes',
    defaultInterval: 60000, // 1 min

    fetch: async () => {
        try {
            const res = await fetch('https://icanhazdadjoke.com/', {
                headers: { 'Accept': 'application/json' }
            });
            if (!res.ok) return 'No jokes today...';
            const data = await res.json();
            return data.joke;
        } catch (e) {
            return 'Joke Error';
        }
    }
};
