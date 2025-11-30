'use client';

import { useState, useEffect, useRef } from 'react';
import CanvasLEDTicker from '@/components/CanvasLEDTicker';
import { Settings } from '@/components/Settings';
import { useConfig } from '@/context/ConfigContext';
import { useDataHydration } from '@/hooks/useDataHydration';

/**
 * LED Ticker Home Page
 */
export default function Home() {
  const config = useConfig();
  
  // Hydrate the rows (fetch data for dynamic plugins)
  const hydratedRows = useDataHydration(config.rows);
  const [showSettings, setShowSettings] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ width: '100%', height: '100vh' }}
      >
        <CanvasLEDTicker
          rows={hydratedRows}
          dotSize={config.dotSize}
          dotColor={config.dotColor}
          dotGap={config.dotGap}
          rowSpacing={config.rowSpacing}
          pageInterval={config.pageInterval}
        />
      </div>
    </>
  );
}
