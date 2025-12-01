import { LEDPlugin } from './types';

interface CustomAPIPluginParams {
    url: string;
    jsonPath?: string;
    method?: string;
    headers?: string;
    refreshInterval?: number;
}

export const CustomAPIPlugin: LEDPlugin<CustomAPIPluginParams> = {
    id: 'customapi',
    name: 'Custom API',
    description: 'Fetch data from any JSON API',
    defaultInterval: 60000, // Default: update every minute
    configSchema: [
        {
            key: 'url',
            label: 'API URL',
            type: 'text',
            defaultValue: '',
            required: true,
            placeholder: 'https://api.example.com/data',
        },
        {
            key: 'jsonPath',
            label: 'JSON Path (optional)',
            type: 'text',
            defaultValue: '',
            placeholder: 'data.message or leave empty for full response',
        },
        {
            key: 'method',
            label: 'HTTP Method',
            type: 'select',
            defaultValue: 'GET',
            options: [
                { value: 'GET', label: 'GET' },
                { value: 'POST', label: 'POST' },
            ]
        },
        {
            key: 'headers',
            label: 'Headers (JSON)',
            type: 'text',
            defaultValue: '{}',
            placeholder: '{"Authorization": "Bearer token"}',
        },
    ],
    fetch: async (params) => {
        try {
            const url = params.url;
            if (!url) {
                return 'Please configure API URL';
            }
            
            const method = params.method || 'GET';
            const headersStr = params.headers || '{}';
            
            let headers: Record<string, string> = {};
            try {
                headers = JSON.parse(headersStr);
            } catch (e) {
                console.warn('Invalid headers JSON, using empty headers');
            }
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            });
            
            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            
            const data = await response.json();
            
            // If jsonPath is provided, try to extract that value
            if (params.jsonPath) {
                const value = extractValueByPath(data, params.jsonPath);
                if (value !== undefined && value !== null) {
                    return typeof value === 'object' ? JSON.stringify(value) : String(value);
                }
            }
            
            // Otherwise, try to intelligently format the response
            if (typeof data === 'string') {
                return data;
            } else if (typeof data === 'object') {
                // Look for common message fields
                const messageFields = ['message', 'text', 'content', 'data', 'result', 'value'];
                for (const field of messageFields) {
                    if (data[field]) {
                        const value = data[field];
                        return typeof value === 'object' ? JSON.stringify(value) : String(value);
                    }
                }
                // Fallback: stringify the whole object
                return JSON.stringify(data);
            }
            
            return String(data);
            
        } catch (error) {
            console.error('Error fetching custom API:', error);
            return `🔌 API: Configure your endpoint in settings`;
        }
    }
};

// Helper function to extract nested values using dot notation
function extractValueByPath(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return undefined;
        }
    }
    
    return current;
}

