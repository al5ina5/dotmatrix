'use client';

import React, { CSSProperties } from 'react';
import DotMatrix, { AnimationType } from './DotMatrix';
import styles from './DotMatrixTicker.module.css';

export interface DotMatrixTickerProps {
    text: string;
    dotSize?: number;
    dotColor?: string;
    dotGap?: number;
    animation?: AnimationType;
    scrollSpeed?: number; // seconds for full scroll
    glowing?: boolean;
}

export default function DotMatrixTicker({
    text,
    dotSize = 8,
    dotColor = '#00ff00',
    dotGap = 3,
    animation = 'none',
    scrollSpeed = 20,
    glowing = false,
}: DotMatrixTickerProps) {
    const containerStyle: CSSProperties = {
        '--scroll-duration': `${scrollSpeed}s`,
    } as CSSProperties;

    return (
        <div className={`${styles.ticker} ${glowing ? styles.glowing : ''}`}>
            <div className={styles.scrollContainer} style={containerStyle}>
                {/* Render the text twice for seamless loop */}
                <div className={styles.textInstance}>
                    <DotMatrix
                        text={text}
                        dotSize={dotSize}
                        dotColor={dotColor}
                        dotGap={dotGap}
                        animation={animation}
                    />
                </div>
                <div className={styles.textInstance}>
                    <DotMatrix
                        text={text}
                        dotSize={dotSize}
                        dotColor={dotColor}
                        dotGap={dotGap}
                        animation={animation}
                    />
                </div>
            </div>
        </div>
    );
}
