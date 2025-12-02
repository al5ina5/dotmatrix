'use client';

import { Copy, Smartphone, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';
import { SettingsHeader } from './config/SettingsHeader';
import { RemoteConnectionState } from '@/lib/remoteControl';

interface RemoteConnectionUIProps {
    peerId?: string | null;
    onConnectClick: () => void;
    isConnected?: boolean;
    connectedToId?: string | null;
    connectionState?: RemoteConnectionState;
}

export function RemoteConnectionUI({
    peerId,
    onConnectClick,
    isConnected = false,
    connectedToId = null,
    connectionState = RemoteConnectionState.DISCONNECTED
}: RemoteConnectionUIProps) {
    const handleCopyCode = async () => {
        if (!peerId) return;

        try {
            await navigator.clipboard.writeText(peerId);
            alert(`Code ${peerId} copied to clipboard.`);
        } catch (error) {
            console.error('Failed to copy code:', error);
            alert('Could not copy code to clipboard.');
        }
    };

    // Split peerId into 4 characters for display boxes
    const codeArray = peerId ? peerId.toUpperCase().split('').slice(0, 4) : ['', '', '', ''];
    // Pad to 4 characters if needed
    while (codeArray.length < 4) {
        codeArray.push('');
    }

    // Show connection status if connected as client
    const showClientConnection = isConnected && connectedToId;

    return (
        <div className="space-y-6">
            <SettingsHeader title="Remote Control" />
            <div className="space-y-4">
                <div className="flex gap-3 font-mono">
                    {codeArray.map((char, index) => (
                        <div
                            key={index}
                            className="w-16 h-16 bg-white/10 border-2 border-white/20 rounded-lg text-white text-center text-4xl font-bold flex items-center justify-center"
                        >
                            {char || '-'}
                        </div>
                    ))}
                </div>
                {showClientConnection ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Connected to {connectedToId.toUpperCase()}</span>
                    </div>
                ) : (
                    <p className='text-sm opacity-80'>
                        Use your code to configure this device remotely, or click the button below to connect to a remote device.
                    </p>
                )}
            </div>
            <div className="flex flex-wrap gap-4">
                <Button
                    onClick={handleCopyCode}
                    disabled={!peerId}
                    icon={Copy}
                    variant="default"
                >
                    Copy Code
                </Button>

                {!showClientConnection && (
                    <Button
                        onClick={onConnectClick}
                        icon={Smartphone}
                        variant="primary"
                    >
                        Connect to Remote
                    </Button>
                )}
            </div>
        </div>
    );
}
