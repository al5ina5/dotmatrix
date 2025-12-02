'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createRemoteClient, RemoteMessage, RemoteConnectionState, RemoteConfig } from '@/lib/remoteControl';
import { LEDRowConfig } from '@/config/led.config';
import type { RemoteControlAdapter } from '@/lib/remoteControl/types';

interface RemoteClientHook {
    connectionState: RemoteConnectionState;
    isConnected: boolean;
    remoteConfig: RemoteConfig | null;
    sendUpdateRow: (index: number, row: LEDRowConfig) => void;
    sendAddRow: () => void;
    sendDeleteRow: (index: number) => void;
    sendMoveRow: (fromIndex: number, toIndex: number) => void;
    sendUpdateDisplay: (field: string, value: number | string) => void;
}

/**
 * Hook for Phone (Client) side
 * Connects to TV and sends config changes
 */
export function useRemoteClient(peerId: string | null): RemoteClientHook {
    const [connectionState, setConnectionState] = useState(RemoteConnectionState.DISCONNECTED);
    const [remoteConfig, setRemoteConfig] = useState<RemoteConfig | null>(null);
    const adapterRef = useRef<RemoteControlAdapter | null>(null);

    // Handle incoming messages from TV
    const handleMessage = useCallback((msg: RemoteMessage) => {
        switch (msg.type) {
            case 'SYNC_CONFIG':
                // Receive config update from TV
                console.log('[useRemoteClient] Received SYNC_CONFIG:', msg.payload);
                setRemoteConfig(msg.payload);
                break;

            case 'PONG':
                // Keep-alive response
                break;
        }
    }, []);

    // Initialize client when peerId is provided
    useEffect(() => {
        if (!peerId) {
            // Reset state when peerId is cleared
            setConnectionState(RemoteConnectionState.DISCONNECTED);
            setRemoteConfig(null);
            adapterRef.current = null;
            return;
        }

        setConnectionState(RemoteConnectionState.CONNECTING);
        console.log('[useRemoteClient] Connecting to:', peerId);

        createRemoteClient(peerId, (msg: RemoteMessage) => {
            handleMessage(msg);
        }).then((adapter) => {
            console.log('[useRemoteClient] Adapter created, setting up state listener');
            adapterRef.current = adapter;

            adapter.onConnectionStateChange((state) => {
                console.log('[useRemoteClient] Connection state changed:', state);
                setConnectionState(state);
            });
        }).catch((err) => {
            console.error('[useRemoteClient] Failed to connect to remote host:', err);
            setConnectionState(RemoteConnectionState.ERROR);
        });

        return () => {
            console.log('[useRemoteClient] Cleaning up connection');
            if (adapterRef.current) {
                adapterRef.current.disconnect();
                adapterRef.current = null;
            }
            setConnectionState(RemoteConnectionState.DISCONNECTED);
            setRemoteConfig(null);
        };
    }, [peerId, handleMessage]);

    // Send methods - log to help debug
    const sendUpdateRow = useCallback((index: number, row: LEDRowConfig) => {
        console.log('[useRemoteClient] sendUpdateRow:', index, row);
        if (!adapterRef.current) {
            console.warn('[useRemoteClient] Cannot send - adapter not ready');
            return;
        }
        adapterRef.current.send({ type: 'UPDATE_ROW', index, row });
    }, []);

    const sendAddRow = useCallback(() => {
        console.log('[useRemoteClient] sendAddRow');
        if (!adapterRef.current) {
            console.warn('[useRemoteClient] Cannot send - adapter not ready');
            return;
        }
        adapterRef.current.send({ type: 'ADD_ROW' });
    }, []);

    const sendDeleteRow = useCallback((index: number) => {
        console.log('[useRemoteClient] sendDeleteRow:', index);
        if (!adapterRef.current) {
            console.warn('[useRemoteClient] Cannot send - adapter not ready');
            return;
        }
        adapterRef.current.send({ type: 'DELETE_ROW', index });
    }, []);

    const sendMoveRow = useCallback((fromIndex: number, toIndex: number) => {
        console.log('[useRemoteClient] sendMoveRow:', fromIndex, toIndex);
        if (!adapterRef.current) {
            console.warn('[useRemoteClient] Cannot send - adapter not ready');
            return;
        }
        adapterRef.current.send({ type: 'MOVE_ROW', fromIndex, toIndex });
    }, []);

    const sendUpdateDisplay = useCallback((field: string, value: number | string) => {
        console.log('[useRemoteClient] sendUpdateDisplay:', field, value);
        if (!adapterRef.current) {
            console.warn('[useRemoteClient] Cannot send - adapter not ready');
            return;
        }
        adapterRef.current.send({ type: 'UPDATE_DISPLAY', field, value });
    }, []);

    return {
        connectionState,
        isConnected: connectionState === RemoteConnectionState.CONNECTED,
        remoteConfig,
        sendUpdateRow,
        sendAddRow,
        sendDeleteRow,
        sendMoveRow,
        sendUpdateDisplay,
    };
}
