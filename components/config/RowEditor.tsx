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
import { X } from 'lucide-react';

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

    // Check if plugin has its own color fields
    const plugin = PLUGIN_REGISTRY[row.pluginId];
    const hasPluginColorFields = plugin?.configSchema?.some(field => field.type === 'color');

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
            className={`transition-all ${isOpen && 'bg-white/20'} rounded overflow-hidden ${isDragging ? 'opacity-50' : ''}`}
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
                className="relative cursor-pointer hover:bg-white/5 rounded transition-colors p-2"
            >
                <LEDPreview
                    content={previewContent}
                    color={row.color || '#00ff00'}
                    scrolling={row.scrolling ?? true}
                    alignment={row.alignment || 'left'}
                />
                {isOpen && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(index);
                        }}
                        className="absolute right-4 top-4 shrink-0 bg-red-500 text-black font-medium text-xs px-0.5 rounded"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="p-6 space-y-6">

                    {/* Standard Display Options - Apply to ALL rows */}

                    {/* Only show top-level color picker if plugin doesn't have its own color fields */}
                    {!hasPluginColorFields && (
                        <ColorPicker
                            label="Color"
                            value={row.color || '#00ff00'}
                            onChange={(color) => handleStandardOptionChange('color', color)}
                        />
                    )}

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

