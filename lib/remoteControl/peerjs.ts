import Peer, { DataConnection } from 'peerjs';
import { RemoteMessage, ConnectionState, RemoteControlAdapter } from './types';

/**
 * PeerJS-based implementation of RemoteControlAdapter
 */
class PeerJSAdapter implements RemoteControlAdapter {
    private peer: Peer | null = null;
    private connection: DataConnection | null = null;
    private connectionStateCallback: ((state: ConnectionState) => void) | null = null;
    private messageCallback: ((msg: RemoteMessage) => void) | null = null;

    /**
     * Initialize as Host (TV)
     */
    async initHost(onMessage: (msg: RemoteMessage) => void): Promise<string> {
        this.messageCallback = onMessage;

        return new Promise((resolve, reject) => {
            // Generate a short, readable peer ID (4 chars)
            const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();

            this.peer = new Peer(shortId, {
                debug: 2, // Enable debug logs in dev mode
            });

            this.peer.on('open', (id) => {
                console.log('[RemoteControl] Host initialized with ID:', id);
                this.updateConnectionState(ConnectionState.DISCONNECTED);
                resolve(id);
            });

            this.peer.on('error', (err) => {
                console.error('[RemoteControl] Peer error:', err);
                this.updateConnectionState(ConnectionState.ERROR);
                reject(err);
            });

            // Listen for incoming connections
            this.peer.on('connection', (conn) => {
                console.log('[RemoteControl] Client connecting...');
                this.setupConnection(conn);
            });
        });
    }

    /**
     * Initialize as Client (Phone)
     */
    async initClient(peerId: string, onMessage: (msg: RemoteMessage) => void): Promise<void> {
        this.messageCallback = onMessage;

        return new Promise((resolve, reject) => {
            this.peer = new Peer({
                debug: 2,
            });

            this.peer.on('open', () => {
                console.log('[RemoteControl] Client peer opened, connecting to:', peerId);
                this.updateConnectionState(ConnectionState.CONNECTING);

                const conn = this.peer!.connect(peerId, { reliable: true });
                this.setupConnection(conn);
                resolve();
            });

            this.peer.on('error', (err) => {
                console.error('[RemoteControl] Client error:', err);
                this.updateConnectionState(ConnectionState.ERROR);
                reject(err);
            });
        });
    }

    /**
     * Setup connection event handlers
     */
    private setupConnection(conn: DataConnection) {
        this.connection = conn;

        conn.on('open', () => {
            console.log('[RemoteControl] Connection established');
            this.updateConnectionState(ConnectionState.CONNECTED);

            // Send connected notification
            this.send({ type: 'CONNECTED' });
        });

        conn.on('data', (data) => {
            console.log('[RemoteControl] Received:', data);
            if (this.messageCallback) {
                this.messageCallback(data as RemoteMessage);
            }
        });

        conn.on('close', () => {
            console.log('[RemoteControl] Connection closed');
            this.updateConnectionState(ConnectionState.DISCONNECTED);
            this.connection = null;
        });

        conn.on('error', (err) => {
            console.error('[RemoteControl] Connection error:', err);
            this.updateConnectionState(ConnectionState.ERROR);
        });
    }

    /**
     * Send message to connected peer
     */
    send(msg: RemoteMessage): void {
        if (!this.connection || !this.connection.open) {
            console.warn('[RemoteControl] Cannot send - not connected');
            return;
        }

        console.log('[RemoteControl] Sending:', msg);
        this.connection.send(msg);
    }

    /**
     * Disconnect from peer
     */
    disconnect(): void {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
        this.updateConnectionState(ConnectionState.DISCONNECTED);
    }

    /**
     * Register connection state change callback
     */
    onConnectionStateChange(callback: (state: ConnectionState) => void): void {
        this.connectionStateCallback = callback;
    }

    /**
     * Update connection state and notify callback
     */
    private updateConnectionState(state: ConnectionState): void {
        if (this.connectionStateCallback) {
            this.connectionStateCallback(state);
        }
    }
}

// Singleton instance
let adapter: PeerJSAdapter | null = null;

export function getPeerJSAdapter(): RemoteControlAdapter {
    if (!adapter) {
        adapter = new PeerJSAdapter();
    }
    return adapter;
}
