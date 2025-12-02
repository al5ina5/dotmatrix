'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
    showSettings: boolean;
    setShowSettings: (value: boolean | ((prev: boolean) => boolean)) => void;
    /** Host peer ID for remote control */
    peerId: string | null;
    setPeerId: (id: string | null) => void;
    /** Whether a remote client is currently connected */
    isRemoteConnected: boolean;
    setIsRemoteConnected: (value: boolean) => void;
}

export const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIProviderProps {
    children: ReactNode;
}

export function UIProvider({ children }: UIProviderProps) {
    const [showSettings, setShowSettings] = useState(false);
    const [peerId, setPeerId] = useState<string | null>(null);
    const [isRemoteConnected, setIsRemoteConnected] = useState(false);

    return (
        <UIContext.Provider
            value={{
                showSettings,
                setShowSettings,
                peerId,
                setPeerId,
                isRemoteConnected,
                setIsRemoteConnected,
            }}
        >
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
}

