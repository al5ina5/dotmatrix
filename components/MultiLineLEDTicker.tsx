'use client';

import React, { useState, useEffect } from 'react';
import LEDRow from './LEDRow';
import { LEDRowConfig } from '@/config/led.config';
import styles from './MultiLineLEDTicker.module.css';

export interface MultiLineLEDTickerProps {
    rows: readonly LEDRowConfig[];
    dotSize: number;
    dotColor: string;
    dotGap: number;
    rowSpacing: number;
}

import { usePluginData } from '@/hooks/usePluginData';

// Internal component to handle data fetching for each row
const TickerRow = ({
    row,
    dotSize,
    dotColor,
    dotGap,
    isPaused
}: {
    row: LEDRowConfig;
    dotSize: number;
    dotColor: string;
    dotGap: number;
    isPaused: boolean;
}) => {
    const { content } = usePluginData(row.pluginId, row.params);

    return (
        <LEDRow
            content={content}
            dotSize={dotSize}
            dotColor={row.color || dotColor}
            dotGap={dotGap}
            stepInterval={row.stepInterval}
            spacing={row.spacing}
            scrolling={row.scrolling}
            alignment={row.alignment}
            isPaused={isPaused}
        />
    );
};

/**
 * MultiLineLEDTicker Component
 * 
 * Displays a fullscreen static LED grid with multiple scrolling text rows.
 * - LEDs are static and fill the entire viewport
 * - Each row scrolls independently
 * - Rows are centered if they fit, cropped if screen is too small
 * - Click anywhere to pause/resume all rows
 */
export default function MultiLineLEDTicker({
    rows,
    dotSize,
    dotColor,
    dotGap,
    rowSpacing,
}: MultiLineLEDTickerProps) {
    const [isPaused, setIsPaused] = useState(false);
    const [visibleRows, setVisibleRows] = useState<number[]>([]);
    const [gridDimensions, setGridDimensions] = useState({ cols: 0, totalRows: 0 });

    // Toggle pause on click
    const handleClick = () => {
        setIsPaused(prev => !prev);
    };

    // Calculate grid dimensions and which rows are visible
    useEffect(() => {
        const updateDimensions = () => {
            // Pitch is the distance from the start of one dot to the start of the next
            const pitch = dotSize + dotGap;
            const totalGridRows = Math.ceil(window.innerHeight / pitch);

            // Each text row is 7 LED rows tall
            const textRowHeight = 7;
            // rowSpacing is now in dots
            const rowsPerTextRow = textRowHeight + rowSpacing;

            // How many text rows can fit on screen?
            const maxTextRows = Math.floor(totalGridRows / rowsPerTextRow);

            // Determine which rows to show (crop if too many, show all if they fit)
            const rowsToShow = rows.slice(0, Math.min(maxTextRows, rows.length));
            const visible = rowsToShow.map((_, i) => i);

            setGridDimensions({ cols: Math.ceil(window.innerWidth / pitch), totalRows: totalGridRows });
            setVisibleRows(visible);
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [dotSize, dotGap, rowSpacing, rows.length]);

    const pitch = dotSize + dotGap;
    const textRowHeight = 7;
    const rowsPerTextRow = textRowHeight + rowSpacing;

    // Calculate vertical offset to center rows if they don't fill screen
    // We only count the spacing BETWEEN rows, not after the last one
    // Content height in dots = (Rows * 7) + ((Rows - 1) * Spacing)
    const visualContentRowsInDots = (visibleRows.length * textRowHeight) + (Math.max(0, visibleRows.length - 1) * rowSpacing);
    const unusedRows = gridDimensions.totalRows - visualContentRowsInDots;
    // We align to the grid by multiplying by pitch
    const verticalOffset = Math.floor(unusedRows / 2) * pitch;

    // Calculate margin bottom to align perfectly with grid
    // Distance from top of one block to top of next = (7 + rowSpacing) * pitch
    // Height of one block = 7 * dotSize + 6 * dotGap
    // Margin = Distance - Height
    //        = (7 * pitch + rowSpacing * pitch) - (7 * dotSize + 6 * dotGap)
    //        = (7 * dotSize + 7 * dotGap + rowSpacing * pitch) - (7 * dotSize + 6 * dotGap)
    //        = dotGap + (rowSpacing * pitch)
    const rowMarginBottom = dotGap + (rowSpacing * pitch);

    return (
        <div className={styles.container} onClick={handleClick}>
            {/* Static LED grid background (all LEDs dimmed) */}
            <div
                className={styles.ledGrid}
                style={{
                    gridTemplateColumns: `repeat(${gridDimensions.cols}, ${dotSize}px)`,
                    gridTemplateRows: `repeat(${gridDimensions.totalRows}, ${dotSize}px)`,
                    gap: `${dotGap}px`,
                }}
            >
                {Array.from({ length: gridDimensions.totalRows * gridDimensions.cols }).map((_, i) => (
                    <div
                        key={i}
                        className={styles.backgroundDot}
                        style={{
                            width: `${dotSize}px`,
                            height: `${dotSize}px`,
                            backgroundColor: dotColor,
                        }}
                    />
                ))}
            </div>

            {/* Text rows overlay */}
            <div
                className={styles.rowsContainer}
                style={{ paddingTop: `${verticalOffset}px` }}
            >
                {visibleRows.map((rowIndex, index) => {
                    const row = rows[rowIndex];
                    const isLastRow = index === visibleRows.length - 1;

                    return (
                        <div
                            key={rowIndex}
                            className={styles.rowWrapper}
                            style={{ marginBottom: isLastRow ? 0 : `${rowMarginBottom}px` }}
                        >
                            <TickerRow
                                row={row}
                                dotSize={dotSize}
                                dotColor={dotColor}
                                dotGap={dotGap}
                                isPaused={isPaused}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
