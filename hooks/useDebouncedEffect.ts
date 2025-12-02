'use client';

import { useEffect } from 'react';

/**
 * Run an effect after a delay whenever deps change.
 * The effect is cancelled and rescheduled on each change (classic debounce).
 */
export function useDebouncedEffect(
    effect: () => void | (() => void),
    deps: any[],
    delay: number
) {
    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            effect();
        }, delay);

        return () => {
            window.clearTimeout(timeoutId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, delay]);
}


