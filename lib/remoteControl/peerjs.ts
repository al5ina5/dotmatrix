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
    // Track the latest known state so late subscribers get an immediate, correct value
    private currentState: ConnectionState = ConnectionState.DISCONNECTED;

    /**
     * Initialize as Host (TV)
     */
    async initHost(onMessage: (msg: RemoteMessage) => void): Promise<string> {
        this.messageCallback = onMessage;

        return new Promise((resolve, reject) => {
            // Try to load existing peerId from localStorage
            const STORAGE_KEY = 'remote-host-peer-id';
            let shortId: string;
            
            if (typeof window !== 'undefined') {
                const savedId = localStorage.getItem(STORAGE_KEY);
                if (savedId && savedId.length === 4) {
                    // Use saved peerId
                    shortId = savedId.toUpperCase();
                    console.log('[RemoteControl] Using saved peerId:', shortId);
                } else {
                    // Generate a new short, readable peer ID (4 chars)
                    shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
                    console.log('[RemoteControl] Generated new peerId:', shortId);
                }
            } else {
                // Server-side: always generate new
                shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
            }

            this.peer = new Peer(shortId, {
                debug: 2, // Enable debug logs in dev mode
            });

            this.peer.on('open', (id) => {
                console.log('[RemoteControl] Host initialized with ID:', id);
                // Save peerId to localStorage for persistence
                if (typeof window !== 'undefined') {
                    localStorage.setItem(STORAGE_KEY, id);
                }
                this.updateConnectionState(ConnectionState.DISCONNECTED);
                resolve(id);
            });

            this.peer.on('error', (err) => {
                console.error('[RemoteControl] Peer error:', err);
                // If error is due to ID being taken, try generating a new one
                if (err.type === 'unavailable-id' || err.type === 'network') {
                    console.log('[RemoteControl] PeerId unavailable, generating new one...');
                    // Clear the saved ID and try again with a new one
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem(STORAGE_KEY);
                    }
                    // Generate new ID and retry
                    const newId = Math.random().toString(36).substring(2, 6).toUpperCase();
                    this.peer?.destroy();
                    this.peer = new Peer(newId, { debug: 2 });
                    
                    this.peer.on('open', (id) => {
                        console.log('[RemoteControl] Host initialized with new ID:', id);
                        if (typeof window !== 'undefined') {
                            localStorage.setItem(STORAGE_KEY, id);
                        }
                        this.updateConnectionState(ConnectionState.DISCONNECTED);
                        resolve(id);
                    });

                    this.peer.on('error', (retryErr) => {
                        console.error('[RemoteControl] Retry failed:', retryErr);
                        this.updateConnectionState(ConnectionState.ERROR);
                        reject(retryErr);
                    });

                    this.peer.on('connection', (conn) => {
                        console.log('[RemoteControl] Client connecting...');
                        this.setupConnection(conn);
                    });
                } else {
                    this.updateConnectionState(ConnectionState.ERROR);
                    reject(err);
                }
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
        // Check if connection is already open (race condition protection)
        if (conn.open) {
            console.log('[RemoteControl] Connection already open');
            this.connection = conn;
            this.updateConnectionState(ConnectionState.CONNECTED);
            // Send connected notification
            this.send({ type: 'CONNECTED' });
        } else {
            this.connection = conn;
        }

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
        // Immediately emit the current state so consumers don't miss prior transitions
        callback(this.currentState);
    }

    /**
     * Update connection state and notify callback
     */
    private updateConnectionState(state: ConnectionState): void {
        this.currentState = state;
        if (this.connectionStateCallback) {
            this.connectionStateCallback(state);
        }
    }
}

// Create a new adapter instance each time (not singleton)
// This allows separate client/host instances to coexist
export function getPeerJSAdapter(): RemoteControlAdapter {
    return new PeerJSAdapter();
}
