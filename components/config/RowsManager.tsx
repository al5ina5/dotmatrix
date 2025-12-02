'use client';

import { useState } from 'react';
import { useConfig } from '@/context/ConfigContext';
import { RowEditor } from './RowEditor';
import { CirclePlus } from 'lucide-react';

export function RowsManager() {
    const { rows, addRow, updateRow, deleteRow, moveRow, addAllPlugins } = useConfig();
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
            <div className="flex items-center gap-2">
                <p className="font-bold">{rows.length} Row{rows.length === 1 ? '' : 's'}</p>

                <button className="opacity-50 hover:opacity-100 transition-opacity" onClick={addRow}>
                    <CirclePlus size={18} />
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

