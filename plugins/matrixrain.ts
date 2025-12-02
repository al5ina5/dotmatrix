/**
 * Matrix Rain Effect Plugin
 * Fullscreen plugin that creates the classic "Matrix code rain" effect
 */

import { FullscreenPlugin } from './types';

interface MatrixRainParams {
    /** Speed of falling characters (pixels per frame) */
    speed?: number;

    /** Color of the rain (hex string) */
    color?: string;

    /** Density of columns (0-1) */
    density?: number;

    /** Character set to use */
    charset?: string;

    /** Fade trail length */
    trailLength?: number;
}

/**
 * Matrix Rain Fullscreen Plugin
 * 
 * This is a fullscreen plugin that renders directly to the canvas.
 * It doesn't return text content like regular plugins - instead,
 * it has a render function that draws directly.
 */
export const MatrixRainPlugin: FullscreenPlugin<MatrixRainParams> = {
    id: 'matrix-rain',
    name: 'Matrix Rain',
    description: 'Classic Matrix code rain effect',
    screenType: 'fullscreen',

    defaultParams: {
        speed: 2,
        color: '#00ff00',
        density: 0.8,
        charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()',
        trailLength: 20
    },

    configSchema: [
        {
            key: 'speed',
            type: 'number',
            label: 'Fall Speed',
            defaultValue: 2,
            min: 0.5,
            max: 10,
            step: 0.5
        },
        {
            key: 'color',
            type: 'color',
            label: 'Rain Color',
            defaultValue: '#00ff00'
        },
        {
            key: 'density',
            type: 'number',
            label: 'Density',
            defaultValue: 0.8,
            min: 0.1,
            max: 1,
            step: 0.1
        },
        {
            key: 'charset',
            type: 'text',
            label: 'Character Set',
            defaultValue: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()',
            placeholder: 'Characters to use in rain'
        },
        {
            key: 'trailLength',
            type: 'number',
            label: 'Trail Length',
            defaultValue: 20,
            min: 5,
            max: 50,
            step: 5
        }
    ],

    /**
     * Render function called each frame
     * This draws directly to the canvas context
     */
    render: (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        dotSize: number,
        dotGap: number,
        timestamp: number,
        params: MatrixRainParams,
        state: any
    ) => {
        const {
            speed = 2,
            color = '#00ff00',
            density = 0.8,
            charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()',
            trailLength = 20
        } = params;

        const pitch = dotSize + dotGap;
        const cols = Math.ceil(width / pitch);
        const rows = Math.ceil(height / pitch);

        // Initialize state on first render
        if (!state.columns) {
            state.columns = Array(cols).fill(null).map(() => ({
                y: Math.random() * -height,
                speed: 0.5 + Math.random() * speed,
                chars: Array(Math.floor(Math.random() * 20) + 10).fill(null).map(() =>
                    charset[Math.floor(Math.random() * charset.length)]
                )
            }));
        }

        // Update and draw each column
        state.columns.forEach((column: any, colIndex: number) => {
            // Skip some columns for density
            if (Math.random() > density) return;

            const x = colIndex * pitch;

            // Update position
            column.y += column.speed;

            // Reset if off screen
            if (column.y > height + (column.chars.length * pitch * 7)) {
                column.y = -column.chars.length * pitch * 7;
                column.speed = 0.5 + Math.random() * speed;
                // Regenerate characters
                column.chars = Array(Math.floor(Math.random() * 20) + 10).fill(null).map(() =>
                    charset[Math.floor(Math.random() * charset.length)]
                );
            }

            // Draw characters with fade effect
            column.chars.forEach((char: string, charIndex: number) => {
                const charY = column.y + (charIndex * pitch * 7);

                if (charY < -pitch * 7 || charY > height) return;

                // Calculate opacity based on position in trail
                const positionInTrail = charIndex / column.chars.length;
                const opacity = Math.max(0, 1 - (positionInTrail * (1 / trailLength)));

                // Draw character as LED dots
                // For now, we'll draw a simple representation
                // In full implementation, you'd use the pattern system
                ctx.fillStyle = color;
                ctx.globalAlpha = opacity;

                // Draw a simple vertical line for each character
                // (Full implementation would render actual character patterns)
                const charHeight = pitch * 7;
                ctx.fillRect(x, charY, dotSize, Math.min(charHeight, height - charY));
            });
        });

        ctx.globalAlpha = 1.0; // Reset alpha
    }
};

