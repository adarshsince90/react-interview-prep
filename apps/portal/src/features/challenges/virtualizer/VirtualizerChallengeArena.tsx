import React, { useState, useRef, useMemo } from 'react';
import {
  useDynamicVirtualizer
} from './useDynamicVirtualizer';
import {
  Code2,
  RotateCcw,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sliders
} from 'lucide-react';

interface FeedItem {
  id: number;
  author: string;
  avatarColor: string;
  tag: string;
  timestamp: string;
  title: string;
  summary: string;
  expandedDetails: string;
}

const AUTHORS = ['Dan Abramov', 'Sophie Alpert', 'Sebastian Markbåge', 'Andrew Clark', 'Rachel Nabors', 'Dominic Gannaway'];
const TAGS = ['Concurrent React', 'Fiber Reconciliation', 'V8 Inlining', 'Web Vitals', 'Memory Optimization', 'RSC Flight Wire'];
const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

function generateSampleFeed(count: number): FeedItem[] {
  return Array.from({ length: count }, (_, i) => {
    const author = AUTHORS[i % AUTHORS.length];
    const tag = TAGS[i % TAGS.length];
    const avatarColor = COLORS[i % COLORS.length];

    // Varying text length to create dynamic natural heights
    const isLong = i % 3 === 0;
    const isMedium = i % 2 === 0;

    const summary = isLong
      ? `Deep architectural inspection of Fiber node linked-list traversal during Concurrent Mode time-slicing. Demonstrates how React 19 lane priorities (SyncLane, InputContinuousLane, DefaultLane, IdleLane) preempt long-running computations without freezing 60 FPS frame rates.`
      : isMedium
        ? `Analysis of V8 hidden class shape transitions when comparing object spread vs Object.assign referential stability on the heap.`
        : `Interactive breakdown of browser main thread yielding via scheduler.yield() and cooperative event loop task slicing.`;

    const expandedDetails = `Technical Specification & Implementation Notes for #${i + 1}:
• Dynamic ResizeObserver measurement ensures zero layout distortion upon accordion toggles.
• Binary search O(log N) offsets dynamically account for this extra ${isLong ? '180px' : '110px'} content block.
• DOM node recycling pins memory consumption at under 25 physical DOM elements despite ${count.toLocaleString()} virtual rows.`;

    return {
      id: i + 1,
      author,
      avatarColor,
      tag,
      timestamp: `${(i % 59) + 1}m ago`,
      title: `Engineering Milestone #${i + 1}: ${tag} Architecture & Performance Drill`,
      summary,
      expandedDetails
    };
  });
}

export const VirtualizerChallengeArena: React.FC = () => {
  const [itemCount, setItemCount] = useState<number>(5000);
  const [overscan, setOverscan] = useState<number>(3);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [targetIndexInput, setTargetIndexInput] = useState<string>('2450');

  const containerRef = useRef<HTMLDivElement | null>(null);

  const feedData = useMemo(() => generateSampleFeed(itemCount), [itemCount]);

  const {
    virtualItems,
    totalSize,
    measureElement,
    scrollToIndex,
    isScrolling,
    metrics
  } = useDynamicVirtualizer({
    count: itemCount,
    estimateHeight: 85,
    overscan,
    containerRef
  });

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleJumpToIndex = (e: React.FormEvent) => {
    e.preventDefault();
    const idx = parseInt(targetIndexInput, 10);
    if (!isNaN(idx)) {
      scrollToIndex(idx, 'center');
    }
  };

  const handleReset = () => {
    setExpandedIds(new Set());
    scrollToIndex(0, 'start');
  };

  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '1.75rem', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--react-cyan)', padding: '0.25rem 0.65rem', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            <Code2 size={14} /> CHALLENGE-01: Dynamic-Height Virtual Windowing Engine
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Dynamic-Height Virtual List with ResizeObserver &amp; O(log N) Binary Search
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.3rem 0 0 0' }}>
            A zero-dependency production virtualizer supporting dynamic accordion expansions, asynchronous image measuring, and smooth 60 FPS DOM recycling across {itemCount.toLocaleString()} items.
          </p>
        </div>

        {/* Global Action Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setItemCount(prev => (prev === 5000 ? 10000 : 5000))}
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              background: '#0ea5e9',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Count: {itemCount.toLocaleString()} items
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
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Physical DOM Allocated</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
            {metrics.renderedCount} nodes
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Total Dataset: {itemCount.toLocaleString()} items
          </div>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ResizeObserver Measured</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--react-cyan)', marginTop: '0.2rem' }}>
            {metrics.measuredCount} items
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Cached Dynamic Heights
          </div>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lookup Complexity</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.2rem' }}>
            O(log N)
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {metrics.binarySearchComparisons} ops per frame vs {itemCount.toLocaleString()} linear
          </div>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Scroll State</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isScrolling ? '#f59e0b' : 'var(--text-primary)', marginTop: '0.35rem' }}>
            {isScrolling ? 'Scrolled (60 FPS)' : 'Idle'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Total Height: {(totalSize / 1000).toFixed(1)}k px
          </div>
        </div>
      </div>

      {/* Main Sandbox Grid: Virtual Container + Control Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        {/* Virtual Scroll Container */}
        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Dynamic Virtual Feed Viewport</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Visible Slice: [{metrics.viewportRange[0]} .. {metrics.viewportRange[1]}]
            </span>
          </div>

          <div
            ref={containerRef}
            style={{
              height: '480px',
              overflowY: 'auto',
              position: 'relative',
              background: 'var(--bg-primary)',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            {/* Total Spacer Height */}
            <div style={{ height: `${totalSize}px`, position: 'relative' }}>
              {virtualItems.map(item => {
                const data = feedData[item.index];
                if (!data) return null;
                const isExpanded = expandedIds.has(data.id);

                return (
                  <div
                    key={item.key}
                    ref={el => measureElement(el, item.index)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      transform: `translateY(${item.start}px)`,
                      padding: '0.85rem 1rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isExpanded ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                      transition: 'background 150ms ease',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      {/* Avatar */}
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: data.avatarColor,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          flexShrink: 0
                        }}
                      >
                        #{data.id}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {data.author}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {data.timestamp}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.7rem', background: 'rgba(2, 132, 199, 0.1)', color: 'var(--react-cyan)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                            {data.tag}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          {data.title}
                        </div>

                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', lineHeight: 1.45 }}>
                          {data.summary}
                        </p>

                        {/* Accordion Toggle */}
                        <button
                          onClick={() => toggleExpand(data.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--react-cyan)',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          {isExpanded ? (
                            <>Collapse Dynamic Details <ChevronUp size={13} /></>
                          ) : (
                            <>Expand Dynamic Details (ResizeObserver Test) <ChevronDown size={13} /></>
                          )}
                        </button>

                        {/* Expandable Box */}
                        {isExpanded && (
                          <div
                            style={{
                              marginTop: '0.6rem',
                              padding: '0.65rem',
                              borderRadius: '6px',
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-medium)',
                              fontFamily: 'monospace',
                              fontSize: '0.72rem',
                              color: 'var(--text-secondary)',
                              whiteSpace: 'pre-line'
                            }}
                          >
                            {data.expandedDetails}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Controls & Architectural Proof */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Jump To Index Control */}
          <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={15} color="var(--react-cyan)" /> O(log N) Fast Jump Navigator
            </div>
            <form onSubmit={handleJumpToIndex} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                min="0"
                max={itemCount - 1}
                value={targetIndexInput}
                onChange={e => setTargetIndexInput(e.target.value)}
                placeholder="Index (0..4999)"
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0.5rem 0.95rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#0ea5e9',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Jump
              </button>
            </form>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
              <button
                type="button"
                onClick={() => scrollToIndex(0, 'start')}
                style={{ flex: 1, padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.72rem', cursor: 'pointer' }}
              >
                Top (#0)
              </button>
              <button
                type="button"
                onClick={() => scrollToIndex(Math.floor(itemCount / 2), 'center')}
                style={{ flex: 1, padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.72rem', cursor: 'pointer' }}
              >
                Mid (#{(itemCount / 2).toLocaleString()})
              </button>
              <button
                type="button"
                onClick={() => scrollToIndex(itemCount - 1, 'end')}
                style={{ flex: 1, padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.72rem', cursor: 'pointer' }}
              >
                Bottom
              </button>
            </div>
          </div>

          {/* Overscan Buffer Slider */}
          <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={15} color="#10b981" /> Overscan Padding Configuration
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
              <span>Overscan Buffer: <strong style={{ color: '#10b981' }}>{overscan} rows</strong></span>
              <span style={{ color: 'var(--text-muted)' }}>Above &amp; Below Viewport</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              value={overscan}
              onChange={e => setOverscan(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          {/* Staff Architectural Takeaway */}
          <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              <CheckCircle2 size={15} color="#10b981" /> Staff Engineering Pattern:
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              1. <strong>Cumulative Offset Prefix-Sum:</strong> Avoids $O(N)$ linear scans on every scroll frame by caching running totals.<br />
              2. <strong>ResizeObserver Self-Healing:</strong> Dynamic text wrapping or expandable cards automatically update measured height cache and recalculate cumulative offsets without page jitter.<br />
              3. <strong>translateY Element Recycling:</strong> Physical DOM elements remain anchored in the GPU compositor thread with zero layout reflow thrashing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
