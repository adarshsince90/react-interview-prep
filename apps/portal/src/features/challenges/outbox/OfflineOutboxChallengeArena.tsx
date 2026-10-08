import React, { useState } from 'react';
import { useOfflineOutbox } from './useOfflineOutbox';
import {
  Wifi,
  WifiOff,
  Database,
  Send
} from 'lucide-react';

export const OfflineOutboxChallengeArena: React.FC = () => {
  const {
    queue,
    enqueue,
    clearCompleted,
    isOnline,
    setIsOnline,
    forceFailures,
    setForceFailures,
    isProcessing
  } = useOfflineOutbox();

  const [milestoneName, setMilestoneName] = useState('Staff System Design Certification');
  const [optimisticList, setOptimisticList] = useState<string[]>([
    'V8 Heap Snapshot Mastery',
    'RSC Flight Protocol Implementation'
  ]);

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneName.trim()) return;

    // 1. Optimistic local update
    setOptimisticList(prev => [...prev, milestoneName]);

    // 2. Queue in outbox
    enqueue('/api/v1/milestones', { title: milestoneName, timestamp: Date.now() });
    setMilestoneName('');
  };

  const pendingCount = queue.filter(q => q.status === 'pending' || q.status === 'syncing').length;
  const completedCount = queue.filter(q => q.status === 'completed').length;
  const failedCount = queue.filter(q => q.status === 'failed' && q.attempts >= q.maxRetries).length;

  return (
    <div>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.25rem 0.65rem', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            <Database size={14} /> CHALLENGE-03: Resilient Offline Mutation Outbox
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Offline-First Mutation Outbox &amp; Full-Jitter Backoff
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.3rem 0 0 0' }}>
            Production FIFO mutation queue backed by IndexedDB persistence, exponential backoff with full jitter, and optimistic UI rollback.
          </p>
        </div>

        {/* Network & Toggle Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setIsOnline(!isOnline)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              border: 'none',
              background: isOnline ? '#10b981' : '#ef4444',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            Network: {isOnline ? 'ONLINE' : 'OFFLINE'}
          </button>

          <button
            onClick={() => setForceFailures(!forceFailures)}
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              background: forceFailures ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-tertiary)',
              color: forceFailures ? '#ef4444' : 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {forceFailures ? '503 Failures Active' : 'Normal Network (200 OK)'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Outbox Queue Depth</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: pendingCount > 0 ? '#f59e0b' : '#10b981', marginTop: '0.2rem' }}>
            {pendingCount} pending
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            FIFO execution order
          </div>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed Syncs</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
            {completedCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Server acknowledged
          </div>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Backoff Algorithm</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0ea5e9', marginTop: '0.35rem' }}>
            Full Jitter Exp
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Prevents thundering herd
          </div>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sync Worker Status</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isProcessing ? '#f59e0b' : isOnline ? '#10b981' : '#94a3b8', marginTop: '0.35rem' }}>
            {isProcessing ? 'Draining Queue...' : isOnline ? 'Idle (Listening)' : 'Paused (Offline)'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Heartbeat active
          </div>
        </div>
      </div>

      {/* 2-Column: Optimistic App vs Live Outbox Queue */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Left: Optimistic App */}
        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.85rem' }}>
            Optimistic UI: Enterprise Milestones
          </div>

          <form onSubmit={handleAddMilestone} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={milestoneName}
              onChange={e => setMilestoneName(e.target.value)}
              placeholder="New architectural milestone..."
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem'
              }}
            />
            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.5rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                background: '#10b981',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <Send size={13} /> Save
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {optimisticList.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{item}</span>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>Optimistic Active</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Outbox Inspector */}
        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>IndexedDB FIFO Outbox Queue ({queue.length})</span>
            {failedCount > 0 && (
              <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 600 }}>
                {failedCount} permanently failed
              </span>
            )}
            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--react-cyan)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clear Completed ({completedCount})
              </button>
            )}
          </div>

          <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {queue.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Outbox is empty. Submit a milestone on the left while offline to test queue persistence!
              </div>
            ) : (
              queue.map(item => (
                <div
                  key={item.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.78rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{item.id}</span>
                    <span
                      style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background:
                          item.status === 'completed'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : item.status === 'syncing'
                              ? 'rgba(14, 165, 233, 0.15)'
                              : item.attempts > 0
                                ? 'rgba(245, 158, 11, 0.15)'
                                : 'rgba(148, 163, 184, 0.15)',
                        color:
                          item.status === 'completed'
                            ? '#10b981'
                            : item.status === 'syncing'
                              ? '#0ea5e9'
                              : item.attempts > 0
                                ? '#f59e0b'
                                : 'var(--text-muted)'
                      }}
                    >
                      {item.status.toUpperCase()} ({item.attempts}/{item.maxRetries} tries)
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Payload: {JSON.stringify(item.payload)}
                  </div>
                  {item.lastError && (
                    <div style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '0.3rem' }}>
                      {item.lastError}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
