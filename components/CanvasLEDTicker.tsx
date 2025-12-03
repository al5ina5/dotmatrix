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
    brightness: number; // 0-100
    inactiveLEDOpacity?: number; // 0-50, representing 0-50% opacity
    inactiveLEDColor?: string; // Hex color string for inactive LEDs
    speedMultiplier?: number; // Animation speed multiplier (0.25x to 4x, 1.0 = normal)
    filters?: {
        vcrCurve: boolean;
        scanlines: boolean;
        glitch: boolean;
        rgbShift: boolean;
        vignette: boolean;
    };
}

import { vertexShaderSource, fragmentShaderSource } from '@/lib/shaders';

export default function CanvasLEDTicker({
    rows,
    dotSize,
    dotColor,
    dotGap,
    rowSpacing,
    pageInterval,
    brightness = 100,
    inactiveLEDOpacity = 8,
    inactiveLEDColor,
    speedMultiplier = 1.0,
    filters = {
        vcrCurve: false,
        scanlines: false,
        glitch: false,
        rgbShift: false,
        vignette: false,
    },
}: CanvasLEDTickerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // Use refs for mutable state to avoid re-triggering the effect loop
    const rowsRef = useRef(rows);
    rowsRef.current = rows;

    const speedMultiplierRef = useRef(speedMultiplier);
    speedMultiplierRef.current = speedMultiplier;

    const filtersRef = useRef(filters);
    filtersRef.current = filters;

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
            displayedContent: any; // Current content being displayed
            pendingContent: any | null; // New content waiting to be displayed
            cyclesCompleted: number; // Number of complete scroll cycles since pending content arrived
            lastOffset: number; // Previous offset to detect wrap-around
            totalWidth: number; // Total width of current displayed content (for cycle detection)
        }
    }>({});

    const prevSpeedMultiplierRef = useRef(speedMultiplier);

    // Reset animation timing when speed multiplier changes to apply immediately
    useEffect(() => {
        if (prevSpeedMultiplierRef.current !== speedMultiplier) {
            // Reset lastTick for all rows so the new speed applies immediately
            Object.keys(stateRef.current).forEach(key => {
                stateRef.current[parseInt(key)].lastTick = performance.now();
            });
            prevSpeedMultiplierRef.current = speedMultiplier;
        }
    }, [speedMultiplier]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        // Initialize WebGL
        const gl = canvas.getContext('webgl');
        if (!gl) {
            console.error('WebGL not supported');
            return;
        }

        // Initialize Offscreen Canvas for 2D drawing
        if (!offscreenCanvasRef.current) {
            offscreenCanvasRef.current = document.createElement('canvas');
        }
        const offscreenCanvas = offscreenCanvasRef.current;
        const ctx = offscreenCanvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        // --- WebGL Setup ---
        const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
            const program = gl.createProgram();
            if (!program) return null;
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error(gl.getProgramInfoLog(program));
                gl.deleteProgram(program);
                return null;
            }
            return program;
        };

        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        if (!vertexShader || !fragmentShader) return;

        const program = createProgram(gl, vertexShader, fragmentShader);
        if (!program) return;

        const positionLocation = gl.getAttribLocation(program, 'a_position');
        const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1,
        ]), gl.STATIC_DRAW);

        const texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0, 1,
            1, 1,
            0, 0,
            0, 0,
            1, 1,
            1, 0,
        ]), gl.STATIC_DRAW);

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Uniform Locations
        const uTimeLoc = gl.getUniformLocation(program, 'u_time');
        const uVcrCurveLoc = gl.getUniformLocation(program, 'u_vcrCurve');
        const uScanlinesLoc = gl.getUniformLocation(program, 'u_scanlines');
        const uGlitchLoc = gl.getUniformLocation(program, 'u_glitch');
        const uRgbShiftLoc = gl.getUniformLocation(program, 'u_rgbShift');
        const uVignetteLoc = gl.getUniformLocation(program, 'u_vignette');

        let animationFrameId: number;

        // Resize handler
        const handleResize = () => {
            const dpr = window.devicePixelRatio || 1;

            // Resize main canvas (WebGL)
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);

            // Resize offscreen canvas (2D)
            offscreenCanvas.width = window.innerWidth * dpr;
            offscreenCanvas.height = window.innerHeight * dpr;
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
            if (pageStateRef.current.totalPages > 1) {
                if (timestamp - pageStateRef.current.lastPageSwitch > pageInterval) {
                    pageStateRef.current.currentPage = (pageStateRef.current.currentPage + 1) % pageStateRef.current.totalPages;
                    pageStateRef.current.lastPageSwitch = timestamp;
                }
            } else {
                if (pageStateRef.current.currentPage !== 0) {
                    pageStateRef.current.currentPage = 0;
                }
            }

            const width = window.innerWidth;
            const height = window.innerHeight;
            const pitch = dotSize + dotGap;

            const cols = Math.ceil(width / pitch);
            const totalRows = Math.ceil(height / pitch);

            // --- DRAW TO OFFSCREEN CANVAS (2D) ---
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);

            // 1. Calculate Layout for Current Page
            const { rowsPerPage, currentPage } = pageStateRef.current;
            const textRowHeight = 7;
            const rowsPerBlock = textRowHeight + rowSpacing;

            const startIndex = currentPage * rowsPerPage;
            const endIndex = Math.min(startIndex + rowsPerPage, rowsRef.current.length);
            const visibleRows = rowsRef.current.slice(startIndex, endIndex);

            const visualContentRowsInDots = (visibleRows.length * textRowHeight) + (Math.max(0, visibleRows.length - 1) * rowSpacing);
            const unusedRows = totalRows - visualContentRowsInDots;
            const startGridRow = Math.floor(unusedRows / 2);

            // 2. Draw Background Grid
            const baseColor = typeof dotColor === 'string' ? dotColor : '#00ff00';
            const inactiveColor = inactiveLEDColor || baseColor;
            const rgb = hexToRgb(inactiveColor);
            const opacity = inactiveLEDOpacity / 100;
            const dimStyle = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})` : '#111';

            ctx.fillStyle = dimStyle;
            for (let r = 0; r < totalRows; r++) {
                for (let c = 0; c < cols; c++) {
                    ctx.fillRect(c * pitch, r * pitch, dotSize, dotSize);
                }
            }

            // 3. Draw Active Rows
            visibleRows.forEach((rowConfig, i) => {
                const originalIndex = startIndex + i;

                if (!stateRef.current[originalIndex]) {
                    stateRef.current[originalIndex] = {
                        offset: 0,
                        lastTick: timestamp,
                        displayedContent: rowConfig.content,
                        pendingContent: null,
                        cyclesCompleted: 0,
                        lastOffset: 0,
                        totalWidth: 0
                    };
                }
                const state = stateRef.current[originalIndex];

                // Check if content has changed
                const contentChanged = state.displayedContent !== rowConfig.content;
                if (contentChanged) {
                    // New content arrived - store it as pending (always use latest)
                    // If there was already pending content, replace it with the newer one
                    if (!state.pendingContent) {
                        // First pending content - reset cycle counter
                        state.cyclesCompleted = 0;
                    }
                    state.pendingContent = rowConfig.content;
                }

                // Use displayed content for rendering (not the new content)
                const contentToRender = state.displayedContent;

                const gridRowStart = startGridRow + (i * rowsPerBlock);
                const rowColor = rowConfig.color || baseColor;
                const spacing = rowConfig.spacing;
                const prepared = prepareContent(contentToRender, rowColor, spacing);
                const alignment = rowConfig.alignment || 'left';
                const scrolling = rowConfig.scrolling !== false;

                // Update totalWidth for current displayed content
                // This is used for cycle detection
                if (state.totalWidth !== prepared.totalWidth) {
                    state.totalWidth = prepared.totalWidth;
                }

                if (rowConfig.scrolling !== false && !document.hidden) {
                    const adjustedStepInterval = rowConfig.stepInterval / speedMultiplierRef.current;
                    if (timestamp - state.lastTick > adjustedStepInterval) {
                        const prevOffset = state.offset;
                        state.offset++;
                        state.lastTick = timestamp;

                        // Detect cycle completion: a cycle is complete when offset >= totalWidth
                        // Since offset increments continuously, we detect when it crosses the totalWidth boundary
                        if (state.pendingContent && state.totalWidth > 0) {
                            // Check if we've completed a full cycle (offset crossed totalWidth boundary)
                            const prevCycle = Math.floor(prevOffset / state.totalWidth);
                            const currentCycle = Math.floor(state.offset / state.totalWidth);

                            if (currentCycle > prevCycle) {
                                // Completed a cycle
                                state.cyclesCompleted++;

                                // After 2-3 cycles, switch to pending content (using 3 for safety)
                                if (state.cyclesCompleted >= 3) {
                                    state.displayedContent = state.pendingContent;
                                    state.pendingContent = null;
                                    state.cyclesCompleted = 0;
                                    // Reset offset to 0 for new content (start from beginning)
                                    state.offset = 0;
                                    // totalWidth will be recalculated on next frame with new content
                                    state.totalWidth = 0;
                                }
                            }
                        }

                        state.lastOffset = prevOffset;
                    }
                } else {
                    state.lastTick = timestamp;
                    // For non-scrolling rows, update content immediately if changed
                    if (contentChanged) {
                        state.displayedContent = rowConfig.content;
                        state.pendingContent = null;
                        state.cyclesCompleted = 0;
                    }
                }

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
                            const brightnessFactor = brightness / 100;
                            const pixelColor = prepared.charColors[colorIndex];
                            const rgb = hexToRgb(pixelColor);

                            if (rgb) {
                                ctx.fillStyle = `rgb(${Math.floor(rgb.r * brightnessFactor)}, ${Math.floor(rgb.g * brightnessFactor)}, ${Math.floor(rgb.b * brightnessFactor)})`;
                            } else {
                                ctx.fillStyle = pixelColor;
                            }

                            ctx.fillRect(c * pitch, screenRow * pitch, dotSize, dotSize);
                        }
                    }
                }
            });

            // --- RENDER TO MAIN CANVAS (WebGL) ---
            gl.useProgram(program);

            // Update Texture
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offscreenCanvas);

            // Set Uniforms
            gl.uniform1f(uTimeLoc, timestamp / 1000);
            gl.uniform1i(uVcrCurveLoc, filtersRef.current.vcrCurve ? 1 : 0);
            gl.uniform1i(uScanlinesLoc, filtersRef.current.scanlines ? 1 : 0);
            gl.uniform1i(uGlitchLoc, filtersRef.current.glitch ? 1 : 0);
            gl.uniform1i(uRgbShiftLoc, filtersRef.current.rgbShift ? 1 : 0);
            gl.uniform1i(uVignetteLoc, filtersRef.current.vignette ? 1 : 0);

            // Draw
            gl.enableVertexAttribArray(positionLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(texCoordLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [dotSize, dotColor, dotGap, rowSpacing, pageInterval, brightness, inactiveLEDOpacity, inactiveLEDColor, filters]); // Re-init if layout config changes

    return (
        <div ref={containerRef} style={{ width: '100vw', height: '100dvh', background: 'black', overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ display: 'block' }} />
        </div>
    );
}
