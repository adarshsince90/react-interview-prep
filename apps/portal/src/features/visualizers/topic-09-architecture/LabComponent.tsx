import React, { useState } from 'react';
import { Layers, Network, GitFork, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

type LabMode = 'fsd-validator' | 'module-federation' | 'strangler-fig';

// FSD Layers ordered from top (highest) to bottom (lowest)
const FSD_LAYERS = [
  { id: 'app', name: 'App', level: 1, desc: 'Providers, router config, global styles' },
  { id: 'pages', name: 'Pages', level: 2, desc: 'Composite route screens' },
  { id: 'widgets', name: 'Widgets', level: 3, desc: 'Self-contained UI blocks (Header, Feed)' },
  { id: 'features', name: 'Features', level: 4, desc: 'User interactions (AddToCart, LikePost)' },
  { id: 'entities', name: 'Entities', level: 5, desc: 'Domain models & primitives (User, Product)' },
  { id: 'shared', name: 'Shared', level: 6, desc: 'Reusable UI kit, API clients, tokens' }
];

export const ArchitectureLab: React.FC = () => {
  const [mode, setMode] = useState<LabMode>('fsd-validator');

  // FSD state
  const [sourceLayer, setSourceLayer] = useState<string>('features');
  const [targetLayer, setTargetLayer] = useState<string>('entities');
  const [isSameSlice, setIsSameSlice] = useState<boolean>(false);

  // Module Federation state
  const [hostReactVersion, setHostReactVersion] = useState<string>('19.0.0');
  const [remoteReactVersion, setRemoteReactVersion] = useState<string>('19.0.0');
  const [isSingleton, setIsSingleton] = useState<boolean>(true);

  // Strangler Fig state
  const [migratedRoutes, setMigratedRoutes] = useState<Record<string, boolean>>({
    '/auth': true,
    '/billing': true,
    '/catalog': false,
    '/dashboard': false,
    '/settings': false
  });

  // Calculate FSD validation result
  const sourceObj = FSD_LAYERS.find((l) => l.id === sourceLayer)!;
  const targetObj = FSD_LAYERS.find((l) => l.id === targetLayer)!;

  let fsdStatus: 'valid' | 'invalid' = 'valid';
  let fsdMessage = '';

  if (sourceObj.level >= targetObj.level) {
    if (sourceObj.level === targetObj.level) {
      if (sourceObj.id === 'shared') {
        fsdStatus = 'valid';
        fsdMessage = 'Shared layer utilities are permitted to reference other shared utilities.';
      } else if (isSameSlice) {
        fsdStatus = 'valid';
        fsdMessage = 'Internal segment imports within the same slice are allowed.';
      } else {
        fsdStatus = 'invalid';
        fsdMessage = `Horizontal slice cross-import prohibited: Slices in "${sourceObj.name}" cannot import sibling slices in the same layer.`;
      }
    } else {
      fsdStatus = 'invalid';
      fsdMessage = `Upward dependency violation: Lower layer "${sourceObj.name}" cannot import from higher layer "${targetObj.name}".`;
    }
  } else {
    fsdStatus = 'valid';
    fsdMessage = `Clean unidirectional flow: Higher layer "${sourceObj.name}" is importing from lower layer "${targetObj.name}".`;
  }

  // Module Federation validation
  const versionsMatch = hostReactVersion === remoteReactVersion;
  let mfStatus: 'optimal' | 'warning' | 'fatal' = 'optimal';
  let mfMessage = '';

  if (!isSingleton) {
    mfStatus = 'fatal';
    mfMessage = 'FATAL: React singleton disabled! Both Host and Remote instantiate isolated React runtimes. React Hook dispatcher throws "Invalid hook call".';
  } else if (!versionsMatch) {
    mfStatus = 'warning';
    mfMessage = `VERSION MISMATCH: Host has ${hostReactVersion}, Remote requires ${remoteReactVersion}. Fallback negotiation triggers; host version takes precedence if SemVer range permits.`;
  } else {
    mfStatus = 'optimal';
    mfMessage = `OPTIMAL SINGLETON: Both Host and Remote share memory address 0x00FE41A. Zero duplicate bundles loaded; hook dispatchers synchronized.`;
  }

  // Strangler calculation
  const totalRoutes = Object.keys(migratedRoutes).length;
  const migratedCount = Object.values(migratedRoutes).filter(Boolean).length;
  const percentMigrated = Math.round((migratedCount / totalRoutes) * 100);
  const bundleSizeSaved = Math.round(migratedCount * 85); // KB estimated savings
  const avgInp = Math.max(45, Math.round(280 - (migratedCount * 45)));

  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '1.5rem', marginTop: '1rem' }}>
      {/* Mode Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setMode('fsd-validator')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: mode === 'fsd-validator' ? 'var(--bg-tertiary)' : 'transparent',
            color: mode === 'fsd-validator' ? 'var(--react-cyan)' : 'var(--text-secondary)',
            border: mode === 'fsd-validator' ? '1px solid var(--border-medium)' : '1px solid transparent',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          <Layers size={16} /> 1. FSD Dependency Matrix
        </button>
        <button
          onClick={() => setMode('module-federation')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: mode === 'module-federation' ? 'var(--bg-tertiary)' : 'transparent',
            color: mode === 'module-federation' ? 'var(--purple-accent)' : 'var(--text-secondary)',
            border: mode === 'module-federation' ? '1px solid var(--border-medium)' : '1px solid transparent',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          <Network size={16} /> 2. Module Federation Singleton Resolver
        </button>
        <button
          onClick={() => setMode('strangler-fig')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: mode === 'strangler-fig' ? 'var(--bg-tertiary)' : 'transparent',
            color: mode === 'strangler-fig' ? 'var(--emerald-success)' : 'var(--text-secondary)',
            border: mode === 'strangler-fig' ? '1px solid var(--border-medium)' : '1px solid transparent',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          <GitFork size={16} /> 3. Strangler Fig Route Delegator
        </button>
      </div>

      {/* MODE 1: FSD Dependency Matrix */}
      {mode === 'fsd-validator' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.15rem' }}>
              Feature-Sliced Design (FSD) Architectural Rule Verifier
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Select a source layer attempting to import a target layer. The engine evaluates strict unidirectional compliance and cross-slice boundaries.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Source Layer */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                SOURCE LAYER (Importing File)
              </label>
              <select
                value={sourceLayer}
                onChange={(e) => setSourceLayer(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '0.9rem' }}
              >
                {FSD_LAYERS.map((layer) => (
                  <option key={layer.id} value={layer.id}>
                    L{layer.level}: {layer.name} ({layer.desc})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Layer */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                TARGET LAYER (Imported Module)
              </label>
              <select
                value={targetLayer}
                onChange={(e) => setTargetLayer(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '0.9rem' }}
              >
                {FSD_LAYERS.map((layer) => (
                  <option key={layer.id} value={layer.id}>
                    L{layer.level}: {layer.name} ({layer.desc})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {sourceLayer === targetLayer && sourceLayer !== 'shared' && (
            <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="same-slice"
                checked={isSameSlice}
                onChange={(e) => setIsSameSlice(e.target.checked)}
              />
              <label htmlFor="same-slice" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Is this an internal import inside the <strong>same slice</strong> (e.g., ui segment importing from model segment)?
              </label>
            </div>
          )}

          {/* Result Banner */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${fsdStatus === 'valid' ? 'var(--emerald-success)' : '#ef4444'}`,
              background: fsdStatus === 'valid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}
          >
            {fsdStatus === 'valid' ? (
              <CheckCircle2 color="var(--emerald-success)" size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <AlertTriangle color="#ef4444" size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div>
              <div style={{ fontWeight: 700, color: fsdStatus === 'valid' ? 'var(--emerald-success)' : '#ef4444', fontSize: '0.95rem' }}>
                {fsdStatus === 'valid' ? 'ARCHITECTURE RULE PASS' : 'ARCHITECTURE RULE VIOLATION (CI ESLint Failure)'}
              </div>
              <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {fsdMessage}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: Module Federation */}
      {mode === 'module-federation' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.15rem' }}>
              Module Federation Shared Scope & Singleton Simulator
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Simulate container initialization between Host Shell and Remote Micro-App. Observe how singleton configuration prevents duplicate React hook dispatcher memory corruptions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                HOST REACT RUNTIME
              </label>
              <select
                value={hostReactVersion}
                onChange={(e) => setHostReactVersion(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '0.9rem' }}
              >
                <option value="19.0.0">React 19.0.0</option>
                <option value="18.3.1">React 18.3.1</option>
              </select>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                REMOTE REQUIRED PEER
              </label>
              <select
                value={remoteReactVersion}
                onChange={(e) => setRemoteReactVersion(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '0.9rem' }}
              >
                <option value="19.0.0">React 19.0.0</option>
                <option value="18.3.1">React 18.3.1</option>
              </select>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                SINGLETON CONSTRAINT
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="singleton-toggle"
                  checked={isSingleton}
                  onChange={(e) => setIsSingleton(e.target.checked)}
                />
                <label htmlFor="singleton-toggle" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  singleton: true
                </label>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${mfStatus === 'optimal' ? 'var(--emerald-success)' : mfStatus === 'warning' ? '#f59e0b' : '#ef4444'}`,
              background: mfStatus === 'optimal' ? 'rgba(16, 185, 129, 0.1)' : mfStatus === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}
          >
            {mfStatus === 'optimal' ? (
              <ShieldCheck color="var(--emerald-success)" size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <AlertTriangle color={mfStatus === 'warning' ? '#f59e0b' : '#ef4444'} size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div>
              <div style={{ fontWeight: 700, color: mfStatus === 'optimal' ? 'var(--emerald-success)' : mfStatus === 'warning' ? '#f59e0b' : '#ef4444', fontSize: '0.95rem' }}>
                {mfStatus.toUpperCase()} RESOLUTION
              </div>
              <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {mfMessage}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: Strangler Fig */}
      {mode === 'strangler-fig' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.15rem' }}>
              Strangler Fig Route Delegator & Performance Telemetry
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Toggle individual route prefixes to simulate incremental delegation from the legacy monolithic CRA to the modern Next.js clean architecture monorepo.
            </p>
          </div>

          {/* Metric Indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Migration Progress</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--react-cyan)' }}>{percentMigrated}%</div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bundle Reduction</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-success)' }}>-{bundleSizeSaved} KB</div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>P75 INP Latency</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: avgInp <= 100 ? 'var(--emerald-success)' : '#f59e0b' }}>{avgInp} ms</div>
            </div>
          </div>

          {/* Route Matrix */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(migratedRoutes).map(([path, isMigrated]) => (
              <div
                key={path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <code style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{path}</code>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      background: isMigrated ? 'rgba(16, 185, 129, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                      color: isMigrated ? 'var(--emerald-success)' : 'var(--text-muted)'
                    }}
                  >
                    {isMigrated ? 'Edge Proxy -> Modern Next.js FSD' : 'Origin -> Legacy CRA Monolith'}
                  </span>
                </div>
                <button
                  onClick={() => setMigratedRoutes((prev) => ({ ...prev, [path]: !isMigrated }))}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)',
                    background: isMigrated ? 'var(--bg-primary)' : 'var(--emerald-success)',
                    color: isMigrated ? 'var(--text-secondary)' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  {isMigrated ? 'Roll Back to Monolith' : 'Strangulate to Modern'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
