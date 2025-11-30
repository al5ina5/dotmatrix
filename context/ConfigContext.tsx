'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LED_CONFIG, LEDRowConfig } from '@/config/led.config';

interface ConfigContextType {
    // Rows
    rows: LEDRowConfig[];
    addRow: () => void;
    updateRow: (index: number, row: LEDRowConfig) => void;
    deleteRow: (index: number) => void;
    moveRow: (fromIndex: number, toIndex: number) => void;
    
    // Display Settings
    dotSize: number;
    dotGap: number;
    dotColor: string;
    rowSpacing: number;
    pageInterval: number;
    updateDisplaySetting: (field: string, value: number | string) => void;
    
    // Reset
    resetToDefaults: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const STORAGE_KEY = 'led-config';

// Helper to load from localStorage
function loadFromStorage() {
    if (typeof window === 'undefined') return null;
    
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading config from localStorage:', error);
    }
    return null;
}

// Helper to save to localStorage
function saveToStorage(rows: LEDRowConfig[], displaySettings: any) {
    if (typeof window === 'undefined') return;
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            rows,
            displaySettings
        }));
    } catch (error) {
        console.error('Error saving config to localStorage:', error);
    }
}

export function ConfigProvider({ children }: { children: ReactNode }) {
    // Initialize from localStorage or defaults
    const [rows, setRows] = useState<LEDRowConfig[]>(() => {
        const stored = loadFromStorage();
        return stored?.rows || [...LED_CONFIG.rows];
    });
    
    const [displaySettings, setDisplaySettings] = useState(() => {
        const stored = loadFromStorage();
        return stored?.displaySettings || {
            dotSize: LED_CONFIG.display.dotSize,
            dotGap: LED_CONFIG.display.dotGap,
            dotColor: LED_CONFIG.display.dotColor,
            rowSpacing: LED_CONFIG.layout.rowSpacing,
            pageInterval: LED_CONFIG.layout.pageInterval,
        };
    });

    // Save to localStorage whenever rows or displaySettings change
    useEffect(() => {
        saveToStorage(rows, displaySettings);
    }, [rows, displaySettings]);

    const addRow = () => {
        const newRow: LEDRowConfig = {
            pluginId: 'text',
            params: { content: '' },
            stepInterval: 100,
            color: '#ffffff',
            spacing: { betweenLetters: 1, betweenWords: 4, beforeRepeat: 12 }
        };
        setRows([...rows, newRow]);
    };

    const updateRow = (index: number, updatedRow: LEDRowConfig) => {
        const newRows = [...rows];
        newRows[index] = updatedRow;
        setRows(newRows);
    };

    const deleteRow = (index: number) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    const moveRow = (fromIndex: number, toIndex: number) => {
        const newRows = [...rows];
        const [movedRow] = newRows.splice(fromIndex, 1);
        newRows.splice(toIndex, 0, movedRow);
        setRows(newRows);
    };

    const updateDisplaySetting = (field: string, value: number | string) => {
        setDisplaySettings(prev => ({ ...prev, [field]: value }));
    };

    const resetToDefaults = () => {
        setRows([...LED_CONFIG.rows]);
        setDisplaySettings({
            dotSize: LED_CONFIG.display.dotSize,
            dotGap: LED_CONFIG.display.dotGap,
            dotColor: LED_CONFIG.display.dotColor,
            rowSpacing: LED_CONFIG.layout.rowSpacing,
            pageInterval: LED_CONFIG.layout.pageInterval,
        });
    };

    return (
        <ConfigContext.Provider
            value={{
                rows,
                addRow,
                updateRow,
                deleteRow,
                moveRow,
                dotSize: displaySettings.dotSize,
                dotGap: displaySettings.dotGap,
                dotColor: displaySettings.dotColor,
                rowSpacing: displaySettings.rowSpacing,
                pageInterval: displaySettings.pageInterval,
                updateDisplaySetting,
                resetToDefaults,
            }}
        >
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
}
