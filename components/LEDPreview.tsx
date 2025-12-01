'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { getPattern } from '@/lib/patterns';

interface LEDPreviewProps {
    content: string;
    color?: string;
    scrolling?: boolean;
    alignment?: 'left' | 'center' | 'right';
}

/**
 * Mini LED Preview Component - Canvas Version
 * High-performance LED matrix preview using Canvas
 * Supports both scrolling and static (aligned) modes
 * Used in the settings panel to preview row content
 */
export function LEDPreview({
    content,
    color = '#00ff00',
    scrolling = true,
    alignment = 'left'
}: LEDPreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollOffsetRef = useRef(0);
    const animationFrameRef = useRef<number>(0);

    const dotSize = 3;
    const dotGap = 1;
    const letterSpacing = 1;
    const wordSpacing = 4;
    const beforeRepeat = 12;
    const height = 7;

    // Pre-calculate character positions and patterns
    const { patterns, positions, totalWidth } = useMemo(() => {
        const patterns = content.split('').map(char => getPattern(char));
        const positions: number[] = [];
        let currentPos = 0;

        content.split('').forEach((char, i) => {
            positions.push(currentPos);

            if (char === ' ') {
                currentPos += wordSpacing;
            } else {
                currentPos += 5;

                if (i < content.length - 1 && content[i + 1] !== ' ') {
                    currentPos += letterSpacing;
                }
            }
        });

        return { patterns, positions, totalWidth: currentPos + beforeRepeat };
    }, [content]);

    // Parse color to RGB
    const colorRGB = useMemo(() => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 255, b: 0 };
    }, [color]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const cellSize = dotSize + dotGap;

        // Get container width
        const container = canvas.parentElement;
        const containerWidth = container?.clientWidth || 800;
        const visibleCols = Math.floor(containerWidth / cellSize);

        // Set canvas size to fill container
        canvas.width = visibleCols * cellSize;
        canvas.height = height * cellSize;

        let lastTime = 0;
        const scrollSpeed = 150; // ms per step

        // Calculate content width (without repeat spacing)
        const contentWidth = positions.length > 0
            ? positions[positions.length - 1] + (content[content.length - 1] === ' ' ? wordSpacing : 5)
            : 0;

        // Calculate alignment offset for static mode
        const getAlignmentOffset = (): number => {
            if (scrolling) return 0;

            if (alignment === 'center') {
                return Math.floor((visibleCols - contentWidth) / 2);
            } else if (alignment === 'right') {
                return visibleCols - contentWidth - 2;
            }
            return 0; // left
        };

        // Check if a grid cell should be active
        const isActive = (col: number, row: number): boolean => {
            let charColumnIndex: number;

            if (scrolling) {
                // Scrolling mode: wrap around
                charColumnIndex = (col + scrollOffsetRef.current) % totalWidth;
            } else {
                // Static mode: apply alignment offset
                const alignOffset = getAlignmentOffset();
                charColumnIndex = col - alignOffset;

                // Out of bounds check for static mode
                if (charColumnIndex < 0 || charColumnIndex >= contentWidth) {
                    return false;
                }
            }

            for (let i = 0; i < content.length; i++) {
                const charStart = positions[i];
                const char = content[i];
                const charWidth = char === ' ' ? wordSpacing : 5;

                if (charColumnIndex >= charStart && charColumnIndex < charStart + charWidth) {
                    const columnInChar = charColumnIndex - charStart;
                    if (char === ' ') return false;

                    const pattern = patterns[i];
                    if (!pattern || row >= pattern.length) return false;

                    const patternRow = pattern[row];
                    if (!patternRow || columnInChar >= patternRow.length) return false;

                    return patternRow[columnInChar] === 1;
                }
            }
            return false;
        };

        // Render function
        const render = (timestamp: number) => {
            // Update scroll offset only if scrolling is enabled
            if (scrolling && timestamp - lastTime > scrollSpeed) {
                scrollOffsetRef.current = (scrollOffsetRef.current + 1) % totalWidth;
                lastTime = timestamp;
            }

            // Clear canvas
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw LEDs
            for (let row = 0; row < height; row++) {
                for (let col = 0; col < visibleCols; col++) {
                    const x = col * cellSize;
                    const y = row * cellSize;

                    const active = isActive(col, row);
                    const alpha = active ? 1 : 0.08;

                    // Draw LED dot
                    ctx.fillStyle = `rgba(${colorRGB.r}, ${colorRGB.g}, ${colorRGB.b}, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(x + dotSize / 2, y + dotSize / 2, dotSize / 2, 0, Math.PI * 2);
                    ctx.fill();

                    // Add glow for active LEDs
                    if (active) {
                        ctx.shadowColor = color;
                        ctx.shadowBlur = 4;
                        ctx.beginPath();
                        ctx.arc(x + dotSize / 2, y + dotSize / 2, dotSize / 2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                }
            }

            animationFrameRef.current = requestAnimationFrame(render);
        };

        animationFrameRef.current = requestAnimationFrame(render);

        // Handle resize
        const handleResize = () => {
            const container = canvas.parentElement;
            const containerWidth = container?.clientWidth || 800;
            const newVisibleCols = Math.floor(containerWidth / cellSize);

            canvas.width = newVisibleCols * cellSize;
            canvas.height = height * cellSize;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            window.removeEventListener('resize', handleResize);
        };
    }, [content, color, patterns, positions, totalWidth, colorRGB, dotSize, dotGap, height, scrolling, alignment]);

    // Reset scroll offset when switching modes
    useEffect(() => {
        if (!scrolling) {
            scrollOffsetRef.current = 0;
        }
    }, [scrolling]);

    const cellSize = dotSize + dotGap;
    // Canvas height is 7 rows of LEDs (no gaps at edges)
    const canvasHeight = (height * dotSize) + ((height - 1) * dotGap);

    return (
        <div
            className="overflow-hidden rounded border border-white/20 bg-black p-2 flex items-center"
            style={{
                width: '100%',
                minHeight: `${canvasHeight + 16}px` // Canvas + padding
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    display: 'block',
                    width: '100%',
                    height: `${canvasHeight}px`,
                    imageRendering: 'crisp-edges'
                }}
            />
        </div>
    );
}

