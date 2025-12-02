import { LEDPlugin } from './types';
import { withPluginErrorHandling } from '@/lib/pluginHelpers';

export const HackerNewsPlugin: LEDPlugin = {
    id: 'hackernews',
    name: 'Hacker News',
    description: 'Top stories from Hacker News',
    defaultInterval: 300000, // 5 mins

    fetch: async () => withPluginErrorHandling(
        'hackernews',
        async () => {
            // 1. Get top story IDs
            const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
            if (!topRes.ok) throw new Error('Failed to fetch top stories');
            const topIds = await topRes.json();

            // 2. Get details for top 5
            const stories = await Promise.all(topIds.slice(0, 5).map(async (id: number) => {
                const sRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
                const sData = await sRes.json();
                return sData.title;
            }));

            return `HN TOP 5: ${stories.join('   •   ')}`;
        },
        'HN: Unable to load stories'
    )
};
