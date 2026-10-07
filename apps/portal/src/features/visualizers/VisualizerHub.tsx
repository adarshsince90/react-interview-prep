import React, { useState } from 'react';
import { JsxCompilerLab } from './topic-03-jsx/JsxCompilerLab';
import { ComponentPurityLab } from './topic-04-purity/ComponentPurityLab';
import { RenderCycleLab } from './topic-05-render/RenderCycleLab';
import { ArchitectureLab } from './topic-09-architecture/LabComponent';
import { TestingLab } from './topic-10-testing/TestingLab';
import { CanvasDesignLab } from './topic-11-system-design/CanvasDesignLab';
import { EventLoopLab } from './topic-04-event-loop/EventLoopLab';
import { FiberReconciliationLab } from './topic-14-fiber/FiberReconciliationLab';
import { RscFlightLab } from './topic-19-rsc/RscFlightLab';
import { Layers, Code2, GitCompare, Activity, Box, ShieldCheck, Network, Cpu, GitBranch, Terminal } from 'lucide-react';

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
          Hands-on visual simulators proving the engine mechanics of V8 Event Loop, JSX AST desugaring, StrictMode, Fiber Reconciliation, RSC Flight protocol, and System Design.
        </p>
      </div>

      {/* Lab Switcher Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveLab('lab-04-event-loop')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.15rem',
            borderRadius: '8px',
            background: activeLab === 'lab-04-event-loop' ? 'var(--bg-tertiary)' : 'transparent',
            color: activeLab === 'lab-04-event-loop' ? 'var(--react-cyan)' : 'var(--text-secondary)',
            border: activeLab === 'lab-04-event-loop' ? '1px solid var(--border-medium)' : '1px solid transparent',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Cpu size={18} /> Lab 04: Event Loop & INP
        </button>

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
            fontSize: '0.9rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Code2 size={18} /> Lab 10: JSX Compiler & $$typeof
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
            fontSize: '0.9rem',
            whiteSpace: 'nowrap'
          }}
        >
          <GitCompare size={18} /> Lab 11: Purity & StrictMode
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
            fontSize: '0.9rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Activity size={18} /> Lab 12: Render Cycle Stepper
        </button>

        <button
          onClick={() => setActiveLab('lab-14-fiber-reconciliation')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.15rem',
            borderRadius: '8px',
            background: activeLab === 'lab-14-fiber-reconciliation' ? 'var(--bg-tertiary)' : 'transparent',
            color: activeLab === 'lab-14-fiber-reconciliation' ? '#38bdf8' : 'var(--text-secondary)',
            border: activeLab === 'lab-14-fiber-reconciliation' ? '1px solid var(--border-medium)' : '1px solid transparent',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap'
          }}
        >
          <GitBranch size={18} /> Lab 14: Fiber & Key Diffing
        </button>

        <button
          onClick={() => setActiveLab('lab-19-rsc-flight')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.15rem',
            borderRadius: '8px',
            background: activeLab === 'lab-19-rsc-flight' ? 'var(--bg-tertiary)' : 'transparent',
            color: activeLab === 'lab-19-rsc-flight' ? '#f472b6' : 'var(--text-secondary)',
            border: activeLab === 'lab-19-rsc-flight' ? '1px solid var(--border-medium)' : '1px solid transparent',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Terminal size={18} /> Lab 19: RSC Flight Parser
        </button>

        <button
          onClick={() => setActiveLab('topic-09-architecture')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.15rem',
            borderRadius: '8px',
            background: activeLab === 'topic-09-architecture' ? 'var(--bg-tertiary)' : 'transparent',
            color: activeLab === 'topic-09-architecture' ? 'var(--amber-warning, #f59e0b)' : 'var(--text-secondary)',
            border: activeLab === 'topic-09-architecture' ? '1px solid var(--border-medium)' : '1px solid transparent',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Box size={18} /> Lab 09: Architecture & Strangler Fig
        </button>

        <button
          onClick={() => setActiveLab('topic-10-testing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.15rem',
            borderRadius: '8px',
            background: activeLab === 'topic-10-testing' ? 'var(--bg-tertiary)' : 'transparent',
            color: activeLab === 'topic-10-testing' ? 'var(--purple-accent, #a855f7)' : 'var(--text-secondary)',
            border: activeLab === 'topic-10-testing' ? '1px solid var(--border-medium)' : '1px solid transparent',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap'
          }}
        >
          <ShieldCheck size={18} /> Lab 10: Testing Trophy
        </button>

        <button
          onClick={() => setActiveLab('topic-11-system-design')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.15rem',
            borderRadius: '8px',
            background: activeLab === 'topic-11-system-design' ? 'var(--bg-tertiary)' : 'transparent',
            color: activeLab === 'topic-11-system-design' ? 'var(--react-cyan, #0ea5e9)' : 'var(--text-secondary)',
            border: activeLab === 'topic-11-system-design' ? '1px solid var(--border-medium)' : '1px solid transparent',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Network size={18} /> Lab 11: System Design Canvas
        </button>
      </div>

      {/* Active Lab Viewport */}
      <div>
        {activeLab === 'lab-04-event-loop' && <EventLoopLab />}
        {activeLab === 'lab-10-jsx-compiler' && <JsxCompilerLab />}
        {activeLab === 'lab-11-component-purity' && <ComponentPurityLab />}
        {activeLab === 'lab-12-render-cycle-stepper' && <RenderCycleLab />}
        {activeLab === 'lab-14-fiber-reconciliation' && <FiberReconciliationLab />}
        {activeLab === 'lab-19-rsc-flight' && <RscFlightLab />}
        {activeLab === 'topic-09-architecture' && <ArchitectureLab />}
        {activeLab === 'topic-10-testing' && <TestingLab />}
        {activeLab === 'topic-11-system-design' && <CanvasDesignLab />}
      </div>
    </div>
  );
};

