'use client';

import { useState, useRef, useEffect } from 'react';
import { RemoteConnectionState } from '@/lib/remoteControl';
import { Modal } from './Modal';
import { ModalHeader } from './ui/ModalHeader';

interface RemoteConnectionPromptProps {
    onConnect: (peerId: string) => void;
    onCancel: () => void;
    connectionState?: RemoteConnectionState;
    currentRemoteId?: string | null;
}

/**
 * Simplified remote connection prompt with inline status indicator
 */
export function RemoteConnectionPrompt({
    onConnect,
    onCancel,
    connectionState = RemoteConnectionState.DISCONNECTED,
    currentRemoteId = null
}: RemoteConnectionPromptProps) {
    // Initialize with empty boxes - don't pre-fill with existing connection ID
    const [codeValues, setCodeValues] = useState<string[]>(['', '', '', '']);

    const [lastAttemptedCode, setLastAttemptedCode] = useState<string | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Auto-focus first input when modal opens
    useEffect(() => {
        // Small delay to ensure modal is fully rendered
        const timer = setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const code = codeValues.join('').toUpperCase();

    const handleConnect = () => {
        // Only connect if:
        // 1. Code is 4 characters
        // 2. Not already connecting
        if (
            code.length === 4 &&
            connectionState !== RemoteConnectionState.CONNECTING
        ) {
            setLastAttemptedCode(code);
            onConnect(code);
        }
    };


    const handleInputChange = (index: number, value: string) => {
        // Only allow alphanumeric characters
        const char = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(-1);

        const newValues = [...codeValues];
        newValues[index] = char;
        const newCodeString = newValues.join('').toUpperCase();

        setCodeValues(newValues);

        // Clear last attempted code if user is changing the code to something different
        if (lastAttemptedCode && newCodeString !== lastAttemptedCode && newCodeString.length <= 4) {
            setLastAttemptedCode(null);
        }

        // Auto-advance to next input if character entered
        if (char && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-connect when all 4 boxes are filled
        if (newCodeString.length === 4 && connectionState !== RemoteConnectionState.CONNECTING) {
            // Small delay to allow user to see the full code
            setTimeout(() => {
                setLastAttemptedCode(newCodeString);
                onConnect(newCodeString);
            }, 300);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (!codeValues[index] && index > 0) {
                // If current box is empty, go back and clear previous
                const newValues = [...codeValues];
                newValues[index - 1] = '';
                setCodeValues(newValues);
                inputRefs.current[index - 1]?.focus();
            } else {
                // Clear current box
                const newValues = [...codeValues];
                newValues[index] = '';
                setCodeValues(newValues);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 3) {
            inputRefs.current[index + 1]?.focus();
        } else if (e.key === 'Enter' && code.length === 4 && connectionState !== RemoteConnectionState.CONNECTING) {
            handleConnect();
        } else if (e.key === 'Escape') {
            onCancel();
        } else if (e.key === 'Delete') {
            const newValues = [...codeValues];
            newValues[index] = '';
            setCodeValues(newValues);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 4);

        const newValues = ['', '', '', ''];
        for (let i = 0; i < 4; i++) {
            newValues[i] = pastedText[i] || '';
        }
        setCodeValues(newValues);

        const pastedCode = pastedText.toUpperCase();

        // Clear last attempted code if pasting a different code
        if (lastAttemptedCode && pastedCode !== lastAttemptedCode) {
            setLastAttemptedCode(null);
        }

        // Auto-connect when 4 characters are pasted
        if (pastedCode.length === 4 && connectionState !== RemoteConnectionState.CONNECTING) {
            setTimeout(() => {
                setLastAttemptedCode(pastedCode);
                onConnect(pastedCode);
            }, 300);
        }

        // Focus the last filled box or first empty box
        const focusIndex = Math.min(pastedText.length, 3);
        setTimeout(() => inputRefs.current[focusIndex]?.focus(), 0);
    };

    const handleRetry = () => {
        setCodeValues(['', '', '', '']);
        inputRefs.current[0]?.focus();
    };

    // Determine status display - only show if it's relevant to the current code
    const getStatusDisplay = () => {
        // Don't show status if code doesn't match the attempted code (user changed it)
        if (lastAttemptedCode && code !== lastAttemptedCode && code.length === 4) {
            return null;
        }

        switch (connectionState) {
            case RemoteConnectionState.CONNECTING:
                // Only show if we have a code and it matches what we're connecting to
                if (lastAttemptedCode && code === lastAttemptedCode) {
                    return (
                        <div className="flex items-center gap-2 text-blue-400 text-sm">
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Connecting to {lastAttemptedCode}...</span>
                        </div>
                    );
                }
                return null;
            case RemoteConnectionState.CONNECTED:
                // Only show if code matches the connected code
                if (lastAttemptedCode && code === lastAttemptedCode) {
                    return (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                            <span className="text-lg">✓</span>
                            <span>Connected to {lastAttemptedCode}</span>
                        </div>
                    );
                }
                return null;
            case RemoteConnectionState.ERROR:
                // Show error if we attempted this code
                if (lastAttemptedCode && code === lastAttemptedCode) {
                    return (
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                            <span className="text-lg">⚠</span>
                            <span>Connection failed. Check code and try again.</span>
                        </div>
                    );
                }
                return null;
            default:
                return null;
        }
    };

    return (
        <Modal isOpen={true} onClose={onCancel} maxWidth="max-w-md">
            <ModalHeader title="Remote Control" onClose={onCancel} />

            <div className="p-6 pt-8 flex flex-col items-center gap-6 font-mono">
                <div className="">
                    <p className="text-white/60">
                        Enter the 4-character code shown on the display you want to control.
                    </p>
                </div>

                <div className="flex flex-col gap-4 w-full">
                    {/* Code Input - 4 separate boxes */}
                    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                        {codeValues.map((value, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                type="text"
                                inputMode="text"
                                maxLength={1}
                                value={value}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                disabled={connectionState === RemoteConnectionState.CONNECTING}
                                className="w-16 h-16 bg-white/10 border-2 border-white/20 focus:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed outline-none text-white rounded-lg text-center text-4xl font-bold transition-colors"
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    {/* Status Indicator */}
                    <div className="min-h-[24px] flex items-center justify-center">
                        {getStatusDisplay()}
                    </div>

                    {/* Buttons */}
                    {/* <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        {connectionState === RemoteConnectionState.ERROR ? (
                            <button
                                onClick={handleRetry}
                                className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg text-base font-bold transition-colors"
                            >
                                Try Again
                            </button>
                        ) : (
                            <button
                                onClick={handleConnect}
                                disabled={code.length !== 4 || connectionState === RemoteConnectionState.CONNECTING}
                                className="flex-1 bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-500 disabled:hover:bg-green-600 text-white px-6 py-3 rounded-lg text-base font-bold transition-colors"
                            >
                                {connectionState === RemoteConnectionState.CONNECTING ? 'Connecting...' : 'Connect'}
                            </button>
                        )}
                    </div> */}
                </div>

                <div className="text-xs text-white/30 text-center">
                    Press <kbd className="bg-white/10 px-2 py-0.5 rounded">Enter</kbd> to connect •{' '}
                    <kbd className="bg-white/10 px-2 py-0.5 rounded">Esc</kbd> to cancel
                </div>
            </div>
        </Modal>
    );
}
