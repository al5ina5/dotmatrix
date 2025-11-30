import React from 'react';

interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
    return (
        <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="peer sr-only"
                />
                <div className="w-5 h-5 border-2 border-white/30 rounded bg-black/50 peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all group-hover:border-white/50 flex items-center justify-center">
                    {checked && (
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="3 7 6 10 11 4" />
                        </svg>
                    )}
                </div>
            </div>
            <span className="text-sm text-white/90 group-hover:text-white transition-colors">
                {label}
            </span>
        </label>
    );
}

