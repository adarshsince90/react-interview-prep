import React, { useState, useRef, useMemo } from 'react';
import { 
  Layers, 
  RotateCcw, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface RowItem {
  id: number;
  name: string;
  role: string;
  department: string;
  latencyMs: number;
}

const TOTAL_ITEMS = 1000;
const ROW_HEIGHT = 42;
const VIEWPORT_HEIGHT = 336; // 8 visible rows

const GENERATED_DATA: RowItem[] = Array.from({ length: TOTAL_ITEMS }, (_, i) => ({
  id: i + 1,
  name: `Staff Engineer #${i + 1}`,
  role: i % 3 === 0 ? 'Distributed Systems' : i % 2 === 0 ? 'React Runtime' : 'Performance Architect',
  department: ['Core Infrastructure', 'Cloud Platform', 'Product Architecture', 'Web Vitals'][i % 4],
  latencyMs: Math.floor(Math.random() * 45) + 5
}));

export const VirtualizationLab: React.FC = () => {
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [overscan, setOverscan] = useState<number>(2);
  const [isVirtualEnabled, setIsVirtualEnabled] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = TOTAL_ITEMS * ROW_HEIGHT;

  // Virtual calculations
  const { startIndex, endIndex, renderedItems, offsetY } = useMemo(() => {
    if (!isVirtualEnabled) {
      return {
        startIndex: 0,
        endIndex: TOTAL_ITEMS - 1,
        renderedItems: GENERATED_DATA,
        offsetY: 0
      };
    }

    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - overscan);
    const end = Math.min(
      TOTAL_ITEMS - 1,
      Math.floor((scrollTop + VIEWPORT_HEIGHT) / ROW_HEIGHT) + overscan
    );

    const items = GENERATED_DATA.slice(start, end + 1);
    const offset = start * ROW_HEIGHT;

    return {
      startIndex: start,
      endIndex: end,
      renderedItems: items,
      offsetY: offset
    };
  }, [scrollTop, overscan, isVirtualEnabled]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const handleReset = () => {
    setScrollTop(0);
    setOverscan(2);
    setIsVirtualEnabled(true);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '1.75rem', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.25rem 0.65rem', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            <Layers size={14} /> LAB 22 • Virtualization & Viewport Culling Visualizer
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Virtual Windowing & DOM Recycling
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.3rem 0 0 0' }}>
            Simulate 1,000 dataset rows rendered with dynamic viewport offset culling vs rendering 1,000 physical DOM nodes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setIsVirtualEnabled(!isVirtualEnabled)}
            style={{
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              border: 'none',
              background: isVirtualEnabled ? '#10b981' : '#ef4444',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Virtualization: {isVirtualEnabled ? 'ENABLED' : 'DISABLED (Heavy)'}
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

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Physical DOM Nodes</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: renderedItems.length > 50 ? '#ef4444' : '#10b981', marginTop: '0.2rem' }}>
            {renderedItems.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Total in Dataset: {TOTAL_ITEMS}
          </div>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overscan Buffer</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--react-cyan)', marginTop: '0.2rem' }}>
            {isVirtualEnabled ? overscan : 0} items
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Prevents blank white frames
          </div>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Viewport Scroll Y</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {Math.round(scrollTop)} px
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Total Virtual Height: {totalHeight}px
          </div>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Window Index</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.35rem' }}>
            [{startIndex} .. {endIndex}]
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Recycled in DOM Tree
          </div>
        </div>
      </div>

      {/* Dual Layout: Virtual List + Inspector */}
      <div className="responsive-split-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Virtual List Container */}
        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Scrollable Viewport (Height: 336px)</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scroll mousewheel inside box:</span>
          </div>

          <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{
              height: `${VIEWPORT_HEIGHT}px`,
              overflowY: 'auto',
              position: 'relative',
              background: 'var(--bg-primary)',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)'
            }}
          >
            {/* Virtual Spacer */}
            <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
              {/* Visible Recycled Rows Container */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  transform: `translateY(${offsetY}px)`
                }}
              >
                {renderedItems.map(item => (
                  <div
                    key={item.id}
                    style={{
                      height: `${ROW_HEIGHT}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 1rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      background: item.id % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--react-cyan)', width: '45px' }}>#{item.id}</span>
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{item.role}</span>
                      <span style={{ fontSize: '0.7rem', background: 'rgba(2, 132, 199, 0.1)', color: '#0ea5e9', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                        {item.latencyMs}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Culling Diagnostics & Overscan Controls */}
        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={16} color="var(--react-cyan)" /> Virtual Window Buffer Tuning
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
              <span>Overscan Count: <strong style={{ color: '#10b981' }}>{overscan} rows</strong></span>
              <span style={{ color: 'var(--text-muted)' }}>Rendered outside viewport</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="5" 
              value={overscan} 
              disabled={!isVirtualEnabled}
              onChange={e => setOverscan(Number(e.target.value))}
              style={{ width: '100%', cursor: isVirtualEnabled ? 'pointer' : 'not-allowed' }}
            />
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '1rem', fontSize: '0.78rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Architectural Analysis:</div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Without virtualization, the browser creates <strong>1,000 physical DOM nodes</strong> totaling over 800 KB heap allocations. With viewport culling, the DOM footprint stays pinned at <strong>~12 nodes ({renderedItems.length} nodes)</strong> regardless of dataset size.
            </p>
          </div>

          <div style={{ padding: '0.75rem', borderRadius: '8px', background: isVirtualEnabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${isVirtualEnabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isVirtualEnabled ? <CheckCircle2 size={15} color="#10b981" /> : <AlertTriangle size={15} color="#ef4444" />}
            <span>
              {isVirtualEnabled ? '60 FPS guaranteed via translateY recycling' : 'DOM thrashing & paint reflows on high scroll'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
