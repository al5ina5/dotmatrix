import React, { useState, useEffect } from 'react';

interface ArrayInputProps {
    label: string;
    value: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
}

export function ArrayInput({ label, value, onChange, placeholder }: ArrayInputProps) {
    // Normalize the value - handle objects that might have been stored incorrectly
    const normalizeValue = (val: any): string[] => {
        if (!Array.isArray(val)) return [];

        return val.map(item => {
            // If it's an object, try to extract a string value from it
            if (typeof item === 'object' && item !== null) {
                // Try common properties
                if ('id' in item) return String(item.id);
                if ('symbol' in item) return String(item.symbol);
                if ('value' in item) return String(item.value);
                if ('name' in item) return String(item.name);
                // Fallback to empty string for unparseable objects
                return '';
            }
            return String(item);
        }).filter(item => item.length > 0);
    };

    const arrayValue = normalizeValue(value);
    const [inputValue, setInputValue] = useState(arrayValue.join(', '));

    // Update input when external value changes
    useEffect(() => {
        const normalized = normalizeValue(value);
        setInputValue(normalized.join(', '));

        // Auto-fix: if we normalized objects to strings, save the corrected version
        if (JSON.stringify(normalized) !== JSON.stringify(value)) {
            onChange(normalized);
        }
    }, [JSON.stringify(value)]);

    // Debounce the onChange
    useEffect(() => {
        const timer = setTimeout(() => {
            const items = inputValue
                .split(',')
                .map(item => item.trim())
                .filter(item => item.length > 0);

            // Only update if changed
            if (JSON.stringify(items) !== JSON.stringify(arrayValue)) {
                onChange(items);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [inputValue]);

    return (
        <div className="space-y-2">
            <label className="text-xs block opacity-70">{label}</label>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder || "item1, item2, item3..."}
                className="w-full bg-transparent border-2 border-white/20 p-2 rounded outline-none focus:border-white/40 transition-colors font-mono text-sm"
            />
            <p className="text-xs text-white/50">Comma-separated values</p>
        </div>
    );
}

