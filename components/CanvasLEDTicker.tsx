'use client';

import { useEffect, useRef } from 'react';
import { LEDRowConfig } from '@/config/led.config';
import { getPattern } from '@/lib/patterns';
import { HydratedRow } from '@/hooks/useDataHydration';

interface CanvasLEDTickerProps {
    rows: HydratedRow[];
    dotSize: number;
    dotColor: number | string; // Accept hex string
    dotGap: number;
    rowSpacing: number;
}

// Helper to parse hex color to RGB for alpha manipulation
function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export default function CanvasLEDTicker({
    rows,
    dotSize,
    dotColor,
    dotGap,
    rowSpacing,
}: CanvasLEDTickerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Use refs for mutable state to avoid re-triggering the effect loop
    const rowsRef = useRef(rows);
    rowsRef.current = rows;

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
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial size

        // --- RENDER LOOP ---
        const render = (timestamp: number) => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const pitch = dotSize + dotGap;

            const cols = Math.ceil(width / pitch);
            const totalRows = Math.ceil(height / pitch);

            // Clear screen
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);

            // --- 1. Calculate Layout ---
            const textRowHeight = 7;
            const rowsPerBlock = textRowHeight + rowSpacing;

            // Calculate visual height (excluding last margin)
            const activeRows = rowsRef.current;
            const visualContentRowsInDots = (activeRows.length * textRowHeight) + (Math.max(0, activeRows.length - 1) * rowSpacing);
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
            activeRows.forEach((rowConfig, rowIndex) => {
                // Initialize state if needed
                if (!stateRef.current[rowIndex]) {
                    stateRef.current[rowIndex] = { offset: 0, lastTick: timestamp };
                }
                const state = stateRef.current[rowIndex];

                // Update Animation State
                if (rowConfig.scrolling !== false && !document.hidden) {
                    if (timestamp - state.lastTick > rowConfig.stepInterval) {
                        state.offset++;
                        state.lastTick = timestamp;
                    }
                }

                // Calculate Row Position
                const gridRowStart = startGridRow + (rowIndex * rowsPerBlock);

                // Prepare Content Logic
                const content = rowConfig.content;
                const spacing = rowConfig.spacing;

                // Calculate content width for alignment/looping
                let contentWidth = 0;
                const charPositions: number[] = [];
                const patterns: number[][][] = [];

                // Pre-calc positions (this could be memoized but it's fast enough)
                let currentPos = 0;
                for (let i = 0; i < content.length; i++) {
                    const char = content[i];
                    charPositions.push(currentPos);
                    patterns.push(getPattern(char));

                    if (char === ' ') {
                        currentPos += spacing.betweenWords;
                    } else {
                        currentPos += 5; // Char width
                        if (i < content.length - 1 && content[i + 1] !== ' ') {
                            currentPos += spacing.betweenLetters;
                        }
                    }
                }
                contentWidth = currentPos;
                const totalWidth = contentWidth + spacing.beforeRepeat;

                // Determine Alignment Offset
                let alignOffset = 0;
                if (rowConfig.scrolling === false) {
                    if (rowConfig.alignment === 'center') alignOffset = Math.floor((cols - contentWidth) / 2);
                    else if (rowConfig.alignment === 'right') alignOffset = cols - contentWidth - 2;
                }

                // Set Color
                const rowColor = rowConfig.color || baseColor;
                ctx.fillStyle = rowColor;

                // Draw the 7 rows of this text block
                for (let r = 0; r < 7; r++) {
                    const screenRow = gridRowStart + r;
                    if (screenRow < 0 || screenRow >= totalRows) continue;

                    // Optimization: Only iterate columns that could possibly have text?
                    // For simplicity, we iterate screen cols.
                    for (let c = 0; c < cols; c++) {

                        let charColIndex: number;

                        if (rowConfig.scrolling !== false) {
                            // Infinite scroll
                            charColIndex = (c + state.offset) % totalWidth;
                        } else {
                            // Static
                            charColIndex = c - alignOffset;
                        }

                        // Quick bounds check for static
                        if (charColIndex < 0) continue;
                        if (rowConfig.scrolling === false && charColIndex >= contentWidth) continue;

                        // Find which char this column belongs to
                        // This search is the bottleneck. 
                        // Optimization: We can map column -> char index directly if we pre-calc.
                        // But let's try the simple loop first.

                        let isActive = false;

                        // Reverse loop might be faster if we assume we are looking near the end? No.
                        // Binary search? Maybe.
                        // Simple optimization: check bounds.

                        for (let i = 0; i < content.length; i++) {
                            const start = charPositions[i];
                            // If we passed the possible char, break
                            if (start > charColIndex) break;

                            const char = content[i];
                            const width = char === ' ' ? spacing.betweenWords : 5;

                            if (charColIndex >= start && charColIndex < start + width) {
                                if (char !== ' ') {
                                    const colInChar = charColIndex - start;
                                    const pattern = patterns[i];
                                    if (pattern && pattern[r] && pattern[r][colInChar] === 1) {
                                        isActive = true;
                                    }
                                }
                                break; // Found the char, stop looking
                            }
                        }

                        if (isActive) {
                            // Draw bright pixel (overdrawing the dim one)
                            ctx.fillRect(c * pitch, screenRow * pitch, dotSize, dotSize);

                            // Optional: Add a "glow" effect?
                            // ctx.shadowBlur = 4;
                            // ctx.shadowColor = rowColor;
                            // ctx.fillRect...
                            // ctx.shadowBlur = 0; // Reset
                            // Glow is expensive on Pi, keep it off for now.
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
    }, [dotSize, dotColor, dotGap, rowSpacing]); // Re-init if layout config changes

    return (
        <div ref={containerRef} style={{ width: '100vw', height: '100vh', background: 'black', overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ display: 'block' }} />
        </div>
    );
}
