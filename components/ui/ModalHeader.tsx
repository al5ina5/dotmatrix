'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ModalHeaderProps {
    title: string;
    onClose?: () => void;
    children?: React.ReactNode;
    className?: string;
}

export function ModalHeader({ title, onClose, children, className = '' }: ModalHeaderProps) {
    return (
        <div className={`relative flex items-center gap-4 p-4 px-6 border-b border-white/20 shadow-2xl z-10 ${className}`}>
            <h1 className="uppercase">{title}</h1>

            {children}

            <div className="flex-1" />

            {onClose && (
                <button
                    onClick={onClose}
                    className="opacity-50 hover:opacity-100 transition-opacity"
                    aria-label={`Close ${title.toLowerCase()}`}
                >
                    <X size={24} />
                </button>
            )}
        </div>
    );
}


