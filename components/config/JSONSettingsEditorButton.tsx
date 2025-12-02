'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import JSONSettingsEditor from '@/components/JSONSettingsEditor';

export function JSONSettingsEditorButton() {
    const [showJsonEditor, setShowJsonEditor] = useState(false);

    return (
        <>
            <JSONSettingsEditor
                isOpen={showJsonEditor}
                onClose={() => setShowJsonEditor(false)}
            />
            <Button onClick={() => setShowJsonEditor(true)}>
                Open JSON Settings Editor
            </Button>
        </>
    );
}

