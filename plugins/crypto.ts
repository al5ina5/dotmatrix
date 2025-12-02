import { LEDPlugin } from './types';
import { withPluginErrorHandling } from '@/lib/pluginHelpers';

interface CryptoParams {
    coins: string[];  // CoinGecko IDs (e.g., 'bitcoin', 'ethereum', 'sonic-3')
    currency?: string;
}

export const CryptoPlugin: LEDPlugin<CryptoParams> = {
    id: 'crypto',
    name: 'Crypto Ticker',
    description: 'Live crypto prices from CoinGecko (Free)',
    defaultInterval: 60000, // 1 minute (CoinGecko free tier limit friendly)
    configSchema: [
        {
            key: 'coins',
            type: 'array',
            label: 'Coins to Track',
            defaultValue: ['bitcoin', 'ethereum'],
            placeholder: 'bitcoin, ethereum, sonic-3'
        },
        {
            key: 'currency',
            type: 'select',
            label: 'Currency',
            defaultValue: 'usd',
            options: [
                { value: 'usd', label: 'USD' },
                { value: 'eur', label: 'EUR' },
                { value: 'gbp', label: 'GBP' }
            ]
        }
    ],

    fetch: async ({ coins, currency = 'usd' }) => withPluginErrorHandling(
        'crypto',
        async () => {
            if (!coins || coins.length === 0) return 'No coins configured';

            // Common coin ID to symbol mapping
            const symbolMap: Record<string, string> = {
                'bitcoin': 'BTC',
                'ethereum': 'ETH',
                'sonic-3': 'S',
                'solana': 'SOL',
                'cardano': 'ADA',
                'ripple': 'XRP',
                'polkadot': 'DOT',
                'dogecoin': 'DOGE',
                'avalanche-2': 'AVAX',
                'chainlink': 'LINK'
            };

            const ids = coins.join(',');
            // Direct CoinGecko API call (free tier, no key required)
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${currency}&include_24hr_change=true`;

            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 429) return 'Rate Limit (Wait...)';
                throw new Error('CoinGecko API Error');
            }

            const data = await response.json();

            // Format with colored segments: label (gray), price (green/red)
            const segments = [];

            for (let i = 0; i < coins.length; i++) {
                const coinId = coins[i];
                const coinData = data[coinId];
                const price = coinData?.[currency];
                const change = coinData?.[`${currency}_24h_change`];
                const symbol = symbolMap[coinId] || coinId.toUpperCase().slice(0, 4);

                if (price === undefined) {
                    segments.push({ text: `${symbol}: ???`, color: '#888888' });
                } else {
                    // Format price nicely
                    let priceStr = price.toString();
                    if (price >= 1000) {
                        priceStr = price.toLocaleString('en-US', { maximumFractionDigits: 0 });
                    } else if (price < 1) {
                        priceStr = price.toFixed(4);
                    } else {
                        priceStr = price.toFixed(2);
                    }

                    // Determine arrow
                    let arrow = '';
                    if (change !== undefined) {
                        arrow = change >= 0 ? '↑' : '↓';
                    }

                    // Determine color based on change
                    const priceColor = change === undefined ? '#ffffff' : (change >= 0 ? '#228B22' : '#E33E33');

                    // Add segments: label (gray), price (green/red), arrow (green/red)
                    segments.push({ text: `${symbol}: `, color: '#888888' });
                    segments.push({ text: `$${priceStr} ${arrow}`, color: priceColor });
                }

                // Add spacing between coins (except for the last one)
                if (i < coins.length - 1) {
                    segments.push({ text: '   ', color: '#888888' });
                }
            }

            return segments;
        },
        coins?.map(c => c.toUpperCase().slice(0, 3)).join(', ')
            ? `💰 ${coins.map(c => c.toUpperCase().slice(0, 3)).join(', ')}: Fetching prices...`
            : '💰 Crypto: Fetching prices...'
    )
};
