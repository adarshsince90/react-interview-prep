import React, { useState } from 'react';
import { ShieldCheck, Award, AlertOctagon, CheckCircle2, Clock, Play, RotateCcw } from 'lucide-react';

type LabMode = 'trophy-calculator' | 'msw-interceptor' | 'actionability-inspector';

export const TestingLab: React.FC = () => {
  const [mode, setMode] = useState<LabMode>('trophy-calculator');

  // Mode 1: Trophy Calculator State
  const [unitCount, setUnitCount] = useState<number>(100);
  const [integrationCount, setIntegrationCount] = useState<number>(300);
  const [e2eCount, setE2eCount] = useState<number>(20);

  // Mode 2: MSW Simulator State
  const [selectedRoute, setSelectedRoute] = useState<string>('get-user');
  const [responseLog, setResponseLog] = useState<{ status: number; payload: string; time: number } | null>(null);
  const [isIntercepting, setIsIntercepting] = useState<boolean>(false);

  // Mode 3: Actionability Inspector State
  const [isAttached, setIsAttached] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isStable, setIsStable] = useState<boolean>(true);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [isUnoccluded, setIsUnoccluded] = useState<boolean>(true);

  // Calculator calculations
  const totalTests = unitCount + integrationCount + e2eCount;
  const executionTimeSec = Math.round((unitCount * 0.002) + (integrationCount * 0.035) + (e2eCount * 3.5));
  const ciComputeCost = ((executionTimeSec / 60) * 0.008).toFixed(3);
  const confidenceScore = Math.min(99, Math.round(((integrationCount * 0.5) + (e2eCount * 2.5) + (unitCount * 0.05)) / (totalTests || 1) * 100));
  const flakinessRisk = e2eCount > 50 ? 'HIGH' : e2eCount > 25 ? 'MODERATE' : 'LOW';

  // MSW execution simulation
  const handleTriggerMsw = (routeKey: string) => {
    setIsIntercepting(true);
    setResponseLog(null);

    setTimeout(() => {
      setIsIntercepting(false);
      switch (routeKey) {
        case 'get-user':
          setResponseLog({
            status: 200,
            payload: JSON.stringify({ id: 'usr-901', name: 'Dr. Jane Foster', role: 'Staff Architect' }, null, 2),
            time: 24
          });
          break;
        case 'post-checkout':
          setResponseLog({
            status: 201,
            payload: JSON.stringify({ orderId: 'ORD-8821', status: 'CONFIRMED', total: '$149.00' }, null, 2),
            time: 68
          });
          break;
        case 'post-error':
          setResponseLog({
            status: 500,
            payload: JSON.stringify({ error: 'INTERNAL_SERVER_ERROR', message: 'Payment gateway timed out' }, null, 2),
            time: 15
          });
          break;
        case 'get-auth-fail':
          setResponseLog({
            status: 401,
            payload: JSON.stringify({ error: 'UNAUTHORIZED', message: 'Token signature invalid or expired' }, null, 2),
            time: 12
          });
          break;
      }
    }, 250);
  };

  // Actionability Checks
  const allActionable = isAttached && isVisible && isStable && isEnabled && isUnoccluded;

  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '1.5rem', marginTop: '1rem' }}>
      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setMode('trophy-calculator')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: mode === 'trophy-calculator' ? 'var(--bg-tertiary)' : 'transparent',
            color: mode === 'trophy-calculator' ? 'var(--react-cyan)' : 'var(--text-secondary)',
            border: mode === 'trophy-calculator' ? '1px solid var(--border-medium)' : '1px solid transparent',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          <Award size={16} /> 1. Testing Trophy Cost-Confidence Calculator
        </button>
        <button
          onClick={() => setMode('msw-interceptor')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: mode === 'msw-interceptor' ? 'var(--bg-tertiary)' : 'transparent',
            color: mode === 'msw-interceptor' ? 'var(--purple-accent)' : 'var(--text-secondary)',
            border: mode === 'msw-interceptor' ? '1px solid var(--border-medium)' : '1px solid transparent',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          <ShieldCheck size={16} /> 2. MSW Network Interception Simulator
        </button>
        <button
          onClick={() => setMode('actionability-inspector')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: mode === 'actionability-inspector' ? 'var(--bg-tertiary)' : 'transparent',
            color: mode === 'actionability-inspector' ? 'var(--emerald-success)' : 'var(--text-secondary)',
            border: mode === 'actionability-inspector' ? '1px solid var(--border-medium)' : '1px solid transparent',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          <Clock size={16} /> 3. Playwright Actionability Inspector
        </button>
      </div>

      {/* MODE 1: Testing Trophy Calculator */}
      {mode === 'trophy-calculator' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.15rem' }}>
              Frontend Testing Trophy vs. Classical Pyramid ROI Model
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Adjust test distribution across Unit, Integration, and E2E layers. Observe the impact on CI execution time, compute costs, flakiness risk, and production confidence.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Unit Slider */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>UNIT TESTS</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{unitCount}</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={unitCount}
                onChange={(e) => setUnitCount(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>~2ms per test (Pure functions)</span>
            </div>

            {/* Integration Slider */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--react-cyan)' }}>INTEGRATION TESTS (RTL + MSW)</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--react-cyan)' }}>{integrationCount}</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={integrationCount}
                onChange={(e) => setIntegrationCount(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>~35ms per test (Connected features)</span>
            </div>

            {/* E2E Slider */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--amber-warning, #f59e0b)' }}>E2E TESTS (Playwright)</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--amber-warning, #f59e0b)' }}>{e2eCount}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={e2eCount}
                onChange={(e) => setE2eCount(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>~3.5s per test (Real browser instances)</span>
            </div>
          </div>

          {/* Metric Dashboard */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Test Count</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalTests}</div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CI Duration</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: executionTimeSec > 120 ? '#ef4444' : 'var(--emerald-success)' }}>
                {executionTimeSec}s
              </div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CI Compute / Run</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-secondary)' }}>${ciComputeCost}</div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Confidence Index</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--react-cyan)' }}>{confidenceScore}%</div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Flakiness Risk</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: flakinessRisk === 'HIGH' ? '#ef4444' : flakinessRisk === 'MODERATE' ? '#f59e0b' : 'var(--emerald-success)' }}>
                {flakinessRisk}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: MSW Simulator */}
      {mode === 'msw-interceptor' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.15rem' }}>
              MSW v2 Network-Level Request Interceptor
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Trigger outgoing API requests. Observe how Mock Service Worker intercepts standard HTTP sockets, simulates status codes, and returns W3C Response objects without client-side module mocks.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <button
              onClick={() => { setSelectedRoute('get-user'); handleTriggerMsw('get-user'); }}
              disabled={isIntercepting}
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: selectedRoute === 'get-user' ? 'var(--bg-tertiary)' : 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
            >
              <Play size={14} style={{ display: 'inline', marginRight: '4px' }} /> GET /api/users/901 (200 OK)
            </button>
            <button
              onClick={() => { setSelectedRoute('post-checkout'); handleTriggerMsw('post-checkout'); }}
              disabled={isIntercepting}
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: selectedRoute === 'post-checkout' ? 'var(--bg-tertiary)' : 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
            >
              <Play size={14} style={{ display: 'inline', marginRight: '4px' }} /> POST /api/checkout (201 Created)
            </button>
            <button
              onClick={() => { setSelectedRoute('post-error'); handleTriggerMsw('post-error'); }}
              disabled={isIntercepting}
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: selectedRoute === 'post-error' ? 'var(--bg-tertiary)' : 'var(--bg-primary)', color: '#ef4444', border: '1px solid #ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
            >
              <AlertOctagon size={14} style={{ display: 'inline', marginRight: '4px' }} /> POST /api/checkout (500 Error)
            </button>
            <button
              onClick={() => { setSelectedRoute('get-auth-fail'); handleTriggerMsw('get-auth-fail'); }}
              disabled={isIntercepting}
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: selectedRoute === 'get-auth-fail' ? 'var(--bg-tertiary)' : 'var(--bg-primary)', color: '#f59e0b', border: '1px solid #f59e0b', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
            >
              <AlertOctagon size={14} style={{ display: 'inline', marginRight: '4px' }} /> GET /api/account (401 Unauthorized)
            </button>
          </div>

          {/* Response Inspector Box */}
          <div style={{ background: '#0f172a', borderRadius: '8px', padding: '1rem', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                MSW Socket Interceptor Output
              </span>
              {responseLog && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Latency: {responseLog.time}ms</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      background: responseLog.status < 300 ? 'rgba(16, 185, 129, 0.2)' : responseLog.status < 500 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: responseLog.status < 300 ? '#10b981' : responseLog.status < 500 ? '#f59e0b' : '#ef4444'
                    }}
                  >
                    HTTP {responseLog.status}
                  </span>
                </div>
              )}
            </div>
            {isIntercepting ? (
              <div style={{ color: '#38bdf8', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                [MSW Interceptor]: Intercepting socket fetch... Applying delay() and headers...
              </div>
            ) : responseLog ? (
              <pre style={{ margin: 0, color: '#f8fafc', fontSize: '0.82rem', fontFamily: 'monospace', overflowX: 'auto' }}>
                {responseLog.payload}
              </pre>
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                Click a route trigger above to simulate network-level interception.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 3: Playwright Actionability Inspector */}
      {mode === 'actionability-inspector' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.15rem' }}>
              Playwright Auto-Waiting Actionability Check Simulator
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Before Playwright dispatches user actions, it evaluates 5 strict criteria. Toggle the simulated DOM conditions below to see when Playwright proceeds vs. retries.
            </p>
          </div>

          {/* Toggle Conditions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}>
              <input type="checkbox" checked={isAttached} onChange={(e) => setIsAttached(e.target.checked)} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>1. Attached to DOM</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}>
              <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>2. Visible (Non-zero)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}>
              <input type="checkbox" checked={isStable} onChange={(e) => setIsStable(e.target.checked)} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>3. Stable (Not animating)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}>
              <input type="checkbox" checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>4. Enabled (Un-disabled)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}>
              <input type="checkbox" checked={isUnoccluded} onChange={(e) => setIsUnoccluded(e.target.checked)} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>5. Receives Events (No modal)</span>
            </label>
          </div>

          {/* Actionability Result Status */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${allActionable ? 'var(--emerald-success)' : '#f59e0b'}`,
              background: allActionable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}
          >
            {allActionable ? (
              <CheckCircle2 color="var(--emerald-success)" size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <RotateCcw color="#f59e0b" size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div>
              <div style={{ fontWeight: 700, color: allActionable ? 'var(--emerald-success)' : '#f59e0b', fontSize: '0.95rem' }}>
                {allActionable ? 'ACTIONABLE: PLAYWRIGHT DISPATCHES NATIVE CLICK' : 'AUTO-WAITING: PLAYWRIGHT RETRIES (Polling until timeout)'}
              </div>
              <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {allActionable
                  ? 'All 5 actionability criteria satisfied. Native mouse click dispatched with zero artificial sleep delays.'
                  : `Waiting for: ${[!isAttached && 'DOM attachment', !isVisible && 'Visibility', !isStable && 'CSS transition completion', !isEnabled && 'Enabled state', !isUnoccluded && 'Obstruction removal'].filter(Boolean).join(', ')}.`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
