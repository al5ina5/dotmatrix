import React, { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (color: string) => void;
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

// Helper function to convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

// Validate hex color
function isValidHex(hex: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [hexValue, setHexValue] = useState(value);
    const [rgb, setRgb] = useState(() => hexToRgb(value) || { r: 0, g: 0, b: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const nativeInputRef = useRef<HTMLInputElement>(null);

    // Sync with external value changes
    useEffect(() => {
        if (value !== hexValue) {
            setHexValue(value);
            const newRgb = hexToRgb(value);
            if (newRgb) {
                setRgb(newRgb);
            }
        }
    }, [value]);

    const handleHexChange = (newHex: string) => {
        setHexValue(newHex);
        if (isValidHex(newHex)) {
            const newRgb = hexToRgb(newHex);
            if (newRgb) {
                setRgb(newRgb);
                onChange(newHex);
            }
        }
    };

    const handleRgbChange = (channel: 'r' | 'g' | 'b', val: number) => {
        const newRgb = { ...rgb, [channel]: val };
        setRgb(newRgb);
        const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        setHexValue(newHex);
        onChange(newHex);
    };

    const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setHexValue(newColor);
        const newRgb = hexToRgb(newColor);
        if (newRgb) {
            setRgb(newRgb);
        }
        onChange(newColor);
    };

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    return (
        <div className="w-full" ref={containerRef}>
            <label className="text-xs mb-1 block opacity-70">
                {label}
            </label>
            <div className="space-y-2">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border-2 border-white/20 hover:border-white/40 p-3 rounded transition-all"
                >
                    <div
                        className="w-8 h-8 rounded border-2 border-white/30 flex-shrink-0"
                        style={{ backgroundColor: hexValue }}
                    />
                    <span className="text-sm font-mono flex-1 text-left">{hexValue.toUpperCase()}</span>
                    <span className="text-xs opacity-50">{isOpen ? '▼' : '▶'}</span>
                </button>

                {isOpen && (
                    <div className="bg-white/5 border-2 border-white/20 rounded p-4 space-y-4">
                        {/* Native color picker (works on desktop, fallback for iOS) */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs opacity-70 flex-shrink-0">Native:</label>
                            <input
                                ref={nativeInputRef}
                                type="color"
                                value={hexValue}
                                onChange={handleNativeColorChange}
                                className="flex-1 h-10 rounded cursor-pointer"
                            />
                        </div>

                        {/* Hex input (works on iOS) */}
                        <div>
                            <label className="text-xs opacity-70 block mb-1">Hex:</label>
                            <input
                                type="text"
                                value={hexValue}
                                onChange={(e) => handleHexChange(e.target.value)}
                                placeholder="#000000"
                                className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-green-400"
                                maxLength={7}
                            />
                        </div>

                        {/* RGB sliders (work on iOS) */}
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs opacity-70">Red</label>
                                    <span className="text-xs font-mono">{rgb.r}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="255"
                                    value={rgb.r}
                                    onChange={(e) => handleRgbChange('r', Number(e.target.value))}
                                    onInput={(e) => handleRgbChange('r', Number((e.target as HTMLInputElement).value))}
                                    className="w-full"
                                    style={{
                                        background: `linear-gradient(to right, #000 0%, #ff0000 100%)`,
                                    }}
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs opacity-70">Green</label>
                                    <span className="text-xs font-mono">{rgb.g}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="255"
                                    value={rgb.g}
                                    onChange={(e) => handleRgbChange('g', Number(e.target.value))}
                                    onInput={(e) => handleRgbChange('g', Number((e.target as HTMLInputElement).value))}
                                    className="w-full"
                                    style={{
                                        background: `linear-gradient(to right, #000 0%, #00ff00 100%)`,
                                    }}
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs opacity-70">Blue</label>
                                    <span className="text-xs font-mono">{rgb.b}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="255"
                                    value={rgb.b}
                                    onChange={(e) => handleRgbChange('b', Number(e.target.value))}
                                    onInput={(e) => handleRgbChange('b', Number((e.target as HTMLInputElement).value))}
                                    className="w-full"
                                    style={{
                                        background: `linear-gradient(to right, #000 0%, #0000ff 100%)`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

