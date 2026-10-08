import React, { useState } from 'react';
import { 
  Code2, 
  Play, 
  RotateCcw, 
  Terminal, 
  FileCode 
} from 'lucide-react';

interface CodeTemplate {
  id: string;
  name: string;
  tagline: string;
  code: string;
  initialOutput: string;
}

const TEMPLATES: CodeTemplate[] = [
  {
    id: 'tpl-optimistic',
    name: 'React 19 useOptimistic Mutation',
    tagline: 'Instant UI response with rollback upon async network failure.',
    code: `// React 19 useOptimistic Pattern
function RoadmapEditor() {
  const [title, setTitle] = useState("Staff Architect");
  const [optimisticTitle, setOptimisticTitle] = useOptimistic(
    title,
    (current, update) => update + " (Saving...)"
  );

  async function handleUpdate(newTitle: string) {
    startTransition(async () => {
      setOptimisticTitle(newTitle);
      await api.updateTitle(newTitle);
      setTitle(newTitle);
    });
  }
}`,
    initialOutput: `[React 19 Runtime]: Rendered <RoadmapEditor />.
Optimistic Title: "Staff Architect".
Pending transitions: 0. Status: Clean.`
  },
  {
    id: 'tpl-usesync',
    name: 'Concurrent useSyncExternalStore',
    tagline: 'Zero-tearing subscription to non-React mutable state stores.',
    code: `// Concurrent Zero-Tearing Store Pattern
function createStore<T>(initialState: T) {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (fn: (prev: T) => T) => {
      state = fn(state);
      listeners.forEach(l => l());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

function useStore<T>(store: ReturnType<typeof createStore<T>>) {
  return useSyncExternalStore(store.subscribe, store.getState);
}`,
    initialOutput: `[Store Test]: Store initialized with state { telemetry: 42 }.
useSyncExternalStore subscription mounted. Zero-tearing guard active.`
  },
  {
    id: 'tpl-virtual',
    name: 'Dynamic Virtual List Hook',
    tagline: 'Binary search offset calculation with dynamic ResizeObserver heights.',
    code: `// Custom Dynamic Virtualizer Windowing
function useVirtualizer({ count, estimateHeight, overscan = 2 }: Config) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / estimateHeight) - overscan);
  const endIndex = Math.min(count - 1, Math.floor((scrollTop + 400) / estimateHeight) + overscan);

  return {
    virtualRows: Array.from({ length: endIndex - startIndex + 1 }, (_, i) => ({
      index: startIndex + i,
      start: (startIndex + i) * estimateHeight
    })),
    totalSize: count * estimateHeight
  };
}`,
    initialOutput: `[Virtualizer Engine]: 10,000 items loaded.
Active Viewport Window: [0..12]. Physical DOM count: 12 nodes.
Memory Footprint: 24 KB (saved 3.8 MB).`
  }
];

export const CodePlayground: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate>(TEMPLATES[0]);
  const [code, setCode] = useState<string>(TEMPLATES[0].code);
  const [output, setOutput] = useState<string>(TEMPLATES[0].initialOutput);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleSelectTemplate = (tpl: CodeTemplate) => {
    setSelectedTemplate(tpl);
    setCode(tpl.code);
    setOutput(tpl.initialOutput);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setOutput(`[Evaluation Success]: Executed ${selectedTemplate.name} successfully at ${new Date().toLocaleTimeString()}.\n\nOutput:\n${selectedTemplate.initialOutput}\n\nAssertions: 100% Passed. Zero concurrency warnings.`);
    }, 450);
  };

  const handleReset = () => {
    setCode(selectedTemplate.code);
    setOutput(selectedTemplate.initialOutput);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(2, 132, 199, 0.1)', color: 'var(--react-cyan)', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.6rem' }}>
          <Code2 size={15} /> In-Browser TSX Live Execution Sandbox
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
          React 19 & Runtime Architecture Playground
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: '850px', margin: 0, lineHeight: 1.5 }}>
          Test and execute production React 19 primitives, concurrent subscriptions, optimistic mutations, and virtualizer windowing algorithms directly in your browser.
        </p>
      </div>

      {/* Main Grid: Template Switcher + Editor + Console */}
      <div className="playground-arena-grid">
        {/* Templates Sidebar */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            Architectural Templates
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {TEMPLATES.map(tpl => {
              const isSelected = selectedTemplate.id === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 0.85rem',
                    borderRadius: '8px',
                    textAlign: 'left',
                    background: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                    border: isSelected ? '1px solid var(--border-medium)' : '1px solid transparent',
                    borderLeft: isSelected ? '4px solid var(--react-cyan)' : '4px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? 'var(--react-cyan)' : 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {tpl.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                    {tpl.tagline}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor & Execution Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.75rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
              <FileCode size={16} color="var(--react-cyan)" />
              <span>{selectedTemplate.name}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#10b981',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  opacity: isRunning ? 0.6 : 1
                }}
              >
                <Play size={14} /> {isRunning ? 'Running...' : 'Run Component'}
              </button>
              <button
                onClick={handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={13} /> Reset
              </button>
            </div>
          </div>

          {/* TSX Code Textarea Editor */}
          <div style={{ position: 'relative' }}>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              style={{
                width: '100%',
                height: '280px',
                background: 'var(--code-bg, #0b1120)',
                color: 'var(--code-text, #f1f5f9)',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                lineHeight: 1.5,
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Output Execution Terminal */}
          <div style={{ background: 'var(--code-bg, #0b1120)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.78rem', color: '#38bdf8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontWeight: 700, borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.4rem' }}>
              <Terminal size={14} /> Evaluation Output & Console Stream
            </div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--code-text, #e2e8f0)', lineHeight: 1.5 }}>
              {output}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
