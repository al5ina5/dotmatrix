'use client';

import React from 'react';
import { RotateCcw, CirclePlus } from 'lucide-react';

interface SettingsHeaderProps {
    title: string;
    onReset?: () => void;
    resetLabel?: string;
    resetMessage?: string;
    showAddButton?: boolean;
    onAdd?: () => void;
    addButtonLabel?: string;
    disabled?: boolean; // For remote mode
}

export function SettingsHeader({
    title,
    onReset,
    resetLabel = 'Reset to default',
    resetMessage,
    showAddButton = false,
    onAdd,
    addButtonLabel,
    disabled = false
}: SettingsHeaderProps) {
    const handleReset = () => {
        if (disabled) {
            return;
        }
        const message = resetMessage || `Reset ${title.toLowerCase()} to default state? This will remove all custom configurations.`;
        if (confirm(message)) {
            onReset?.();
        }
    };

    return (
        <div className="flex items-center gap-2">
            <p className="font-bold">{title}</p>
            {showAddButton && onAdd && (
                <button
                    className="opacity-50 hover:opacity-100 transition-opacity disabled:opacity-25 disabled:cursor-not-allowed"
                    onClick={onAdd}
                    disabled={disabled}
                    title={addButtonLabel || 'Add'}
                >
                    <CirclePlus size={18} />
                </button>
            )}
            <div className="flex-1" />
            {onReset && (
                <button
                    className="opacity-25 hover:opacity-100 transition-opacity disabled:opacity-10 disabled:cursor-not-allowed"
                    onClick={handleReset}
                    disabled={disabled}
                    title={resetLabel}
                >
                    <RotateCcw size={18} />
                </button>
            )}
        </div>
    );
}

