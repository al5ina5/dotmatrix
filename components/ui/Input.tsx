import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function Input({ label, id, className = '', ...props }: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="text-xs mb-1 block opacity-70" htmlFor={id}>
                    {label}
                </label>
            )}
            <input
                id={id}
                className={`w-full block bg-transparent border-b-2 border-white/20 p-2 outline-none focus:border-white/40 transition-colors ${className}`}
                {...props}
            />
        </div>
    );
}
