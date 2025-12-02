'use client';

import React from 'react';
import { useConfig } from '@/context/ConfigContext';
import { Slider } from '@/components/ui/Slider';
import { ColorSlider } from '@/components/ui/ColorSlider';
import { SettingsHeader } from './SettingsHeader';

export function DisplaySettings() {
    const { dotSize, dotGap, dotColor, rowSpacing, pageInterval, brightness, inactiveLEDOpacity, inactiveLEDColor, speedMultiplier, updateDisplaySetting, resetDisplaySettings, isRemoteMode } = useConfig();

    return (
        <div className="space-y-6">
            <SettingsHeader
                title="Display Settings"
                onReset={resetDisplaySettings}
                resetLabel="Reset display settings to default"
                resetMessage="Reset all display settings to default values? This will remove all custom configurations."
                disabled={isRemoteMode}
            />

            {/* Brightness Slider */}
            <div className="grid grid-cols-1 gap-6">
                <Slider
                    label="Brightness"
                    id="brightness"
                    value={brightness}
                    min={5}
                    max={100}
                    step={5}
                    unit="%"
                    onChange={(value) => updateDisplaySetting('brightness', value)}
                />
                {/* Animation Speed Multiplier Slider */}
                <Slider
                    label="Animation Speed"
                    id="speedMultiplier"
                    value={speedMultiplier}
                    min={0.25}
                    max={4}
                    step={0.25}
                    unit="x"
                    onChange={(value) => updateDisplaySetting('speedMultiplier', value)}
                />
                {/* Inactive LED Color Slider */}
                <ColorSlider
                    label="Dimmed LED Color"
                    id="inactiveLEDColor"
                    value={inactiveLEDColor}
                    onChange={(color) => updateDisplaySetting('inactiveLEDColor', color)}
                />
                {/* Inactive LED Opacity Slider */}
                <Slider
                    label="Dimmed LED Opacity"
                    id="inactiveLEDOpacity"
                    value={inactiveLEDOpacity}
                    min={0}
                    max={50}
                    step={1}
                    unit="%"
                    onChange={(value) => updateDisplaySetting('inactiveLEDOpacity', value)}
                />
                {/* Font Size Slider */}
                <Slider
                    label="Font Size"
                    id="dotSize"
                    value={dotSize}
                    min={2}
                    max={20}
                    step={1}
                    unit="px"
                    onChange={(value) => updateDisplaySetting('dotSize', value)}
                />
                {/* Character Spacing Slider */}
                <Slider
                    label="Character Spacing"
                    id="dotGap"
                    value={dotGap}
                    min={0}
                    max={10}
                    step={1}
                    unit="px"
                    onChange={(value) => updateDisplaySetting('dotGap', value)}
                />
                {/* Line Spacing Slider */}
                <Slider
                    label="Line Spacing"
                    id="rowSpacing"
                    value={rowSpacing}
                    min={0}
                    max={20}
                    step={1}
                    unit="px"
                    onChange={(value) => updateDisplaySetting('rowSpacing', value)}
                />
                {/* Page Duration Slider */}
                <Slider
                    label="Page Duration"
                    id="pageInterval"
                    value={pageInterval}
                    min={1000}
                    max={60000}
                    step={1000}
                    unit="ms"
                    onChange={(value) => updateDisplaySetting('pageInterval', value)}
                />
            </div>
        </div>
    );
}
