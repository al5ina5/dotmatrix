'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Modal } from './Modal';
import { CircleCheck } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';
import type { StoredConfig } from '@/types/config';
import { useDebouncedEffect } from '@/hooks/useDebouncedEffect';
import { ModalHeader } from './ui/ModalHeader';

interface JSONSettingsEditorProps {
    isOpen: boolean;
    onClose: () => void;
}

type SaveStatus = 'idle' | 'debouncing' | 'success' | 'error';

// Monaco editor (VS Code-like) loaded client-side only
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false
});

export default function JSONSettingsEditor({ isOpen, onClose }: JSONSettingsEditorProps) {
    const { exportConfig, importConfig, isRemoteMode } = useConfig();

    const [jsonText, setJsonText] = useState('');
    const [status, setStatus] = useState<SaveStatus>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [hasEdited, setHasEdited] = useState(false);

    // Load current config whenever the editor is opened (but don't reset on every config change)
    useEffect(() => {
        if (!isOpen) return;

        try {
            const config = exportConfig();
            const pretty = JSON.stringify(config, null, 2);
            setJsonText(pretty);
            setStatus('idle');
            setErrorMessage(null);
            setHasEdited(false);
        } catch (err) {
            console.error('Failed to export config for JSON editor:', err);
            setJsonText('// Failed to load configuration');
            setStatus('error');
            setErrorMessage('Failed to load configuration.');
        }
        // We intentionally *don't* depend on exportConfig here to avoid resetting
        // the editor state every time the config changes while typing.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Debounced auto-save: run 200ms after user stops typing
    useDebouncedEffect(
        () => {
            if (!isOpen) return;
            if (!hasEdited) return;
            if (isRemoteMode) return; // Read-only in remote mode

            setStatus('debouncing');
            setErrorMessage(null);

            try {
                const parsed = JSON.parse(jsonText) as StoredConfig;

                // Very basic shape validation before importing
                if (
                    !parsed ||
                    typeof parsed !== 'object' ||
                    !Array.isArray(parsed.rows) ||
                    !parsed.displaySettings ||
                    typeof parsed.displaySettings !== 'object'
                ) {
                    throw new Error('JSON must contain { "rows": [...], "displaySettings": { ... } }');
                }

                importConfig(parsed);

                // NOTE: We no longer overwrite jsonText from exportConfig here.
                // That avoids resetting the Monaco editor value and stealing focus.
                setStatus('success');
                setHasEdited(false);
                setErrorMessage(null);
            } catch (err: any) {
                console.error('JSON editor validation/import failed:', err);
                setStatus('error');
                setErrorMessage(
                    err?.message || 'Invalid configuration JSON. Please ensure it matches the export format.'
                );
            }
        },
        [jsonText, hasEdited, isOpen, isRemoteMode, importConfig],
        200
    );

    // Keep success state visible for a few seconds before returning to idle
    useEffect(() => {
        if (status !== 'success') return;

        const timeoutId = window.setTimeout(() => {
            setStatus('idle');
        }, 3000);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [status]);

    const handleChange = (value: string | undefined) => {
        setJsonText(value ?? '');
        setHasEdited(true);
    };

    // Status icon color logic:
    // - hidden when idle
    // - gray when debouncing
    // - green on success
    // - red on error
    let icon = null;
    if (status !== 'idle') {
        let colorClass = 'text-gray-400';
        if (status === 'success') colorClass = 'text-green-500';
        if (status === 'error') colorClass = 'text-red-500';
        icon = <CircleCheck className={colorClass} size={24} />;
    }

    // Single-line status message for footer
    let footerMessage = 'Edit your settings JSON above. Changes will be validated and saved automatically.';
    let footerClass = 'text-xs text-white/70';

    if (status === 'debouncing') {
        footerMessage = 'Validating and applying changes...';
        footerClass = 'text-xs text-gray-300';
    } else if (status === 'success') {
        footerMessage = 'Settings saved.';
        footerClass = 'text-xs text-green-400';
    } else if (status === 'error' && errorMessage) {
        footerMessage = errorMessage;
        footerClass = 'text-xs text-red-400';
    }

    if (isRemoteMode) {
        footerMessage = 'Read-only in remote mode. Edit and import/export are only available on the host device.';
        footerClass = 'text-xs text-red-400';
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="z-200 max-w-4xl! mx-auto">
            <ModalHeader title="Settings Editor" onClose={onClose}>
                {/* Status icon: hidden by default, green on success, red on error, gray while debouncing */}
                {icon}
            </ModalHeader>

            {/* Textarea with entire settings JSON. Debounced 2s and auto-applied when valid (local mode only). */}
            <div className="border-b border-white/20">
                <MonacoEditor
                    height="24rem"
                    language="json"
                    value={jsonText}
                    onChange={handleChange}
                    options={{
                        readOnly: isRemoteMode,
                        minimap: { enabled: false },
                        fontSize: 18,
                        wordWrap: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on'
                    }}
                    theme="vs-dark"
                />
            </div>

            <div className="p-6">
                <p className={footerClass}>{footerMessage}</p>
            </div>
        </Modal>
    );
}

