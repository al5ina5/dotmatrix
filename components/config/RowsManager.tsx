'use client';

import { useState } from 'react';
import { useConfig } from '@/context/ConfigContext';
import { RowEditor } from './RowEditor';

export function RowsManager() {
    const { rows, addRow, updateRow, deleteRow, moveRow } = useConfig();
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
            <div className="flex items-center justify-between">
                <p className="font-bold">Rows ({rows.length})</p>
                <button
                    onClick={addRow}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
                >
                    Add Row +
                </button>
            </div>

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

