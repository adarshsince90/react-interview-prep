import React, { useState } from 'react';
import { JsxCompilerLab } from './topic-03-jsx/JsxCompilerLab';
import { ComponentPurityLab } from './topic-04-purity/ComponentPurityLab';
import { RenderCycleLab } from './topic-05-render/RenderCycleLab';
import { Layers, Code2, GitCompare, Activity, Cpu } from 'lucide-react';

interface VisualizerHubProps {
  initialLabId?: string | null;
}

export const VisualizerHub: React.FC<VisualizerHubProps> = ({ initialLabId }) => {
  const [activeLab, setActiveLab] = useState<string>(initialLabId || 'lab-10-jsx-compiler');

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 216, 255, 0.1)', color: 'var(--react-cyan)', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          <Layers size={15} /> Living Simulation Arena
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Interactive React & Runtime Laboratories
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '800px', margin: 0 }}>
          Hands-on visual simulators proving the engine mechanics of JSX AST desugaring, V8 Heap object allocations, StrictMode double-rendering stress tests, and the 3-phase Render Cycle.
        </p>
      </div>

      {/* Lab Switcher Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveLab('lab-10-jsx-compiler')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.15rem',
            borderRadius: '8px',
            background: activeLab === 'lab-10-jsx-compiler' ? 'var(--bg-tertiary)' : 'transparent',
            color: activeLab === 'lab-10-jsx-compiler' ? 'var(--react-cyan)' : 'var(--text-secondary)',
            border: activeLab === 'lab-10-jsx-compiler' ? '1px solid var(--border-medium)' : '1px solid transparent',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          <Code2 size={18} /> Lab 10: JSX Compiler & $$typeof Inspector
        </button>

        <button
          onClick={() => setActiveLab('lab-11-component-purity')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.15rem',
            borderRadius: '8px',
            background: activeLab === 'lab-11-component-purity' ? 'var(--bg-tertiary)' : 'transparent',
            color: activeLab === 'lab-11-component-purity' ? 'var(--purple-accent)' : 'var(--text-secondary)',
            border: activeLab === 'lab-11-component-purity' ? '1px solid var(--border-medium)' : '1px solid transparent',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          <GitCompare size={18} /> Lab 11: Component Purity & StrictMode
        </button>

        <button
          onClick={() => setActiveLab('lab-12-render-cycle-stepper')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.15rem',
            borderRadius: '8px',
            background: activeLab === 'lab-12-render-cycle-stepper' ? 'var(--bg-tertiary)' : 'transparent',
            color: activeLab === 'lab-12-render-cycle-stepper' ? 'var(--emerald-success)' : 'var(--text-secondary)',
            border: activeLab === 'lab-12-render-cycle-stepper' ? '1px solid var(--border-medium)' : '1px solid transparent',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          <Activity size={18} /> Lab 12: Render Cycle Stepper (Trigger $\rightarrow$ Render $\rightarrow$ Commit)
        </button>

        <button
          disabled
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.15rem',
            borderRadius: '8px',
            background: 'transparent',
            color: 'var(--text-muted)',
            border: '1px dashed var(--border-subtle)',
            fontSize: '0.9rem',
            cursor: 'not-allowed',
            opacity: 0.6
          }}
        >
          <Cpu size={18} /> Lab 04: Event Loop & INP (Phase 01 Queue)
        </button>
      </div>

      {/* Active Lab Viewport */}
      <div>
        {activeLab === 'lab-10-jsx-compiler' && <JsxCompilerLab />}
        {activeLab === 'lab-11-component-purity' && <ComponentPurityLab />}
        {activeLab === 'lab-12-render-cycle-stepper' && <RenderCycleLab />}
      </div>
    </div>
  );
};
