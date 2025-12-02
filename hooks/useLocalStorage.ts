import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with automatic serialization
 * 
 * Features:
 * - Automatic JSON serialization/deserialization
 * - SSR-safe (checks for window)
 * - Error handling with fallback to default value
 * - Auto-saves on value changes
 * - Type-safe
 * 
 * @param key - The localStorage key
 * @param defaultValue - The default value if no stored value exists
 * @param validate - Optional validation/migration function for stored data
 * @returns [value, setValue] tuple similar to useState
 * 
 * @example
 * const [config, setConfig] = useLocalStorage<Config>('app-config', defaultConfig);
 */
export function useLocalStorage<T>(
    key: string,
    defaultValue: T,
    validate?: (data: any) => T | null
): [T, (value: T | ((prev: T) => T)) => void] {
    // Initialize state with value from localStorage or default
    const [storedValue, setStoredValue] = useState<T>(() => {
        return loadFromLocalStorage(key, defaultValue, validate);
    });

    // Update localStorage whenever the value changes
    useEffect(() => {
        saveToLocalStorage(key, storedValue);
    }, [key, storedValue]);

    // Wrapped setter that accepts value or updater function
    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        setStoredValue(prevValue => {
            const newValue = value instanceof Function ? value(prevValue) : value;
            return newValue;
        });
    }, []);

    return [storedValue, setValue];
}

/**
 * Load value from localStorage with error handling
 */
function loadFromLocalStorage<T>(
    key: string,
    defaultValue: T,
    validate?: (data: any) => T | null
): T {
    // SSR safety check
    if (typeof window === 'undefined') {
        return defaultValue;
    }

    try {
        const item = localStorage.getItem(key);
        
        if (item === null) {
            return defaultValue;
        }

        const parsed = JSON.parse(item);

        // If validation function provided, use it
        if (validate) {
            const validated = validate(parsed);
            if (validated === null) {
                console.warn(`[useLocalStorage] Validation failed for key "${key}", using default value`);
                // Clear corrupted data
                localStorage.removeItem(key);
                return defaultValue;
            }
            return validated;
        }

        return parsed;
    } catch (error) {
        console.error(`[useLocalStorage] Error loading "${key}":`, error);
        // Clear corrupted data
        try {
            localStorage.removeItem(key);
        } catch (removeError) {
            // Ignore removal errors
        }
        return defaultValue;
    }
}

/**
 * Save value to localStorage with error handling
 */
function saveToLocalStorage<T>(key: string, value: T): void {
    // SSR safety check
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`[useLocalStorage] Error saving "${key}":`, error);
        
        // Check if it's a quota exceeded error
        if (error instanceof DOMException && (
            error.code === 22 || // QuotaExceededError
            error.code === 1014 || // Firefox
            error.name === 'QuotaExceededError' || // Chrome
            error.name === 'NS_ERROR_DOM_QUOTA_REACHED' // Firefox
        )) {
            console.error('[useLocalStorage] localStorage quota exceeded');
        }
    }
}

