import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  RotateCcw, 
  RefreshCw, 
  AlertCircle, 
  Sliders, 
  Terminal, 
  Database
} from 'lucide-react';

type QueryStatus = 'fetching' | 'fresh' | 'stale' | 'inactive' | 'gc';

export const QueryCacheLab: React.FC = () => {
  const [staleTimeSec, setStaleTimeSec] = useState<number>(4);
  const [gcTimeSec, setGcTimeSec] = useState<number>(8);
  const [queryStatus, setQueryStatus] = useState<QueryStatus>('fresh');
  const [observersCount, setObserversCount] = useState<number>(1);
  const [secondsInState, setSecondsInState] = useState<number>(0);
  const [optimisticTitle, setOptimisticTitle] = useState<string>('Staff Engineer Roadmap');
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [failMutation, setFailMutation] = useState<boolean>(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const [cacheLog, setCacheLog] = useState<string[]>([
    'Query [\'user\', 42, \'roadmap\'] initialized in queryClient cache.'
  ]);

  const appendLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setCacheLog(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 15)]);
  };

  // State machine timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsInState(s => s + 1);

      if (queryStatus === 'fresh' && observersCount > 0) {
        if (secondsInState >= staleTimeSec) {
          setQueryStatus('stale');
          setSecondsInState(0);
          appendLog('staleTime elapsed: Query transitioned from fresh -> stale. Eligible for background refetch.');
        }
      } else if (queryStatus === 'inactive') {
        if (secondsInState >= gcTimeSec) {
          setQueryStatus('gc');
          appendLog('gcTime elapsed: Query garbage collected and purged from TanStack cache memory.');
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [queryStatus, secondsInState, staleTimeSec, gcTimeSec, observersCount]);

  const handleRefetch = () => {
    setQueryStatus('fetching');
    setSecondsInState(0);
    appendLog('Triggered manual invalidateQueries([\'user\', 42]). Fetching in flight...');
    setTimeout(() => {
      setQueryStatus('fresh');
      setSecondsInState(0);
      appendLog('Fetch resolved with 200 OK. Query marked fresh.');
    }, 800);
  };

  const handleToggleObserver = () => {
    if (observersCount > 0) {
      setObserversCount(0);
      setQueryStatus('inactive');
      setSecondsInState(0);
      appendLog('Observer component unmounted (observers: 0). Query marked INACTIVE. gcTime timer started.');
    } else {
      setObserversCount(1);
      setQueryStatus('fetching');
      setSecondsInState(0);
      appendLog('Observer component mounted. Query reactivated with stale-while-revalidate.');
      setTimeout(() => {
        setQueryStatus('fresh');
        setSecondsInState(0);
      }, 600);
    }
  };

  const handleSimulateMutation = () => {
    if (isMutating) return;
    setIsMutating(true);
    setMutationError(null);
    const previousSnapshot = optimisticTitle;
    const newTitle = 'Staff Frontend Architect (Optimistic)';
    
    // 1. Optimistic Update
    setOptimisticTitle(newTitle);
    appendLog(`onMutate: Optimistically updated UI cache to "${newTitle}". Cached snapshot saved for rollback.`);

    // 2. Simulated Network Call
    setTimeout(() => {
      setIsMutating(false);
      if (failMutation) {
        setOptimisticTitle(previousSnapshot);
        setMutationError('500 Internal Server Error: Mutation rejected.');
        appendLog(`onError: Server error encountered! Rolled back UI cache to snapshot: "${previousSnapshot}".`);
      } else {
        appendLog('onSuccess: Server confirmed mutation. Query cache committed.');
      }
    }, 1200);
  };

  const handleReset = () => {
    setQueryStatus('fresh');
    setObserversCount(1);
    setSecondsInState(0);
    setOptimisticTitle('Staff Engineer Roadmap');
    setMutationError(null);
    setIsMutating(false);
    appendLog('Query cache reset to fresh baseline.');
  };

  const getStatusColor = (status: QueryStatus) => {
    switch (status) {
      case 'fetching': return '#0ea5e9';
      case 'fresh': return '#10b981';
      case 'stale': return '#f59e0b';
      case 'inactive': return '#8b5cf6';
      case 'gc': return '#ef4444';
    }
  };

  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '1.75rem', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--react-cyan)', padding: '0.25rem 0.65rem', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            <Database size={14} /> LAB 21 • TanStack Query Cache Lifecycle & Optimistic Rollback
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Query Cache States & Optimistic Rollbacks
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.3rem 0 0 0' }}>
            Interactive simulation of TanStack Query lifecycle (fresh → stale → inactive → gc) and automatic rollback mechanics during failed mutations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={handleRefetch}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              border: 'none',
              background: '#0ea5e9',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} /> Invalidate & Refetch
          </button>
          <button
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Query Lifecycle State Ring */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {(['fetching', 'fresh', 'stale', 'inactive', 'gc'] as QueryStatus[]).map(s => {
          const isActive = queryStatus === s;
          const color = getStatusColor(s);

          return (
            <div
              key={s}
              style={{
                background: isActive ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                border: `2px solid ${isActive ? color : 'var(--border-subtle)'}`,
                borderRadius: '10px',
                padding: '0.85rem',
                textAlign: 'center',
                boxShadow: isActive ? `0 0 15px ${color}33` : 'none',
                transition: 'all 200ms ease'
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: isActive ? color : 'var(--text-muted)' }}>
                {s}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.2rem', color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {isActive ? `${secondsInState}s` : '--'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {s === 'fresh' ? `stale in ${Math.max(0, staleTimeSec - secondsInState)}s` : s === 'inactive' ? `gc in ${Math.max(0, gcTimeSec - secondsInState)}s` : s === 'stale' ? 'Cached / Expired' : s === 'fetching' ? 'Network' : 'Purged'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls & Configuration */}
      <div className="responsive-diff-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Timing Config */}
        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={16} color="var(--react-cyan)" /> Cache Timing Configuration
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
              <span>staleTime: <strong style={{ color: '#10b981' }}>{staleTimeSec} seconds</strong></span>
              <span style={{ color: 'var(--text-muted)' }}>(0 = immediately stale)</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={staleTimeSec} 
              onChange={e => setStaleTimeSec(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
              <span>gcTime: <strong style={{ color: '#8b5cf6' }}>{gcTimeSec} seconds</strong></span>
              <span style={{ color: 'var(--text-muted)' }}>(garbage collection buffer)</span>
            </div>
            <input 
              type="range" 
              min="3" 
              max="15" 
              value={gcTimeSec} 
              onChange={e => setGcTimeSec(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          <button
            onClick={handleToggleObserver}
            style={{
              width: '100%',
              padding: '0.65rem',
              borderRadius: '8px',
              border: 'none',
              background: observersCount > 0 ? '#8b5cf6' : '#10b981',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            {observersCount > 0 ? 'Unmount Observer Component (observers: 0)' : 'Mount Observer Component (observers: 1)'}
          </button>
        </div>

        {/* Optimistic Mutation Simulator */}
        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={16} color="#f59e0b" /> Optimistic Mutation & Rollback
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Active UI State:</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {optimisticTitle}
            </div>
            {mutationError && (
              <div style={{ color: '#ef4444', fontSize: '0.74rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertCircle size={13} /> {mutationError}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '0.85rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={failMutation} 
                onChange={e => setFailMutation(e.target.checked)} 
                style={{ width: '15px', height: '15px' }}
              />
              <span>Simulate Network Failure (<strong style={{ color: '#ef4444' }}>Force 500 Rollback</strong>)</span>
            </label>
          </div>

          <button
            onClick={handleSimulateMutation}
            disabled={isMutating}
            style={{
              width: '100%',
              padding: '0.65rem',
              borderRadius: '8px',
              border: 'none',
              background: '#f59e0b',
              color: '#000',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: isMutating ? 'not-allowed' : 'pointer',
              opacity: isMutating ? 0.6 : 1
            }}
          >
            {isMutating ? 'Mutating in flight...' : 'Trigger Optimistic Mutation'}
          </button>
        </div>
      </div>

      {/* Stream Telemetry */}
      <div style={{ background: 'var(--code-bg, #0b1120)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--code-text, #e2e8f0)', maxHeight: '160px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', marginBottom: '0.4rem', fontWeight: 700 }}>
          <Terminal size={14} /> TanStack Query Cache Transaction Log
        </div>
        {cacheLog.map((log, index) => (
          <div key={index} style={{ padding: '0.15rem 0', opacity: index === 0 ? 1 : 0.75, color: log.includes('error') || log.includes('Rolled back') ? '#f87171' : log.includes('fresh') || log.includes('confirmed') ? '#4ade80' : 'inherit' }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};
