'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { LED_CONFIG, LEDRowConfig } from '@/config/led.config';
import { PLUGIN_REGISTRY } from '@/plugins/registry';
import { useRemoteClient } from '@/hooks/useRemoteClient';
import { RemoteConnectionState } from '@/lib/remoteControl';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { DisplaySettings, StoredConfig } from '@/types/config';
import { ScreenBasedConfig, ScreenConfig, MultiLineScreenConfig, isMultiLineScreen } from '@/types/screen';
import { isLegacyConfig, migrateToScreenConfig } from '@/lib/screenMigration';

interface ConfigContextType {
    // Rows (backward compatibility - operates on default multi-line screen)
    rows: LEDRowConfig[];
    addRow: () => void;
    updateRow: (index: number, row: LEDRowConfig) => void;
    deleteRow: (index: number) => void;
    moveRow: (fromIndex: number, toIndex: number) => void;

    // Screens (new API)
    screens: ScreenConfig[];
    addScreen: (screen: ScreenConfig) => void;
    updateScreen: (index: number, screen: ScreenConfig) => void;
    deleteScreen: (index: number) => void;
    moveScreen: (fromIndex: number, toIndex: number) => void;
    getDefaultMultiLineScreen: () => MultiLineScreenConfig | null;

    // Display Settings
    dotSize: number;
    dotGap: number;
    dotColor: string;
    rowSpacing: number;
    pageInterval: number;
    brightness: number;
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
 * Supports both legacy (StoredConfig) and new (ScreenBasedConfig) formats
 */
function validateStoredConfig(data: any): ScreenBasedConfig | StoredConfig | null {
    if (!data || typeof data !== 'object') {
        return null;
    }

    // If it's already a screen-based config, validate and return it
    if (data.screens && Array.isArray(data.screens)) {
        // Validate screen-based config
        if (data.displaySettings && typeof data.displaySettings.brightness !== 'number') {
            data.displaySettings.brightness = 100;
        }
        return data as ScreenBasedConfig;
    }

    // Legacy config format - validate and clean up rows
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

    // Migrate old configs without brightness setting
    if (data.displaySettings && typeof data.displaySettings.brightness !== 'number') {
        data.displaySettings.brightness = 100;
    }

    // Auto-migrate legacy configs to screen-based format
    if (isLegacyConfig(data)) {
        return migrateToScreenConfig(data as StoredConfig);
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
    // Default configuration values (screen-based)
    const defaultConfig: ScreenBasedConfig = {
        screens: [
            {
                id: 'default',
                type: 'multiline',
                name: 'Main Display',
                rows: [...LED_CONFIG.rows],
                duration: 0,
                zIndex: 0
            } as MultiLineScreenConfig
        ],
        displaySettings: {
            dotSize: LED_CONFIG.display.dotSize,
            dotGap: LED_CONFIG.display.dotGap,
            dotColor: LED_CONFIG.display.dotColor,
            rowSpacing: LED_CONFIG.layout.rowSpacing,
            pageInterval: LED_CONFIG.layout.pageInterval,
            brightness: LED_CONFIG.display.brightness ?? 100,
        },
        screenInterval: 0
    };

    // LOCAL STATE: Managed with useLocalStorage hook
    // Store as ScreenBasedConfig, but validate can return either format
    const [localConfig, setLocalConfig] = useLocalStorage<ScreenBasedConfig | StoredConfig>(
        STORAGE_KEY,
        defaultConfig,
        validateStoredConfig
    );

    // Normalize to ScreenBasedConfig format
    const screenConfig: ScreenBasedConfig = useMemo(() => {
        if (isLegacyConfig(localConfig)) {
            return migrateToScreenConfig(localConfig);
        }
        return localConfig as ScreenBasedConfig;
    }, [localConfig]);

    // Get default multi-line screen for row API compatibility
    const defaultScreen = useMemo(() => {
        return screenConfig.screens.find(
            (s): s is MultiLineScreenConfig => s.type === 'multiline' && s.id === 'default'
        ) || screenConfig.screens.find(
            (s): s is MultiLineScreenConfig => s.type === 'multiline'
        ) || null;
    }, [screenConfig]);

    // Backward compatibility: expose rows from default screen
    const rows = defaultScreen?.rows || [];
    const displaySettings = screenConfig.displaySettings;

    const setRows = useCallback((updater: LEDRowConfig[] | ((prev: LEDRowConfig[]) => LEDRowConfig[])) => {
        setLocalConfig(prev => {
            const config = isLegacyConfig(prev) ? migrateToScreenConfig(prev) : (prev as ScreenBasedConfig);
            const newRows = typeof updater === 'function' ? updater(rows) : updater;

            // Update default multi-line screen
            const updatedScreens = config.screens.map(screen => {
                if (isMultiLineScreen(screen) && (screen.id === 'default' || !defaultScreen || screen.id === defaultScreen.id)) {
                    return { ...screen, rows: newRows };
                }
                return screen;
            });

            // If no multi-line screen exists, create one
            if (!updatedScreens.some(s => isMultiLineScreen(s))) {
                updatedScreens.push({
                    id: 'default',
                    type: 'multiline',
                    name: 'Main Display',
                    rows: newRows,
                    duration: 0,
                    zIndex: 0
                } as MultiLineScreenConfig);
            }

            return { ...config, screens: updatedScreens };
        });
    }, [setLocalConfig, rows, defaultScreen]);

    const setDisplaySettings = useCallback((updater: DisplaySettings | ((prev: DisplaySettings) => DisplaySettings)) => {
        setLocalConfig(prev => {
            const config = isLegacyConfig(prev) ? migrateToScreenConfig(prev) : (prev as ScreenBasedConfig);
            const newSettings = typeof updater === 'function' ? updater(config.displaySettings) : updater;
            return { ...config, displaySettings: newSettings };
        });
    }, [setLocalConfig]);

    // REMOTE STATE: Connect to remote host when in remote mode
    const {
        connectionState,
        isConnected,
        remoteConfig,
        sendUpdateRow,
        sendAddRow,
        sendDeleteRow,
        sendMoveRow,
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
            sendMoveRow(fromIndex, toIndex);
        } else {
            setRows(prev => {
                const newRows = [...prev];
                const [movedRow] = newRows.splice(fromIndex, 1);
                newRows.splice(toIndex, 0, movedRow);
                return newRows;
            });
        }
    }, [mode, sendMoveRow]);

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

    // SCREEN MANAGEMENT METHODS
    const addScreen = useCallback((screen: ScreenConfig) => {
        if (mode === 'remote') {
            // TODO: Implement remote screen operations
            console.warn('Screen operations not yet supported in remote mode');
            return;
        }
        setLocalConfig(prev => {
            const config = isLegacyConfig(prev) ? migrateToScreenConfig(prev) : (prev as ScreenBasedConfig);
            return { ...config, screens: [...config.screens, screen] };
        });
    }, [mode, setLocalConfig]);

    const updateScreen = useCallback((index: number, updatedScreen: ScreenConfig) => {
        if (mode === 'remote') {
            // TODO: Implement remote screen operations
            console.warn('Screen operations not yet supported in remote mode');
            return;
        }
        setLocalConfig(prev => {
            const config = isLegacyConfig(prev) ? migrateToScreenConfig(prev) : (prev as ScreenBasedConfig);
            const newScreens = [...config.screens];
            newScreens[index] = updatedScreen;
            return { ...config, screens: newScreens };
        });
    }, [mode, setLocalConfig]);

    const deleteScreen = useCallback((index: number) => {
        if (mode === 'remote') {
            // TODO: Implement remote screen operations
            console.warn('Screen operations not yet supported in remote mode');
            return;
        }
        setLocalConfig(prev => {
            const config = isLegacyConfig(prev) ? migrateToScreenConfig(prev) : (prev as ScreenBasedConfig);
            // Don't allow deleting the last screen
            if (config.screens.length <= 1) return config;
            return { ...config, screens: config.screens.filter((_, i) => i !== index) };
        });
    }, [mode, setLocalConfig]);

    const moveScreen = useCallback((fromIndex: number, toIndex: number) => {
        if (mode === 'remote') {
            // TODO: Implement remote screen operations
            console.warn('Screen operations not yet supported in remote mode');
            return;
        }
        setLocalConfig(prev => {
            const config = isLegacyConfig(prev) ? migrateToScreenConfig(prev) : (prev as ScreenBasedConfig);
            const newScreens = [...config.screens];
            const [movedScreen] = newScreens.splice(fromIndex, 1);
            newScreens.splice(toIndex, 0, movedScreen);
            return { ...config, screens: newScreens };
        });
    }, [mode, setLocalConfig]);

    const getDefaultMultiLineScreen = useCallback(() => {
        return defaultScreen;
    }, [defaultScreen]);

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
        // For remote mode, we still need to handle legacy format
        const currentRows = mode === 'remote' ? (remoteConfig?.rows || []) : rows;
        const currentScreens = mode === 'remote'
            ? (remoteConfig?.screens || [])
            : screenConfig.screens;
        const currentDisplaySettings = mode === 'remote'
            ? (remoteConfig?.displaySettings || {
                dotSize: 2,
                dotGap: 1,
                dotColor: '#00ff00',
                rowSpacing: 1,
                pageInterval: 2000,
                brightness: 100
            })
            : displaySettings;

        return {
            // Row API (backward compatibility)
            rows: currentRows,
            addRow,
            updateRow,
            deleteRow,
            moveRow,
            // Screen API (new)
            screens: currentScreens,
            addScreen,
            updateScreen,
            deleteScreen,
            moveScreen,
            getDefaultMultiLineScreen,
            // Display Settings
            dotSize: currentDisplaySettings.dotSize,
            dotGap: currentDisplaySettings.dotGap,
            dotColor: currentDisplaySettings.dotColor,
            rowSpacing: currentDisplaySettings.rowSpacing,
            pageInterval: currentDisplaySettings.pageInterval,
            brightness: currentDisplaySettings.brightness ?? 100,
            updateDisplaySetting,
            resetToDefaults,
            addAllPlugins,
        };
    }, [
        mode,
        rows,
        screenConfig.screens,
        displaySettings,
        remoteConfig,
        addRow,
        updateRow,
        deleteRow,
        moveRow,
        addScreen,
        updateScreen,
        deleteScreen,
        moveScreen,
        getDefaultMultiLineScreen,
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
