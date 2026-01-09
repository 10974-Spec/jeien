import { useState, useEffect, useRef, useCallback } from 'react';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

export function useCachedFetch(url, options = {}, dependencies = [], skip = false) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  
  const cacheKey = useRef(JSON.stringify({ url, options }));
  const controllerRef = useRef(new AbortController());

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (skip) return;

    const key = cacheKey.current;
    const cached = cache.get(key);
    
    // Return cached data if still valid and not forcing refresh
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION && !forceRefresh) {
      setData(cached.data);
      setTimestamp(cached.timestamp);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Abort previous request
      controllerRef.current.abort();
      controllerRef.current = new AbortController();

      const signal = controllerRef.current.signal;
      
      const response = await fetch(url, {
        ...options,
        signal,
        headers: {
          'Accept': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Cache the result
      const cacheEntry = {
        data: result,
        timestamp: Date.now()
      };
      
      cache.set(key, cacheEntry);
      
      setData(result);
      setTimestamp(cacheEntry.timestamp);
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }

      setError(err.message);
      
      // If error but we have cached data, use it
      if (cached && !forceRefresh) {
        console.log('Using stale cached data due to error');
        setData(cached.data);
        setTimestamp(cached.timestamp);
      }
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options), skip, ...dependencies]);

  useEffect(() => {
    fetchData();
    
    return () => {
      controllerRef.current.abort();
    };
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    cache.delete(cacheKey.current);
    setData(null);
    setTimestamp(null);
  }, []);

  return { 
    data, 
    loading, 
    error, 
    timestamp, 
    refresh, 
    clearCache,
    isCached: timestamp && Date.now() - timestamp < CACHE_DURATION
  };
}

// Hook for API calls with automatic retry
export function useApiCall(apiCall, dependencies = [], options = {}) {
  const {
    initialData = null,
    enabled = true,
    retries = 2,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    let attempts = 0;
    let lastError = null;

    while (attempts <= retries) {
      try {
        const result = await apiCall();
        setData(result);
        setRetryCount(attempts);
        return result;
      } catch (err) {
        lastError = err;
        attempts++;
        
        if (attempts <= retries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
        }
      }
    }

    setError(lastError);
    setRetryCount(attempts - 1);
    throw lastError;
  }, [apiCall, enabled, retries, retryDelay]);

  useEffect(() => {
    if (enabled) {
      execute().finally(() => {
        setLoading(false);
      });
    }
  }, [execute, enabled, ...dependencies]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    retryCount,
    refetch,
    isError: !!error,
    isSuccess: !loading && !error
  };
}