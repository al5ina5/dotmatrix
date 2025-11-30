import { LEDPlugin } from './types';

interface RedditPluginParams {
    subreddit: string;
    sortBy?: string;
    limit?: number;
}

export const RedditPlugin: LEDPlugin<RedditPluginParams> = {
    id: 'reddit',
    name: 'Reddit Feed',
    description: 'Display top posts from any subreddit',
    defaultInterval: 300000, // Update every 5 minutes
    configSchema: [
        {
            key: 'subreddit',
            label: 'Subreddit',
            type: 'text',
            defaultValue: 'showerthoughts',
            placeholder: 'showerthoughts, todayilearned, etc.',
        },
        {
            key: 'sortBy',
            label: 'Sort By',
            type: 'select',
            defaultValue: 'hot',
            options: [
                { value: 'hot', label: 'Hot' },
                { value: 'new', label: 'New' },
                { value: 'top', label: 'Top' },
                { value: 'rising', label: 'Rising' },
            ]
        },
        {
            key: 'limit',
            label: 'Number of Posts',
            type: 'number',
            defaultValue: 3,
            min: 1,
            max: 10,
        }
    ],
    fetch: async (params) => {
        try {
            const subreddit = params.subreddit || 'showerthoughts';
            const sortBy = params.sortBy || 'hot';
            const limit = params.limit || 3;
            
            // Reddit JSON API (public, no authentication required)
            const response = await fetch(
                `https://www.reddit.com/r/${subreddit}/${sortBy}.json?limit=${limit}`,
                {
                    headers: {
                        'User-Agent': 'LED-Ticker/1.0'
                    }
                }
            );
            
            if (!response.ok) throw new Error('Failed to fetch Reddit data');
            
            const data = await response.json();
            const posts = data.data?.children || [];
            
            if (posts.length === 0) {
                return `No posts found in r/${subreddit}`;
            }
            
            const postTitles = posts.map((post: any) => {
                const title = post.data?.title || 'No title';
                const score = post.data?.score || 0;
                const numComments = post.data?.num_comments || 0;
                
                return `r/${subreddit}: ${title} (↑${score} 💬${numComments})`;
            });
            
            return postTitles.join(' | ');
            
        } catch (error) {
            console.error('Error fetching Reddit data:', error);
            return `r/${params.subreddit || 'reddit'} unavailable`;
        }
    }
};

