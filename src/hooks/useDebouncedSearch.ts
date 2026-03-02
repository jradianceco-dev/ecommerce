/**
 * Debounced Search Hook
 * 
 * Delays search execution to improve performance
 * Prevents excessive API calls while typing
 */

import { useState, useEffect, useCallback } from 'react';

interface UseDebounceOptions {
  delay?: number;
  leading?: boolean;
}

/**
 * Debounce hook for any value
 */
export function useDebounce<T>(
  value: T,
  options: UseDebounceOptions = {}
): T {
  const { delay = 300, leading = false } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isLeading, setIsLeading] = useState(leading);

  useEffect(() => {
    if (isLeading && leading) {
      setIsLeading(false);
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay, leading, isLeading]);

  return debouncedValue;
}

/**
 * Debounced search hook specifically for search inputs
 */
export function useDebouncedSearch(
  initialValue: string = '',
  onSearch: (query: string) => void,
  delay: number = 300
) {
  const [query, setQuery] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedQuery = useDebounce(query, { delay });

  // Execute search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery) {
      onSearch('');
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    onSearch(debouncedQuery);
    
    // Reset searching state after a bit
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [debouncedQuery, onSearch, delay]);

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    setQuery: handleQueryChange,
    clearSearch,
    isSearching,
  };
}

/**
 * Debounce function utility
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}
