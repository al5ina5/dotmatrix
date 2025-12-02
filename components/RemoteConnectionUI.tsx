'use client';

interface RemoteConnectionUIProps {
    // Host mode props
    peerId?: string | null;
    isConnected?: boolean;
    // Actions
    onConnectClick: () => void;
}

/**
 * Simplified Remote Connection UI
 * Shows host code and button to connect to another device
 */
export function RemoteConnectionUI({
    peerId,
    isConnected,
    onConnectClick
}: RemoteConnectionUIProps) {
    return (
        <div className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
            {/* Left: Host Code Display */}
            <div className="flex items-center gap-4">
                {peerId ? (
                    <>
                        <div>
                            <p className="text-xs text-white/50 mb-0.5">Your Remote Code</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold font-mono tracking-wider text-green-400">
                                    {peerId}
                                </span>
                                {isConnected && (
                                    <span className="text-xs text-green-400 font-medium">
                                        ● Connected
                                    </span>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-sm text-white/50">
                        Initializing...
                    </div>
                )}
            </div>

            {/* Right: Connect Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onConnectClick();
                }}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
                <span>📱</span> Connect to Remote
            </button>
        </div>
    );
}
