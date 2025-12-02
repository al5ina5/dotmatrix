'use client';

import { useEffect, useState } from 'react';
import { Portal } from './Portal';

interface ConnectionCodeOverlayProps {
    code: string | null;
}

export function ConnectionCodeOverlay({ code }: ConnectionCodeOverlayProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (code) {
            // Reset visibility when code changes
            setIsVisible(true);

            // Hide after 2 minutes (120,000 ms)
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 60000 * 5);

            return () => clearTimeout(timer);
        }
    }, [code]);

    if (!code || !isVisible) return null;

    return (
        <Portal>
            <div className='fixed top-6 w-full flex justify-center text-white z-90'>
                <p className='text-3xl'>Remote Code: {code}</p>
            </div>
        </Portal>
    );
}
