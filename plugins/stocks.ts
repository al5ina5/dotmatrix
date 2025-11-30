import { LEDPlugin } from './types';

interface StocksPluginParams {
    symbols: string[];
}

export const StocksPlugin: LEDPlugin<StocksPluginParams> = {
    id: 'stocks',
    name: 'Stock Ticker',
    description: 'Display real-time stock prices from Yahoo Finance',
    defaultInterval: 60000, // Update every minute
    configSchema: [
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
            const symbols = params.symbols || ['AAPL', 'GOOGL', 'MSFT'];

            // Yahoo Finance API (unofficial but free)
            const symbolsStr = symbols.join(',');
            const response = await fetch(
                `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsStr}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,symbol`
            );

            if (!response.ok) throw new Error('Failed to fetch stock data');

            const data = await response.json();
            const quotes = data.quoteResponse?.result || [];

            if (quotes.length === 0) {
                return 'No stock data available';
            }

            const stockStrings = quotes.map((quote: any) => {
                const price = quote.regularMarketPrice?.toFixed(2) || 'N/A';
                const change = quote.regularMarketChange?.toFixed(2) || '0';
                const changePercent = quote.regularMarketChangePercent?.toFixed(2) || '0';
                const arrow = parseFloat(change) >= 0 ? '↑' : '↓';

                return `${quote.symbol} $${price} ${arrow}${Math.abs(parseFloat(changePercent))}%`;
            });

            return stockStrings.join(' | ');

        } catch (error) {
            console.error('Error fetching stock data:', error);
            return 'Stock data unavailable';
        }
    }
};

