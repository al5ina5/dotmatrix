import { LEDRowConfig } from '@/config/led.config';

/**
 * Message types sent between TV (host) and Phone (client)
 */
export type RemoteMessage =
    | { type: 'PING' }
    | { type: 'PONG' }
    | { type: 'CONNECTED' }
    | { type: 'SYNC_CONFIG'; payload: RemoteConfig }
    | { type: 'UPDATE_ROW'; index: number; row: LEDRowConfig }
    | { type: 'ADD_ROW' }
    | { type: 'DELETE_ROW'; index: number }
    | { type: 'UPDATE_DISPLAY'; field: string; value: number | string };

/**
 * Full config snapshot for initial sync
 */
export interface RemoteConfig {
    rows: LEDRowConfig[];
    displaySettings: {
        dotSize: number;
        dotGap: number;
        dotColor: string;
        rowSpacing: number;
        pageInterval: number;
    };
}

/**
 * Connection states
 */
export enum ConnectionState {
    DISCONNECTED = 'disconnected',
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
    ERROR = 'error'
}

/**
 * Adapter interface for remote control transport
 * (allows swapping PeerJS for other solutions like Ably/Pusher)
 */
export interface RemoteControlAdapter {
    // Host (TV) methods
    initHost: (onMessage: (msg: RemoteMessage) => void) => Promise<string>; // Returns peer ID

    // Client (Phone) methods
    initClient: (peerId: string, onMessage: (msg: RemoteMessage) => void) => Promise<void>;

    // Shared methods
    send: (msg: RemoteMessage) => void;
    disconnect: () => void;
    onConnectionStateChange: (callback: (state: ConnectionState) => void) => void;
}
