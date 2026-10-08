import React, { useState } from 'react';
import { 
  Database, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Layers, 
  Activity, 
  Terminal, 
  ArrowRight
} from 'lucide-react';

interface RetainedObject {
  id: string;
  name: string;
  type: 'DOM_DETACHED' | 'CLOSURE_SCOPE' | 'BUFFER' | 'WEAKMAP_KEY';
  shallowSizeKb: number;
  retainedSizeKb: number;
  distanceFromRoot: number;
  retainerChain: string;
  isLeaked: boolean;
  isWeakRef: boolean;
}

export const MemoryRetainerLab: React.FC = () => {
  const [isWidgetMounted, setIsWidgetMounted] = useState<boolean>(false);
  const [cleanupEnabled, setCleanupEnabled] = useState<boolean>(false);
  const [gcRunning, setGcRunning] = useState<boolean>(false);
  const [gcCount, setGcCount] = useState<number>(0);
  const [heapAllocationKb, setHeapAllocationKb] = useState<number>(1420);
  const [detachedDomCount, setDetachedDomCount] = useState<number>(0);
  const [logMessages, setLogMessages] = useState<string[]>([
    'V8 Engine Initialized: Old Space 1.42 MB, New Space 0.28 MB, 0 Detached Nodes.'
  ]);

  const [retainedObjects, setRetainedObjects] = useState<RetainedObject[]>([
    {
      id: 'root-win',
      name: 'window (Global Scope)',
      type: 'CLOSURE_SCOPE',
      shallowSizeKb: 64,
      retainedSizeKb: 1420,
      distanceFromRoot: 0,
      retainerChain: 'GC Root (Global)',
      isLeaked: false,
      isWeakRef: false
    }
  ]);

  const appendLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogMessages(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 15)]);
  };

  const handleMountWidget = () => {
    if (isWidgetMounted) return;
    setIsWidgetMounted(true);
    setHeapAllocationKb(prev => prev + 1850);
    appendLog('Mounted <DynamicTelemetryChart />: Allocated 1.85 MB V8 Old Space Buffer.');
  };

  const handleUnmountWidget = () => {
    if (!isWidgetMounted) return;
    setIsWidgetMounted(false);

    if (!cleanupEnabled) {
      setDetachedDomCount(prev => prev + 1);
      const newObj: RetainedObject = {
        id: `leak-${Date.now()}`,
        name: `Detached HTMLDivElement#chart-${detachedDomCount + 1}`,
        type: 'DOM_DETACHED',
        shallowSizeKb: 120,
        retainedSizeKb: 1730,
        distanceFromRoot: 2,
        retainerChain: 'window.addEventListener(\'resize\') -> closureScope -> targetDiv',
        isLeaked: true,
        isWeakRef: false
      };
      setRetainedObjects(prev => [...prev, newObj]);
      appendLog('WARNING: <DynamicTelemetryChart /> unmounted WITHOUT aborting resize listener! Node detached from DOM tree but retained in V8 Heap.');
    } else {
      appendLog('SUCCESS: <DynamicTelemetryChart /> unmounted WITH AbortController.abort(). Listener severed; node marked White for immediate Tri-Color sweep.');
      setHeapAllocationKb(prev => Math.max(1420, prev - 1700));
    }
  };

  const handleTriggerGC = () => {
    setGcRunning(true);
    appendLog('V8 Scavenger & Major Tri-Color Mark-Sweep triggered...');

    setTimeout(() => {
      setGcRunning(false);
      setGcCount(c => c + 1);

      if (cleanupEnabled) {
        setRetainedObjects(prev => prev.filter(o => !o.isLeaked));
        setDetachedDomCount(0);
        setHeapAllocationKb(1420);
        appendLog('V8 Major GC Complete: 0 Detached nodes survived. Old Space reclaimed to baseline 1.42 MB.');
      } else {
        appendLog(`V8 Major GC Complete: ${detachedDomCount} detached DOM node(s) could NOT be collected because reachable via active GC root chain.`);
      }
    }, 900);
  };

  const handleReset = () => {
    setIsWidgetMounted(false);
    setCleanupEnabled(false);
    setDetachedDomCount(0);
    setHeapAllocationKb(1420);
    setRetainedObjects([
      {
        id: 'root-win',
        name: 'window (Global Scope)',
        type: 'CLOSURE_SCOPE',
        shallowSizeKb: 64,
        retainedSizeKb: 1420,
        distanceFromRoot: 0,
        retainerChain: 'GC Root (Global)',
        isLeaked: false,
        isWeakRef: false
      }
    ]);
    appendLog('Environment reset: V8 Heap cleared to pristine baseline.');
  };

  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '1.75rem', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.25rem 0.65rem', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            <Database size={14} /> LAB 20 • V8 Heap & Retainer Graph Visualizer
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Memory Leaks, Detached DOM & Retainer Graphs
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.3rem 0 0 0' }}>
            Simulate how unmounted React components retain multi-megabyte V8 heap subtrees when un-cancelled listeners hold detached DOM elements.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={handleTriggerGC}
            disabled={gcRunning}
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
              cursor: gcRunning ? 'not-allowed' : 'pointer',
              opacity: gcRunning ? 0.6 : 1,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Trash2 size={15} /> {gcRunning ? 'Sweeping Heap...' : 'Collect Garbage (Major GC)'}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>V8 Heap Allocated</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: detachedDomCount > 0 ? '#ef4444' : '#10b981', marginTop: '0.2rem' }}>
            {(heapAllocationKb / 1024).toFixed(2)} MB
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Baseline: 1.42 MB
          </div>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Detached DOM Trees</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: detachedDomCount > 0 ? '#ef4444' : 'var(--text-primary)', marginTop: '0.2rem' }}>
            {detachedDomCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {detachedDomCount === 0 ? 'Healthy (Zero Leaked Elements)' : 'Leaked in Heap Retainers'}
          </div>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cleanup Mode</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: cleanupEnabled ? '#10b981' : '#f59e0b', marginTop: '0.35rem' }}>
            {cleanupEnabled ? 'Defensive AbortController' : 'Leaky Closure (Bug)'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Toggle via simulator controls
          </div>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>GC Sweeps Run</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--react-cyan, #0ea5e9)', marginTop: '0.2rem' }}>
            {gcCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Tri-Color Orinoco Cycle
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} color="var(--react-cyan)" /> Component Lifecycle Simulator
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <button
              onClick={handleMountWidget}
              disabled={isWidgetMounted}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '8px',
                border: 'none',
                background: isWidgetMounted ? 'var(--bg-secondary)' : '#10b981',
                color: isWidgetMounted ? 'var(--text-muted)' : '#fff',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: isWidgetMounted ? 'not-allowed' : 'pointer'
              }}
            >
              Mount &lt;ChartWidget /&gt;
            </button>
            <button
              onClick={handleUnmountWidget}
              disabled={!isWidgetMounted}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '8px',
                border: 'none',
                background: !isWidgetMounted ? 'var(--bg-secondary)' : '#ef4444',
                color: !isWidgetMounted ? 'var(--text-muted)' : '#fff',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: !isWidgetMounted ? 'not-allowed' : 'pointer'
              }}
            >
              Unmount &lt;ChartWidget /&gt;
            </button>
          </div>

          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.85rem', marginBottom: '0.85rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600 }}>
              <input 
                type="checkbox" 
                checked={cleanupEnabled} 
                onChange={e => setCleanupEnabled(e.target.checked)} 
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>Enable Defensive Cleanup (<code style={{ color: '#10b981' }}>controller.abort()</code>)</span>
            </label>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.3rem', paddingLeft: '1.6rem' }}>
              When enabled, component cleanup unsubscribes all listeners so GC roots are severed on unmount.
            </div>
          </div>

          <div style={{ padding: '0.75rem', borderRadius: '8px', background: isWidgetMounted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)', border: `1px solid ${isWidgetMounted ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isWidgetMounted ? '#10b981' : '#94a3b8' }} />
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
              {isWidgetMounted ? '<ChartWidget /> is currently MOUNTED (Allocating 1.85 MB)' : '<ChartWidget /> is currently UNMOUNTED'}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={16} color="var(--purple-accent, #a855f7)" /> V8 Retainer Chain Topology
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.55rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem' }}>
              <span style={{ background: '#3b82f6', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>GC ROOT</span>
              <span style={{ fontWeight: 600 }}>window (Global Object)</span>
              <ArrowRight size={13} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.55rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', marginLeft: '1rem' }}>
              <span style={{ background: '#8b5cf6', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>CLOSURE</span>
              <span style={{ fontWeight: 600 }}>handleResize() [Lexical Context]</span>
              <ArrowRight size={13} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: detachedDomCount > 0 ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-secondary)', border: detachedDomCount > 0 ? '1px solid #ef4444' : '1px solid transparent', padding: '0.55rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', marginLeft: '2rem' }}>
              <span style={{ background: detachedDomCount > 0 ? '#ef4444' : '#10b981', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                {detachedDomCount > 0 ? 'DETACHED DOM' : 'CLEANED'}
              </span>
              <span style={{ fontWeight: 600 }}>HTMLDivElement #telemetry-canvas</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: detachedDomCount > 0 ? '#ef4444' : 'var(--text-muted)' }}>
                {detachedDomCount > 0 ? 'RETAINED (1.73 MB)' : 'Collected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={16} color="#10b981" /> Chrome DevTools Heap Snapshot Inspector Simulation
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.5rem 0.75rem' }}>Constructor / Object</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Distance</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Shallow Size</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Retained Size</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Retainer Path</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {retainedObjects.map(obj => (
                <tr key={obj.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: obj.isLeaked ? '#ef4444' : 'var(--text-primary)' }}>
                    {obj.name}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-secondary)' }}>{obj.distanceFromRoot}</td>
                  <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-secondary)' }}>{obj.shallowSizeKb} KB</td>
                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: obj.isLeaked ? '#ef4444' : 'var(--text-primary)' }}>
                    {(obj.retainedSizeKb / 1024).toFixed(2)} MB
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {obj.retainerChain}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    {obj.isLeaked ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#ef4444', fontWeight: 700 }}>
                        <AlertTriangle size={13} /> Leaked Retainer
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontWeight: 600 }}>
                        <CheckCircle2 size={13} /> Managed Root
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ background: 'var(--code-bg, #0b1120)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--code-text, #e2e8f0)', maxHeight: '160px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', marginBottom: '0.4rem', fontWeight: 700 }}>
          <Terminal size={14} /> V8 Garbage Collection & Memory Stream Log
        </div>
        {logMessages.map((log, index) => (
          <div key={index} style={{ padding: '0.15rem 0', opacity: index === 0 ? 1 : 0.75, color: log.includes('WARNING') || log.includes('❌') ? '#f87171' : log.includes('SUCCESS') || log.includes('🎉') ? '#4ade80' : 'inherit' }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};
