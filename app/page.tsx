'use client';

import MultiLineLEDTicker from '@/components/MultiLineLEDTicker';
import { LED_CONFIG } from '@/config/led.config';
import { useDataHydration } from '@/hooks/useDataHydration';

/**
 * LED Ticker Home Page
 */
export default function Home() {
  // Hydrate the rows (fetch data for dynamic plugins)
  const hydratedRows = useDataHydration(LED_CONFIG.rows);

  return (
    <MultiLineLEDTicker
      rows={hydratedRows}
      dotSize={LED_CONFIG.display.dotSize}
      dotColor={LED_CONFIG.display.dotColor}
      dotGap={LED_CONFIG.display.dotGap}
      rowSpacing={LED_CONFIG.layout.rowSpacing}
    />
  );
}
