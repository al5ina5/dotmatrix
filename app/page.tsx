'use client';

import { useState, useEffect, useRef } from 'react';
import CanvasLEDTicker from '@/components/CanvasLEDTicker';
import { Settings } from '@/components/Settings';
import { ConfigProvider, useConfig } from '@/context/ConfigContext';
import { UIProvider, useUI } from '@/context/UIContext';
import { useDataHydration } from '@/hooks/useDataHydration';
import { useRemoteHost } from '@/hooks/useRemoteHost';
import { ConnectionCodeOverlay } from '@/components/ConnectionCodeOverlay';
import { RemoteConnectionState } from '@/lib/remoteControl';
import LandingComponent from '@/components/LandingComponent';

/**
 * Inner component that consumes ConfigContext
 */
function TickerDisplay({
  remoteId,
  setRemoteId,
  onDisconnect,
  clientConnectionState,
  pendingRemoteId
}: {
  remoteId: string | null,
  setRemoteId: (id: string | null) => void,
  onDisconnect: () => void,
  clientConnectionState: RemoteConnectionState,
  pendingRemoteId: string | null
}) {
  const config = useConfig();
  const {
    showSettings,
    setShowSettings,
    setPeerId,
    setIsRemoteConnected,
  } = useUI();

  // Initialize Remote Control Host here to persist connection even when settings are closed
  const { peerId, connectionState, isConnected } = useRemoteHost(!remoteId); // Only be a host if NOT a client

  // Expose host state to UI context for other components (e.g., landing)
  useEffect(() => {
    setPeerId(peerId ?? null);
  }, [peerId, setPeerId]);

  useEffect(() => {
    setIsRemoteConnected(isConnected);
  }, [isConnected, setIsRemoteConnected]);

  // Hydrate the rows (fetch data for dynamic plugins)
  const hydratedRows = useDataHydration(config.rows);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-close settings when a phone connects (as host)
  useEffect(() => {
    if (isConnected) {
      setShowSettings(false);
    }
  }, [isConnected, setShowSettings]);

  // Long-press to open settings
  const handlePointerDown = () => {
    holdTimerRef.current = setTimeout(() => {
      setShowSettings(true);
    }, 800); // Hold for 800ms to open settings
  };

  const handlePointerUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  // Double-click to toggle settings
  const handleDoubleClick = () => {
    setShowSettings(prev => !prev);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <ConnectionCodeOverlay code={peerId} />
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          peerId={peerId}
          connectionState={connectionState}
          isConnected={isConnected}
          onConnect={(id) => setRemoteId(id)}
          onDisconnect={onDisconnect}
          currentRemoteId={remoteId}
          clientConnectionState={clientConnectionState}
          pendingRemoteId={pendingRemoteId}
        />
      )}
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        style={{ width: '100%', height: '100vh' }}
      >
        <CanvasLEDTicker
          rows={hydratedRows}
          dotSize={config.dotSize}
          dotColor={config.dotColor}
          dotGap={config.dotGap}
          rowSpacing={config.rowSpacing}
          pageInterval={config.pageInterval}
          brightness={config.brightness}
          inactiveLEDOpacity={config.inactiveLEDOpacity}
          inactiveLEDColor={config.inactiveLEDColor}
          speedMultiplier={config.speedMultiplier}
        />
      </div>
    </>
  );
}

/**
 * LED Ticker Home Page Wrapper
 * Single ConfigProvider with adaptive mode
 */
export default function Home() {
  // Track connection state first
  const [clientConnectionState, setClientConnectionState] = useState<RemoteConnectionState>(RemoteConnectionState.DISCONNECTED);

  // Persist remote connection ID across reloads - only set when actually connected
  // Start with null, will be restored if connection is successful
  const [connectToId, setConnectToId] = useState<string | null>(null);

  // Track pending connection attempt (code being tried)
  const [pendingRemoteId, setPendingRemoteId] = useState<string | null>(null);

  // On mount, check if we have a saved connection ID - if so, attempt to reconnect
  // But don't set connectToId until connection succeeds
  useEffect(() => {
    if (typeof window !== 'undefined' && !connectToId && !pendingRemoteId) {
      const savedId = localStorage.getItem('remote-connection-id');
      if (savedId) {
        // Attempt to reconnect to saved ID, but don't switch mode until it succeeds
        setPendingRemoteId(savedId);
      }
    }
  }, []);

  // Update localStorage when connection changes
  const handleSetRemoteId = (id: string | null) => {
    // When setting a remote ID, we're attempting to connect
    // Don't switch mode yet - wait for connection to succeed
    setPendingRemoteId(id);
    // Don't set connectToId until connection succeeds
  };

  // Handle disconnection - clear both pending and connected
  const handleDisconnect = () => {
    setPendingRemoteId(null);
    setConnectToId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('remote-connection-id');
    }
  };

  // Switch to remote mode when connection succeeds
  useEffect(() => {
    if (clientConnectionState === RemoteConnectionState.CONNECTED && pendingRemoteId) {
      // Connection successful - switch to remote mode
      setConnectToId(pendingRemoteId);
      setPendingRemoteId(null);
      if (typeof window !== 'undefined') {
        localStorage.setItem('remote-connection-id', pendingRemoteId);
      }
    } else if (clientConnectionState === RemoteConnectionState.ERROR && pendingRemoteId) {
      // Connection failed - clear pending
      setPendingRemoteId(null);
    } else if (clientConnectionState === RemoteConnectionState.DISCONNECTED && connectToId) {
      // Disconnected - clear connected state
      setConnectToId(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('remote-connection-id');
      }
    }
  }, [clientConnectionState, pendingRemoteId, connectToId]);

  // Determine if we should be in remote mode (only when actually connected)
  const isRemoteMode = connectToId !== null && clientConnectionState === RemoteConnectionState.CONNECTED;
  // Pass the peerId for connection attempt (pending or connected)
  const peerIdToConnect = pendingRemoteId || connectToId;

  return (
    <UIProvider>
      <ConfigProvider
        mode={isRemoteMode ? 'remote' : 'local'}
        remotePeerId={peerIdToConnect}
        onRemoteConnectionStateChange={setClientConnectionState}
      >
        <LandingComponent />
        <TickerDisplay
          remoteId={connectToId}
          setRemoteId={handleSetRemoteId}
          onDisconnect={handleDisconnect}
          clientConnectionState={clientConnectionState}
          pendingRemoteId={pendingRemoteId}
        />
      </ConfigProvider>
    </UIProvider>
  );
}

