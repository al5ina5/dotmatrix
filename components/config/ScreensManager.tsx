/**
 * Screens Manager Component
 * 
 * Main component for managing screens in a unified tree view
 * Modular design - easy to customize and extend
 */

import { useState } from 'react';
import { useConfig } from '@/context/ConfigContext';
import { ScreenConfig, MultiLineScreenConfig, FullscreenScreenConfig, SingleLineScreenConfig, isMultiLineScreen, isFullscreenScreen, isSingleLineScreen } from '@/types/screen';
import { ScreenTypeSelector } from './ScreenTypeSelector';
import { MultiLineScreenEditor } from './MultiLineScreenEditor';
import { FullscreenScreenEditor } from './FullscreenScreenEditor';
import { CirclePlus } from 'lucide-react';
import { FULLSCREEN_PLUGIN_REGISTRY } from '@/plugins/fullscreenRegistry';

export function ScreensManager() {
    const { screens, addScreen, updateScreen, deleteScreen, moveScreen } = useConfig();
    const [showAddScreen, setShowAddScreen] = useState(false);
    const [selectedScreenType, setSelectedScreenType] = useState<'multiline' | 'fullscreen' | 'singleline' | ''>('');

    const handleAddScreen = () => {
        if (!selectedScreenType) return;

        let newScreen: ScreenConfig;

        switch (selectedScreenType) {
            case 'multiline':
                newScreen = {
                    id: `screen-${Date.now()}`,
                    type: 'multiline',
                    name: 'Multi-Line Display',
                    rows: [],
                    duration: 0,
                    zIndex: 0
                } as MultiLineScreenConfig;
                break;

            case 'fullscreen':
                // Default to first available fullscreen plugin (Matrix Rain)
                const firstPlugin = Object.values(FULLSCREEN_PLUGIN_REGISTRY)[0];
                newScreen = {
                    id: `screen-${Date.now()}`,
                    type: 'fullscreen',
                    name: firstPlugin?.name || 'Fullscreen Effect',
                    pluginId: firstPlugin?.id || 'matrix-rain',
                    params: firstPlugin?.defaultParams || {},
                    opacity: 0.3,
                    zIndex: -1
                } as FullscreenScreenConfig;
                break;

            case 'singleline':
                newScreen = {
                    id: `screen-${Date.now()}`,
                    type: 'singleline',
                    name: 'Single Line',
                    pluginId: 'text',
                    params: { content: 'Configure me!' },
                    stepInterval: 100,
                    color: '#ffffff',
                    scrolling: true,
                    alignment: 'left',
                    spacing: {
                        betweenLetters: 1,
                        betweenWords: 4,
                        beforeRepeat: 12
                    },
                    duration: 0,
                    zIndex: 0
                } as SingleLineScreenConfig;
                break;

            default:
                return;
        }

        addScreen(newScreen);
        setShowAddScreen(false);
        setSelectedScreenType('');
    };

    const handleScreenUpdate = (index: number, updatedScreen: ScreenConfig) => {
        updateScreen(index, updatedScreen);
    };

    const handleScreenDelete = (index: number) => {
        if (confirm('Delete this screen? This cannot be undone.')) {
            deleteScreen(index);
        }
    };

    const handleScreenMove = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < screens.length) {
            moveScreen(index, newIndex);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Screens</h2>
                    <p className="text-sm text-white/50">
                        {screens.length} screen{screens.length === 1 ? '' : 's'} configured
                    </p>
                </div>
                <button
                    onClick={() => setShowAddScreen(!showAddScreen)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
                >
                    <CirclePlus size={18} />
                    Add Screen
                </button>
            </div>

            {/* Add Screen Form */}
            {showAddScreen && (
                <div className="border border-white/20 rounded-lg p-4 space-y-4 bg-white/5">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold">Add New Screen</h3>
                        <button
                            onClick={() => {
                                setShowAddScreen(false);
                                setSelectedScreenType('');
                            }}
                            className="text-white/50 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>

                    <ScreenTypeSelector
                        value={selectedScreenType}
                        onChange={setSelectedScreenType}
                    />

                    {selectedScreenType && (
                        <div className="pt-2">
                            <button
                                onClick={handleAddScreen}
                                className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg transition-colors"
                            >
                                Create Screen
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Screens List */}
            <div className="space-y-4">
                {screens.length === 0 ? (
                    <div className="text-center py-12 text-white/50">
                        <p>No screens configured</p>
                        <p className="text-sm mt-2">Click "Add Screen" to get started</p>
                    </div>
                ) : (
                    screens.map((screen, index) => (
                        <div key={screen.id} className="space-y-2">
                            {/* Screen Editor - Routes to appropriate component */}
                            {isMultiLineScreen(screen) && (
                                <MultiLineScreenEditor
                                    screen={screen}
                                    screenIndex={index}
                                    onUpdate={(updated) => handleScreenUpdate(index, updated)}
                                    onDelete={() => handleScreenDelete(index)}
                                />
                            )}

                            {isFullscreenScreen(screen) && (
                                <FullscreenScreenEditor
                                    screen={screen}
                                    screenIndex={index}
                                    onUpdate={(updated) => handleScreenUpdate(index, updated)}
                                    onDelete={() => handleScreenDelete(index)}
                                />
                            )}

                            {isSingleLineScreen(screen) && (
                                <div className="border border-white/20 rounded-lg p-4">
                                    <p className="text-white/50">Single-line screen editor (coming soon)</p>
                                    <p className="text-xs text-white/30 mt-1">
                                        Screen: {screen.name || `Screen ${index + 1}`} | Plugin: {screen.pluginId}
                                    </p>
                                </div>
                            )}

                            {/* Move Controls */}
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => handleScreenMove(index, 'up')}
                                    disabled={index === 0}
                                    className="text-xs px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30"
                                >
                                    ↑ Move Up
                                </button>
                                <button
                                    onClick={() => handleScreenMove(index, 'down')}
                                    disabled={index === screens.length - 1}
                                    className="text-xs px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30"
                                >
                                    ↓ Move Down
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

