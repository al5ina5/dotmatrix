'use client';

import React, { CSSProperties } from 'react';
import { getPattern } from '@/lib/patterns';
import styles from './DotMatrix.module.css';

export type AnimationType = 'none' | 'fade' | 'wave' | 'ripple' | 'glow' | 'pulse';

export interface DotMatrixProps {
    text: string;
    dotSize?: number;
    dotColor?: string;
    dotGap?: number;
    animation?: AnimationType;
    animationSpeed?: number;
    className?: string;
}

export default function DotMatrix({
    text,
    dotSize = 6,
    dotColor = '#00ff00',
    dotGap = 2,
    animation = 'fade',
    animationSpeed = 1,
    className = '',
}: DotMatrixProps) {
    const chars = text.split('');

    // Calculate character dimensions based on dot size and gap
    const charWidth = dotSize * 5 + dotGap * 4;
    const charHeight = dotSize * 7 + dotGap * 6;

    const containerStyle: CSSProperties = {
        '--dot-color': dotColor,
        '--dot-gap': `${dotGap}px`,
        '--char-width': `${charWidth}px`,
        '--char-height': `${charHeight}px`,
    } as CSSProperties;

    return (
        <div className={`${styles.container} ${className}`} style={containerStyle}>
            {chars.map((char, charIndex) => {
                const pattern = getPattern(char);

                return (
                    <div key={`char-${charIndex}`} className={styles.character}>
                        {pattern.map((row, rowIndex) =>
                            row.map((cell, colIndex) => {
                                const isActive = cell === 1;
                                const dotIndex = rowIndex * 5 + colIndex;

                                // Calculate animation delay based on animation type
                                let animationDelay = 0;

                                if (animation !== 'none' && isActive) {
                                    switch (animation) {
                                        case 'fade':
                                        case 'wave':
                                            // Sequential delay by character and then by dot
                                            animationDelay = (charIndex * 100 + dotIndex * 15) / animationSpeed;
                                            break;
                                        case 'ripple':
                                            // Delay based on distance from center
                                            const centerRow = 3;
                                            const centerCol = 2;
                                            const distance = Math.sqrt(
                                                Math.pow(rowIndex - centerRow, 2) +
                                                Math.pow(colIndex - centerCol, 2)
                                            );
                                            animationDelay = (charIndex * 150 + distance * 80) / animationSpeed;
                                            break;
                                        case 'glow':
                                        case 'pulse':
                                            // Random delay for more organic effect
                                            animationDelay = (charIndex * 100 + Math.random() * 200) / animationSpeed;
                                            break;
                                    }
                                }

                                const dotStyle: CSSProperties = {
                                    width: `${dotSize}px`,
                                    height: `${dotSize}px`,
                                    animationDelay: `${animationDelay}ms`,
                                };

                                const dotClasses = [
                                    styles.dot,
                                    isActive && styles.active,
                                    isActive && animation !== 'none' && styles[`animate-${animation}`],
                                ]
                                    .filter(Boolean)
                                    .join(' ');

                                return (
                                    <div
                                        key={`dot-${rowIndex}-${colIndex}`}
                                        className={dotClasses}
                                        style={dotStyle}
                                    />
                                );
                            })
                        )}
                    </div>
                );
            })}
        </div>
    );
}
