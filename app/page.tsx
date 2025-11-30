'use client';

import StaticLEDTicker from '@/components/StaticLEDTicker';
import { LED_CONFIG } from '@/config/led.config';

/**
 * LED Ticker Home Page
 * 
 * All configuration is managed in /config/led.config.ts
 * Edit that file to change:
 * - Text content
 * - LED color and size
 * - Animation speed
 * - Spacing between letters/words
 */
export default function Home() {
  return (
    <>
      <StaticLEDTicker
        text={'@@@@@'}
        dotSize={LED_CONFIG.dotSize}
        dotColor={LED_CONFIG.dotColor}
        dotGap={LED_CONFIG.dotGap}
        stepInterval={LED_CONFIG.stepInterval}
        spacing={LED_CONFIG.spacing}
      />
    </>
  );
}
