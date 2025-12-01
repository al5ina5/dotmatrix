import { LEDPlugin } from './types';

interface StocksPluginParams {
    apiKey: string;
    symbols: string[];
}

export const StocksPlugin: LEDPlugin<StocksPluginParams> = {
    id: 'stocks',
    name: 'Stock Ticker',
    description: 'Display real-time stock prices using Finnhub API (free tier available)',
    defaultInterval: 60000, // Update every minute
    configSchema: [
        {
            key: 'apiKey',
            label: 'Finnhub API Key',
            type: 'text',
            defaultValue: '',
            required: true,
            placeholder: 'Get free API key from finnhub.io',
        },
        {
            key: 'symbols',
            label: 'Stock Symbols',
            type: 'array',
            defaultValue: ['AAPL', 'GOOGL', 'MSFT'],
            placeholder: 'AAPL, GOOGL, TSLA',
        }
    ],
    fetch: async (params) => {
        try {
            const { apiKey, symbols = ['AAPL', 'GOOGL', 'MSFT'] } = params;

            if (!apiKey) {
                return '📈 Stocks: Add Finnhub API key in settings (free at finnhub.io)';
            }

            // Finnhub API - Free tier: 60 calls/minute, CORS-enabled
            const stockPromises = symbols.map(async (symbol) => {
                const response = await fetch(
                    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
                );

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Invalid API key');
                    }
                    throw new Error('Failed to fetch');
                }

                const data = await response.json();

                // Finnhub returns: c (current), d (change), dp (percent change)
                const price = data.c?.toFixed(2) || 'N/A';
                const change = data.d?.toFixed(2) || '0';
                const changePercent = data.dp?.toFixed(2) || '0';
                const arrow = parseFloat(change) >= 0 ? '↑' : '↓';

                return `${symbol} $${price} ${arrow}${Math.abs(parseFloat(changePercent))}%`;
            });

            const results = await Promise.all(stockPromises);
            return `📈 ${results.join(' | ')}`;

        } catch (error) {
            console.error('Error fetching stock data:', error);
            if (error instanceof Error && error.message === 'Invalid API key') {
                return '📈 Stocks: Invalid API key';
            }
            const symbolList = (params.symbols || []).join(', ');
            return symbolList
                ? `📈 ${symbolList}: Loading...`
                : `📈 Stocks: Configure in settings`;
        }
    }
};

