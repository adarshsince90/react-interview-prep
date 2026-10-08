import { useState, useEffect, useCallback } from 'react';

export interface OutboxItem {
  id: string;
  endpoint: string;
  payload: any;
  createdAt: number;
  attempts: number;
  maxRetries: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  nextRetryAt: number;
  lastError?: string;
}

export function calculateFullJitterBackoff(attempt: number, baseMs = 1000, maxMs = 30000): number {
  const exponential = Math.min(maxMs, baseMs * Math.pow(2, attempt));
  return Math.floor(Math.random() * exponential);
}

export function useOfflineOutbox() {
  const [queue, setQueue] = useState<OutboxItem[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [networkLatencyMs, setNetworkLatencyMs] = useState<number>(300);
  const [forceFailures, setForceFailures] = useState<boolean>(false);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const enqueue = useCallback((endpoint: string, payload: any) => {
    const newItem: OutboxItem = {
      id: 'mut-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      endpoint,
      payload,
      createdAt: Date.now(),
      attempts: 0,
      maxRetries: 4,
      status: 'pending',
      nextRetryAt: Date.now()
    };

    setQueue(prev => [...prev, newItem]);
    return newItem.id;
  }, []);

  // Process outbox loop
  useEffect(() => {
    if (!isOnline || isProcessing) return;

    const pendingIndex = queue.findIndex(
      item => (item.status === 'pending' || item.status === 'failed') &&
              item.attempts < item.maxRetries &&
              Date.now() >= item.nextRetryAt
    );

    if (pendingIndex === -1) return;

    const itemToProcess = queue[pendingIndex];
    setIsProcessing(true);

    // Set syncing
    setQueue(prev => prev.map((item, idx) => idx === pendingIndex ? { ...item, status: 'syncing' } : item));

    const timer = setTimeout(() => {
      setIsProcessing(false);

      if (forceFailures || !isOnline) {
        // Simulated failure with jittered backoff
        const nextAttempt = itemToProcess.attempts + 1;
        const jitterDelay = calculateFullJitterBackoff(nextAttempt);

        setQueue(prev => prev.map((item, idx) => {
          if (idx !== pendingIndex) return item;
          return {
            ...item,
            attempts: nextAttempt,
            status: nextAttempt >= item.maxRetries ? 'failed' : 'pending',
            nextRetryAt: Date.now() + jitterDelay,
            lastError: 'HTTP 503 Service Unavailable (Network Jitter Backoff)'
          };
        }));
      } else {
        // Success
        setQueue(prev => prev.map((item, idx) => idx === pendingIndex ? { ...item, status: 'completed' } : item));
      }
    }, networkLatencyMs);

    return () => clearTimeout(timer);
  }, [queue, isOnline, isProcessing, forceFailures, networkLatencyMs]);

  const clearCompleted = useCallback(() => {
    setQueue(prev => prev.filter(item => item.status !== 'completed'));
  }, []);

  return {
    queue,
    enqueue,
    clearCompleted,
    isOnline,
    setIsOnline,
    forceFailures,
    setForceFailures,
    isProcessing,
    networkLatencyMs,
    setNetworkLatencyMs
  };
}
