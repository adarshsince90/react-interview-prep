import { MemoryRetainerLab } from './topic-09-memory/MemoryRetainerLab';
import { QueryCacheLab } from './topic-04-state/QueryCacheLab';
import { VirtualizationLab } from './topic-08-performance/VirtualizationLab';
import { Database, Zap } from 'lucide-react';
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

interface LabMeta {
  id: string;
  number: string;
  title: string;
  phaseBadge: string;
  tagline: string;
  icon: React.ComponentType<{ size: number }>;
  color: string;
}

const LABS_CONFIG: LabMeta[] = [
  {
    id: 'lab-20-memory-retainer',
    number: '20',
    title: 'V8 Heap & Retainer Graph',
    phaseBadge: 'Phase 01: JS Runtime',
    tagline: 'GC Roots, detached DOM tree memory retention, and Tri-Color marking sweep.',
    icon: Database,
    color: '#ef4444'
  },
  {
    id: 'lab-21-query-cache',
    number: '21',
    title: 'Query Cache & Optimistic Rollback',
    phaseBadge: 'Phase 05: State Architecture',
    tagline: 'TanStack Query state machine (fresh, stale, inactive, gc) and rollback on 500 error.',
    icon: Zap,
    color: 'var(--amber-warning, #f59e0b)'
  },
  {
    id: 'lab-22-virtualization',
    number: '22',
    title: 'Virtualization & Viewport Culling',
    phaseBadge: 'Phase 08: Performance',
    tagline: '1,000 dataset rows culled into 12 physical DOM elements with translateY recycling.',
    icon: Layers,
    color: 'var(--emerald-success, #10b981)'
  },

  {
    id: 'lab-04-event-loop',
    number: '04',
    title: 'Event Loop & INP Engine',
    phaseBadge: 'Phase 01: JS Runtime',
    tagline: '4-Lane reactor, microtasks, timers, and browser render frame time-slicing.',
    icon: Cpu,
    color: 'var(--react-cyan)'
  },
  {
    id: 'lab-10-jsx-compiler',
    number: '10',
    title: 'JSX Compiler & $$typeof',
    phaseBadge: 'Phase 03: React Core',
    tagline: 'AST desugaring, classic vs automatic runtime, and Symbol security protection.',
    icon: Code2,
    color: 'var(--react-cyan)'
  },
  {
    id: 'lab-11-component-purity',
    number: '11',
    title: 'Component Purity & StrictMode',
    phaseBadge: 'Phase 03: React Core',
    tagline: 'Double-invoking renders, side-effect detection, and idempotent execution.',
    icon: GitCompare,
    color: 'var(--purple-accent)'
  },
  {
    id: 'lab-12-render-cycle-stepper',
    number: '12',
    title: 'Render Cycle Timeline Stepper',
    phaseBadge: 'Phase 03: React Core',
    tagline: 'Render vs Commit phase timeline, DOM mutation, and layout effect execution.',
    icon: Activity,
    color: 'var(--emerald-success)'
  },
  {
    id: 'lab-14-fiber-reconciliation',
    number: '14',
    title: 'Fiber Linked-List & Key Diffing',
    phaseBadge: 'Phase 04: Fiber Architecture',
    tagline: 'Cooperative time-slicing, return/child/sibling pointers, and key diffing.',
    icon: GitBranch,
    color: '#38bdf8'
  },
  {
    id: 'lab-19-rsc-flight',
    number: '19',
    title: 'RSC Flight Wire Format Parser',
    phaseBadge: 'Phase 06: Next.js & RSC',
    tagline: 'Streaming Flight chunk protocol, client boundary references, and serialization.',
    icon: Terminal,
    color: '#f472b6'
  },
  {
    id: 'topic-09-architecture',
    number: '09',
    title: 'Architecture & Strangler Fig',
    phaseBadge: 'Phase 09: Enterprise Architecture',
    tagline: 'Domain boundaries, micro-frontends, and Strangler Fig monolith migration.',
    icon: Box,
    color: 'var(--amber-warning, #f59e0b)'
  },
  {
    id: 'topic-10-testing',
    number: '10',
    title: 'Testing Trophy & MSW Mocking',
    phaseBadge: 'Phase 10: Modern Testing',
    tagline: 'Testing pyramid runner, user event interaction, and MSW network mock layer.',
    icon: ShieldCheck,
    color: 'var(--purple-accent, #a855f7)'
  },
  {
    id: 'topic-11-system-design',
    number: '11',
    title: 'System Design Canvas & CRDTs',
    phaseBadge: 'Phase 11: System Design',
    tagline: 'Real-time collaborative canvas, peer nodes, and CRDT state convergence.',
    icon: Network,
    color: 'var(--react-cyan, #0ea5e9)'
  }
];

export const VisualizerHub: React.FC<VisualizerHubProps> = ({ initialLabId }) => {
  const [activeLab, setActiveLab] = useState<string>(initialLabId || 'lab-04-event-loop');

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 216, 255, 0.1)', color: 'var(--react-cyan)', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.6rem' }}>
          <Layers size={15} /> Living Simulation Arena • 12 Active Laboratories
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
          Interactive React & Runtime Laboratories
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: '850px', margin: 0, lineHeight: 1.5 }}>
          Hands-on visual simulators proving the engine mechanics of V8 Event Loop, JSX AST desugaring, StrictMode, Fiber Reconciliation, RSC Flight protocol, and System Design.
        </p>
      </div>

      {/* 2-Column Master-Detail Layout */}
      <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'flex-start' }}>
        {/* Left Vertical Simulation Navigation Panel */}
        <div
          style={{
            width: '320px',
            flexShrink: 0,
            position: 'sticky',
            top: '80px',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '0.85rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem'
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0.3rem 0.6rem 0.4rem 0.6rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.3rem' }}>
            Available Simulations (12)
          </div>

          {LABS_CONFIG.map(lab => {
            const Icon = lab.icon;
            const isSelected = activeLab === lab.id;

            return (
              <button
                key={lab.id}
                onClick={() => setActiveLab(lab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '8px',
                  background: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                  border: isSelected ? '1px solid var(--border-medium)' : '1px solid transparent',
                  borderLeft: isSelected ? `4px solid ${lab.color}` : '4px solid transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                  width: '100%',
                  position: 'relative'
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(2, 132, 199, 0.06)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-primary)',
                    color: lab.color,
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  <Icon size={17} />
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', color: isSelected ? lab.color : 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                    {lab.phaseBadge}
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: isSelected ? 700 : 600, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.3, marginBottom: '3px' }}>
                    {lab.title}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {lab.tagline}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Active Lab Canvas */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {activeLab === 'lab-04-event-loop' && <EventLoopLab />}
          {activeLab === 'lab-10-jsx-compiler' && <JsxCompilerLab />}
          {activeLab === 'lab-11-component-purity' && <ComponentPurityLab />}
          {activeLab === 'lab-12-render-cycle-stepper' && <RenderCycleLab />}
          {activeLab === 'lab-14-fiber-reconciliation' && <FiberReconciliationLab />}
          {activeLab === 'lab-19-rsc-flight' && <RscFlightLab />}
          {activeLab === 'topic-09-architecture' && <ArchitectureLab />}
          {activeLab === 'topic-10-testing' && <TestingLab />}
          {activeLab === 'topic-11-system-design' && <CanvasDesignLab />}
          {activeLab === 'lab-20-memory-retainer' && <MemoryRetainerLab />}
          {activeLab === 'lab-21-query-cache' && <QueryCacheLab />}
          {activeLab === 'lab-22-virtualization' && <VirtualizationLab />}

        </div>
      </div>
    </div>
  );
};
