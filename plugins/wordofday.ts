import { LEDPlugin } from './types';

interface WordOfDayPluginParams {
    showDefinition?: boolean;
}

export const WordOfDayPlugin: LEDPlugin<WordOfDayPluginParams> = {
    id: 'wordofday',
    name: 'Word of the Day',
    description: 'Display a random word with its definition',
    defaultInterval: 86400000, // Update once per day (24 hours)
    configSchema: [
        {
            key: 'showDefinition',
            label: 'Show Definition',
            type: 'boolean',
            defaultValue: true,
        }
    ],
    fetch: async (params) => {
        try {
            const showDefinition = params.showDefinition ?? true;
            
            // Random Word API (free, no key required)
            const randomWordResponse = await fetch('https://random-word-api.herokuapp.com/word');
            if (!randomWordResponse.ok) throw new Error('Failed to fetch random word');
            
            const words = await randomWordResponse.json();
            const word = words[0];
            
            if (!word) {
                return 'Word of the Day unavailable';
            }
            
            // Get definition from Free Dictionary API (no key required)
            if (showDefinition) {
                try {
                    const definitionResponse = await fetch(
                        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
                    );
                    
                    if (definitionResponse.ok) {
                        const definitionData = await definitionResponse.json();
                        const entry = definitionData[0];
                        const meaning = entry?.meanings?.[0];
                        const definition = meaning?.definitions?.[0]?.definition;
                        const partOfSpeech = meaning?.partOfSpeech;
                        
                        if (definition) {
                            return `Word: ${word.toUpperCase()} (${partOfSpeech}) - ${definition}`;
                        }
                    }
                } catch (defError) {
                    // If definition fails, just show the word
                    console.warn('Could not fetch definition:', defError);
                }
            }
            
            // Fallback: just the word
            return `Word of the Day: ${word.toUpperCase()}`;
            
        } catch (error) {
            console.error('Error fetching word of the day:', error);
            return 'Word of the Day unavailable';
        }
    }
};

