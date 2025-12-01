'use client';

import { useEffect, useRef, useState } from 'react';
import { LEDRowConfig } from '@/config/led.config';
import { HydratedRow } from '@/hooks/useDataHydration';
import { prepareContent, isPixelActive, hexToRgb } from '@/lib/ledRenderer';

interface CanvasLEDTickerProps {
    rows: HydratedRow[];
    dotSize: number;
    dotColor: number | string; // Accept hex string
    dotGap: number;
    rowSpacing: number;
    pageInterval: number;
}

export default function CanvasLEDTicker({
    rows,
    dotSize,
    dotColor,
    dotGap,
    rowSpacing,
    pageInterval,
}: CanvasLEDTickerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Use refs for mutable state to avoid re-triggering the effect loop
    const rowsRef = useRef(rows);
    rowsRef.current = rows;

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const pageStateRef = useRef({
        currentPage: 0,
        lastPageSwitch: 0,
        totalPages: 1,
        rowsPerPage: 1
    });

    const stateRef = useRef<{
        [key: number]: {
            offset: number;
            lastTick: number;
        }
    }>({});

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency on canvas itself
        if (!ctx) return;

        let animationFrameId: number;

        // Resize handler
        const handleResize = () => {
            // Set actual canvas size to match display size for sharp rendering
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;

            // Scale context to match dpr
            ctx.scale(dpr, dpr);

            // Set CSS size
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;

            // Recalculate pagination on resize
            const pitch = dotSize + dotGap;
            const totalGridRows = Math.ceil(window.innerHeight / pitch);
            const textRowHeight = 7;
            const rowsPerBlock = textRowHeight + rowSpacing;

            // Calculate how many rows fit
            const rowsPerPage = Math.max(1, Math.floor(totalGridRows / rowsPerBlock));
            const totalPages = Math.ceil(rowsRef.current.length / rowsPerPage);

            pageStateRef.current.rowsPerPage = rowsPerPage;
            pageStateRef.current.totalPages = totalPages;

            // Reset to page 0 if out of bounds
            if (pageStateRef.current.currentPage >= totalPages) {
                pageStateRef.current.currentPage = 0;
                setCurrentPage(0);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial size

        // --- RENDER LOOP ---
        const render = (timestamp: number) => {
            // --- Page Switching Logic ---
            // Only switch pages if we actually have more content than fits on one screen
            if (pageStateRef.current.totalPages > 1) {
                if (timestamp - pageStateRef.current.lastPageSwitch > pageInterval) {
                    pageStateRef.current.currentPage = (pageStateRef.current.currentPage + 1) % pageStateRef.current.totalPages;
                    pageStateRef.current.lastPageSwitch = timestamp;
                }
            } else {
                // Force page 0 if everything fits
                if (pageStateRef.current.currentPage !== 0) {
                    pageStateRef.current.currentPage = 0;
                }
            }

            const width = window.innerWidth;
            const height = window.innerHeight;
            const pitch = dotSize + dotGap;

            const cols = Math.ceil(width / pitch);
            const totalRows = Math.ceil(height / pitch);

            // Clear screen
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);

            // --- 1. Calculate Layout for Current Page ---
            const { rowsPerPage, currentPage } = pageStateRef.current;
            const textRowHeight = 7;
            const rowsPerBlock = textRowHeight + rowSpacing;

            // Get rows for this page
            const startIndex = currentPage * rowsPerPage;
            const endIndex = Math.min(startIndex + rowsPerPage, rowsRef.current.length);
            const visibleRows = rowsRef.current.slice(startIndex, endIndex);

            // Calculate visual height (excluding last margin)
            const visualContentRowsInDots = (visibleRows.length * textRowHeight) + (Math.max(0, visibleRows.length - 1) * rowSpacing);
            const unusedRows = totalRows - visualContentRowsInDots;
            const startGridRow = Math.floor(unusedRows / 2);

            // --- 2. Draw Background Grid ---
            // We draw all dots as "dimmed" first
            const baseColor = typeof dotColor === 'string' ? dotColor : '#00ff00';
            const rgb = hexToRgb(baseColor);
            const dimStyle = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)` : '#111';

            ctx.fillStyle = dimStyle;

            // Optimization: Draw circles is expensive.
            // For 20k dots, drawing rects is much faster and looks similar at small sizes.
            // If dotSize > 4, we can try circles, but rects are safer for Pi.
            // Let's stick to rects for raw performance, or rounded rects if possible.
            // Actually, let's do circles but optimized.
            // Better yet: Path2D?
            // Fastest: fillRect. Let's use fillRect for the "pixels".
            // Real LED screens often look like square pixels anyway.

            for (let r = 0; r < totalRows; r++) {
                for (let c = 0; c < cols; c++) {
                    ctx.fillRect(c * pitch, r * pitch, dotSize, dotSize);
                }
            }

            // --- 3. Draw Active Rows ---
            visibleRows.forEach((rowConfig, i) => {
                // Original index is crucial for state persistence
                const originalIndex = startIndex + i;

                // Initialize state if needed
                if (!stateRef.current[originalIndex]) {
                    stateRef.current[originalIndex] = { offset: 0, lastTick: timestamp };
                }
                const state = stateRef.current[originalIndex];

                // Update Animation State
                if (rowConfig.scrolling !== false && !document.hidden) {
                    if (timestamp - state.lastTick > rowConfig.stepInterval) {
                        state.offset++;
                        state.lastTick = timestamp;
                    }
                } else {
                    // If paused/hidden, update lastTick so we don't jump when resuming
                    state.lastTick = timestamp;
                }

                // Calculate Row Position
                const gridRowStart = startGridRow + (i * rowsPerBlock);

                // Prepare Content using shared rendering logic
                const rowColor = rowConfig.color || baseColor;
                const spacing = rowConfig.spacing;
                const prepared = prepareContent(rowConfig.content, rowColor, spacing);

                // Draw the 7 rows of this text block using shared rendering logic
                const alignment = rowConfig.alignment || 'left';
                const scrolling = rowConfig.scrolling !== false;
                
                for (let r = 0; r < 7; r++) {
                    const screenRow = gridRowStart + r;
                    if (screenRow < 0 || screenRow >= totalRows) continue;

                    for (let c = 0; c < cols; c++) {
                        const { active, colorIndex } = isPixelActive(
                            c,
                            r,
                            prepared,
                            state.offset,
                            scrolling,
                            alignment,
                            cols,
                            spacing
                        );

                        if (active && colorIndex >= 0) {
                            // Set color for this character and draw bright pixel
                            ctx.fillStyle = prepared.charColors[colorIndex];
                            ctx.fillRect(c * pitch, screenRow * pitch, dotSize, dotSize);
                        }
                    }
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [dotSize, dotColor, dotGap, rowSpacing, pageInterval]); // Re-init if layout config changes

    return (
        <div ref={containerRef} style={{ width: '100vw', height: '100dvh', background: 'black', overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ display: 'block' }} />
        </div>
    );
}
