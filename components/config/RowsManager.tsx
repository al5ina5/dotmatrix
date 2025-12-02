'use client';

import { useState } from 'react';
import { useConfig } from '@/context/ConfigContext';
import { RowEditor } from './RowEditor';
import { SettingsHeader } from './SettingsHeader';

export function RowsManager() {
    const { rows, addRow, updateRow, deleteRow, moveRow, resetRows, isRemoteMode } = useConfig();
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (index: number) => {
        if (draggedIndex === null || draggedIndex === index) return;

        moveRow(draggedIndex, index);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <div className="space-y-6">
            <SettingsHeader
                title={`${rows.length} Row${rows.length === 1 ? '' : 's'}`}
                onReset={resetRows}
                resetLabel="Reset rows to default"
                resetMessage="Reset all rows to default state? This will remove all custom configurations."
                showAddButton={true}
                onAdd={addRow}
                addButtonLabel="Add row"
                disabled={false}
            />

            <div>
                {rows.map((row, index) => (
                    <RowEditor
                        key={index}
                        row={row}
                        index={index}
                        onUpdate={updateRow}
                        onDelete={deleteRow}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    />
                ))}
            </div>
        </div>
    );
}

