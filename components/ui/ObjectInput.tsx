import React, { useState, useEffect } from 'react';

interface ObjectInputProps {
    label: string;
    value: any;
    onChange: (value: any) => void;
    placeholder?: string;
}

export function ObjectInput({ label, value, onChange, placeholder }: ObjectInputProps) {
    const objValue = typeof value === 'object' && value !== null ? value : {};
    const [inputValue, setInputValue] = useState(JSON.stringify(objValue, null, 2));
    const [error, setError] = useState<string | null>(null);

    // Update input when external value changes
    useEffect(() => {
        setInputValue(JSON.stringify(objValue, null, 2));
    }, [JSON.stringify(objValue)]);

    // Debounce the onChange
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                const parsed = JSON.parse(inputValue);
                setError(null);
                
                // Only update if changed
                if (JSON.stringify(parsed) !== JSON.stringify(objValue)) {
                    onChange(parsed);
                }
            } catch (err) {
                setError('Invalid JSON');
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [inputValue]);

    return (
        <div className="space-y-2">
            <label className="text-xs block opacity-70">{label}</label>
            <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder || '{"key": "value"}'}
                className={`w-full bg-transparent border-2 ${error ? 'border-red-500/50' : 'border-white/20'} p-2 rounded outline-none focus:border-white/40 transition-colors min-h-[100px] font-mono text-sm`}
            />
            {error ? (
                <p className="text-xs text-red-400">{error}</p>
            ) : (
                <p className="text-xs text-white/50">Valid JSON object</p>
            )}
        </div>
    );
}

