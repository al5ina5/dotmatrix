'use client';

import { useState, useEffect, useRef } from 'react';
import CanvasLEDTicker from '@/components/CanvasLEDTicker';
import { Settings } from '@/components/Settings';
import { ConfigProvider, useConfig } from '@/context/ConfigContext';
import { useDataHydration } from '@/hooks/useDataHydration';
import { useRemoteHost } from '@/hooks/useRemoteHost';
import { ConnectionCodeOverlay } from '@/components/ConnectionCodeOverlay';
import { RemoteConnectionState } from '@/lib/remoteControl';

/**
 * Inner component that consumes ConfigContext
 */
function TickerDisplay({
  remoteId,
  setRemoteId,
  clientConnectionState
}: {
  remoteId: string | null,
  setRemoteId: (id: string | null) => void,
  clientConnectionState: RemoteConnectionState
}) {
  const config = useConfig();

  // Initialize Remote Control Host here to persist connection even when settings are closed
  const { peerId, connectionState, isConnected } = useRemoteHost(!remoteId); // Only be a host if NOT a client

  // Hydrate the rows (fetch data for dynamic plugins)
  const hydratedRows = useDataHydration(config.rows);
  const [showSettings, setShowSettings] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-close settings when a phone connects (as host)
  useEffect(() => {
    if (isConnected) {
      setShowSettings(false);
    }
  }, [isConnected]);

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
          onDisconnect={() => setRemoteId(null)}
          currentRemoteId={remoteId}
          clientConnectionState={clientConnectionState}
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
  // Persist remote connection ID across reloads
  const [connectToId, setConnectToId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('remote-connection-id');
    }
    return null;
  });

  const [clientConnectionState, setClientConnectionState] = useState<RemoteConnectionState>(RemoteConnectionState.DISCONNECTED);

  // Update localStorage when connection changes
  const handleSetRemoteId = (id: string | null) => {
    setConnectToId(id);
    if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem('remote-connection-id', id);
      } else {
        localStorage.removeItem('remote-connection-id');
      }
    }
  };

  return (
    <ConfigProvider
      mode={connectToId ? 'remote' : 'local'}
      remotePeerId={connectToId}
      onRemoteConnectionStateChange={setClientConnectionState}
    >
      <TickerDisplay
        remoteId={connectToId}
        setRemoteId={handleSetRemoteId}
        clientConnectionState={clientConnectionState}
      />
    </ConfigProvider>
  );
}

