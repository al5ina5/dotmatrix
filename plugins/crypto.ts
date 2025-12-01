import { LEDPlugin } from './types';

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

    fetch: async ({ coins, currency = 'usd' }) => {
        try {
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
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${currency}`;

            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 429) return 'Rate Limit (Wait...)';
                throw new Error('CoinGecko API Error');
            }

            const data = await response.json();

            // Format: "BTC: $95,000  ETH: $3,200  S: $0.85"
            const parts = coins.map(coinId => {
                const price = data[coinId]?.[currency];
                const symbol = symbolMap[coinId] || coinId.toUpperCase().slice(0, 4);

                if (price === undefined) return `${symbol}: ???`;

                // Format price nicely
                let priceStr = price.toString();
                if (price >= 1000) {
                    priceStr = price.toLocaleString('en-US', { maximumFractionDigits: 0 });
                } else if (price < 1) {
                    priceStr = price.toFixed(4);
                } else {
                    priceStr = price.toFixed(2);
                }

                return `${symbol}: $${priceStr}`;
            });

            return parts.join('   ');
        } catch (error) {
            console.error('Crypto plugin error:', error);
            // Return friendlier message with the coins they're trying to track
            const coinList = coins?.map(c => c.toUpperCase().slice(0, 3)).join(', ') || 'crypto';
            return `💰 ${coinList}: Fetching prices...`;
        }
    }
};
