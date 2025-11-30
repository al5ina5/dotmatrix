'use client';

import DotMatrixTicker from '@/components/DotMatrixTicker';
import { useState } from 'react';

export default function Home() {
  const [tickerText, setTickerText] = useState('This is a TEST.');

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      {/* Full Width Ticker */}
      <DotMatrixTicker
        text={tickerText}
        dotSize={10}
        dotColor="#00ff00"
        dotGap={3}
        scrollSpeed={10}
        glowing={false}
      />
    </div>
  );
}
