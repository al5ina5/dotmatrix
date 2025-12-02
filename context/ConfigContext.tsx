'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { LED_CONFIG, LEDRowConfig } from '@/config/led.config';
import { PLUGIN_REGISTRY } from '@/plugins/registry';
import { useRemoteClient } from '@/hooks/useRemoteClient';
import { RemoteConnectionState } from '@/lib/remoteControl';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { DisplaySettings, StoredConfig } from '@/types/config';

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

export const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const STORAGE_KEY = 'led-config';

/**
 * Validation function for stored config data
 * Cleans up and migrates data from older versions
 */
function validateStoredConfig(data: any): StoredConfig | null {
    if (!data || typeof data !== 'object') {
        return null;
    }

    // Validate and clean up rows data
    if (data.rows && Array.isArray(data.rows)) {
        data.rows = data.rows.map((row: any) => {
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

    return data as StoredConfig;
}

interface ConfigProviderProps {
    children: ReactNode;
    mode?: 'local' | 'remote';
    remotePeerId?: string | null;
    onRemoteConnectionStateChange?: (state: RemoteConnectionState) => void;
}

export function ConfigProvider({ 
    children, 
    mode = 'local', 
    remotePeerId = null,
    onRemoteConnectionStateChange
}: ConfigProviderProps) {
    // Default configuration values
    const defaultConfig: StoredConfig = {
        rows: [...LED_CONFIG.rows],
        displaySettings: {
            dotSize: LED_CONFIG.display.dotSize,
            dotGap: LED_CONFIG.display.dotGap,
            dotColor: LED_CONFIG.display.dotColor,
            rowSpacing: LED_CONFIG.layout.rowSpacing,
            pageInterval: LED_CONFIG.layout.pageInterval,
        }
    };

    // LOCAL STATE: Managed with useLocalStorage hook
    const [localConfig, setLocalConfig] = useLocalStorage<StoredConfig>(
        STORAGE_KEY,
        defaultConfig,
        validateStoredConfig
    );

    // Separate rows and displaySettings for backward compatibility
    const rows = localConfig.rows;
    const displaySettings = localConfig.displaySettings;

    const setRows = useCallback((updater: LEDRowConfig[] | ((prev: LEDRowConfig[]) => LEDRowConfig[])) => {
        setLocalConfig(prev => ({
            ...prev,
            rows: typeof updater === 'function' ? updater(prev.rows) : updater
        }));
    }, [setLocalConfig]);

    const setDisplaySettings = useCallback((updater: DisplaySettings | ((prev: DisplaySettings) => DisplaySettings)) => {
        setLocalConfig(prev => ({
            ...prev,
            displaySettings: typeof updater === 'function' ? updater(prev.displaySettings) : updater
        }));
    }, [setLocalConfig]);

    // REMOTE STATE: Connect to remote host when in remote mode
    const {
        connectionState,
        isConnected,
        remoteConfig,
        sendUpdateRow,
        sendAddRow,
        sendDeleteRow,
        sendUpdateDisplay,
    } = useRemoteClient(mode === 'remote' ? remotePeerId : null);

    // Notify parent of connection state changes
    useEffect(() => {
        if (mode === 'remote' && onRemoteConnectionStateChange) {
            onRemoteConnectionStateChange(connectionState);
        }
    }, [connectionState, mode, onRemoteConnectionStateChange]);

    // ACTION HANDLERS: Switch between local and remote based on mode
    const addRow = useCallback(() => {
        if (mode === 'remote') {
            sendAddRow();
        } else {
            const newRow: LEDRowConfig = {
                pluginId: 'text',
                params: { content: 'Configure me!' },
                stepInterval: 100,
                color: '#ffffff',
                spacing: { betweenLetters: 1, betweenWords: 4, beforeRepeat: 12 }
            };
            setRows(prev => [...prev, newRow]);
        }
    }, [mode, sendAddRow]);

    const updateRow = useCallback((index: number, updatedRow: LEDRowConfig) => {
        if (mode === 'remote') {
            sendUpdateRow(index, updatedRow);
        } else {
            setRows(prev => {
                const newRows = [...prev];
                newRows[index] = updatedRow;
                return newRows;
            });
        }
    }, [mode, sendUpdateRow]);

    const deleteRow = useCallback((index: number) => {
        if (mode === 'remote') {
            sendDeleteRow(index);
        } else {
            setRows(prev => prev.filter((_, i) => i !== index));
        }
    }, [mode, sendDeleteRow]);

    const moveRow = useCallback((fromIndex: number, toIndex: number) => {
        if (mode === 'remote') {
            console.warn('Move row not implemented for remote mode yet');
        } else {
            setRows(prev => {
                const newRows = [...prev];
                const [movedRow] = newRows.splice(fromIndex, 1);
                newRows.splice(toIndex, 0, movedRow);
                return newRows;
            });
        }
    }, [mode]);

    const updateDisplaySetting = useCallback((field: string, value: number | string) => {
        if (mode === 'remote') {
            sendUpdateDisplay(field, value);
        } else {
            setDisplaySettings((prev: DisplaySettings) => ({ ...prev, [field]: value }));
        }
    }, [mode, sendUpdateDisplay, setDisplaySettings]);

    const resetToDefaults = useCallback(() => {
        if (mode === 'remote') {
            console.warn('Cannot reset remote defaults');
        } else {
            setLocalConfig(defaultConfig);
        }
    }, [mode, setLocalConfig, defaultConfig]);

    const addAllPlugins = useCallback(() => {
        if (mode === 'remote') {
            // TODO: Implement bulk row operations for remote mode
            // For now, this operation is not supported remotely
            alert('Test All Plugins is not available in remote control mode. Use this feature on the host device.');
            return;
        }

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
                baseRow.params = { coins: ['bitcoin', 'ethereum', 'solana'], currency: 'usd' };
            } else if (plugin.id === 'stocks') {
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
                return null;
            } else if (plugin.id === 'movies') {
                return null;
            } else if (plugin.id === 'wordofday') {
                baseRow.params = { showDefinition: false };
            }

            return baseRow;
        }).filter((row): row is LEDRowConfig => row !== null);

        setRows(allPluginRows);
    }, [mode]);

    // CONTEXT VALUE: Use remote data when in remote mode, local data otherwise
    const contextValue = useMemo(() => {
        const currentRows = mode === 'remote' ? (remoteConfig?.rows || []) : rows;
        const currentDisplaySettings = mode === 'remote' 
            ? (remoteConfig?.displaySettings || {
                dotSize: 2,
                dotGap: 1,
                dotColor: '#00ff00',
                rowSpacing: 1,
                pageInterval: 2000
            })
            : displaySettings;

        return {
            rows: currentRows,
            addRow,
            updateRow,
            deleteRow,
            moveRow,
            dotSize: currentDisplaySettings.dotSize,
            dotGap: currentDisplaySettings.dotGap,
            dotColor: currentDisplaySettings.dotColor,
            rowSpacing: currentDisplaySettings.rowSpacing,
            pageInterval: currentDisplaySettings.pageInterval,
            updateDisplaySetting,
            resetToDefaults,
            addAllPlugins,
        };
    }, [
        mode, 
        rows, 
        displaySettings, 
        remoteConfig, 
        addRow, 
        updateRow, 
        deleteRow, 
        moveRow, 
        updateDisplaySetting, 
        resetToDefaults, 
        addAllPlugins
    ]);

    return (
        <ConfigContext.Provider value={contextValue}>
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
