/**
 * Multi-Line Screen Editor Component
 * 
 * Modular component for editing multi-line screens
 * Shows rows management interface
 */

import { useState } from 'react';
import { MultiLineScreenConfig } from '@/types/screen';
import { LEDRowConfig } from '@/config/led.config';
import { RowsManager } from './RowsManager';
import { Input } from '../ui/Input';
import { useConfig } from '@/context/ConfigContext';

interface MultiLineScreenEditorProps {
  screen: MultiLineScreenConfig;
  screenIndex: number;
  onUpdate: (screen: MultiLineScreenConfig) => void;
  onDelete: () => void;
}

export function MultiLineScreenEditor({
  screen,
  screenIndex,
  onUpdate,
  onDelete
}: MultiLineScreenEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const config = useConfig();
  const defaultScreen = config.getDefaultMultiLineScreen();
  
  // Get rows from the default multi-line screen or this screen
  const rows = screen.id === defaultScreen?.id 
    ? config.rows 
    : screen.rows;

  const handleNameChange = (name: string) => {
    onUpdate({ ...screen, name });
  };

  const handleRowUpdate = (index: number, row: LEDRowConfig) => {
    // If this is the default screen, use the context method
    if (screen.id === defaultScreen?.id) {
      config.updateRow(index, row);
    } else {
      // Otherwise, update the screen's rows directly
      const newRows = [...screen.rows];
      newRows[index] = row;
      onUpdate({ ...screen, rows: newRows });
    }
  };

  const handleRowAdd = () => {
    const newRow: LEDRowConfig = {
      pluginId: 'text',
      params: { content: 'Configure me!' },
      stepInterval: 100,
      color: '#ffffff',
      spacing: { betweenLetters: 1, betweenWords: 4, beforeRepeat: 12 }
    };

    if (screen.id === defaultScreen?.id) {
      config.addRow();
    } else {
      onUpdate({ ...screen, rows: [...screen.rows, newRow] });
    }
  };

  const handleRowDelete = (index: number) => {
    if (screen.id === defaultScreen?.id) {
      config.deleteRow(index);
    } else {
      onUpdate({ ...screen, rows: screen.rows.filter((_, i) => i !== index) });
    }
  };

  const handleRowMove = (fromIndex: number, toIndex: number) => {
    if (screen.id === defaultScreen?.id) {
      config.moveRow(fromIndex, toIndex);
    } else {
      const newRows = [...screen.rows];
      const [movedRow] = newRows.splice(fromIndex, 1);
      newRows.splice(toIndex, 0, movedRow);
      onUpdate({ ...screen, rows: newRows });
    }
  };

  return (
    <div className="border border-white/20 rounded-lg p-4 space-y-4">
      {/* Screen Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/70 hover:text-white transition-colors"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <span className="text-lg font-bold">📺 Multi-Line Display</span>
          <Input
            value={screen.name || `Screen ${screenIndex + 1}`}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Screen name..."
            className="flex-1 max-w-xs"
          />
        </div>
        <button
          onClick={onDelete}
          className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded transition-colors"
        >
          Delete
        </button>
      </div>

      {/* Rows Section */}
      {isExpanded && (
        <div className="pl-8 space-y-4">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm">{rows.length} Row{rows.length === 1 ? '' : 's'}</p>
            <button
              onClick={handleRowAdd}
              className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors"
            >
              + Add Row
            </button>
          </div>

          <div className="space-y-2">
            {rows.map((row, index) => (
              <div
                key={index}
                className="bg-white/5 rounded p-3 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-white/70">
                    📝 Row {index + 1}: {row.pluginId}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRowMove(index, Math.max(0, index - 1))}
                      disabled={index === 0}
                      className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleRowMove(index, Math.min(rows.length - 1, index + 1))}
                      disabled={index === rows.length - 1}
                      className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleRowDelete(index)}
                      className="text-xs px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {/* RowEditor would go here - for now just show basic info */}
                <div className="text-xs text-white/50">
                  Plugin: {row.pluginId} | Speed: {row.stepInterval}ms | Color: {row.color}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

