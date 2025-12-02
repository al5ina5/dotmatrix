'use client';

import React from 'react';
import { useConfig } from '@/context/ConfigContext';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ClearSettingsButton() {
    const { resetToDefaults, isRemoteMode } = useConfig();

    const handleClearAll = () => {
        if (isRemoteMode) {
            alert('Cannot clear all settings in remote control mode. Use this feature on the host device.');
            return;
        }

        if (confirm('Clear ALL settings and reset to defaults? This will remove all rows and display settings. This cannot be undone.')) {
            if (confirm('Are you absolutely sure? This will delete all your custom configurations.')) {
                resetToDefaults();
            }
        }
    };

    return (
        <Button
            onClick={handleClearAll}
            disabled={isRemoteMode}
            variant="danger"
            icon={Trash2}
            title={isRemoteMode ? 'Cannot clear settings in remote mode' : 'Clear all settings and reset to defaults'}
        >
            Clear All Settings
        </Button>
    );
}

