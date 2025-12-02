import React, { useState } from 'react';

interface ColorSliderProps {
    label?: string;
    id?: string;
    value: string; // Hex color string
    onChange: (color: string) => void;
    className?: string;
}

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h = h / 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h < 1 / 6) {
        r = c; g = x; b = 0;
    } else if (h < 2 / 6) {
        r = x; g = c; b = 0;
    } else if (h < 3 / 6) {
        r = 0; g = c; b = x;
    } else if (h < 4 / 6) {
        r = 0; g = x; b = c;
    } else if (h < 5 / 6) {
        r = x; g = 0; b = c;
    } else {
        r = c; g = 0; b = x;
    }

    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: h * 360, s, l };
}

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
}

export function ColorSlider({
    label,
    id,
    value,
    onChange,
    className = ''
}: ColorSliderProps) {
    const [isActive, setIsActive] = useState(false);

    // Convert hex to HSL to get hue
    const rgb = hexToRgb(value) || { r: 0, g: 255, b: 0 };
    const { h } = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hue = Math.round(h);

    // Generate gradient stops for the hue slider
    const gradientStops: string[] = [];
    for (let i = 0; i <= 360; i += 60) {
        const rgb = hslToRgb(i, 1, 0.5);
        gradientStops.push(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b}) ${(i / 360) * 100}%`);
    }

    const handleHueChange = (newHue: number) => {
        // Convert hue to color (full saturation, 50% lightness for vibrant colors)
        const rgb = hslToRgb(newHue, 1, 0.5);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        onChange(hex);
    };

    // Calculate percentage based on hue (0-360)
    const percentage = (hue / 360) * 100;

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="text-xs mb-1 opacity-70 flex justify-between items-center" htmlFor={id}>
                    <span>{label}</span>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-4 h-4 rounded border-2 border-white/30"
                            style={{ backgroundColor: value }}
                        />
                        <span className="font-mono text-xs">{value.toUpperCase()}</span>
                    </div>
                </label>
            )}
            <input
                type="range"
                id={id}
                min={0}
                max={360}
                step={1}
                value={hue}
                onChange={(e) => handleHueChange(Number(e.target.value))}
                onFocus={() => setIsActive(true)}
                onBlur={() => setIsActive(false)}
                onMouseDown={() => setIsActive(true)}
                onMouseUp={() => setIsActive(false)}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer color-slider ${isActive ? 'color-slider-active' : ''}`}
                style={{
                    background: `linear-gradient(to right, ${gradientStops.join(', ')})`
                }}
            />
            <style jsx>{`
                .color-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: ${value};
                    cursor: pointer;
                    border: 3px solid #fff;
                    box-shadow: 0 0 0 2px #000, 0 2px 4px rgba(0,0,0,0.3);
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .color-slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: ${value};
                    cursor: pointer;
                    border: 3px solid #fff;
                    box-shadow: 0 0 0 2px #000, 0 2px 4px rgba(0,0,0,0.3);
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .color-slider-active::-webkit-slider-thumb {
                    transform: scale(1.2);
                    box-shadow: 0 0 0 2px #000, 0 0 8px ${value};
                }

                .color-slider-active::-moz-range-thumb {
                    transform: scale(1.2);
                    box-shadow: 0 0 0 2px #000, 0 0 8px ${value};
                }

                .color-slider:focus {
                    outline: none;
                }
            `}</style>
        </div>
    );
}

