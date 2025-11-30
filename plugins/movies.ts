import { LEDPlugin } from './types';

interface MoviesParams {
    limit?: number;
    separator?: string;
}

export const MoviesPlugin: LEDPlugin<MoviesParams> = {
    id: 'movies',
    name: 'Upcoming Movies',
    description: 'Displays upcoming movies from TMDB',
    defaultInterval: 300000, // Update every 5 minutes

    fetch: async ({ limit = 5, separator = ' *** ' }) => {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

        if (!apiKey) {
            return 'Error: Missing API Key';
        }

        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=en-US&page=1`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }

            const data = await response.json();
            const titles = data.results.slice(0, limit).map((m: any) => m.title);

            return `${titles.join(separator)}`;
        } catch (error) {
            console.error('Movies plugin error:', error);
            return 'Error Loading Data';
        }
    }
};
