'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { LEDContent } from '@/plugins/types';
import { prepareContent, isPixelActive, hexToRgb } from '@/lib/ledRenderer';

interface LEDPreviewProps {
    content: LEDContent; // Now supports multi-color!
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
    const lastContentRef = useRef(content);

    const dotSize = 3;
    const dotGap = 1;
    const height = 7;

    const spacing = useMemo(() => ({
        betweenLetters: 1,
        betweenWords: 4,
        beforeRepeat: 12
    }), []);

    // Pre-calculate character positions and patterns using shared logic
    const prepared = useMemo(() => {
        return prepareContent(content, color, spacing);
    }, [content, color, spacing]);

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

        // No need for custom logic anymore - using shared renderer

        // Render function
        const render = (timestamp: number) => {
            // Update scroll offset only if scrolling is enabled
            if (scrolling && timestamp - lastTime > scrollSpeed) {
                scrollOffsetRef.current = (scrollOffsetRef.current + 1) % prepared.totalWidth;
                lastTime = timestamp;
            }

            // Clear canvas
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw LEDs with multi-color support
            for (let row = 0; row < height; row++) {
                for (let col = 0; col < visibleCols; col++) {
                    const x = col * cellSize;
                    const y = row * cellSize;

                    const { active, colorIndex } = isPixelActive(
                        col,
                        row,
                        prepared,
                        scrollOffsetRef.current,
                        scrolling,
                        alignment,
                        visibleCols,
                        spacing
                    );

                    if (active && colorIndex >= 0) {
                        // Get color for this specific character
                        const pixelColor = prepared.charColors[colorIndex];
                        const rgb = hexToRgb(pixelColor) || { r: 0, g: 255, b: 0 };

                        // Draw active LED with character's color
                        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
                        ctx.beginPath();
                        ctx.arc(x + dotSize / 2, y + dotSize / 2, dotSize / 2, 0, Math.PI * 2);
                        ctx.fill();

                        // Add glow for active LEDs
                        ctx.shadowColor = pixelColor;
                        ctx.shadowBlur = 4;
                        ctx.beginPath();
                        ctx.arc(x + dotSize / 2, y + dotSize / 2, dotSize / 2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    } else {
                        // Draw dimmed LED
                        const rgb = hexToRgb(color) || { r: 0, g: 255, b: 0 };
                        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`;
                        ctx.beginPath();
                        ctx.arc(x + dotSize / 2, y + dotSize / 2, dotSize / 2, 0, Math.PI * 2);
                        ctx.fill();
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
    }, [content, color, prepared, dotSize, dotGap, height, scrolling, alignment, spacing]);

    // Reset scroll offset when switching modes or content type changes significantly
    useEffect(() => {
        const lastContent = lastContentRef.current;
        const currentContent = content;

        // Only reset if content type changed (string vs array) or became empty
        const shouldReset = (
            (typeof lastContent !== typeof currentContent) ||
            (Array.isArray(currentContent) && currentContent.length === 0) ||
            (typeof currentContent === 'string' && !currentContent)
        );

        if (!scrolling || shouldReset) {
            scrollOffsetRef.current = 0;
        }

        lastContentRef.current = content;
    }, [scrolling, content]);

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

