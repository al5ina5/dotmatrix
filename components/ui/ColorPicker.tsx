import React, { useRef } from 'react';

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (color: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div className="w-full">
            <label className="text-xs mb-1 block opacity-70">
                {label}
            </label>
            <button
                type="button"
                onClick={handleClick}
                className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border-2 border-white/20 hover:border-white/40 p-3 rounded transition-all"
            >
                <div
                    className="w-8 h-8 rounded border-2 border-white/30 flex-shrink-0"
                    style={{ backgroundColor: value }}
                />
                <span className="text-sm font-mono">{value.toUpperCase()}</span>
            </button>
            <input
                ref={inputRef}
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only"
            />
        </div>
    );
}

