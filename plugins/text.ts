import { LEDPlugin } from './types';

interface TextPluginParams {
    content: string;
}

export const TextPlugin: LEDPlugin<TextPluginParams> = {
    id: 'text',
    name: 'Static Text',
    description: 'Display custom static text on the LED matrix',
    configSchema: [
        {
            key: 'content',
            label: 'Text Content',
            type: 'text',
            defaultValue: 'Add some text here...',
            required: true,
            placeholder: 'Enter your text...'
        }
    ],
    fetch: async (params) => {
        return params.content || '';
    }
};




