import React from 'react';

interface SliderProps {
    label?: string;
    id?: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
    className?: string;
}

export function Slider({
    label,
    id,
    value,
    min = 0,
    max = 100,
    step = 1,
    onChange,
    className = ''
}: SliderProps) {
    // Calculate percentage based on min/max range
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="text-xs mb-1 opacity-70 flex justify-between items-center" htmlFor={id}>
                    <span>{label}</span>
                    <span className="font-mono">{value}%</span>
                </label>
            )}
            <input
                type="range"
                id={id}
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
                style={{
                    background: `linear-gradient(to right, #00ff00 0%, #00ff00 ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`
                }}
            />
            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #00ff00;
                    cursor: pointer;
                    border: 2px solid #000;
                }

                .slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #00ff00;
                    cursor: pointer;
                    border: 2px solid #000;
                }

                .slider::-webkit-slider-thumb:hover {
                    background: #00ff88;
                }

                .slider::-moz-range-thumb:hover {
                    background: #00ff88;
                }
            `}</style>
        </div>
    );
}

