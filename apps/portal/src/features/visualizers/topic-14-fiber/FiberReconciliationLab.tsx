import React, { useState } from 'react';
import { 
  GitBranch, 
  RotateCcw, 
  Play, 
  FastForward, 
  AlertCircle, 
  CheckCircle2, 
  Code2 
} from 'lucide-react';

interface ListItem {
  id: string;
  label: string;
  color: string;
  persistedText: string;
}

export const FiberReconciliationLab: React.FC = () => {
  // Scenario configuration
  const [keyStrategy, setKeyStrategy] = useState<'stable-keys' | 'index-keys'>('stable-keys');

  // List data state
  const initialItems: ListItem[] = [
    { id: 'item-A', label: 'Item A (Red)', color: '#ef4444', persistedText: 'Local text in A' },
    { id: 'item-B', label: 'Item B (Blue)', color: '#3b82f6', persistedText: 'Local text in B' },
    { id: 'item-C', label: 'Item C (Green)', color: '#10b981', persistedText: 'Local text in C' },
    { id: 'item-D', label: 'Item D (Amber)', color: '#f59e0b', persistedText: 'Local text in D' }
  ];

  const reorderedItems: ListItem[] = [
    { id: 'item-B', label: 'Item B (Blue)', color: '#3b82f6', persistedText: '' },
    { id: 'item-A', label: 'Item A (Red)', color: '#ef4444', persistedText: '' },
    { id: 'item-D', label: 'Item D (Amber)', color: '#f59e0b', persistedText: '' },
    { id: 'item-C', label: 'Item C (Green)', color: '#10b981', persistedText: '' }
  ];

  const [currentList, setCurrentList] = useState<ListItem[]>(initialItems);
  const [isReordered, setIsReordered] = useState<boolean>(false);

  // Fiber traversal nodes
  const fiberNodes = [
    { id: 'root', name: 'HostRootFiber', type: 'root', tag: 'FiberRoot', child: 'App', sibling: null, returnNode: null },
    { id: 'App', name: 'AppFiber', type: 'component', tag: 'FunctionComponent', child: 'TodoList', sibling: null, returnNode: 'HostRoot' },
    { id: 'TodoList', name: 'TodoListFiber', type: 'component', tag: 'FunctionComponent', child: 'Item-0', sibling: null, returnNode: 'App' },
    { id: 'Item-0', name: 'ItemFiber [B]', type: 'element', tag: 'HostComponent', child: null, sibling: 'Item-1', returnNode: 'TodoList' },
    { id: 'Item-1', name: 'ItemFiber [A]', type: 'element', tag: 'HostComponent', child: null, sibling: 'Item-2', returnNode: 'TodoList' },
    { id: 'Item-2', name: 'ItemFiber [D]', type: 'element', tag: 'HostComponent', child: null, sibling: 'Item-3', returnNode: 'TodoList' },
    { id: 'Item-3', name: 'ItemFiber [C]', type: 'element', tag: 'HostComponent', child: null, sibling: null, returnNode: 'TodoList' }
  ];

  const [activeFiberIndex, setActiveFiberIndex] = useState<number>(0);

  const handleToggleReorder = () => {
    if (!isReordered) {
      if (keyStrategy === 'index-keys') {
        // With index keys, React maps by index: 0->0, 1->1, 2->2, 3->3
        // So the DOM input text stays attached to the slot index, creating state bleed!
        const bleedItems = reorderedItems.map((item, idx) => ({
          ...item,
          persistedText: currentList[idx]?.persistedText || ''
        }));
        setCurrentList(bleedItems);
      } else {
        // With stable keys, React tracks item by id, preserving its exact identity
        const stableItems = reorderedItems.map(item => ({
          ...item,
          persistedText: initialItems.find(orig => orig.id === item.id)?.persistedText || ''
        }));
        setCurrentList(stableItems);
      }
      setIsReordered(true);
    } else {
      setCurrentList(initialItems);
      setIsReordered(false);
    }
  };

  const handleStepFiber = () => {
    setActiveFiberIndex(prev => (prev + 1) % fiberNodes.length);
  };

  const currentActiveFiber = fiberNodes[activeFiberIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
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
            <GitBranch style={{ color: 'var(--react-cyan)' }} size={20} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              React Fiber Work Loop & Reconciliation Diffing Visualizer
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Investigate why <code>key={`{index}`}</code> causes state-bleed bugs and step through Fiber linked-list work loop traversal.
          </p>
        </div>

        {/* Strategy Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.35rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => { setKeyStrategy('stable-keys'); setCurrentList(initialItems); setIsReordered(false); }}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              background: keyStrategy === 'stable-keys' ? 'rgba(0, 216, 255, 0.15)' : 'transparent',
              color: keyStrategy === 'stable-keys' ? 'var(--react-cyan)' : 'var(--text-secondary)',
              border: keyStrategy === 'stable-keys' ? '1px solid var(--react-cyan)' : '1px solid transparent',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            Stable Keys (id)
          </button>
          <button
            onClick={() => { setKeyStrategy('index-keys'); setCurrentList(initialItems); setIsReordered(false); }}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              background: keyStrategy === 'index-keys' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              color: keyStrategy === 'index-keys' ? 'var(--rose-danger, #f43f5e)' : 'var(--text-secondary)',
              border: keyStrategy === 'index-keys' ? '1px solid var(--rose-danger, #f43f5e)' : '1px solid transparent',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            Array Index as Key (Antipattern)
          </button>
        </div>
      </div>

      {/* Part 1: Interactive List Diffing & State Bleed Showcase */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: '10px',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              1. Child Reconciliation & State Retention Matrix
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Simulates list reordering from <code>[A, B, C, D]</code> to <code>[B, A, D, C]</code>.
            </span>
          </div>

          <button
            onClick={handleToggleReorder}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              background: 'var(--react-cyan)',
              color: '#000',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {isReordered ? <RotateCcw size={16} /> : <Play size={16} />}
            {isReordered ? 'Reset List Order' : 'Trigger Re-order [B, A, D, C]'}
          </button>
        </div>

        {/* Status Callout */}
        <div style={{
          background: keyStrategy === 'stable-keys' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${keyStrategy === 'stable-keys' ? 'var(--emerald-success, #10b981)' : 'var(--rose-danger, #f43f5e)'}`,
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          {keyStrategy === 'stable-keys' ? (
            <CheckCircle2 style={{ color: 'var(--emerald-success, #10b981)' }} size={20} />
          ) : (
            <AlertCircle style={{ color: 'var(--rose-danger, #f43f5e)' }} size={20} />
          )}
          <div style={{ fontSize: '0.85rem' }}>
            {keyStrategy === 'stable-keys' ? (
              <span style={{ color: 'var(--emerald-success, #10b981)', fontWeight: 600 }}>
                Stable Keys Active: React maps by <code>key="item-X"</code>. Internal DOM input values follow their true elements.
              </span>
            ) : (
              <span style={{ color: 'var(--rose-danger, #f43f5e)', fontWeight: 600 }}>
                Index as Key Antipattern Active: React reconciles by index (0, 1, 2, 3). Internal state stays anchored to slot positions, causing severe state bleed!
              </span>
            )}
          </div>
        </div>

        {/* Rendered Elements List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.75rem' }}>
          {currentList.map((item, index) => (
            <div key={keyStrategy === 'stable-keys' ? item.id : index} style={{
              background: 'var(--bg-primary)',
              border: `2px solid ${item.color}`,
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{item.label}</span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.4rem',
                  borderRadius: '4px',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-muted)'
                }}>
                  key={keyStrategy === 'stable-keys' ? `"${item.id}"` : `{${index}}`}
                </span>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Uncontrolled Input State:
                </label>
                <input
                  type="text"
                  value={item.persistedText}
                  onChange={(e) => {
                    const text = e.target.value;
                    setCurrentList(prev => prev.map((it, idx) => idx === index ? { ...it, persistedText: text } : it));
                  }}
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.5rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '4px',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Slot Index: <strong>[{index}]</strong> | Element ID: <strong>{item.id}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Part 2: Fiber Linked-List Work Loop Visualizer */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: '10px',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              2. Fiber Tree Pointer Traversal (performUnitOfWork)
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Step through the DFS work loop walking <code>child</code> $\rightarrow$ <code>sibling</code> $\rightarrow$ <code>return</code> pointers.
            </span>
          </div>

          <button
            onClick={handleStepFiber}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-medium)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <FastForward size={16} /> Step Work Loop (Node {activeFiberIndex + 1}/{fiberNodes.length})
          </button>
        </div>

        {/* Fiber Node Inspector Card */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Active Node Details */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Code2 style={{ color: 'var(--react-cyan)' }} size={18} />
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                Active Unit of Work: {currentActiveFiber.name}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', fontFamily: 'Consolas, monospace' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>fiber.tag:</span>
                <span style={{ color: 'var(--react-cyan)' }}>{currentActiveFiber.tag}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>fiber.child:</span>
                <span style={{ color: '#c084fc' }}>{currentActiveFiber.child ? `Pointer -> ${currentActiveFiber.child}` : 'null (Leaf Node)'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>fiber.sibling:</span>
                <span style={{ color: '#34d399' }}>{currentActiveFiber.sibling ? `Pointer -> ${currentActiveFiber.sibling}` : 'null (No Brother)'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>fiber.return:</span>
                <span style={{ color: '#60a5fa' }}>{currentActiveFiber.returnNode ? `Pointer -> ${currentActiveFiber.returnNode}` : 'null (Root)'}</span>
              </div>
            </div>
          </div>

          {/* Traversal State Flow */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '8px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Reconciliation Phase Action:
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {currentActiveFiber.child ? (
                <>
                  <code>beginWork()</code> completes. Because child exists (<code>{currentActiveFiber.child}</code>), the work loop dives deeper to process the child next.
                </>
              ) : currentActiveFiber.sibling ? (
                <>
                  Leaf node reached! <code>completeWork()</code> executes. Traversal hops across to sibling pointer (<code>{currentActiveFiber.sibling}</code>).
                </>
              ) : (
                <>
                  End of branch! <code>completeWork()</code> bubbles up the <code>return</code> pointer to complete parent fiber.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Fiber Nodes Chain */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginTop: '1rem', paddingBottom: '0.5rem' }}>
          {fiberNodes.map((node, idx) => {
            const isActive = idx === activeFiberIndex;
            return (
              <div key={node.id} style={{
                background: isActive ? 'rgba(0, 216, 255, 0.15)' : 'var(--bg-primary)',
                border: isActive ? '2px solid var(--react-cyan)' : '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '0.5rem 0.75rem',
                fontSize: '0.78rem',
                flexShrink: 0,
                textAlign: 'center',
                transition: 'all 0.2s'
              }}>
                <div style={{ fontWeight: 700, color: isActive ? 'var(--react-cyan)' : 'var(--text-primary)' }}>
                  {node.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {node.tag}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
