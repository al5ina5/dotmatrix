'use client';

import { Portal } from "./Portal";
import { RowsManager } from "./config/RowsManager";
import { DisplaySettings } from "./config/DisplaySettings";
import { useConfig } from "@/context/ConfigContext";

interface SettingsProps {
    onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
    const { resetToDefaults } = useConfig();

    const handleReset = () => {
        if (confirm('Reset all settings to defaults? This cannot be undone.')) {
            resetToDefaults();
        }
    };

    const handleClearCache = () => {
        if (confirm('Clear all cached data and refresh? This will reload the page.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <Portal>
            <div className="fixed inset-0 bg-black/95 text-white font-mono z-50 overflow-auto">
                <button
                    onClick={onClose}
                    className="fixed top-6 right-6 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
                    aria-label="Close settings"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className="max-w-2xl mx-auto space-y-12 p-6 py-12">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Settings</h1>
                            <p className="opacity-70">Manage your LED display settings here.</p>
                        </div>
                        <div className="flex gap-4 items-center">
                            <button
                                onClick={handleClearCache}
                                className="text-xs text-yellow-500/70 hover:text-yellow-500 underline transition-colors"
                                title="Clear all cached data and reload (fixes corrupted data)"
                            >
                                🔄 Clear Cache
                            </button>
                            <button
                                onClick={handleReset}
                                className="text-xs text-white/50 hover:text-white/80 underline transition-colors"
                            >
                                Reset to Defaults
                            </button>
                        </div>
                    </div>

                    <RowsManager />
                    <DisplaySettings />

                    <div className="mt-12 pt-6 border-t border-white/10 text-center text-sm text-white/50">
                        <p>💡 <strong>Tip:</strong> Double-click display to toggle settings • Long-press for 800ms to open settings</p>
                    </div>
                </div>
            </div>
        </Portal>
    );
}