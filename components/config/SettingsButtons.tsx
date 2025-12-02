'use client';

import React from 'react';
import { ExportButtonGroup } from './ExportButtonGroup';
import { ImportButtonGroup } from './ImportButtonGroup';
import { SettingsHeader } from './SettingsHeader';
import { JSONSettingsEditorButton } from './JSONSettingsEditorButton';
import { ClearSettingsButton } from './ClearSettingsButton';

export function SettingsButtons() {
    return (
        <div className="space-y-12 *:space-y-6">
            <div className="">
                <SettingsHeader title="Export and Import" />
                <div className="flex gap-4 flex-wrap">
                    <ExportButtonGroup />
                    <ImportButtonGroup />
                </div>
            </div>
            <div>
                <SettingsHeader title="More" />
                <div className="flex gap-4 flex-wrap">
                    <JSONSettingsEditorButton />
                    <ClearSettingsButton />
                </div>
            </div>
        </div>
    );
}
