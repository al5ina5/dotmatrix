import React, { useState } from 'react';

interface SliderProps {
    label?: string;
    id?: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
    className?: string;
    unit?: string; // Optional unit to display after value (e.g., 'px', 'ms', '%')
}

export function Slider({
    label,
    id,
    value,
    min = 0,
    max = 100,
    step = 1,
    onChange,
    className = '',
    unit = '%'
}: SliderProps) {
    const [isActive, setIsActive] = useState(false);
    // Calculate percentage based on min/max range
    const percentage = ((value - min) / (max - min)) * 100;
    
    // Use green when active/focused, gray otherwise
    const trackColor = isActive ? '#00ff00' : '#666';

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="text-xs mb-1 opacity-70 flex justify-between items-center" htmlFor={id}>
                    <span>{label}</span>
                    <span className="font-mono">{value}{unit}</span>
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
                onInput={(e) => onChange(Number((e.target as HTMLInputElement).value))}
                onFocus={() => setIsActive(true)}
                onBlur={() => setIsActive(false)}
                onMouseDown={() => setIsActive(true)}
                onMouseUp={() => setIsActive(false)}
                onTouchStart={() => setIsActive(true)}
                onTouchEnd={() => setIsActive(false)}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider ${isActive ? 'slider-active' : ''}`}
                style={{
                    background: `linear-gradient(to right, ${trackColor} 0%, ${trackColor} ${percentage}%, #333 ${percentage}%, #333 100%)`
                }}
            />
            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #666;
                    cursor: pointer;
                    -webkit-tap-highlight-color: transparent;
                    touch-action: pan-x;
                }

                .slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #666;
                    cursor: pointer;
                    border: none;
                }

                .slider-active::-webkit-slider-thumb {
                    background: #00ff00;
                }

                .slider-active::-moz-range-thumb {
                    background: #00ff00;
                }

                .slider:focus {
                    outline: none;
                }

                /* Improve iOS touch handling */
                .slider {
                    -webkit-tap-highlight-color: transparent;
                    touch-action: pan-x;
                }
            `}</style>
        </div>
    );
}

