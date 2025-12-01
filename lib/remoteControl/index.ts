/**
 * Public API for Remote Control
 * 
 * This abstracts the underlying transport (PeerJS) so it can be swapped
 * for other solutions (Ably, Pusher, WebRTC, etc.) in the future.
 */

import { getPeerJSAdapter } from './peerjs';
import type { RemoteControlAdapter, RemoteMessage, ConnectionState, RemoteConfig } from './types';

export type { RemoteMessage, ConnectionState, RemoteConfig };
export { ConnectionState as RemoteConnectionState } from './types';

/**
 * Create a remote control host (TV side)
 */
export function createRemoteHost(
    onMessage: (msg: RemoteMessage) => void
): Promise<{ peerId: string; adapter: RemoteControlAdapter }> {
    const adapter = getPeerJSAdapter();

    return adapter.initHost(onMessage).then(peerId => ({
        peerId,
        adapter
    }));
}

/**
 * Create a remote control client (Phone side)
 */
export function createRemoteClient(
    peerId: string,
    onMessage: (msg: RemoteMessage) => void
): Promise<RemoteControlAdapter> {
    const adapter = getPeerJSAdapter();

    return adapter.initClient(peerId, onMessage).then(() => adapter);
}
