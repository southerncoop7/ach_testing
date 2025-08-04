import { useState, useEffect } from 'react';

/**
 * A custom hook that syncs a state value with the browser's `localStorage`.
 * It behaves like `useState`, but automatically persists the value to localStorage
 * whenever it changes.
 *
 * @template T The type of the value to be stored.
 * @param {string} key The key to use for storing the value in localStorage.
 * @param {T} initialValue The initial value to use if no value is found in localStorage.
 * @returns {[T, (value: T | ((val: T) => T)) => void]} A tuple containing the stored value and a function to update it.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  /**
   * The `useState` hook is initialized with a function that runs only on the first render.
   * This function attempts to retrieve and parse the value from localStorage.
   * It handles potential errors and server-side rendering (where `window` is not defined).
   */
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Prevent SSR errors by checking for `window`.
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue.
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If parsing fails, log the error and return the initial value.
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  /**
   * A wrapped version of the `useState` setter function that also persists the new value to localStorage.
   * @param {T | ((val: T) => T)} value The new value or a function that returns the new value.
   */
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow `value` to be a function so we have the same API as `useState`.
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state.
      setStoredValue(valueToStore);
      // Save to localStorage.
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  /**
   * `useEffect` hook to listen for changes to the same localStorage key from other tabs/windows.
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
        } catch (error) {
          console.error(`Error parsing storage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue];
}