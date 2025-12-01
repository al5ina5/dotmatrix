'use client';

import { useState, useMemo } from 'react';
import { LEDRowConfig } from '@/config/led.config';
import { PLUGIN_REGISTRY } from '@/plugins/registry';
import { usePluginData } from '@/hooks/usePluginData';
import { LEDPreview } from '../LEDPreview';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { ColorPicker } from '../ui/ColorPicker';
import { PluginConfigForm } from './PluginConfigForm';

interface RowEditorProps {
    row: LEDRowConfig;
    index: number;
    onUpdate: (index: number, row: LEDRowConfig) => void;
    onDelete: (index: number) => void;
    onDragStart: (index: number) => void;
    onDragOver: (index: number) => void;
    onDragEnd: () => void;
}

export function RowEditor({ row, index, onUpdate, onDelete, onDragStart, onDragOver, onDragEnd }: RowEditorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Build options dynamically from plugin registry
    const pluginOptions = useMemo(() => {
        return Object.keys(PLUGIN_REGISTRY).map((pluginId) => {
            const plugin = PLUGIN_REGISTRY[pluginId];
            return {
                value: pluginId,
                label: plugin.name || pluginId.charAt(0).toUpperCase() + pluginId.slice(1)
            };
        });
    }, []);

    // Fetch plugin content using the SAME cache as useDataHydration!
    // This means zero duplicate API calls - we're reading from the same SWR cache
    const { content: pluginContent } = usePluginData(
        row.pluginId,
        row.params,
    );

    // Pass raw LEDContent to preview - now supports multi-color!
    const previewContent = pluginContent || 'Loading...';

    const handlePluginChange = (pluginId: string) => {
        // Initialize with default params from schema
        const plugin = PLUGIN_REGISTRY[pluginId];
        const defaultParams: any = {};

        if (plugin?.configSchema) {
            plugin.configSchema.forEach(field => {
                defaultParams[field.key] = field.defaultValue;
            });
        }

        const updatedRow: LEDRowConfig = {
            pluginId,
            params: defaultParams,
            stepInterval: row.stepInterval,
            color: row.color,
            spacing: row.spacing,
            scrolling: row.scrolling,
            alignment: row.alignment,
        };
        onUpdate(index, updatedRow);
    };

    const handleParamsChange = (newParams: any) => {
        const updatedRow: LEDRowConfig = {
            ...row,
            params: newParams
        };
        onUpdate(index, updatedRow);
    };

    const handleStandardOptionChange = (key: string, value: any) => {
        const updatedRow: LEDRowConfig = {
            ...row,
            [key]: value
        };
        onUpdate(index, updatedRow);
    };

    return (
        <div
            className={`transition-all ${isOpen && 'bg-white/20 my-6'} ${isDragging ? 'opacity-50' : ''}`}
            draggable
            onDragStart={(e) => {
                setIsDragging(true);
                onDragStart(index);
                e.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                onDragOver(index);
            }}
            onDragEnd={() => {
                setIsDragging(false);
                onDragEnd();
            }}
        >
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex flex-col cursor-pointer hover:bg-white/5 transition-colors"
            >
                <div className="flex justify-between items-center p-2 overflow-hidden">
                    {/* <div className="shrink-0 cursor-grab active:cursor-grabbing" title="Drag to reorder">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-white/30">
                            <circle cx="4" cy="4" r="1.5" />
                            <circle cx="12" cy="4" r="1.5" />
                            <circle cx="4" cy="8" r="1.5" />
                            <circle cx="12" cy="8" r="1.5" />
                            <circle cx="4" cy="12" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                        </svg>
                    </div> */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                        <LEDPreview
                            content={previewContent}
                            color={row.color || '#00ff00'}
                            scrolling={row.scrolling ?? true}
                            alignment={row.alignment || 'left'}
                        />
                    </div>
                    {isOpen && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(index);
                            }}
                            className="absolute shrink-0 text-red-400 hover:text-red-300 text-xs px-2 py-1 border border-red-400/50 rounded"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>

            {isOpen && (
                <div className="p-6 space-y-6">

                    {/* Standard Display Options - Apply to ALL rows */}

                    <ColorPicker
                        label="Color"
                        value={row.color || '#00ff00'}
                        onChange={(color) => handleStandardOptionChange('color', color)}
                    />

                    <Input
                        label="Move Speed (ms)"
                        type="number"
                        value={row.stepInterval}
                        onChange={(e) => handleStandardOptionChange('stepInterval', parseInt(e.target.value))}
                        placeholder="120"
                    />

                    <Checkbox
                        label="Scrolling"
                        checked={row.scrolling ?? true}
                        onChange={(e) => handleStandardOptionChange('scrolling', e.target.checked)}
                    />

                    {!row.scrolling && (
                        <Select
                            label="Alignment"
                            value={row.alignment || 'left'}
                            onChange={(e) => handleStandardOptionChange('alignment', e.target.value)}
                            options={[
                                { value: 'left', label: 'Left' },
                                { value: 'center', label: 'Center' },
                                { value: 'right', label: 'Right' }
                            ]}
                        />
                    )}

                    <Select
                        label="Plugin"
                        value={row.pluginId}
                        onChange={(e) => handlePluginChange(e.target.value)}
                        options={pluginOptions}
                    />

                    <PluginConfigForm
                        plugin={PLUGIN_REGISTRY[row.pluginId]}
                        params={row.params || {}}
                        onParamsChange={handleParamsChange}
                    />
                </div>
            )}
        </div>
    );
}

