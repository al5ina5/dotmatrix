'use client';

import { useCallback } from 'react';

interface UseFileDownloadOptions {
    filename?: string;
    mimeType?: string;
}

export function useFileDownload() {
    const download = useCallback((content: string, options: UseFileDownloadOptions = {}) => {
        const {
            filename = 'download.txt',
            mimeType = 'text/plain'
        } = options;

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }, []);

    return { download };
}

