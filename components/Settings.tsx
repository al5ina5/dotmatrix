'use client';

import { useState, useEffect } from 'react';
import { Portal } from "./Portal";
import { RowsManager } from "./config/RowsManager";
import { DisplaySettings } from "./config/DisplaySettings";
import { RemoteConnectionUI } from "./RemoteConnectionUI";
import { RemoteConnectionPrompt } from "./RemoteConnectionPrompt";
import { useConfig } from "@/context/ConfigContext";
import { RemoteConnectionState } from "@/lib/remoteControl";

interface SettingsProps {
    onClose: () => void;
    peerId: string | null;
    connectionState: RemoteConnectionState;
    isConnected: boolean;
    // Client Mode Props
    onConnect: (id: string) => void;
    onDisconnect: () => void;
    currentRemoteId: string | null;
    clientConnectionState?: RemoteConnectionState;
}

export function Settings({
    onClose,
    peerId,
    connectionState,
    isConnected,
    onConnect,
    onDisconnect,
    currentRemoteId,
    clientConnectionState
}: SettingsProps) {
    const { resetToDefaults } = useConfig();
    const [showPrompt, setShowPrompt] = useState(false);

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

    const handleConnectClick = () => {
        setShowPrompt(true);
    };

    const handleConnect = (peerId: string) => {
        onConnect(peerId);
    };

    const handleCancelPrompt = () => {
        setShowPrompt(false);
        // If we're in connecting state, cancel the connection
        if (clientConnectionState === RemoteConnectionState.CONNECTING) {
            onDisconnect();
        }
    };

    const handleDisconnect = () => {
        onDisconnect();
    };

    // Close prompt when successfully connected
    useEffect(() => {
        if (clientConnectionState === RemoteConnectionState.CONNECTED && showPrompt) {
            setShowPrompt(false);
        }
    }, [clientConnectionState, showPrompt]);

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
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Settings</h1>
                            <p className="opacity-70">Manage your LED display settings.</p>
                        </div>

                        {!currentRemoteId && (
                            <div className="flex gap-4 items-center">
                                <button
                                    onClick={handleClearCache}
                                    className="text-xs text-yellow-500/70 hover:text-yellow-500 underline transition-colors"
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
                        )}
                    </div>

                    {/* Remote Connection UI */}
                    {!currentRemoteId && (
                        <RemoteConnectionUI
                            peerId={peerId}
                            isConnected={isConnected}
                            onConnectClick={handleConnectClick}
                        />
                    )}

                    {/* Remote Connection Prompt */}
                    {showPrompt && (
                        <RemoteConnectionPrompt
                            onConnect={handleConnect}
                            onCancel={handleCancelPrompt}
                            connectionState={clientConnectionState || RemoteConnectionState.DISCONNECTED}
                        />
                    )}

                    {/* Content Area */}
                    {currentRemoteId ? (
                        // CLIENT MODE: Content is already wrapped by parent provider
                        <>
                            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <div>
                                        <p className="font-bold text-green-400 text-sm">Remote Control Active</p>
                                        <p className="text-xs text-green-400/70">Connected to {currentRemoteId}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDisconnect}
                                    className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 px-3 py-1.5 rounded transition-colors"
                                >
                                    Disconnect
                                </button>
                            </div>
                            <RowsManager />
                            <DisplaySettings />
                        </>
                    ) : (
                        // HOST MODE
                        <>
                            <RowsManager />
                            <DisplaySettings />
                        </>
                    )}

                    <div className="mt-12 pt-6 border-t border-white/10 text-center text-sm text-white/50">
                        <p>💡 <strong>Tip:</strong> Double-click display to toggle settings • Long-press for 800ms to open settings</p>
                    </div>
                </div>
            </div>
        </Portal>
    );
}