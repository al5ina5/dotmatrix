'use client';

import { useState, useEffect } from 'react';
import { Portal } from './Portal';
import { RemoteConnectionState } from '@/lib/remoteControl';

interface RemoteConnectionPromptProps {
    onConnect: (peerId: string) => void;
    onCancel: () => void;
    connectionState?: RemoteConnectionState;
    currentRemoteId?: string | null;
}

/**
 * Simplified remote connection prompt with inline status indicator
 */
export function RemoteConnectionPrompt({
    onConnect,
    onCancel,
    connectionState = RemoteConnectionState.DISCONNECTED,
    currentRemoteId = null
}: RemoteConnectionPromptProps) {
    // Initialize with saved connection ID or empty string
    const [code, setCode] = useState(() => {
        if (currentRemoteId) return currentRemoteId;
        if (typeof window !== 'undefined') {
            return localStorage.getItem('remote-connection-id') || '';
        }
        return '';
    });
    const [lastAttemptedCode, setLastAttemptedCode] = useState<string | null>(currentRemoteId);

    const handleConnect = () => {
        if (code.length === 4 && connectionState !== RemoteConnectionState.CONNECTING) {
            const upperCode = code.toUpperCase();
            setLastAttemptedCode(upperCode);
            onConnect(upperCode);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && code.length === 4 && connectionState !== RemoteConnectionState.CONNECTING) {
            handleConnect();
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    const handleRetry = () => {
        setCode('');
    };

    // Determine status display
    const getStatusDisplay = () => {
        switch (connectionState) {
            case RemoteConnectionState.CONNECTING:
                return (
                    <div className="flex items-center gap-2 text-blue-400 text-sm">
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Connecting to {lastAttemptedCode}...</span>
                    </div>
                );
            case RemoteConnectionState.CONNECTED:
                return (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                        <span className="text-lg">✓</span>
                        <span>Connected to {lastAttemptedCode}</span>
                    </div>
                );
            case RemoteConnectionState.ERROR:
                return (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                        <span className="text-lg">⚠</span>
                        <span>Connection failed. Check code and try again.</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Portal>
            <div className="fixed inset-0 bg-black/98 text-white font-mono z-200 flex items-center justify-center">
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    aria-label="Cancel"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* Content */}
                <div className="flex flex-col items-center gap-8 max-w-md w-full px-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-2">Connect to Remote Display</h2>
                        <p className="text-white/50 text-sm">
                            Enter the 4-character code shown on the display you want to control
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                        {/* Code Input */}
                        <input
                            type="text"
                            placeholder="CODE"
                            maxLength={4}
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            onKeyDown={handleKeyDown}
                            disabled={connectionState === RemoteConnectionState.CONNECTING}
                            className="bg-white/10 border-2 border-white/20 focus:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed outline-none text-white px-6 py-4 rounded-lg text-center text-4xl font-bold tracking-[0.3em] placeholder:font-normal placeholder:tracking-normal placeholder:text-2xl transition-colors"
                            autoFocus
                        />

                        {/* Status Indicator */}
                        <div className="min-h-[24px] flex items-center justify-center">
                            {getStatusDisplay()}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onCancel}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            {connectionState === RemoteConnectionState.ERROR ? (
                                <button
                                    onClick={handleRetry}
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg text-base font-bold transition-colors"
                                >
                                    Try Again
                                </button>
                            ) : (
                                <button
                                    onClick={handleConnect}
                                    disabled={code.length !== 4 || connectionState === RemoteConnectionState.CONNECTING}
                                    className="flex-1 bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-500 disabled:hover:bg-green-600 text-white px-6 py-3 rounded-lg text-base font-bold transition-colors"
                                >
                                    {connectionState === RemoteConnectionState.CONNECTING ? 'Connecting...' : 'Connect'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="text-xs text-white/30 text-center">
                        Press <kbd className="bg-white/10 px-2 py-0.5 rounded">Enter</kbd> to connect • <kbd className="bg-white/10 px-2 py-0.5 rounded">Esc</kbd> to cancel
                    </div>
                </div>
            </div>
        </Portal>
    );
}
