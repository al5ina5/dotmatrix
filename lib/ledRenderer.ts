/**
 * Shared LED Rendering Logic
 * Used by both CanvasLEDTicker (main display) and LEDPreview (settings preview)
 * Ensures consistent rendering with multi-color support
 */

import { getPattern } from './patterns';
import { LEDContent, ColoredSegment } from '@/plugins/types';

export interface SpacingConfig {
    betweenLetters: number;
    betweenWords: number;
    beforeRepeat: number;
}

export interface PreparedContent {
    chars: string[];
    charColors: string[];
    charPositions: number[];
    patterns: number[][][];
    contentWidth: number;
    totalWidth: number;
}

/**
 * Normalize content to colored segments array
 */
export function normalizeContent(content: LEDContent, defaultColor: string): ColoredSegment[] {
    if (typeof content === 'string') {
        return [{ text: content, color: defaultColor }];
    }
    return content;
}

/**
 * Parse hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Prepare content for rendering
 * Converts LEDContent to character array with positions and colors
 */
export function prepareContent(
    content: LEDContent,
    defaultColor: string,
    spacing: SpacingConfig
): PreparedContent {
    const segments = normalizeContent(content, defaultColor);
    
    const chars: string[] = [];
    const charColors: string[] = [];
    const charPositions: number[] = [];
    const patterns: number[][][] = [];
    
    // Build flat character array with color metadata
    for (const segment of segments) {
        for (const char of segment.text) {
            chars.push(char);
            charColors.push(segment.color);
        }
    }
    
    // Calculate positions
    let currentPos = 0;
    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        charPositions.push(currentPos);
        patterns.push(getPattern(char));
        
        if (char === ' ') {
            currentPos += spacing.betweenWords;
        } else {
            currentPos += 5; // Character width
            if (i < chars.length - 1 && chars[i + 1] !== ' ') {
                currentPos += spacing.betweenLetters;
            }
        }
    }
    
    const contentWidth = currentPos;
    const totalWidth = contentWidth + spacing.beforeRepeat;
    
    return {
        chars,
        charColors,
        charPositions,
        patterns,
        contentWidth,
        totalWidth
    };
}

/**
 * Check if a specific grid cell should be active (lit up)
 * This is the core rendering logic used by both components
 */
export function isPixelActive(
    col: number,
    row: number,
    prepared: PreparedContent,
    scrollOffset: number,
    scrolling: boolean,
    alignment: 'left' | 'center' | 'right',
    visibleCols: number,
    spacing: SpacingConfig
): { active: boolean; colorIndex: number } {
    let charColumnIndex: number;
    
    if (scrolling) {
        // Scrolling mode: wrap around
        charColumnIndex = (col + scrollOffset) % prepared.totalWidth;
    } else {
        // Static mode: apply alignment offset
        let alignOffset = 0;
        if (alignment === 'center') {
            alignOffset = Math.floor((visibleCols - prepared.contentWidth) / 2);
        } else if (alignment === 'right') {
            alignOffset = visibleCols - prepared.contentWidth - 2;
        }
        
        charColumnIndex = col - alignOffset;
        
        // Out of bounds check for static mode
        if (charColumnIndex < 0 || charColumnIndex >= prepared.contentWidth) {
            return { active: false, colorIndex: -1 };
        }
    }
    
    // Find which character this column belongs to
    for (let i = 0; i < prepared.chars.length; i++) {
        const start = prepared.charPositions[i];
        const char = prepared.chars[i];
        const width = char === ' ' ? spacing.betweenWords : 5;
        
        if (charColumnIndex >= start && charColumnIndex < start + width) {
            if (char === ' ') {
                return { active: false, colorIndex: -1 };
            }
            
            const colInChar = charColumnIndex - start;
            const pattern = prepared.patterns[i];
            
            if (pattern && pattern[row] && pattern[row][colInChar] === 1) {
                return { active: true, colorIndex: i };
            }
            
            return { active: false, colorIndex: -1 };
        }
    }
    
    return { active: false, colorIndex: -1 };
}


