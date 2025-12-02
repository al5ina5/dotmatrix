'use client';

import React from 'react';
import { Button } from './Button';
import { LucideIcon } from 'lucide-react';

interface ButtonAction {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    disabled?: boolean;
    title?: string;
}

interface ButtonGroupProps {
    mainAction: ButtonAction;
    secondaryActions?: ButtonAction[];
    variant?: 'default' | 'primary' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function ButtonGroup({
    mainAction,
    secondaryActions = [],
    variant = 'default',
    size = 'md',
    className = ''
}: ButtonGroupProps) {
    return (
        <div className={`inline-flex ${className}`}>
            {/* Main button */}
            <Button
                variant={variant}
                size={size}
                icon={mainAction.icon}
                onClick={mainAction.onClick}
                disabled={mainAction.disabled}
                className={secondaryActions.length > 0 ? "rounded-r-none border-r-0" : ""}
            >
                {mainAction.label}
            </Button>
            
            {/* Secondary action buttons (split/dropdown style) */}
            {secondaryActions.map((action, index) => {
                const isLast = index === secondaryActions.length - 1;
                const isIconOnly = action.icon && !action.label;
                
                // Determine border color based on variant (matching Button component borders)
                const borderColorClass = variant === 'primary' 
                    ? 'border-l-blue-600/50' 
                    : variant === 'success' 
                    ? 'border-l-green-600/50'
                    : variant === 'danger'
                    ? 'border-l-red-600/50'
                    : 'border-l-white/20';
                
                return (
                    <Button
                        key={index}
                        variant={variant}
                        size={size}
                        icon={action.icon}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={`
                            rounded-l-none
                            border-l ${borderColorClass}
                            ${isLast ? '' : 'rounded-r-none border-r-0'}
                            ${isIconOnly ? 'px-2' : ''}
                        `}
                        title={action.title || action.label}
                    >
                        {isIconOnly ? null : action.label}
                    </Button>
                );
            })}
        </div>
    );
}

