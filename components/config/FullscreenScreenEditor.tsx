/**
 * Fullscreen Screen Editor Component
 * 
 * Modular component for editing fullscreen effect screens
 * Shows effect-specific options (Matrix Rain, Particles, etc.)
 */

import { useState } from 'react';
import { FullscreenScreenConfig } from '@/types/screen';
import { Input } from '../ui/Input';
import { ColorPicker } from '../ui/ColorPicker';
import { Select } from '../ui/Select';
import { Slider } from '../ui/Slider';
import { FULLSCREEN_PLUGIN_REGISTRY } from '@/plugins/fullscreenRegistry';

interface FullscreenScreenEditorProps {
    screen: FullscreenScreenConfig;
    screenIndex: number;
    onUpdate: (screen: FullscreenScreenConfig) => void;
    onDelete: () => void;
}

export function FullscreenScreenEditor({
    screen,
    screenIndex,
    onUpdate,
    onDelete
}: FullscreenScreenEditorProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const plugin = FULLSCREEN_PLUGIN_REGISTRY[screen.pluginId];

    const handleNameChange = (name: string) => {
        onUpdate({ ...screen, name });
    };

    const handlePluginChange = (pluginId: string) => {
        const newPlugin = FULLSCREEN_PLUGIN_REGISTRY[pluginId];
        const defaultParams = newPlugin?.defaultParams || {};
        onUpdate({
            ...screen,
            pluginId,
            params: defaultParams
        });
    };

    const handleParamChange = (key: string, value: any) => {
        onUpdate({
            ...screen,
            params: {
                ...screen.params,
                [key]: value
            }
        });
    };

    const handleOpacityChange = (opacity: number) => {
        onUpdate({ ...screen, opacity });
    };

    const handleZIndexChange = (zIndex: number) => {
        onUpdate({ ...screen, zIndex });
    };

    // Get available fullscreen plugins
    const availablePlugins = Object.values(FULLSCREEN_PLUGIN_REGISTRY);

    return (
        <div className="border border-white/20 rounded-lg p-4 space-y-4">
            {/* Screen Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        {isExpanded ? '▼' : '▶'}
                    </button>
                    <span className="text-lg font-bold">🎨 Fullscreen Effect</span>
                    <Input
                        value={screen.name || `Screen ${screenIndex + 1}`}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Screen name..."
                        className="flex-1 max-w-xs"
                    />
                </div>
                <button
                    onClick={onDelete}
                    className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded transition-colors"
                >
                    Delete
                </button>
            </div>

            {/* Effect Configuration */}
            {isExpanded && (
                <div className="pl-8 space-y-4">
                    {/* Plugin Selection */}
                    <div>
                        <Select
                            value={screen.pluginId}
                            onChange={(e) => handlePluginChange(e.target.value)}
                            options={availablePlugins.map(p => ({ value: p.id, label: p.name }))}
                            label="Effect Type"
                        />
                        {plugin?.description && (
                            <p className="text-xs text-white/50 mt-1">{plugin.description}</p>
                        )}
                    </div>

                    {/* Effect-Specific Parameters */}
                    {plugin && screen.params && (
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-white/70">Effect Settings</h4>

                            {/* Matrix Rain Specific Options */}
                            {screen.pluginId === 'matrix-rain' && (
                                <>
                                    <div>
                                        <label className="block text-sm mb-2">
                                            Speed: {screen.params.speed || 2}
                                        </label>
                                        <Slider
                                            value={screen.params.speed || 2}
                                            onChange={(value) => handleParamChange('speed', value)}
                                            min={0.5}
                                            max={10}
                                            step={0.5}
                                        />
                                    </div>

                                    <div>
                                        <ColorPicker
                                            label="Color"
                                            value={screen.params.color || '#00ff00'}
                                            onChange={(color) => handleParamChange('color', color)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm mb-2">
                                            Density: {screen.params.density || 0.8}
                                        </label>
                                        <Slider
                                            value={screen.params.density || 0.8}
                                            onChange={(value) => handleParamChange('density', value)}
                                            min={0.1}
                                            max={1}
                                            step={0.1}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm mb-2">
                                            Trail Length: {screen.params.trailLength || 20}
                                        </label>
                                        <Slider
                                            value={screen.params.trailLength || 20}
                                            onChange={(value) => handleParamChange('trailLength', value)}
                                            min={5}
                                            max={50}
                                            step={5}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Add more effect-specific options here as needed */}
                        </div>
                    )}

                    {/* Display Options */}
                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <h4 className="text-sm font-bold text-white/70">Display Options</h4>

                        <div>
                            <label className="block text-sm mb-2">
                                Opacity: {screen.opacity !== undefined ? (screen.opacity * 100).toFixed(0) : 100}%
                            </label>
                            <Slider
                                value={screen.opacity !== undefined ? screen.opacity : 1}
                                onChange={(value) => handleOpacityChange(value)}
                                min={0}
                                max={1}
                                step={0.1}
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-2">Z-Index (Layering)</label>
                            <Input
                                type="number"
                                value={screen.zIndex || 0}
                                onChange={(e) => handleZIndexChange(parseInt(e.target.value) || 0)}
                                className="w-32"
                            />
                            <p className="text-xs text-white/50 mt-1">
                                Lower = behind, Higher = in front (0 = same level)
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

