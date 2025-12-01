'use client';

import { useState, useEffect, useRef } from 'react';
import CanvasLEDTicker from '@/components/CanvasLEDTicker';
import { Settings } from '@/components/Settings';
import { useConfig } from '@/context/ConfigContext';
import { useDataHydration } from '@/hooks/useDataHydration';

/**
 * LED Ticker Home Page
 * 
 * Interaction:
 * - Double-click anywhere: Toggle settings
 * - Long-press (800ms): Open settings
 */
export default function Home() {
  const config = useConfig();

  // Hydrate the rows (fetch data for dynamic plugins)
  const hydratedRows = useDataHydration(config.rows);
  const [showSettings, setShowSettings] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
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
        />
      </div>
    </>
  );
}
