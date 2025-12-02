'use client';

import React from 'react';
import { useConfig } from '@/context/ConfigContext';
import { Input } from '@/components/ui/Input';

export function DisplaySettings() {
    const { dotSize, dotGap, dotColor, rowSpacing, pageInterval, updateDisplaySetting } = useConfig();

    return (
        <div className="space-y-6">
            <p className="font-bold">Display Settings</p>

            <div className="grid grid-cols-4 gap-6">
                <Input
                    label="Dot Size"
                    type="number"
                    id="dotSize"
                    value={dotSize}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDisplaySetting('dotSize', parseInt(e.target.value))}
                />
                <Input
                    label="Dot Gap"
                    type="number"
                    id="dotGap"
                    value={dotGap}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDisplaySetting('dotGap', parseInt(e.target.value))}
                />


                <Input
                    label="Row Spacing"
                    type="number"
                    id="rowSpacing"
                    value={rowSpacing}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDisplaySetting('rowSpacing', parseInt(e.target.value))}
                />

                <Input
                    label="Page Interval (ms)"
                    type="number"
                    id="pageInterval"
                    value={pageInterval}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDisplaySetting('pageInterval', parseInt(e.target.value))}
                />
            </div>
        </div>
    );
}
