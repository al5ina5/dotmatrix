import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
}

export function Select({ label, id, options, className = '', ...props }: SelectProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="text-xs mb-1 block opacity-70" htmlFor={id}>
                    {label}
                </label>
            )}
            <select
                id={id}
                className={`w-full block bg-transparent border-b-2 border-white/20 p-2 outline-none focus:border-white/40 transition-colors ${className}`}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value} className="bg-black">
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}


