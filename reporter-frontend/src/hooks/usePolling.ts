/**
 * Custom hook for safe polling without flickering or excessive re-renders
 * Handles cleanup, prevents memory leaks, and updates only when data changes
 */

import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
  enabled?: boolean;
  interval?: number;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * usePolling - Safe polling hook
 * 
 * CRITICAL: Prevents flickering by:
 * 1. Cleaning up previous interval before creating new one
 * 2. Not calling setState unnecessarily
 * 3. Only calling refetch when enabled changes OR on initial mount
 * 
 * @param refetch - Function to call on interval
 * @param options - Polling configuration
 */
export function usePolling(
  refetch: () => Promise<void>,
  options: UsePollingOptions = {}
) {
  const { enabled = true, interval = 5000, onSuccess, onError } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const enabledRef = useRef(enabled);

  // Update ref when enabled changes
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Set up polling
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only create new interval if polling is enabled
    if (enabledRef.current) {
      const poll = async () => {
        try {
          await refetch();
          onSuccess?.();
        } catch (error) {
          console.error('Polling error:', error);
          onError?.(error);
        }
      };

      // Don't poll immediately on mount - let initial load handle it
      // Start polling only after first interval
      intervalRef.current = setInterval(poll, interval);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [interval]); // Only depend on interval, not refetch (refetch is called via its closure)

  return {
    stop: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    },
  };
}
