import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  RotateCcw, 
  ChevronRight, 
  Layers, 
  Zap, 
  Cpu, 
  Clock, 
  Eye, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';

type RenderPhase = 'IDLE' | 'TRIGGER' | 'RENDER' | 'COMMIT_MUTATION' | 'COMMIT_LAYOUT' | 'PAINT' | 'PASSIVE_EFFECTS';

interface TelemetryEntry {
  id: string;
  phase: string;
  durationUs: number;
  timestamp: string;
  detail: string;
  type: 'trigger' | 'v8-render' | 'blink-dom' | 'paint' | 'effect' | 'bailout';
}

export const RenderCycleLab: React.FC = () => {
  // Simulator State
  const [currentVal, setCurrentVal] = useState<number>(0);
  const [targetVal, setTargetVal] = useState<number>(1);
  const [priorityMode, setPriorityMode] = useState<'SyncLane' | 'TransitionLane'>('SyncLane');
  const [activePhase, setActivePhase] = useState<RenderPhase>('IDLE');
  const [autoPlaying, setAutoPlaying] = useState<boolean>(false);
  const [isBailedOut, setIsBailedOut] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<TelemetryEntry[]>([
    {
      id: 'init-0',
      phase: 'Mount Complete',
      durationUs: 420,
      timestamp: '0.000ms',
      detail: 'FiberRootNode allocated with container #root. Event delegation listeners attached.',
      type: 'blink-dom'
    }
  ]);

  // Double Buffering Virtual Trees
  const [currentTree, setCurrentTree] = useState({
    rootText: '0',
    memoizedState: 0,
    domRef: '#text-node-0x10A'
  });
  const [wipTree, setWipTree] = useState<{
    rootText: string;
    pendingState: number;
    flags: string;
    active: boolean;
  }>({
    rootText: '0',
    pendingState: 0,
    flags: 'NoFlags',
    active: false
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addTelemetry = useCallback((
    phase: string, 
    durationUs: number, 
    detail: string, 
    type: TelemetryEntry['type']
  ) => {
    const entry: TelemetryEntry = {
      id: Math.random().toString(36).substring(7),
      phase,
      durationUs,
      timestamp: `${(performance.now() % 10000).toFixed(2)}ms`,
      detail,
      type
    };
    setTelemetry(prev => [entry, ...prev.slice(0, 9)]);
  }, []);

  // Phase Execution Logic
  const startCycle = (nextVal: number) => {
    setTargetVal(nextVal);
    setIsBailedOut(false);
    
    // Step 1: TRIGGER
    setActivePhase('TRIGGER');
    const isIdentical = Object.is(currentVal, nextVal);
    
    if (isIdentical) {
      setIsBailedOut(true);
      addTelemetry(
        '1. Trigger: Object.is Bailout',
        12,
        `Eager Bailout! Object.is(${currentVal}, ${nextVal}) === true. No work enqueued on Fiber. Zero reconciliation!`,
        'bailout'
      );
      setTimeout(() => setActivePhase('IDLE'), 1200);
      return;
    }

    addTelemetry(
      '1. Trigger Phase',
      45,
      `dispatchSetState(${nextVal}) enqueued. Assigned lane: ${priorityMode}. Requesting Scheduler workLoop.`,
      'trigger'
    );
  };

  const advancePhase = useCallback(() => {
    if (activePhase === 'TRIGGER') {
      // Step 2: RENDER (Virtual DOM / Fiber Reconciler)
      setActivePhase('RENDER');
      setWipTree({
        rootText: targetVal.toString(),
        pendingState: targetVal,
        flags: 'Update | Placement',
        active: true
      });
      addTelemetry(
        '2. Render Phase (V8 Heap)',
        210,
        `workLoopSync: App() executed in pure V8 memory. Allocated workInProgress Fiber tree. Computed text diff: "${currentVal}" -> "${targetVal}". Live DOM is untouched!`,
        'v8-render'
      );
    } else if (activePhase === 'RENDER') {
      // Step 3: COMMIT - MUTATION
      setActivePhase('COMMIT_MUTATION');
      addTelemetry(
        '3A. Commit: Mutation Sub-phase',
        130,
        `Synchronously flushed to Blink C++ DOM: textNode.nodeValue = "${targetVal}". fiberRoot.current pointer swapped to WIP in 1 CPU cycle!`,
        'blink-dom'
      );
    } else if (activePhase === 'COMMIT_MUTATION') {
      // Step 4: COMMIT - LAYOUT
      setActivePhase('COMMIT_LAYOUT');
      setCurrentVal(targetVal);
      setCurrentTree({
        rootText: targetVal.toString(),
        memoizedState: targetVal,
        domRef: '#text-node-0x10A'
      });
      setWipTree(prev => ({ ...prev, active: false, flags: 'NoFlags' }));
      addTelemetry(
        '3B. Commit: useLayoutEffect',
        65,
        `useLayoutEffect synchronous callback executed. DOM is mutated in memory, but browser has NOT yet painted pixels.`,
        'blink-dom'
      );
    } else if (activePhase === 'COMMIT_LAYOUT') {
      // Step 5: BROWSER PAINT
      setActivePhase('PAINT');
      addTelemetry(
        '4. Browser Paint (FCP)',
        85,
        `Main thread yielded to Blink. Recalculated styles, executed layout reflow, and GPU rasterized new pixels to display. User sees "${targetVal}"!`,
        'paint'
      );
    } else if (activePhase === 'PAINT') {
      // Step 6: PASSIVE EFFECTS
      setActivePhase('PASSIVE_EFFECTS');
      addTelemetry(
        '5. Passive Effects (useEffect)',
        140,
        `MessageChannel macrotask fired: useEffect callbacks ran asynchronously without blocking the user interface.`,
        'effect'
      );
    } else if (activePhase === 'PASSIVE_EFFECTS') {
      setActivePhase('IDLE');
      setAutoPlaying(false);
    }
  }, [activePhase, targetVal, currentVal, addTelemetry]);

  // Auto-play stepper
  useEffect(() => {
    if (autoPlaying && activePhase !== 'IDLE' && !isBailedOut) {
      timerRef.current = setTimeout(() => {
        advancePhase();
      }, 900);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoPlaying, activePhase, isBailedOut, advancePhase]);

  const resetAll = () => {
    setCurrentVal(0);
    setTargetVal(1);
    setActivePhase('IDLE');
    setAutoPlaying(false);
    setIsBailedOut(false);
    setCurrentTree({
      rootText: '0',
      memoizedState: 0,
      domRef: '#text-node-0x10A'
    });
    setWipTree({
      rootText: '0',
      pendingState: 0,
      flags: 'NoFlags',
      active: false
    });
    setTelemetry([
      {
        id: 'reset',
        phase: 'Reset',
        durationUs: 15,
        timestamp: '0.00ms',
        detail: 'State reset to initial frame. Zero pending lanes.',
        type: 'trigger'
      }
    ]);
  };

  return (
    <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(0, 216, 255, 0.1)', padding: '0.5rem', borderRadius: '8px', color: 'var(--react-cyan)' }}>
            <Zap size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>
              Lab 12: The 3-Phase Render Cycle Stepper
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Step-by-step visualizer tracing Trigger $\rightarrow$ Render (workInProgress) $\rightarrow$ Commit (DOM & Layout) $\rightarrow$ Paint $\rightarrow$ Passive Effects.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => {
              if (activePhase === 'IDLE') {
                startCycle(currentVal + 1);
                setAutoPlaying(true);
              } else {
                setAutoPlaying(!autoPlaying);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              background: autoPlaying ? 'var(--amber-warning)' : 'var(--react-cyan)',
              color: '#000',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            <Play size={15} /> {autoPlaying ? 'Pause Auto' : 'Auto Play Cycle'}
          </button>

          <button
            onClick={resetAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              border: '1px solid var(--border-medium)',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            <RotateCcw size={15} /> Reset
          </button>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        
        {/* Left Column: Interactive Dispatcher & Phase Progress */}
        <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={16} color="var(--react-cyan)" /> State Trigger Controller
          </h4>

          {/* Trigger Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              disabled={activePhase !== 'IDLE'}
              onClick={() => startCycle(currentVal + 1)}
              style={{
                flex: 1,
                padding: '0.6rem 0.8rem',
                borderRadius: '6px',
                background: 'rgba(0, 216, 255, 0.15)',
                color: 'var(--react-cyan)',
                border: '1px solid var(--react-cyan)',
                fontWeight: 700,
                cursor: activePhase !== 'IDLE' ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
                opacity: activePhase !== 'IDLE' ? 0.5 : 1
              }}
            >
              setCount({currentVal + 1}) (New Value)
            </button>

            <button
              disabled={activePhase !== 'IDLE'}
              onClick={() => startCycle(currentVal)}
              style={{
                flex: 1,
                padding: '0.6rem 0.8rem',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--rose-danger)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontWeight: 600,
                cursor: activePhase !== 'IDLE' ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
                opacity: activePhase !== 'IDLE' ? 0.5 : 1
              }}
            >
              setCount({currentVal}) (Same / Bailout)
            </button>
          </div>

          {/* Priority Lane Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Scheduler Priority Lane
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setPriorityMode('SyncLane')}
                style={{
                  flex: 1,
                  padding: '0.35rem',
                  borderRadius: '6px',
                  background: priorityMode === 'SyncLane' ? 'var(--blue-active)' : 'var(--bg-secondary)',
                  color: priorityMode === 'SyncLane' ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                SyncLane (Discrete Input)
              </button>
              <button
                onClick={() => setPriorityMode('TransitionLane')}
                style={{
                  flex: 1,
                  padding: '0.35rem',
                  borderRadius: '6px',
                  background: priorityMode === 'TransitionLane' ? 'var(--purple-accent)' : 'var(--bg-secondary)',
                  color: priorityMode === 'TransitionLane' ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                TransitionLane (startTransition)
              </button>
            </div>
          </div>

          {/* Step Manual Controller */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <button
              disabled={activePhase === 'IDLE' || autoPlaying || isBailedOut}
              onClick={advancePhase}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '6px',
                background: activePhase === 'IDLE' || autoPlaying || isBailedOut ? 'var(--bg-secondary)' : 'var(--emerald-success)',
                color: activePhase === 'IDLE' || autoPlaying || isBailedOut ? 'var(--text-muted)' : '#000',
                border: '1px solid var(--border-medium)',
                fontWeight: 700,
                cursor: activePhase === 'IDLE' || autoPlaying || isBailedOut ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}
            >
              Step to Next Sub-Phase <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Right Column: 5-Stage Phase Progress Stepper */}
        <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={16} color="var(--purple-accent)" /> 5-Stage Engine Pipeline
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { id: 'TRIGGER', label: '1. Trigger (dispatchSetState)', desc: 'Eager Bailout check & Lane queuing' },
              { id: 'RENDER', label: '2. Render Phase (V8 Heap)', desc: 'Component calls, WIP Fiber tree & child diffing' },
              { id: 'COMMIT_MUTATION', label: '3A. Commit: Mutation', desc: 'Surgical Blink C++ DOM injection & pointer swap' },
              { id: 'COMMIT_LAYOUT', label: '3B. Commit: useLayoutEffect', desc: 'Synchronous layout effects before paint' },
              { id: 'PAINT', label: '4. First Browser Paint', desc: 'Blink Layout, GPU rasterization & pixels on screen' },
              { id: 'PASSIVE_EFFECTS', label: '5. Passive Effects (useEffect)', desc: 'Async MessageChannel callbacks after paint' }
            ].map(stage => {
              const isActive = activePhase === stage.id;
              return (
                <div
                  key={stage.id}
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    background: isActive ? 'rgba(0, 216, 255, 0.12)' : 'var(--bg-secondary)',
                    border: isActive ? '1px solid var(--react-cyan)' : '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--react-cyan)' : 'var(--text-primary)' }}>
                      {stage.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {stage.desc}
                    </div>
                  </div>
                  {isActive && (
                    <span style={{ fontSize: '0.7rem', background: 'var(--react-cyan)', color: '#000', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 800 }}>
                      ACTIVE
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Double Buffering Fiber Inspection Panel */}
      <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={16} color="var(--amber-warning)" /> Double Buffering Topology: Current vs. WorkInProgress Fibers
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center' }}>
          {/* Current Tree */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(39, 174, 96, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-success)' }}>
                CURRENT FIBER TREE (Screen)
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                fiberRoot.current
              </span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: '1.4' }}>
              <div>tag: HostComponent ('h1')</div>
              <div>memoizedProps.children: "{currentTree.rootText}"</div>
              <div>memoizedState: {currentTree.memoizedState}</div>
              <div>stateNode: <span style={{ color: 'var(--react-cyan)' }}>{currentTree.domRef}</span></div>
            </div>
          </div>

          {/* Pointer Swap Arrow */}
          <div style={{ textAlign: 'center', color: activePhase === 'COMMIT_MUTATION' ? 'var(--amber-warning)' : 'var(--text-muted)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.2rem' }}>
              {activePhase === 'COMMIT_MUTATION' ? 'POINTER SWAP!' : 'alternate'}
            </div>
            <ArrowRight size={24} />
          </div>

          {/* WorkInProgress Tree */}
          <div style={{ 
            background: 'var(--bg-secondary)', 
            padding: '1rem', 
            borderRadius: '8px', 
            border: wipTree.active ? '1px dashed var(--react-cyan)' : '1px solid var(--border-medium)',
            opacity: wipTree.active ? 1 : 0.5 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: wipTree.active ? 'var(--react-cyan)' : 'var(--text-muted)' }}>
                WORK-IN-PROGRESS TREE (Heap Scratchpad)
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                flags: {wipTree.flags}
              </span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: '1.4' }}>
              <div>tag: HostComponent ('h1')</div>
              <div>pendingProps.children: "{wipTree.rootText}"</div>
              <div>pendingState: {wipTree.pendingState}</div>
              <div>status: {wipTree.active ? 'Reconciling in V8 Heap...' : 'Idle / Inactive'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Blink DOM Screen Simulation */}
      <div style={{ background: '#070b14', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <Eye size={14} /> Physical Chromium Display Screen (Blink C++ Framebuffer)
        </div>
        <div style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: '0.5rem 0' }}>
          {currentVal}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Physical DOM Node: &lt;h1 id="counter"&gt;{currentVal}&lt;/h1&gt;
        </div>
      </div>

      {/* Telemetry Microsecond Stream */}
      <div>
        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Clock size={15} /> Real-time Execution Telemetry Console (Microsecond Timestamps)
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {telemetry.map(entry => {
            let badgeBg = 'rgba(0, 216, 255, 0.1)';
            let badgeColor = 'var(--react-cyan)';
            if (entry.type === 'bailout') {
              badgeBg = 'rgba(239, 68, 68, 0.15)';
              badgeColor = 'var(--rose-danger)';
            } else if (entry.type === 'blink-dom') {
              badgeBg = 'rgba(39, 174, 96, 0.15)';
              badgeColor = 'var(--emerald-success)';
            } else if (entry.type === 'paint') {
              badgeBg = 'rgba(245, 158, 11, 0.15)';
              badgeColor = 'var(--amber-warning)';
            }

            return (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'var(--bg-tertiary)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace'
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', minWidth: '70px' }}>
                  {entry.timestamp}
                </span>
                <span style={{ background: badgeBg, color: badgeColor, padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem', minWidth: '150px' }}>
                  {entry.phase}
                </span>
                <span style={{ color: 'var(--text-secondary)', flex: 1 }}>
                  {entry.detail}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {entry.durationUs}μs
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
