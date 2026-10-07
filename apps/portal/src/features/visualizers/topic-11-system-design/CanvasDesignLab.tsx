import React, { useState, useEffect, useRef } from 'react';
import { Network, Zap, Shield, Activity, RefreshCw, Cpu } from 'lucide-react';

type TabMode = 'crdt-canvas' | 'hft-terminal' | 'saas-entitlements';

interface CanvasShape {
  id: string;
  type: 'rectangle' | 'circle' | 'note';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text: string;
  updatedBy: string;
  lamportClock: number;
}

interface PeerCursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  active: boolean;
}

export const CanvasDesignLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabMode>('crdt-canvas');

  // --- Mode 1: CRDT Canvas & Spatial QuadTree State ---
  const [shapes, setShapes] = useState<CanvasShape[]>([
    { id: 'shape-1', type: 'rectangle', x: 80, y: 60, width: 140, height: 90, color: '#38bdf8', text: 'Architecture Node A', updatedBy: 'User (You)', lamportClock: 1 },
    { id: 'shape-2', type: 'circle', x: 280, y: 120, width: 110, height: 110, color: '#a855f7', text: 'CRDT Sync Engine', updatedBy: 'User (You)', lamportClock: 1 },
    { id: 'shape-3', type: 'rectangle', x: 460, y: 70, width: 150, height: 80, color: '#34d399', text: 'Edge Gateway B', updatedBy: 'Peer (London)', lamportClock: 2 },
  ]);
  const [crdtLog, setCrdtLog] = useState<string[]>([
    'CRDT Y.Doc initialized with Y.Map("shapes")',
    'Peer London connected via WebSocket provider (session: 0x8f2a)',
  ]);
  const [quadTreeEnabled, setQuadTreeEnabled] = useState<boolean>(true);
  const [peerCursors] = useState<PeerCursor[]>([
    { id: 'peer-1', name: 'Dev London', color: '#f59e0b', x: 390, y: 110, active: true },
    { id: 'peer-2', name: 'Architect Tokyo', color: '#ec4899', x: 220, y: 240, active: true },
  ]);

  // --- Mode 2: HFT Telemetry & Ring Buffer State ---
  const [tickRate, setTickRate] = useState<number>(2000); // 2,000 ticks/sec
  const [useRingBuffer, setUseRingBuffer] = useState<boolean>(true);
  const [hftRunning, setHftRunning] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);
  const [eventLoopLag, setEventLoopLag] = useState<number>(2.1);
  const [totalTicksReceived, setTotalTicksReceived] = useState<number>(0);
  const [marketPrices, setMarketPrices] = useState<Record<string, { price: number; change: number }>>({
    'BTC/USD': { price: 68420.50, change: 1.2 },
    'ETH/USD': { price: 3540.25, change: -0.4 },
    'SOL/USD': { price: 182.10, change: 3.8 },
    'NVDA': { price: 128.40, change: 0.9 },
  });

  // --- Mode 3: SaaS Multi-Tenant Entitlements State ---
  const [selectedTenant, setSelectedTenant] = useState<'acme-enterprise' | 'health-hipaa' | 'startup-free'>('acme-enterprise');
  const tenantConfigs = {
    'acme-enterprise': {
      name: 'Acme Global Holdings',
      tier: 'Enterprise Suite',
      primaryColor: '#0ea5e9',
      surfaceColor: '#0f172a',
      font: 'Inter, sans-serif',
      mask: 0b11111, // Full access
      features: ['Realtime Telemetry', 'Audit Trail', 'Custom Subdomain', 'Dedicated Worker'],
    },
    'health-hipaa': {
      name: 'HealthPlus Clinical',
      tier: 'HIPAA Compliant Cloud',
      primaryColor: '#10b981',
      surfaceColor: '#064e3b',
      font: 'Roboto, sans-serif',
      mask: 0b01101, // View, Export, Audit
      features: ['BAA Encryption', 'Encrypted Blobs', 'Audit Trail'],
    },
    'startup-free': {
      name: 'RapidPrototype Co',
      tier: 'Free Developer Sandbox',
      primaryColor: '#a855f7',
      surfaceColor: '#1e1b4b',
      font: 'JetBrains Mono, monospace',
      mask: 0b00001, // View only
      features: ['Basic Telemetry'],
    },
  };

  // Simulation: HFT ingestion loop
  const hftIntervalRef = useRef<number | null>(null);
  useEffect(() => {
    if (!hftRunning) {
      if (hftIntervalRef.current) clearInterval(hftIntervalRef.current);
      return;
    }

    const intervalTime = useRingBuffer ? 16 : Math.max(1, Math.floor(1000 / tickRate));
    hftIntervalRef.current = window.setInterval(() => {
      setTotalTicksReceived(prev => prev + (useRingBuffer ? Math.round(tickRate / 60) : 1));

      // Calculate dynamic FPS and Lag based on strategy
      if (useRingBuffer) {
        setFps(59 + Math.round(Math.random() * 2));
        setEventLoopLag(1.8 + Math.random() * 0.8);
      } else {
        // Naive setState degrades linearly with tick rate
        const degradedFps = Math.max(12, Math.round(60 - (tickRate / 100)));
        const lag = Math.min(85, (tickRate / 45) + Math.random() * 5);
        setFps(degradedFps);
        setEventLoopLag(lag);
      }

      setMarketPrices(prev => ({
        'BTC/USD': { price: +(prev['BTC/USD'].price + (Math.random() - 0.49) * 12).toFixed(2), change: +(prev['BTC/USD'].change + (Math.random() - 0.5) * 0.1).toFixed(2) },
        'ETH/USD': { price: +(prev['ETH/USD'].price + (Math.random() - 0.49) * 3).toFixed(2), change: +(prev['ETH/USD'].change + (Math.random() - 0.5) * 0.1).toFixed(2) },
        'SOL/USD': { price: +(prev['SOL/USD'].price + (Math.random() - 0.49) * 0.8).toFixed(2), change: +(prev['SOL/USD'].change + (Math.random() - 0.5) * 0.1).toFixed(2) },
        'NVDA': { price: +(prev['NVDA'].price + (Math.random() - 0.49) * 0.5).toFixed(2), change: +(prev['NVDA'].change + (Math.random() - 0.5) * 0.1).toFixed(2) },
      }));
    }, intervalTime);

    return () => {
      if (hftIntervalRef.current) clearInterval(hftIntervalRef.current);
    };
  }, [hftRunning, tickRate, useRingBuffer]);

  // CRDT Concurrent mutation simulator
  const triggerConcurrentEdit = () => {
    const nextClock = shapes[0].lamportClock + 1;
    const newColors = ['#ec4899', '#f59e0b', '#38bdf8', '#10b981', '#6366f1'];
    const chosenColor = newColors[Math.floor(Math.random() * newColors.length)];

    setShapes(prev => [
      { ...prev[0], color: chosenColor, lamportClock: nextClock, updatedBy: 'User (You)' },
      ...prev.slice(1)
    ]);

    setCrdtLog(prev => [
      `[T+${nextClock}] Commutative CRDT merge: Shape A color -> ${chosenColor} (Author: User)`,
      `[T+${nextClock}] Remote awareness vector synchronized: 3 active peers`,
      ...prev.slice(0, 5)
    ]);
  };

  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '1.5rem', marginTop: '1rem' }}>
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('crdt-canvas')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: activeTab === 'crdt-canvas' ? 'var(--bg-tertiary)' : 'transparent',
            color: activeTab === 'crdt-canvas' ? 'var(--react-cyan)' : 'var(--text-secondary)',
            border: activeTab === 'crdt-canvas' ? '1px solid var(--border-medium)' : '1px solid transparent',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          <Network size={16} /> 1. Real-Time CRDT Canvas & QuadTree
        </button>

        <button
          onClick={() => setActiveTab('hft-terminal')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: activeTab === 'hft-terminal' ? 'var(--bg-tertiary)' : 'transparent',
            color: activeTab === 'hft-terminal' ? '#10b981' : 'var(--text-secondary)',
            border: activeTab === 'hft-terminal' ? '1px solid var(--border-medium)' : '1px solid transparent',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          <Activity size={16} /> 2. High-Frequency Trading Ring Buffer
        </button>

        <button
          onClick={() => setActiveTab('saas-entitlements')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: activeTab === 'saas-entitlements' ? 'var(--bg-tertiary)' : 'transparent',
            color: activeTab === 'saas-entitlements' ? '#a855f7' : 'var(--text-secondary)',
            border: activeTab === 'saas-entitlements' ? '1px solid var(--border-medium)' : '1px solid transparent',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          <Shield size={16} /> 3. Multi-Tenant Tokens & Bitmask RBAC
        </button>
      </div>

      {/* --- TAB 1: CRDT Collaborative Canvas --- */}
      {activeTab === 'crdt-canvas' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                Collaborative 2D Canvas & QuadTree Frustum Culler
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Simulating conflict-free CRDT state convergence, peer awareness cursors, and O(log N) QuadTree viewport queries.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={triggerConcurrentEdit}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.85rem',
                  background: 'var(--react-cyan)',
                  color: '#000',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} /> Fire Concurrent CRDT Mutation
              </button>
              <button
                onClick={() => setQuadTreeEnabled(!quadTreeEnabled)}
                style={{
                  padding: '0.45rem 0.85rem',
                  background: quadTreeEnabled ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-tertiary)',
                  color: quadTreeEnabled ? 'var(--react-cyan)' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  border: '1px solid var(--border-medium)',
                  cursor: 'pointer'
                }}
              >
                QuadTree Frustum: {quadTreeEnabled ? 'ENABLED (O(log N))' : 'DISABLED (O(N))'}
              </button>
            </div>
          </div>

          {/* Interactive Canvas Stage */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '320px',
              background: '#0b1120',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              overflow: 'hidden',
              backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              marginBottom: '1rem'
            }}
          >
            {/* Viewport Frustum Overlay */}
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                right: 20,
                bottom: 20,
                border: '1px dashed rgba(56, 189, 248, 0.4)',
                borderRadius: '6px',
                pointerEvents: 'none'
              }}
            >
              <span style={{ position: 'absolute', top: 6, left: 8, fontSize: '0.72rem', color: 'rgba(56, 189, 248, 0.7)', fontFamily: 'monospace' }}>
                Camera Viewport Rect [x: 20, y: 20, w: 960, h: 280] • {quadTreeEnabled ? '3 visible shapes culled in 0.12ms' : 'Full scene brute-force scanned (45ms)'}
              </span>
            </div>

            {/* Shapes on Canvas */}
            {shapes.map(shape => (
              <div
                key={shape.id}
                style={{
                  position: 'absolute',
                  left: shape.x,
                  top: shape.y,
                  width: shape.width,
                  height: shape.height,
                  backgroundColor: shape.color,
                  borderRadius: shape.type === 'circle' ? '50%' : '8px',
                  boxShadow: `0 4px 14px ${shape.color}40`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  padding: '8px',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <span>{shape.text}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 500, opacity: 0.85, marginTop: '4px' }}>
                  Clock: L{shape.lamportClock} • {shape.updatedBy}
                </span>
              </div>
            ))}

            {/* Remote Peer Cursors */}
            {peerCursors.map(cursor => (
              <div
                key={cursor.id}
                style={{
                  position: 'absolute',
                  left: cursor.x,
                  top: cursor.y,
                  pointerEvents: 'none',
                  transition: 'all 0.5s ease'
                }}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cursor.color, border: '2px solid #fff' }} />
                <div
                  style={{
                    background: cursor.color,
                    color: '#000',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                    marginTop: '2px'
                  }}
                >
                  {cursor.name}
                </div>
              </div>
            ))}
          </div>

          {/* CRDT Event Log */}
          <div style={{ background: 'var(--bg-tertiary)', borderRadius: '6px', padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>CRDT Replication Journal (Yjs Protocol):</div>
            {crdtLog.map((log, idx) => (
              <div key={idx} style={{ opacity: 1 - (idx * 0.15) }}>• {log}</div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: HFT Trading Telemetry --- */}
      {activeTab === 'hft-terminal' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                High-Frequency Trading Telemetry Engine
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Benchmarking Naive React Reconciliation vs Circular Ring Buffer + requestAnimationFrame coalescing.
              </p>
            </div>
            <button
              onClick={() => setHftRunning(!hftRunning)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.5rem 1.25rem',
                background: hftRunning ? '#ef4444' : '#10b981',
                color: '#fff',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {hftRunning ? 'Stop Telemetry Stream' : 'Start High-Throughput Stream'}
            </button>
          </div>

          {/* Telemetry Control Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-medium)' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Tick Ingestion Rate: {tickRate.toLocaleString()} msgs/sec
              </label>
              <input
                type="range"
                min="200"
                max="5000"
                step="200"
                value={tickRate}
                onChange={e => setTickRate(+e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-medium)' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Batching Strategy
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setUseRingBuffer(true)}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: useRingBuffer ? '#10b981' : 'transparent',
                    color: useRingBuffer ? '#000' : 'var(--text-secondary)',
                    border: '1px solid var(--border-medium)'
                  }}
                >
                  Ring Buffer + rAF
                </button>
                <button
                  onClick={() => setUseRingBuffer(false)}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: !useRingBuffer ? '#ef4444' : 'transparent',
                    color: !useRingBuffer ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-medium)'
                  }}
                >
                  Naive setState
                </button>
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-medium)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Display Refresh Rate:</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: fps >= 55 ? '#10b981' : fps >= 30 ? '#f59e0b' : '#ef4444' }}>{fps} FPS</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Event Loop Lag:</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: eventLoopLag < 5 ? '#10b981' : '#ef4444' }}>{eventLoopLag.toFixed(1)} ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Processed:</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{totalTicksReceived.toLocaleString()} ticks</span>
              </div>
            </div>
          </div>

          {/* Realtime Market Ladder View */}
          <div style={{ background: '#0b1120', borderRadius: '8px', border: '1px solid var(--border-medium)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '0.65rem 1rem', background: '#030712', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              <div>INSTRUMENT</div>
              <div>LAST PRICE</div>
              <div>24H DELTA</div>
              <div>THROUGHPUT ENGINE</div>
            </div>
            {Object.entries(marketPrices).map(([symbol, item]) => (
              <div
                key={symbol}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  padding: '0.65rem 1rem',
                  borderTop: '1px solid #1e293b',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  color: 'var(--text-primary)'
                }}
              >
                <div style={{ fontWeight: 600 }}>{symbol}</div>
                <div style={{ color: item.change >= 0 ? '#10b981' : '#ef4444' }}>${item.price.toFixed(2)}</div>
                <div style={{ color: item.change >= 0 ? '#10b981' : '#ef4444' }}>{item.change >= 0 ? `+${item.change}%` : `${item.change}%`}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {useRingBuffer ? 'Float64Array (Zero-Copy)' : 'JSON Heap Clones'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 3: SaaS Multi-Tenant Entitlements --- */}
      {activeTab === 'saas-entitlements' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                Multi-Tenant Design Token & Entitlements Engine
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Dynamic white-labeling via CSS Custom Properties paired with synchronous Bitmask RBAC security gates.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(Object.keys(tenantConfigs) as Array<keyof typeof tenantConfigs>).map(k => (
                <button
                  key={k}
                  onClick={() => setSelectedTenant(k)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: selectedTenant === k ? tenantConfigs[k].primaryColor : 'var(--bg-tertiary)',
                    color: selectedTenant === k ? '#000' : 'var(--text-secondary)',
                    border: '1px solid var(--border-medium)'
                  }}
                >
                  {tenantConfigs[k].name}
                </button>
              ))}
            </div>
          </div>

          {/* Branded Dynamic Dashboard Preview */}
          {(() => {
            const config = tenantConfigs[selectedTenant];
            const hasExport = (config.mask & 0b00010) !== 0;
            const hasAudit = (config.mask & 0b00100) !== 0;
            const hasAdmin = (config.mask & 0b10000) !== 0;

            return (
              <div
                style={{
                  background: config.surfaceColor,
                  borderRadius: '10px',
                  border: `2px solid ${config.primaryColor}`,
                  padding: '1.5rem',
                  fontFamily: config.font,
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Branded Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ margin: 0, color: config.primaryColor, fontSize: '1.4rem', fontWeight: 800 }}>
                      {config.name}
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Licensing Tier: {config.tier} • Bitmask: 0b{config.mask.toString(2).padStart(5, '0')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', background: config.primaryColor, color: '#000', border: 'none', fontWeight: 700, fontSize: '0.78rem' }}>
                      Active License
                    </button>
                  </div>
                </div>

                {/* Dashboard Widgets with Bitmask Gating */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {/* Widget 1: Public View */}
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Activity size={14} /> Global Telemetry
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.35rem' }}>
                      99.98% SLA
                    </div>
                    <span style={{ fontSize: '0.72rem', color: config.primaryColor }}>Always Authorized (Mask: 0x01)</span>
                  </div>

                  {/* Widget 2: Export Data Gate */}
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Zap size={14} /> Data Export Pipeline
                    </div>
                    {hasExport ? (
                      <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981', marginTop: '0.35rem' }}>
                          Ready (CSV/Parquet)
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Permission Granted (0x02)</span>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ef4444', marginTop: '0.35rem' }}>
                          🔒 Feature Gated
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>Requires Upgrade (0x02)</span>
                      </div>
                    )}
                  </div>

                  {/* Widget 3: Compliance Audit */}
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Shield size={14} /> Compliance & Audit
                    </div>
                    {hasAudit ? (
                      <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.35rem' }}>
                          SOC2 / HIPAA Active
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Verified via Mask 0x04</span>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ef4444', marginTop: '0.35rem' }}>
                          🔒 Enterprise Only
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>Contact Sales</span>
                      </div>
                    )}
                  </div>

                  {/* Widget 4: Tenant Admin Console */}
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Cpu size={14} /> Dedicated Node Management
                    </div>
                    {hasAdmin ? (
                      <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.35rem' }}>
                          4 Worker Isolates
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Full Root Control (0x10)</span>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#64748b', marginTop: '0.35rem' }}>
                          Multi-Tenant Shared
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Standard Pool</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
