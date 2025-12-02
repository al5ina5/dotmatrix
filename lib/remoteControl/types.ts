import { LEDRowConfig } from '@/config/led.config';
import { ScreenConfig } from '@/types/screen';

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
    | { type: 'MOVE_ROW'; fromIndex: number; toIndex: number }
    | { type: 'UPDATE_DISPLAY'; field: string; value: number | string };

/**
 * Full config snapshot for initial sync
 * Supports both legacy (rows) and new (screens) formats for backward compatibility
 */
export interface RemoteConfig {
    /** Legacy format: rows array (for backward compatibility) */
    rows?: LEDRowConfig[];
    /** New format: screens array */
    screens?: ScreenConfig[];
    displaySettings: {
        dotSize: number;
        dotGap: number;
        dotColor: string;
        rowSpacing: number;
        pageInterval: number;
        brightness: number;
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
