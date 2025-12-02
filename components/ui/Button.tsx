'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'primary' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    children: React.ReactNode;
}

export function Button({
    variant = 'default',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    className = '',
    children,
    disabled,
    ...props
}: ButtonProps) {
    const baseClasses = 'inline-flex items-center justify-center gap-2 uppercase tracking-wide transition-colors border rounded-md whitespace-nowrap';

    const variantClasses = {
        default: 'bg-white/5 hover:bg-white/10 border-white/20 text-white/90',
        primary: 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-600/50 hover:border-blue-600/70 text-blue-100',
        danger: 'bg-red-600/20 hover:bg-red-600/30 border-red-600/50 hover:border-red-600/70 text-red-100',
        success: 'bg-green-600/20 hover:bg-green-600/30 border-green-600/50 hover:border-green-600/70 text-green-100',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-xs',
        lg: 'px-6 py-3 text-sm',
    };

    const disabledClasses = disabled
        ? 'opacity-50 cursor-not-allowed'
        : '';

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

    const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;

    return (
        <button
            className={classes}
            disabled={disabled}
            {...props}
        >
            {Icon && iconPosition === 'left' && <Icon size={iconSize} />}
            {children}
            {Icon && iconPosition === 'right' && <Icon size={iconSize} />}
        </button>
    );
}

