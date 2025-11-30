'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getPattern } from '@/lib/patterns';
import styles from './StaticLEDTicker.module.css';

export interface StaticLEDTickerProps {
    text: string;
    dotSize?: number;
    dotColor?: string;
    dotGap?: number;
    stepInterval?: number;
    spacing?: {
        betweenLetters: number;
        betweenWords: number;
        beforeRepeat: number;
    };
}

/**
 * StaticLEDTicker Component
 * 
 * Displays a scrolling LED ticker with a fixed grid of LED bulbs.
 * The bulbs stay in place and only their on/off state changes.
 * Click anywhere to pause/resume the animation.
 */
export default function StaticLEDTicker({
    text,
    dotSize = 10,
    dotColor = '#00ff00',
    stepInterval = 150,
    dotGap = 3,
    spacing = { betweenLetters: 1, betweenWords: 4, beforeRepeat: 12 },
}: StaticLEDTickerProps) {
    const [scrollOffset, setScrollOffset] = useState(0);
    const [gridDimensions, setGridDimensions] = useState({ cols: 0, rows: 7 });
    const [isPaused, setIsPaused] = useState(false);

    // Toggle pause on click
    const handleClick = () => {
        setIsPaused(prev => !prev);
    };

    // Calculate grid dimensions based on viewport
    useEffect(() => {
        const updateDimensions = () => {
            const cellSize = dotSize + dotGap;
            const cols = Math.ceil(window.innerWidth / cellSize);
            setGridDimensions({ cols, rows: 7 });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [dotSize, dotGap]);

    // Pre-calculate character positions with custom spacing
    const { textPatterns, charPositions, totalWidth } = useMemo(() => {
        const patterns = text.split('').map(char => getPattern(char));
        const positions: number[] = [];
        let currentPos = 0;

        text.split('').forEach((char, i) => {
            positions.push(currentPos);

            if (char === ' ') {
                // Space character
                currentPos += spacing.betweenWords;
            } else {
                // Regular character (5 dots wide)
                currentPos += 5;

                // Add spacing after character
                if (i < text.length - 1) {
                    const nextChar = text[i + 1];
                    if (nextChar !== ' ') {
                        // Add letter spacing only between non-space characters
                        currentPos += spacing.betweenLetters;
                    }
                }
            }
        });

        // Add gap before text repeats
        const total = currentPos + spacing.beforeRepeat;

        return { textPatterns: patterns, charPositions: positions, totalWidth: total };
    }, [text, spacing]);

    // Scroll animation interval
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setScrollOffset((prev) => (prev + 1) % totalWidth);
        }, stepInterval);

        return () => clearInterval(interval);
    }, [stepInterval, totalWidth, isPaused]);

    // Determine if a grid cell should be lit up
    const isGridCellActive = (col: number, row: number): boolean => {
        const charColumnIndex = (col + scrollOffset) % totalWidth;

        // Find which character this position belongs to
        for (let i = 0; i < text.length; i++) {
            const charStart = charPositions[i];
            const char = text[i];
            const charWidth = char === ' ' ? spacing.betweenWords : 5;

            if (charColumnIndex >= charStart && charColumnIndex < charStart + charWidth) {
                const columnInChar = charColumnIndex - charStart;

                // Spaces are never active
                if (char === ' ') return false;

                // Check the pattern
                const pattern = textPatterns[i];
                if (!pattern || row >= pattern.length) return false;

                const patternRow = pattern[row];
                if (!patternRow || columnInChar >= patternRow.length) return false;

                return patternRow[columnInChar] === 1;
            }
        }

        return false;
    };

    const cellSize = dotSize + dotGap;

    return (
        <div className={styles.container} onClick={handleClick}>
            <div
                className={styles.grid}
                style={{
                    gridTemplateColumns: `repeat(${gridDimensions.cols}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${gridDimensions.rows}, ${cellSize}px)`,
                    gap: `${dotGap}px`,
                }}
            >
                {Array.from({ length: gridDimensions.rows }).map((_, row) =>
                    Array.from({ length: gridDimensions.cols }).map((_, col) => {
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
        </div>
    );
}
