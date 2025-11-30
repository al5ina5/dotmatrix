import { LEDPlugin } from './types';

export const SystemPlugin: LEDPlugin = {
    id: 'system',
    name: 'System Stats',
    description: 'Browser/System Info',
    defaultInterval: 5000, // 5 sec

    fetch: () => {
        // Since we are client-side, we can't get real CPU temps.
        // But we can show screen info and memory (if available)
        const width = window.innerWidth;
        const height = window.innerHeight;

        // @ts-ignore - memory API is non-standard but fun
        const memory = performance.memory ?
            // @ts-ignore
            Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB' :
            'N/A';

        return `DISPLAY: ${width}x${height}   MEM: ${memory}   UA: ${navigator.platform}`;
    }
};
