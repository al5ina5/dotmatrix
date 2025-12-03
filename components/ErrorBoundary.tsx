'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

/**
 * Silent Error Boundary
 * Catches errors and automatically reloads the app
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): Partial<State> {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught:', error, errorInfo);
        }

        // Auto-reload after a brief delay
        setTimeout(() => {
            window.location.reload();
        }, 100);
    }

    render() {
        if (this.state.hasError) {
            // Return nothing while reloading
            return null;
        }

        return this.props.children;
    }
}
