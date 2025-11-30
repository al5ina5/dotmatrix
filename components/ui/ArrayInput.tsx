import React, { useState, useEffect } from 'react';

interface ArrayInputProps {
    label: string;
    value: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
}

export function ArrayInput({ label, value, onChange, placeholder }: ArrayInputProps) {
    const arrayValue = Array.isArray(value) ? value : [];
    const [inputValue, setInputValue] = useState(arrayValue.join(', '));

    // Update input when external value changes
    useEffect(() => {
        setInputValue(arrayValue.join(', '));
    }, [JSON.stringify(arrayValue)]);

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

