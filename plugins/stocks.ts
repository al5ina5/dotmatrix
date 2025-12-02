import { LEDPlugin } from './types';
import { withPluginErrorHandling } from '@/lib/pluginHelpers';

interface StocksPluginParams {
    apiKey: string;
    symbols: string[];
    positiveColor?: string;
    negativeColor?: string;
    labelColor?: string;
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
        },
        {
            key: 'positiveColor',
            type: 'color',
            label: 'Positive Change Color (↑)',
            defaultValue: '#228B22'
        },
        {
            key: 'negativeColor',
            type: 'color',
            label: 'Negative Change Color (↓)',
            defaultValue: '#E33E33'
        },
        {
            key: 'labelColor',
            type: 'color',
            label: 'Symbol Label Color',
            defaultValue: '#888888'
        }
    ],
    fetch: async (params) => withPluginErrorHandling(
        'stocks',
        async () => {
            const {
                apiKey,
                symbols = ['AAPL', 'GOOGL', 'MSFT'],
                positiveColor = '#228B22',
                negativeColor = '#E33E33',
                labelColor = '#888888'
            } = params;

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
                const changeNum = parseFloat(change);
                const arrow = changeNum >= 0 ? '↑' : '↓';

                // Determine color based on change
                const priceColor = changeNum >= 0 ? positiveColor : negativeColor;

                return {
                    symbol,
                    price,
                    changePercent: Math.abs(parseFloat(changePercent)),
                    arrow,
                    priceColor
                };
            });

            const results = await Promise.all(stockPromises);

            // Build colored segments
            const segments = [{ text: '📈 ', color: labelColor }];

            results.forEach((stock, i) => {
                segments.push({ text: `${stock.symbol} `, color: labelColor });
                segments.push({ text: `$${stock.price} ${stock.arrow}${stock.changePercent}%`, color: stock.priceColor });

                if (i < results.length - 1) {
                    segments.push({ text: ' | ', color: labelColor });
                }
            });

            return segments;
        },
        params.symbols?.length
            ? `📈 ${params.symbols.join(', ')}: Loading...`
            : '📈 Stocks: Configure in settings'
    )
};

