import { LEDPlugin } from './types';
import { withPluginErrorHandling } from '@/lib/pluginHelpers';

interface MoviesParams {
    apiKey: string;
    limit?: number;
    separator?: string;
}

export const MoviesPlugin: LEDPlugin<MoviesParams> = {
    id: 'movies',
    name: 'Upcoming Movies',
    description: 'Displays upcoming movies from TMDB',
    defaultInterval: 300000, // Update every 5 minutes
    configSchema: [
        {
            key: 'apiKey',
            label: 'TMDB API Key',
            type: 'text',
            defaultValue: '',
            required: true,
            placeholder: 'Get free API key from themoviedb.org',
        },
        {
            key: 'limit',
            label: 'Number of Movies',
            type: 'number',
            defaultValue: 5,
            min: 1,
            max: 20,
        },
        {
            key: 'separator',
            label: 'Separator',
            type: 'text',
            defaultValue: ' *** ',
            placeholder: 'Text between movie titles',
        }
    ],

    fetch: async ({ apiKey, limit = 5, separator = ' *** ' }) => {
        if (!apiKey) {
            return '🎬 Movies: Add TMDB API key in settings (free at themoviedb.org)';
        }

        return withPluginErrorHandling(
            'movies',
            async () => {
                const response = await fetch(
                    `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=en-US&page=1`
                );

                if (!response.ok) {
                    if (response.status === 401) {
                        return '🎬 Movies: Invalid API key';
                    }
                    throw new Error('Failed to fetch movies');
                }

                const data = await response.json();
                const titles = data.results.slice(0, limit).map((m: any) => m.title);

                return `🎬 ${titles.join(separator)}`;
            },
            '🎬 Movies: Unable to load data'
        );
    }
};
