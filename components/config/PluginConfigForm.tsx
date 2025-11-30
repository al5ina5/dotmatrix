'use client';

import React from 'react';
import { LEDPlugin, ConfigField } from '@/plugins/types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { ColorPicker } from '../ui/ColorPicker';
import { MultiSelect } from '../ui/MultiSelect';
import { ArrayInput } from '../ui/ArrayInput';
import { ObjectInput } from '../ui/ObjectInput';

interface PluginConfigFormProps {
    plugin: LEDPlugin;
    params: any;
    onParamsChange: (params: any) => void;
}

export function PluginConfigForm({ plugin, params, onParamsChange }: PluginConfigFormProps) {
    const configSchema = plugin.configSchema || [];

    const handleFieldChange = (key: string, value: any) => {
        onParamsChange({
            ...params,
            [key]: value
        });
    };

    const renderField = (field: ConfigField) => {
        const currentValue = params?.[field.key] ?? field.defaultValue;

        switch (field.type) {
            case 'text':
                return (
                    <Input
                        key={field.key}
                        label={field.label}
                        type="text"
                        value={currentValue || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleFieldChange(field.key, e.target.value)
                        }
                        placeholder={field.placeholder}
                    />
                );

            case 'number':
                return (
                    <Input
                        key={field.key}
                        label={field.label}
                        type="number"
                        value={currentValue || field.defaultValue}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleFieldChange(field.key, parseFloat(e.target.value))
                        }
                        placeholder={field.placeholder}
                    />
                );

            case 'select':
                return (
                    <Select
                        key={field.key}
                        label={field.label}
                        value={currentValue || field.defaultValue}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            handleFieldChange(field.key, e.target.value)
                        }
                        options={field.options || []}
                    />
                );

            case 'boolean':
                return (
                    <Checkbox
                        key={field.key}
                        label={field.label}
                        checked={currentValue ?? field.defaultValue ?? false}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleFieldChange(field.key, e.target.checked)
                        }
                    />
                );

            case 'color':
                return (
                    <ColorPicker
                        key={field.key}
                        label={field.label}
                        value={currentValue || field.defaultValue || '#00ff00'}
                        onChange={(color) => handleFieldChange(field.key, color)}
                    />
                );

            case 'multi-select':
                return (
                    <MultiSelect
                        key={field.key}
                        label={field.label}
                        value={currentValue || field.defaultValue || []}
                        onChange={(values) => handleFieldChange(field.key, values)}
                        options={field.options || []}
                    />
                );

            case 'array':
                return (
                    <ArrayInput
                        key={field.key}
                        label={field.label}
                        value={currentValue || field.defaultValue || []}
                        onChange={(values) => handleFieldChange(field.key, values)}
                        placeholder={field.placeholder}
                    />
                );

            case 'object':
                return (
                    <ObjectInput
                        key={field.key}
                        label={field.label}
                        value={currentValue || field.defaultValue || {}}
                        onChange={(obj) => handleFieldChange(field.key, obj)}
                        placeholder={field.placeholder}
                    />
                );

            default:
                return (
                    <div key={field.key} className="p-4 border-2 border-red-500/50 rounded bg-red-900/20">
                        <p className="text-sm font-bold text-red-400">Unknown field type: {field.type}</p>
                    </div>
                );
        }
    };

    return (
        <>
            {configSchema.map(field => renderField(field))}
        </>
    );
}

