import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const parse = (v: string) => {
  return JSON.parse(v, (_, val) => {
      // revive ISO date strings
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(val)) {
        return new Date(val);
      }
      return val;
    });
  };

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Use functional setState to ensure we operate on the latest value
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? (value as (val: T) => T)(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error);
        }
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const clear = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (e) {
      console.error(`Error clearing localStorage key "${key}":`, e);
    }
  };

  return [storedValue, setValue, clear] as const;
}