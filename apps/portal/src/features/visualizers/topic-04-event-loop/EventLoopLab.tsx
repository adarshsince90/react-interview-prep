import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  RotateCcw, 
  Cpu, 
  Zap, 
  Layers, 
  AlertTriangle, 
  Timer, 
  FastForward, 
  ShieldAlert, 
  Activity 
} from 'lucide-react';

interface QueueItem {
  id: string;
  name: string;
  source: 'microtask' | 'macrotask' | 'raf' | 'heavy-cpu';
  payload?: string;
  durationMs?: number;
}

interface ExecutionLog {
  id: string;
  lane: 'STACK' | 'MICRO' | 'RENDER' | 'MACRO';
  message: string;
  timestamp: number;
}

export const EventLoopLab: React.FC = () => {
  // 4 Lanes
  const [callStack, setCallStack] = useState<QueueItem | null>(null);
  const [microtasks, setMicrotasks] = useState<QueueItem[]>([]);
  const [macrotasks, setMacrotasks] = useState<QueueItem[]>([]);
  const [rafCallbacks, setRafCallbacks] = useState<QueueItem[]>([]);

  // Telemetry & Indicators
  const [fps, setFps] = useState<number>(60);
  const [inpMs, setInpMs] = useState<number>(12);
  const [isStarving, setIsStarving] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stepCount, setStepCount] = useState<number>(0);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);

  // Simulation timers
  const timerRef = useRef<number | null>(null);
  const starvationRef = useRef<boolean>(false);

  useEffect(() => {
    starvationRef.current = isStarving;
  }, [isStarving]);

  const logEvent = (lane: ExecutionLog['lane'], message: string) => {
    setLogs(prev => [
      { id: Math.random().toString(36).substring(7), lane, message, timestamp: Date.now() },
      ...prev.slice(0, 19)
    ]);
  };

  // Add tasks
  const addMicrotask = (name = 'Promise.then() callback') => {
    const item: QueueItem = {
      id: Math.random().toString(36).substring(7),
      name,
      source: 'microtask',
      durationMs: 4
    };
    setMicrotasks(prev => [...prev, item]);
    logEvent('MICRO', `Enqueued microtask: ${name}`);
  };

  const addMacrotask = (name = 'setTimeout(..., 0)') => {
    const item: QueueItem = {
      id: Math.random().toString(36).substring(7),
      name,
      source: 'macrotask',
      durationMs: 8
    };
    setMacrotasks(prev => [...prev, item]);
    logEvent('MACRO', `Enqueued macrotask: ${name}`);
  };

  const addRaf = (name = 'requestAnimationFrame()') => {
    const item: QueueItem = {
      id: Math.random().toString(36).substring(7),
      name,
      source: 'raf',
      durationMs: 6
    };
    setRafCallbacks(prev => [...prev, item]);
    logEvent('RENDER', `Scheduled rAF callback: ${name}`);
  };

  const addHeavyTask = () => {
    const item: QueueItem = {
      id: Math.random().toString(36).substring(7),
      name: 'Sync Heavy Computation (120ms blocking)',
      source: 'heavy-cpu',
      durationMs: 120
    };
    setCallStack(item);
    setFps(8);
    setInpMs(148);
    logEvent('STACK', '⚠️ Main thread blocked by synchronous heavy computation! FPS dropped to 8.');
    setTimeout(() => {
      setCallStack(null);
      setFps(60);
      setInpMs(14);
      logEvent('STACK', 'Heavy computation completed. Main thread unblocked.');
    }, 1200);
  };

  // Step event loop execution
  const stepEventLoop = useCallback(() => {
    setStepCount(c => c + 1);

    // Rule 1: Call Stack must be empty first
    if (callStack) {
      logEvent('STACK', `Draining Call Stack: ${callStack.name}`);
      setCallStack(null);
      return;
    }

    // Rule 2: Exhaustive Microtask Queue Drain (Highest Priority)
    if (microtasks.length > 0) {
      const nextMicro = microtasks[0];
      setCallStack(nextMicro);
      setMicrotasks(prev => prev.slice(1));
      logEvent('MICRO', `Dequeued microtask into Stack: ${nextMicro.name}`);

      // If starvation mode is enabled, constantly spawn new microtasks
      if (starvationRef.current) {
        setTimeout(() => {
          addMicrotask('Infinite queueMicrotask() recursive call');
        }, 100);
      }
      return;
    }

    // Rule 3: Render Gate (rAF -> Style -> Layout -> Paint)
    if (rafCallbacks.length > 0) {
      const nextRaf = rafCallbacks[0];
      setCallStack(nextRaf);
      setRafCallbacks(prev => prev.slice(1));
      logEvent('RENDER', `Render Gate V-Sync: Executing ${nextRaf.name}`);
      return;
    }

    // Rule 4: Single Macrotask Execution (Turn of the Event Loop)
    if (macrotasks.length > 0) {
      const nextMacro = macrotasks[0];
      setCallStack(nextMacro);
      setMacrotasks(prev => prev.slice(1));
      logEvent('MACRO', `Event loop turn: Dequeued macrotask into Stack: ${nextMacro.name}`);
      return;
    }

    logEvent('STACK', 'Event Loop is IDLE. Awaiting events from browser IPC or timers.');
  }, [callStack, microtasks, rafCallbacks, macrotasks]);

  // Auto-run loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        stepEventLoop();
      }, 700);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, stepEventLoop]);

  // Reset simulator
  const handleReset = () => {
    setIsRunning(false);
    setIsStarving(false);
    setCallStack(null);
    setMicrotasks([]);
    setMacrotasks([]);
    setRafCallbacks([]);
    setFps(60);
    setInpMs(12);
    setLogs([]);
    setStepCount(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner & Telemetry */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Activity style={{ color: 'var(--react-cyan)' }} size={20} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Browser 4-Lane Event Loop & INP Telemetry Simulator
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Watch the V8 Call Stack, exhaustive Microtask drain, 16.6ms Render Gate, and Macrotask queue scheduling.
          </p>
        </div>

        {/* Meters */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            background: 'var(--bg-primary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Frame Rate</div>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: fps >= 50 ? 'var(--emerald-success, #10b981)' : fps >= 30 ? 'var(--amber-warning, #f59e0b)' : 'var(--rose-danger, #f43f5e)'
            }}>
              {fps} FPS
            </div>
          </div>

          <div style={{
            background: 'var(--bg-primary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>INP Latency</div>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: inpMs <= 50 ? 'var(--emerald-success, #10b981)' : inpMs <= 200 ? 'var(--amber-warning, #f59e0b)' : 'var(--rose-danger, #f43f5e)'
            }}>
              {inpMs} ms
            </div>
          </div>

          <div style={{
            background: 'var(--bg-primary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Ticks</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {stepCount}
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
        background: 'var(--bg-secondary)',
        padding: '1rem',
        borderRadius: '10px',
        border: '1px solid var(--border-subtle)'
      }}>
        <button
          onClick={() => setIsRunning(!isRunning)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: isRunning ? 'var(--amber-warning, #f59e0b)' : 'var(--react-cyan)',
            color: '#000',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Play size={16} /> {isRunning ? 'Pause Loop' : 'Auto-Run Loop'}
        </button>

        <button
          onClick={stepEventLoop}
          disabled={isRunning}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            border: '1px solid var(--border-medium)',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          <FastForward size={16} /> Single Tick
        </button>

        <button
          onClick={() => addMicrotask()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.9rem',
            borderRadius: '6px',
            background: 'rgba(168, 85, 247, 0.15)',
            color: '#c084fc',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          <Zap size={14} /> + Queue Microtask
        </button>

        <button
          onClick={() => addMacrotask()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.9rem',
            borderRadius: '6px',
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          <Timer size={14} /> + Queue Macrotask
        </button>

        <button
          onClick={() => addRaf()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.9rem',
            borderRadius: '6px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          <Layers size={14} /> + Schedule rAF
        </button>

        <button
          onClick={addHeavyTask}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.9rem',
            borderRadius: '6px',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          <Cpu size={14} /> Trigger 120ms Heavy CPU
        </button>

        <button
          onClick={() => {
            const next = !isStarving;
            setIsStarving(next);
            if (next) {
              addMicrotask('Infinite queueMicrotask() seed');
              logEvent('MICRO', '🚨 Microtask Starvation Loop ACTIVATED! The event loop will never reach Render Gate or Macrotasks.');
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.9rem',
            borderRadius: '6px',
            background: isStarving ? 'var(--rose-danger, #f43f5e)' : 'var(--bg-tertiary)',
            color: isStarving ? '#fff' : 'var(--text-secondary)',
            border: '1px solid var(--border-medium)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          <ShieldAlert size={14} /> {isStarving ? 'Starvation Loop Active!' : 'Test Microtask Starvation'}
        </button>

        <button
          onClick={handleReset}
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.8rem',
            borderRadius: '6px',
            background: 'transparent',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* 4 Execution Lanes Visualizer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        {/* Lane 1: Call Stack */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '2px solid var(--border-medium)',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>1. Call Stack (V8)</span>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '12px',
              background: callStack ? 'rgba(0, 216, 255, 0.15)' : 'var(--bg-tertiary)',
              color: callStack ? 'var(--react-cyan)' : 'var(--text-muted)',
              fontWeight: 600
            }}>
              {callStack ? 'EXECUTING' : 'EMPTY'}
            </span>
          </div>
          <div style={{
            flex: 1,
            minHeight: '130px',
            background: 'var(--bg-primary)',
            borderRadius: '8px',
            border: '1px dashed var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.75rem'
          }}>
            {callStack ? (
              <div style={{
                background: callStack.source === 'heavy-cpu' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 216, 255, 0.15)',
                border: callStack.source === 'heavy-cpu' ? '1px solid var(--rose-danger, #f43f5e)' : '1px solid var(--react-cyan)',
                borderRadius: '6px',
                padding: '0.75rem',
                width: '100%',
                textAlign: 'center',
                animation: 'pulse 1s infinite'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{callStack.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Source: {callStack.source.toUpperCase()} ({callStack.durationMs}ms)
                </div>
              </div>
            ) : (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Stack is clear</span>
            )}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: 0 }}>
            Synchronous stack frames run run-to-completion before any queue is consulted.
          </p>
        </div>

        {/* Lane 2: Microtask Queue */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '2px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#c084fc' }}>2. Microtasks</span>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '12px',
              background: 'rgba(168, 85, 247, 0.15)',
              color: '#c084fc',
              fontWeight: 600
            }}>
              {microtasks.length} pending
            </span>
          </div>
          <div style={{
            flex: 1,
            minHeight: '130px',
            background: 'var(--bg-primary)',
            borderRadius: '8px',
            border: '1px dashed rgba(168, 85, 247, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            padding: '0.5rem',
            overflowY: 'auto',
            maxHeight: '150px'
          }}>
            {microtasks.length > 0 ? (
              microtasks.map((item, idx) => (
                <div key={item.id} style={{
                  background: 'rgba(168, 85, 247, 0.12)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '4px',
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.78rem',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{idx + 1}. {item.name}</span>
                  <span style={{ color: '#c084fc', fontSize: '0.7rem' }}>O(1) FIFO</span>
                </div>
              ))
            ) : (
              <div style={{ margin: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Microtasks empty</div>
            )}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: 0 }}>
            Drained <strong>exhaustively</strong> until empty before the browser can render.
          </p>
        </div>

        {/* Lane 3: Render Gate */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '2px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#34d399' }}>3. Render Gate (16.6ms)</span>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              fontWeight: 600
            }}>
              {rafCallbacks.length} rAF
            </span>
          </div>
          <div style={{
            flex: 1,
            minHeight: '130px',
            background: 'var(--bg-primary)',
            borderRadius: '8px',
            border: '1px dashed rgba(16, 185, 129, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            padding: '0.5rem',
            overflowY: 'auto',
            maxHeight: '150px'
          }}>
            {rafCallbacks.length > 0 ? (
              rafCallbacks.map((item, idx) => (
                <div key={item.id} style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '4px',
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.78rem',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{idx + 1}. {item.name}</span>
                  <span style={{ color: '#34d399', fontSize: '0.7rem' }}>rAF</span>
                </div>
              ))
            ) : (
              <div style={{ margin: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>No animation tasks</div>
            )}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: 0 }}>
            Syncs with display hardware V-Sync. Executes rAF → Recalculate Style → Layout → Paint.
          </p>
        </div>

        {/* Lane 4: Macrotasks (Task Queue) */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '2px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#60a5fa' }}>4. Macrotask Queue</span>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              fontWeight: 600
            }}>
              {macrotasks.length} tasks
            </span>
          </div>
          <div style={{
            flex: 1,
            minHeight: '130px',
            background: 'var(--bg-primary)',
            borderRadius: '8px',
            border: '1px dashed rgba(59, 130, 246, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            padding: '0.5rem',
            overflowY: 'auto',
            maxHeight: '150px'
          }}>
            {macrotasks.length > 0 ? (
              macrotasks.map((item, idx) => (
                <div key={item.id} style={{
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '4px',
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.78rem',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{idx + 1}. {item.name}</span>
                  <span style={{ color: '#60a5fa', fontSize: '0.7rem' }}>Task</span>
                </div>
              ))
            ) : (
              <div style={{ margin: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Macrotasks empty</div>
            )}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: 0 }}>
            Picks <strong>EXACTLY ONE</strong> task per event loop tick, then yields back to microtasks & rendering.
          </p>
        </div>

      </div>

      {/* Starvation Warning Callout */}
      {isStarving && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--rose-danger, #f43f5e)',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertTriangle style={{ color: 'var(--rose-danger, #f43f5e)', flexShrink: 0 }} size={24} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--rose-danger, #f43f5e)', fontSize: '0.9rem' }}>
              Microtask Starvation in Progress (UI Thread Hang)
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Because the microtask queue drains exhaustively, recursively enqueueing microtasks completely blocks the browser from reaching the Render Gate. The user interface freezes, frames drop to 0, and the browser displays the "Page Unresponsive" dialog.
            </div>
          </div>
        </div>
      )}

      {/* Execution Telemetry Feed */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: '10px',
        padding: '1rem'
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Real-Time Event Loop Telemetry Feed
        </div>
        <div style={{
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: '0.8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          maxHeight: '140px',
          overflowY: 'auto',
          background: 'var(--bg-primary)',
          padding: '0.75rem',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)'
        }}>
          {logs.length > 0 ? (
            logs.map(log => (
              <div key={log.id} style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{
                  color: log.lane === 'STACK' ? 'var(--react-cyan)' : log.lane === 'MICRO' ? '#c084fc' : log.lane === 'RENDER' ? '#34d399' : '#60a5fa',
                  fontWeight: 700
                }}>
                  [{log.lane}]
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>{log.message}</span>
              </div>
            ))
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Press "Single Tick" or "Auto-Run Loop" to inspect event stream.</span>
          )}
        </div>
      </div>
    </div>
  );
};
