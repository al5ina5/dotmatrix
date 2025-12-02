'use client';

import { useState, useEffect, useRef } from 'react';
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

    // Initialize client when peerId is provided
    useEffect(() => {
        if (!peerId) return;

        setConnectionState(RemoteConnectionState.CONNECTING);

        createRemoteClient(peerId, (msg: RemoteMessage) => {
            handleMessage(msg);
        }).then((adapter) => {
            adapterRef.current = adapter;

            adapter.onConnectionStateChange((state) => {
                setConnectionState(state);
            });
        }).catch((err) => {
            console.error('Failed to connect to remote host:', err);
            setConnectionState(RemoteConnectionState.ERROR);
        });

        return () => {
            if (adapterRef.current) {
                adapterRef.current.disconnect();
                adapterRef.current = null;
            }
        };
    }, [peerId]);

    // Handle incoming messages from TV
    const handleMessage = (msg: RemoteMessage) => {
        switch (msg.type) {
            case 'SYNC_CONFIG':
                // Receive config update from TV
                setRemoteConfig(msg.payload);
                break;

            case 'PONG':
                // Keep-alive response
                break;
        }
    };

    // Send methods
    const sendUpdateRow = (index: number, row: LEDRowConfig) => {
        adapterRef.current?.send({ type: 'UPDATE_ROW', index, row });
    };

    const sendAddRow = () => {
        adapterRef.current?.send({ type: 'ADD_ROW' });
    };

    const sendDeleteRow = (index: number) => {
        adapterRef.current?.send({ type: 'DELETE_ROW', index });
    };

    const sendMoveRow = (fromIndex: number, toIndex: number) => {
        adapterRef.current?.send({ type: 'MOVE_ROW', fromIndex, toIndex });
    };

    const sendUpdateDisplay = (field: string, value: number | string) => {
        adapterRef.current?.send({ type: 'UPDATE_DISPLAY', field, value });
    };

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
