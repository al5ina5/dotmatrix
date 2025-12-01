'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LED_CONFIG, LEDRowConfig } from '@/config/led.config';
import { PLUGIN_REGISTRY } from '@/plugins/registry';

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

    // Admin/Testing
    addAllPlugins: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const STORAGE_KEY = 'led-config';

// Helper to load from localStorage
function loadFromStorage() {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);

            // Validate and clean up rows data
            if (parsed.rows && Array.isArray(parsed.rows)) {
                parsed.rows = parsed.rows.map((row: any) => {
                    // Clean up crypto plugin params if they have object arrays
                    if (row.pluginId === 'crypto' && row.params?.coins) {
                        if (Array.isArray(row.params.coins)) {
                            row.params.coins = row.params.coins.map((coin: any) => {
                                // If it's an object, extract the ID
                                if (typeof coin === 'object' && coin !== null) {
                                    return coin.id || coin.symbol || String(coin);
                                }
                                return String(coin);
                            });
                        }
                    }
                    return row;
                });
            }

            return parsed;
        }
    } catch (error) {
        console.error('Error loading config from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem(STORAGE_KEY);
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
            params: { content: 'Configure me!' },
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
        setDisplaySettings((prev: any) => ({ ...prev, [field]: value }));
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

    const addAllPlugins = () => {
        const colors = ['#00ff00', '#ff0000', '#0099ff', '#ffff00', '#ff00ff', '#00ffff', '#ffbf00', '#ffffff'];

        const allPluginRows: LEDRowConfig[] = Object.values(PLUGIN_REGISTRY).map((plugin, index) => {
            const baseRow: LEDRowConfig = {
                pluginId: plugin.id,
                params: {},
                stepInterval: 100,
                color: colors[index % colors.length],
                spacing: { betweenLetters: 1, betweenWords: 4, beforeRepeat: 12 }
            };

            // Add some sensible defaults for plugins that need them
            if (plugin.id === 'text') {
                baseRow.params = { content: 'Hello World! Welcome to DotMatrix LED Display!' };
            } else if (plugin.id === 'clock') {
                baseRow.params = { format: '12h', showSeconds: true, updateInterval: 1000 };
                baseRow.scrolling = false;
                baseRow.alignment = 'center';
            } else if (plugin.id === 'weather') {
                baseRow.params = { zipCode: '10001', unit: 'F' };
            } else if (plugin.id === 'crypto') {
                // Fix: crypto expects array of strings, not objects
                baseRow.params = { coins: ['bitcoin', 'ethereum', 'solana'], currency: 'usd' };
            } else if (plugin.id === 'stocks') {
                // Skip stocks in test mode - requires API key
                return null;
            } else if (plugin.id === 'sports') {
                baseRow.params = { league: 'nba', limit: 3 };
            } else if (plugin.id === 'countdown') {
                baseRow.params = { eventName: 'New Year 2026', targetDate: '2026-01-01', showTime: false };
            } else if (plugin.id === 'worldclock') {
                baseRow.params = { timezones: [{ label: 'NYC', region: 'America/New_York' }] };
            } else if (plugin.id === 'sun') {
                baseRow.params = { lat: 40.71, lng: -74.00 };
            } else if (plugin.id === 'holidays') {
                baseRow.params = { countryCode: 'US' };
            } else if (plugin.id === 'reddit') {
                baseRow.params = { subreddit: 'programming', sortBy: 'hot', limit: 5 };
            } else if (plugin.id === 'customapi') {
                // Skip custom API in test mode - it needs real URL
                return null;
            } else if (plugin.id === 'movies') {
                // Skip movies in test mode - requires API key
                return null;
            } else if (plugin.id === 'wordofday') {
                baseRow.params = { showDefinition: false }; // Faster without definition
            }

            return baseRow;
        }).filter((row): row is LEDRowConfig => row !== null); // Filter out null values

        setRows(allPluginRows);
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
                addAllPlugins,
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
