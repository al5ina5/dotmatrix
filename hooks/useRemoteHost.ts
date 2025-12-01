'use client';

import { useState, useEffect, useRef } from 'react';
import { createRemoteHost, RemoteMessage, RemoteConnectionState, RemoteConfig } from '@/lib/remoteControl';
import { useConfig } from '@/context/ConfigContext';
import type { RemoteControlAdapter } from '@/lib/remoteControl/types';

/**
 * Hook for TV (Host) side
 * Manages peer connection and syncs incoming changes to ConfigContext
 */
export function useRemoteHost(enabled: boolean) {
    const [peerId, setPeerId] = useState<string | null>(null);
    const [connectionState, setConnectionState] = useState(RemoteConnectionState.DISCONNECTED);
    const adapterRef = useRef<RemoteControlAdapter | null>(null);

    const config = useConfig();

    // Initialize host when enabled
    useEffect(() => {
        if (!enabled) {
            // Cleanup if disabled
            if (adapterRef.current) {
                adapterRef.current.disconnect();
                adapterRef.current = null;
                setPeerId(null);
            }
            return;
        }

        // Initialize
        createRemoteHost((msg: RemoteMessage) => {
            handleMessage(msg);
        }).then(({ peerId: id, adapter }) => {
            setPeerId(id);
            adapterRef.current = adapter;

            adapter.onConnectionStateChange((state) => {
                setConnectionState(state);
            });
        }).catch((err) => {
            console.error('Failed to initialize remote host:', err);
        });

        return () => {
            if (adapterRef.current) {
                adapterRef.current.disconnect();
                adapterRef.current = null;
            }
        };
    }, [enabled]);

    // Handle incoming messages from phone
    const handleMessage = (msg: RemoteMessage) => {
        switch (msg.type) {
            case 'CONNECTED':
                // Phone connected - send current config
                syncConfigToClient();
                break;

            case 'UPDATE_ROW':
                config.updateRow(msg.index, msg.row);
                break;

            case 'ADD_ROW':
                config.addRow();
                break;

            case 'DELETE_ROW':
                config.deleteRow(msg.index);
                break;

            case 'UPDATE_DISPLAY':
                config.updateDisplaySetting(msg.field, msg.value);
                break;

            case 'PING':
                adapterRef.current?.send({ type: 'PONG' });
                break;
        }
    };

    // Send current config to connected client
    const syncConfigToClient = () => {
        if (!adapterRef.current) return;

        const payload: RemoteConfig = {
            rows: config.rows,
            displaySettings: {
                dotSize: config.dotSize,
                dotGap: config.dotGap,
                dotColor: config.dotColor,
                rowSpacing: config.rowSpacing,
                pageInterval: config.pageInterval,
            }
        };

        adapterRef.current.send({ type: 'SYNC_CONFIG', payload });
    };

    // Sync config changes to client (bidirectional sync with debounce)
    useEffect(() => {
        if (connectionState === RemoteConnectionState.CONNECTED) {
            // Debounce sync to prevent rapid updates during batch operations
            const timeoutId = setTimeout(() => {
                syncConfigToClient();
            }, 100); // 100ms debounce

            return () => clearTimeout(timeoutId);
        }
    }, [
        config.rows,
        config.dotSize,
        config.dotGap,
        config.dotColor,
        config.rowSpacing,
        config.pageInterval,
        connectionState
    ]);

    return {
        peerId,
        connectionState,
        isConnected: connectionState === RemoteConnectionState.CONNECTED,
    };
}
