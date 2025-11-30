import React from 'react';

interface MultiSelectProps {
    label: string;
    value: string[];
    onChange: (values: string[]) => void;
    options: Array<{ value: string; label: string }>;
}

export function MultiSelect({ label, value, onChange, options }: MultiSelectProps) {
    const selectedValues = Array.isArray(value) ? value : [];

    return (
        <div className="space-y-2">
            <label className="text-xs block opacity-70">{label}</label>
            <div className="space-y-1 max-h-40 overflow-y-auto border-2 border-white/10 rounded p-2">
                {options.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                        <label 
                            key={option.value} 
                            className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 rounded"
                        >
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                    const newValues = e.target.checked
                                        ? [...selectedValues, option.value]
                                        : selectedValues.filter(v => v !== option.value);
                                    onChange(newValues);
                                }}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">{option.label}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}

