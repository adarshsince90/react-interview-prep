import React, { useState } from 'react';
import { GitCompare, Flame, ShieldCheck, RefreshCw, AlertCircle, Cpu } from 'lucide-react';

interface Transaction {
  id: number;
  label: string;
  amount: number;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 1, label: 'Cloud Infrastructure (Azure)', amount: 420 },
  { id: 2, label: 'Kubernetes Cluster', amount: 890 },
  { id: 3, label: 'CDN & DNS Gateway', amount: 150 }
];

export const ComponentPurityLab: React.FC = () => {
  // Master state
  const [dataStore, setDataStore] = useState<Transaction[]>([...INITIAL_TRANSACTIONS]);
  const [strategy, setStrategy] = useState<'impure' | 'pure'>('pure');
  const [strictModeActive, setStrictModeActive] = useState<boolean>(true);
  const [renderCount, setRenderCount] = useState<number>(1);
  const [heapPointer, setHeapPointer] = useState<string>('0x7FFF001');
  const [logMessages, setLogMessages] = useState<string[]>([
    'System Initialized. Master heap pointer: 0x7FFF001'
  ]);

  const addLog = (msg: string) => {
    setLogMessages(prev => [msg, ...prev.slice(0, 5)]);
  };

  const executeSort = () => {
    if (strategy === 'impure') {
      // ❌ IMPURE: Mutates in-place on existing heap reference!
      dataStore.sort((a, b) => b.amount - a.amount);
      
      const multiplier = strictModeActive ? 2 : 1;
      setRenderCount(c => c + multiplier);
      
      addLog(
        `❌ IMPURE SORT: Array.prototype.sort() mutated heap memory at ${heapPointer} directly! StrictMode invocations: ${multiplier}.`
      );
    } else {
      // ✅ PURE ES2023: Allocates brand new shallow copy!
      const nextHeapPointer = '0x' + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
      setHeapPointer(nextHeapPointer);
      
      const sorted = (dataStore as any).toSorted 
        ? (dataStore as any).toSorted((a: Transaction, b: Transaction) => b.amount - a.amount)
        : [...dataStore].sort((a, b) => b.amount - a.amount);

      setDataStore(sorted);
      const multiplier = strictModeActive ? 2 : 1;
      setRenderCount(c => c + multiplier);

      addLog(
        `✅ PURE PROJECTION: Allocated new array at ${nextHeapPointer}. Referential equality check: 0x7FFF001 !== ${nextHeapPointer} -> Triggers clean reconciliation!`
      );
    }
  };

  const resetData = () => {
    setHeapPointer('0x7FFF001');
    setDataStore([...INITIAL_TRANSACTIONS]);
    setRenderCount(1);
    setLogMessages(['Reset to initial state. Heap address: 0x7FFF001']);
  };

  return (
    <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '0.5rem', borderRadius: '8px', color: 'var(--purple-accent)' }}>
          <GitCompare size={24} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Lab 11: Component Purity & StrictMode Stress-Tester</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Compare in-place array mutation against pure functional projection and watch how StrictMode exposes bugs.
          </p>
        </div>
      </div>

      {/* Control Strip */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            Mutation Strategy
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setStrategy('impure')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                background: strategy === 'impure' ? 'var(--rose-danger)' : 'var(--bg-secondary)',
                color: strategy === 'impure' ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-medium)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              ❌ Impure (In-Place .sort())
            </button>
            <button
              onClick={() => setStrategy('pure')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                background: strategy === 'pure' ? 'var(--emerald-success)' : 'var(--bg-secondary)',
                color: strategy === 'pure' ? '#000' : 'var(--text-secondary)',
                border: '1px solid var(--border-medium)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              ✅ Pure (ES2023 .toSorted())
            </button>
          </div>
        </div>

        {/* StrictMode Toggle */}
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            React StrictMode Simulation
          </div>
          <button
            onClick={() => setStrictModeActive(!strictModeActive)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              background: strictModeActive ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-secondary)',
              color: strictModeActive ? 'var(--react-cyan)' : 'var(--text-muted)',
              border: `1px solid ${strictModeActive ? 'var(--react-cyan)' : 'var(--border-medium)'}`,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Flame size={16} /> StrictMode: {strictModeActive ? 'ENABLED (Double Invoke)' : 'DISABLED'}
          </button>
        </div>

        {/* Trigger Sort Button */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={executeSort}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              background: 'var(--react-cyan)',
              color: '#000',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <RefreshCw size={16} /> Execute Sort
          </button>
          <button
            onClick={resetData}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              background: 'var(--bg-secondary)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-medium)',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Memory & V8 Engine Visualizer Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Active Transactions List */}
        <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Rendered Component Tree
            </span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--react-cyan)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
              Render Pass: #{renderCount}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {dataStore.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.label}</span>
                <strong style={{ color: 'var(--react-cyan)', fontFamily: 'var(--font-mono)' }}>${item.amount}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* V8 Heap Pointer & Identity Inspector */}
        <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Cpu size={18} color="var(--purple-accent)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              V8 Engine Heap Inspection
            </span>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
            <div><strong>Active Pointer:</strong> <span style={{ color: strategy === 'impure' ? 'var(--rose-danger)' : 'var(--emerald-success)' }}>{heapPointer}</span></div>
            <div><strong>Referential Equality:</strong> {strategy === 'impure' ? 'prev === next (TRUE, MUTATED)' : 'prev !== next (FALSE, NEW ALLOCATION)'}</div>
            <div><strong>StrictMode Invocation:</strong> {strictModeActive ? '2x Speculative Executions' : '1x Synchronous Execution'}</div>
          </div>

          <div style={{ fontSize: '0.85rem', color: strategy === 'impure' ? 'var(--rose-danger)' : 'var(--emerald-success)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            {strategy === 'impure' ? (
              <>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Production Hazard:</strong> Array was mutated directly in memory. React.memo and selector caches assume nothing changed and skip re-renders in parent components!</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Mathematical Purity Enforced:</strong> Fresh array allocated in V8 New Space. Pure projection guarantees referential transparency and safe time-slicing.</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Telemetry Log */}
      <div style={{ background: 'var(--code-bg)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', fontFamily: 'var(--font-mono)' }}>
          Engine Execution Telemetry Stream
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {logMessages.map((msg, idx) => (
            <div key={idx} style={{ color: idx === 0 ? 'var(--react-cyan)' : '#94a3b8' }}>
              &gt; {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
