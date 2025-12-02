'use client';

import { useState, useEffect } from 'react';
import { Modal } from "./Modal";
import { RowsManager } from "./config/RowsManager";
import { DisplaySettings } from "./config/DisplaySettings";
import { SettingsButtons } from "./config/SettingsButtons";
import { ClearSettingsButton } from "./config/ClearSettingsButton";
import { RemoteConnectionUI } from "./RemoteConnectionUI";
import { RemoteConnectionPrompt } from "./RemoteConnectionPrompt";
import { useConfig } from "@/context/ConfigContext";
import { RemoteConnectionState } from "@/lib/remoteControl";
import { X } from 'lucide-react';
import { ModalHeader } from './ui/ModalHeader';
import { JSONSettingsEditorButton } from './config/JSONSettingsEditorButton';

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
    pendingRemoteId?: string | null;
}

export function Settings({
    onClose,
    peerId,
    connectionState,
    isConnected,
    onConnect,
    onDisconnect,
    currentRemoteId,
    clientConnectionState,
    pendingRemoteId
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

        <>
            {/* Remote Connection Prompt */}
            {showPrompt && (
                <RemoteConnectionPrompt
                    onConnect={handleConnect}
                    onCancel={handleCancelPrompt}
                    connectionState={clientConnectionState || RemoteConnectionState.DISCONNECTED}
                    currentRemoteId={currentRemoteId}
                />
            )}
            <Modal
                isOpen={true}
                onClose={onClose}
                className="max-h-dvh lg:max-h-3/4"
            >
                <ModalHeader title="Settings" onClose={onClose} />

                {/* Content */}
                <div className='relative overflow-auto flex-1 min-h-0 *:p-6 *:py-24 *:border-b *:border-white/20 [&>*:last-child]:border-b-0'>
                    <RemoteConnectionUI
                        peerId={peerId}
                        onConnectClick={handleConnectClick}
                        isConnected={clientConnectionState === RemoteConnectionState.CONNECTED}
                        connectedToId={currentRemoteId}
                        connectionState={clientConnectionState || RemoteConnectionState.DISCONNECTED}
                    />
                    <RowsManager />
                    <DisplaySettings />
                    <SettingsButtons />
                    {/* <div className='flex flex-col items-center justify-center gap-4'>
                        <JSONSettingsEditorButton />
                        <ClearSettingsButton />
                    </div> */}
                </div>
            </Modal>
        </>
    );
}