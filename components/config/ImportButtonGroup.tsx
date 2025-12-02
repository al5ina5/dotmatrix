'use client';

import React from 'react';
import { Upload } from 'lucide-react';
import { ButtonGroup } from '@/components/ui/ButtonGroup';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useConfig } from '@/context/ConfigContext';
import { StoredConfig } from '@/types/config';

export function ImportButtonGroup() {
    const { importConfig, isRemoteMode } = useConfig();
    const { upload } = useFileUpload();

    const handlePaste = async () => {
        if (isRemoteMode) {
            alert('Import is only available on the host device. Please run this on the display.');
            return;
        }

        if (!confirm('Are you sure you want to import your settings? Your clipboard contents will be used and will overwrite your current configuration.')) {
            return;
        }

        try {
            const clipboardText = await navigator.clipboard.readText();
            const parsedConfig = JSON.parse(clipboardText) as StoredConfig;

            importConfig(parsedConfig);
            setTimeout(() => alert('Configuration imported from clipboard.'), 80);
        } catch (error) {
            console.error('Failed to import config:', error);
            alert('Clipboard does not contain a valid DotMatrix configuration.');
        }
    };

    const handleUpload = () => {
        if (isRemoteMode) {
            alert('Import is only available on the host device. Please run this on the display.');
            return;
        }

        upload({
            accept: 'application/json,.json',
            onSuccess: (content) => {
                if (!confirm('Are you sure you want to import these settings? This will overwrite your current configuration.')) {
                    return;
                }

                try {
                    const parsedConfig = JSON.parse(content) as StoredConfig;
                    importConfig(parsedConfig);
                    alert('Configuration imported from file.');
                } catch (error) {
                    console.error('Failed to import config:', error);
                    alert('File does not contain a valid DotMatrix configuration.');
                }
            },
            onError: (error) => {
                if (error.message !== 'File selection cancelled') {
                    console.error('Failed to upload file:', error);
                    alert('Failed to read configuration file.');
                }
            }
        });
    };

    return (
        <ButtonGroup
            mainAction={{
                label: 'Import Configuration',
                onClick: handlePaste,
                disabled: isRemoteMode
            }}
            secondaryActions={[
                {
                    label: '',
                    icon: Upload,
                    onClick: handleUpload,
                    disabled: isRemoteMode,
                    title: 'Upload from file'
                }
            ]}
            variant="success"
        />
    );
}

