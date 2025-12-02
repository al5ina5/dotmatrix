'use client';

import { useCallback } from 'react';

interface UseFileUploadOptions {
    accept?: string;
    onSuccess?: (content: string) => void;
    onError?: (error: Error) => void;
}

export function useFileUpload() {
    const upload = useCallback((options: UseFileUploadOptions = {}) => {
        const {
            accept = '*/*',
            onSuccess,
            onError
        } = options;

        return new Promise<string>((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.style.display = 'none';

            input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) {
                    const error = new Error('No file selected');
                    onError?.(error);
                    reject(error);
                    return;
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target?.result as string;
                    onSuccess?.(content);
                    resolve(content);
                    document.body.removeChild(input);
                };
                reader.onerror = () => {
                    const error = new Error('Failed to read file');
                    onError?.(error);
                    reject(error);
                    document.body.removeChild(input);
                };
                reader.readAsText(file);
            };

            input.oncancel = () => {
                const error = new Error('File selection cancelled');
                onError?.(error);
                reject(error);
                document.body.removeChild(input);
            };

            document.body.appendChild(input);
            input.click();
        });
    }, []);

    return { upload };
}

