'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { ButtonGroup } from '@/components/ui/ButtonGroup';
import { useFileDownload } from '@/hooks/useFileDownload';
import { useConfig } from '@/context/ConfigContext';

export function ExportButtonGroup() {
    const { exportConfig } = useConfig();
    const { download } = useFileDownload();

    const handleCopy = async () => {
        try {
            const config = exportConfig();
            const configJson = JSON.stringify(config, null, 2);

            await navigator.clipboard.writeText(configJson);
            alert('Your configuration has been copied to your clipboard.');
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            alert('Could not copy to clipboard. Please try again in a secure (https) context.');
        }
    };

    const handleDownload = () => {
        try {
            const config = exportConfig();
            const configJson = JSON.stringify(config, null, 2);

            download(configJson, {
                filename: 'dotmatrix-config.json',
                mimeType: 'application/json'
            });
        } catch (error) {
            console.error('Failed to download config:', error);
            alert('Failed to download configuration file.');
        }
    };

    return (
        <ButtonGroup
            mainAction={{
                label: 'Export Configuration',
                onClick: handleCopy
            }}
            secondaryActions={[
                {
                    label: '',
                    icon: Download,
                    onClick: handleDownload,
                    title: 'Download as file'
                }
            ]}
            variant="primary"
        />
    );
}

