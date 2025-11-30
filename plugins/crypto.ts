import { LEDPlugin } from './types';

interface CoinConfig {
    id: string;      // CoinGecko ID (e.g., 'bitcoin', 'ethereum')
    symbol: string;  // Display symbol (e.g., 'BTC', 'ETH')
}

interface CryptoParams {
    coins: CoinConfig[];
    currency?: string;
}

export const CryptoPlugin: LEDPlugin<CryptoParams> = {
    id: 'crypto',
    name: 'Crypto Ticker',
    description: 'Live crypto prices from CoinGecko (Free)',
    defaultInterval: 60000, // 1 minute (CoinGecko free tier limit friendly)

    fetch: async ({ coins, currency = 'usd' }) => {
        try {
            if (!coins || coins.length === 0) return 'No coins configured';

            const ids = coins.map(c => c.id).join(',');
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${currency}`;

            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 429) return 'Rate Limit (Wait...)';
                throw new Error('CoinGecko API Error');
            }

            const data = await response.json();

            // Format: "BTC: $95,000  ETH: $3,200  S: $0.85"
            const parts = coins.map(coin => {
                const price = data[coin.id]?.[currency];
                if (price === undefined) return `${coin.symbol}: ???`;

                // Format price nicely
                let priceStr = price.toString();
                if (price >= 1000) {
                    priceStr = price.toLocaleString('en-US', { maximumFractionDigits: 0 });
                } else if (price < 1) {
                    priceStr = price.toFixed(4);
                }

                return `${coin.symbol}: $${priceStr}`;
            });

            return parts.join('   ');
        } catch (error) {
            console.error('Crypto plugin error:', error);
            return 'Crypto Data Error';
        }
    }
};
