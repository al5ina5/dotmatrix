'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getPattern } from '@/lib/patterns';
import styles from './LEDRow.module.css';

export interface LEDRowProps {
    content: string;
    dotSize: number;
    dotColor: string;
    dotGap: number;
    stepInterval: number;
    spacing: {
        betweenLetters: number;
        betweenWords: number;
        beforeRepeat: number;
    };
    scrolling?: boolean;
    alignment?: 'left' | 'center' | 'right';
    isPaused: boolean;
}

/**
 * LEDRow Component
 * 
 * A single scrolling text row (7 LED rows tall)
 */
export default function LEDRow({
    content,
    dotSize,
    dotColor,
    dotGap,
    stepInterval,
    spacing,
    scrolling = true,
    alignment = 'left',
    isPaused,
}: LEDRowProps) {
    const [scrollOffset, setScrollOffset] = useState(0);
    const [gridCols, setGridCols] = useState(0);

    // Calculate grid columns
    useEffect(() => {
        const updateCols = () => {
            const pitch = dotSize + dotGap;
            const cols = Math.ceil(window.innerWidth / pitch);
            setGridCols(cols);
        };

        updateCols();
        window.addEventListener('resize', updateCols);
        return () => window.removeEventListener('resize', updateCols);
    }, [dotSize, dotGap]);

    // Pre-calculate character positions
    const { textPatterns, charPositions, totalWidth, contentWidth } = useMemo(() => {
        const patterns = content.split('').map(char => getPattern(char));
        const positions: number[] = [];
        let currentPos = 0;

        content.split('').forEach((char, i) => {
            positions.push(currentPos);

            if (char === ' ') {
                currentPos += spacing.betweenWords;
            } else {
                currentPos += 5;

                if (i < content.length - 1) {
                    const nextChar = content[i + 1];
                    if (nextChar !== ' ') {
                        currentPos += spacing.betweenLetters;
                    }
                }
            }
        });

        // contentWidth is the actual width of the text
        const contentWidth = currentPos;
        // totalWidth includes the gap before repeating (only used for scrolling)
        const totalWidth = currentPos + spacing.beforeRepeat;

        return { textPatterns: patterns, charPositions: positions, totalWidth, contentWidth };
    }, [content, spacing]);

    // Scroll animation
    useEffect(() => {
        if (isPaused || !scrolling) return;

        const interval = setInterval(() => {
            setScrollOffset((prev) => (prev + 1) % totalWidth);
        }, stepInterval);

        return () => clearInterval(interval);
    }, [stepInterval, totalWidth, isPaused, scrolling]);

    // Calculate static offset based on alignment
    const staticOffset = useMemo(() => {
        if (scrolling) return 0;

        switch (alignment) {
            case 'center':
                return Math.floor((gridCols - contentWidth) / 2);
            case 'right':
                return gridCols - contentWidth - 2; // -2 for a small margin
            case 'left':
            default:
                return 0;
        }
    }, [scrolling, alignment, gridCols, contentWidth]);

    // Check if a grid cell should be active
    const isGridCellActive = (col: number, row: number): boolean => {
        let charColumnIndex: number;

        if (scrolling) {
            // Infinite scrolling logic
            charColumnIndex = (col + scrollOffset) % totalWidth;
        } else {
            // Static alignment logic
            // We map the screen column to the text column by subtracting the offset
            charColumnIndex = col - staticOffset;

            // If outside the text bounds, it's empty
            if (charColumnIndex < 0 || charColumnIndex >= contentWidth) return false;
        }

        for (let i = 0; i < content.length; i++) {
            const charStart = charPositions[i];
            const char = content[i];
            const charWidth = char === ' ' ? spacing.betweenWords : 5;

            if (charColumnIndex >= charStart && charColumnIndex < charStart + charWidth) {
                const columnInChar = charColumnIndex - charStart;

                if (char === ' ') return false;

                const pattern = textPatterns[i];
                if (!pattern || row >= pattern.length) return false;

                const patternRow = pattern[row];
                if (!patternRow || columnInChar >= patternRow.length) return false;

                return patternRow[columnInChar] === 1;
            }
        }

        return false;
    };

    const cellSize = dotSize + dotGap; // Still used for internal logic if needed, but grid uses dotSize

    return (
        <div
            className={styles.row}
            style={{
                gridTemplateColumns: `repeat(${gridCols}, ${dotSize}px)`,
                gridTemplateRows: `repeat(7, ${dotSize}px)`,
                gap: `${dotGap}px`,
            }}
        >
            {Array.from({ length: 7 }).map((_, row) =>
                Array.from({ length: gridCols }).map((_, col) => {
                    const isActive = isGridCellActive(col, row);
                    return (
                        <div
                            key={`${row}-${col}`}
                            className={`${styles.dot} ${isActive ? styles.active : ''}`}
                            style={{
                                width: `${dotSize}px`,
                                height: `${dotSize}px`,
                                backgroundColor: dotColor,
                                boxShadow: isActive ? `0 0 8px ${dotColor}` : 'none',
                            }}
                        />
                    );
                })
            )}
        </div>
    );
}
