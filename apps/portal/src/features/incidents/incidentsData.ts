import type { IncidentCase } from './types';

export const INCIDENT_CASES: IncidentCase[] = [
  {
    id: 'INC-01',
    title: 'SPA Heap Exhaustion & Chrome Tab Crash (Memory Leak)',
    tagline: 'Detached DOM subtree & global EventBus retention climbing to 1.9 GB V8 heap exhaustion',
    category: 'memory-leak',
    severity: 'P0',
    status: 'RESOLVED',
    affectedSystem: 'Market Analytics Real-Time Trading Terminal (/terminal)',
    activeUsersAffected: '18,400 active traders across EU & US market hours',
    summary:
      'Long-lived single-page application sessions suffered silent memory bloat, growing from 55 MB on boot to 1.9 GB over 90 minutes. When approaching the 2 GB V8 engine isolate limit, browser tabs crashed with "Chrome Error Code: Out of Memory" (Aw, Snap!), abruptly killing open limit orders and user sessions.',
    timelineEvents: [
      {
        id: 't1-1',
        timestamp: '09:14 UTC',
        phase: 'ALERT',
        role: 'Datadog RUM Bot',
        message: 'CRITICAL ALERT: Client crash rate on route /terminal spiked from 0.04% to 14.8%. Error code: Out of Memory.',
        severity: 'critical'
      },
      {
        id: 't1-2',
        timestamp: '09:22 UTC',
        phase: 'TRIAGE',
        role: 'On-Call Lead',
        message: 'War room opened. Paged Frontend Core and Market Data squad leads. Customer support reports traders losing active orders.',
        severity: 'warning'
      },
      {
        id: 't1-3',
        timestamp: '09:35 UTC',
        phase: 'TRIAGE',
        role: 'Staff Architect',
        message: 'Reproduced in staging with 10k tick stream. Memory climbs linearly (+7.5 MB/min) specifically when switching between "Depth" and "Order Book" tabs.',
        severity: 'info'
      },
      {
        id: 't1-4',
        timestamp: '09:52 UTC',
        phase: 'DIAGNOSIS',
        role: 'Performance Engineer',
        message: 'Chrome DevTools heap snapshot comparison captured. Retainer tree shows 4,200 detached HTMLDivElement nodes and 8,000 ResizeObserver callbacks anchored to global MarketEventBus singleton.',
        severity: 'critical'
      },
      {
        id: 't1-5',
        timestamp: '10:15 UTC',
        phase: 'DIAGNOSIS',
        role: 'Staff Architect',
        message: 'Root cause confirmed: useMarketDepth custom hook registered bus.subscribe() inside useEffect but omitted the teardown unsubscribe return callback, capturing chart canvas buffers in closure scope.',
        severity: 'warning'
      },
      {
        id: 't1-6',
        timestamp: '10:35 UTC',
        phase: 'HOTFIX',
        role: 'Frontend Lead',
        message: 'PR #4412 merged: Implemented AbortController signal cleanup in useEffect, explicit event bus unregister, and WeakMap cache ephemeron boundaries.',
        severity: 'info'
      },
      {
        id: 't1-7',
        timestamp: '11:00 UTC',
        phase: 'RESOLVED',
        role: 'Incident Commander',
        message: 'Canary verified across 100% production traffic. Memory stabilizes at flat 62 MB over 3-hour soak test. Tab crash rate dropped to 0.01%. Incident resolved.',
        severity: 'success'
      }
    ],
    telemetry: {
      metricName: 'V8 JS Heap Used Size (MB)',
      description: 'Average memory allocated per browser tab on /terminal route over time',
      unit: 'MB',
      healthyThreshold: 120,
      peakBreach: 1940,
      dataPoints: [
        { time: '08:00', value: 58, threshold: 120, unit: 'MB' },
        { time: '08:30', value: 180, threshold: 120, unit: 'MB' },
        { time: '09:00', value: 540, threshold: 120, unit: 'MB' },
        { time: '09:14', value: 1120, threshold: 120, unit: 'MB' },
        { time: '09:30', value: 1650, threshold: 120, unit: 'MB' },
        { time: '09:50', value: 1940, threshold: 120, unit: 'MB' },
        { time: '10:35', value: 1420, threshold: 120, unit: 'MB' },
        { time: '11:00', value: 62, threshold: 120, unit: 'MB' },
        { time: '11:30', value: 64, threshold: 120, unit: 'MB' }
      ]
    },
    diagnosticActions: [
      {
        id: 'diag-1-1',
        label: 'Three-Snapshot Comparison',
        category: 'heap',
        commandOrTool: 'Chrome DevTools > Memory > Take Heap Snapshot (Baseline, Tab Switch x5, Tab Switch x10)',
        hypothesis: 'Objects allocated during tab switches are failing GC collection and remaining on the heap.',
        outputSummary: 'Objects allocated in Snapshot 1 still persist in Snapshot 3 with 0 deallocations.',
        detailedFindings: [
          'Snapshot 1 (Base): 54.2 MB total heap size, 14,200 JS Objects.',
          'Snapshot 2 (After 5 tab switches): 480.1 MB, 142,000 JS Objects.',
          'Snapshot 3 (After 10 tab switches): 985.6 MB, 310,000 JS Objects (+931.4 MB net delta).',
          'Delta analysis reveals detached DOM trees growing by exactly 420 HTMLDivElement instances per tab toggle.'
        ],
        evidenceBadge: 'DevTools Memory: +931 MB Retained Delta'
      },
      {
        id: 'diag-1-2',
        label: 'Retainer Path Graph Traversal',
        category: 'heap',
        commandOrTool: 'DevTools > Memory > Filter: "Detached" > Retainers Pane',
        hypothesis: 'A persistent global or root-level singleton is holding strong lexical references to unmounted component nodes.',
        outputSummary: 'GC Root -> window.MarketEventBus.listeners -> closure [[Scopes]] -> detached DOM subtree.',
        detailedFindings: [
          'Root anchor: Global singleton `window.__MARKET_BUS__` holds an array of 4,200 listener callbacks.',
          'Each listener closure captures `canvasRef.current` and a large `offscreenBuffer` typed array (16 MB each).',
          'Because the listener was never popped from the array upon component unmount, V8 garbage collector cannot mark the closures as unreachable.'
        ],
        evidenceBadge: 'Root Retainer: MarketEventBus.listeners[]'
      },
      {
        id: 'diag-1-3',
        label: 'Performance Allocation Timeline',
        category: 'performance',
        commandOrTool: 'DevTools > Memory > Allocation instrumentation on timeline (blue vs grey bars)',
        hypothesis: 'Allocation spikes correspond directly to WebSocket market tick processing inside unmounted handlers.',
        outputSummary: 'Blue allocation spikes continue firing for unmounted components on every 100ms WebSocket broadcast.',
        detailedFindings: [
          'Even though the user navigated away from the Depth tab, background callbacks continue recalculating canvas paths.',
          'Over 1,200 redundant CPU calculations/sec occurring for zombie components, degrading main-thread responsiveness from 60 FPS to 12 FPS.'
        ],
        evidenceBadge: 'Zombie Execution: 1,200 calls/sec unmounted'
      }
    ],
    hotfix: {
      filename: 'useMarketDepth.ts',
      language: 'typescript',
      explanation:
        'Refactored useMarketDepth to tie subscription lifecycle strictly to component mount/unmount using AbortController and explicit event unsubscription. Replaced unmanaged global object cache with WeakMap to allow automatic GC collection of DOM nodes.',
      beforeCode: `// ❌ VULNERABLE PRODUCTION CODE (Memory Leak & Zombie Execution)
import { useEffect, useRef } from 'react';
import { MarketEventBus } from '../services/MarketEventBus';

export function useMarketDepth(symbol: string) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bufferRef = useRef<ArrayBuffer>(new ArrayBuffer(1024 * 1024 * 16)); // 16 MB buffer

  useEffect(() => {
    // 💥 BUG: Subscribed to singleton bus, but never returned cleanup function!
    // Closure retains canvasRef, bufferRef, and unmounted DOM node indefinitely.
    MarketEventBus.subscribe('DEPTH_UPDATE', (payload) => {
      if (payload.symbol === symbol && canvasRef.current) {
        renderDepthToCanvas(canvasRef.current, bufferRef.current, payload.data);
      }
    });
  }, [symbol]);

  return { canvasRef };
}`,
      afterCode: `// ✅ ENTERPRISE ARCHITECTURAL HOTFIX (Strict Lifecycle & Teardown)
import { useEffect, useRef } from 'react';
import { MarketEventBus } from '../services/MarketEventBus';

export function useMarketDepth(symbol: string) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bufferRef = useRef<ArrayBuffer | null>(null);

  useEffect(() => {
    // 1. Allocate buffer only while mounted
    bufferRef.current = new ArrayBuffer(1024 * 1024 * 16);
    
    // 2. Tie event listener lifecycle to AbortController signal
    const controller = new AbortController();
    const { signal } = controller;

    const unsubscribe = MarketEventBus.subscribe('DEPTH_UPDATE', (payload) => {
      if (signal.aborted) return;
      if (payload.symbol === symbol && canvasRef.current && bufferRef.current) {
        renderDepthToCanvas(canvasRef.current, bufferRef.current, payload.data);
      }
    });

    // 3. Mandatory teardown: clean up event subscription and release large buffer
    return () => {
      controller.abort();
      unsubscribe();
      bufferRef.current = null; // Explicitly release memory reference
    };
  }, [symbol]);

  return { canvasRef };
}`,
      architecturalGuardrail:
        'Added ESLint custom rule `react-hooks/exhaustive-deps-cleanup` and an automated Playwright soak test that validates zero detached DOM node growth after 50 route transitions.'
    },
    rca: {
      title: 'Post-Mortem: Real-Time Terminal V8 Heap Exhaustion & Browser OOM Crashes',
      incidentCommander: 'Staff Frontend Architect',
      blastRadius: '18,400 active trader sessions on /terminal route',
      financialOrSlaImpact: 'Tier-1 SLA breach; estimated $120,000 in delayed trade executions during morning peak',
      timeToDetect: '8 minutes (Datadog RUM alert threshold)',
      timeToMitigate: '81 minutes (Triage to PR #4412 hotfix deployment)',
      timeToResolve: '106 minutes (Full production verification)',
      executiveSummary:
        'During morning trading hours, client browsers on the /terminal route began crashing after ~90 minutes due to JavaScript heap exhaustion. Forensic investigation revealed that the custom `useMarketDepth` hook failed to unregister its subscription from a global event bus upon unmount. This retained unmounted DOM elements, canvas buffers, and closure state across tab switches, accumulating ~900 MB every 10 transitions until V8 ran out of memory.',
      rootCause:
        'Missing cleanup return function in `useEffect` hook combined with a long-lived global event bus singleton, causing unbounded retention of detached DOM trees and 16 MB ArrayBuffer allocations.',
      fiveWhys: [
        {
          step: 1,
          question: 'Why did the browser tabs crash with "Out of Memory"?',
          answer: 'The V8 JavaScript heap exceeded its 2 GB isolate allocation limit on 64-bit Chrome.'
        },
        {
          step: 2,
          question: 'Why did the V8 heap reach 2 GB?',
          answer: 'Over 4,200 detached HTMLDivElement subtrees and associated 16 MB ArrayBuffers were never garbage collected.'
        },
        {
          step: 3,
          question: 'Why could the garbage collector not reclaim these detached DOM nodes?',
          answer: 'The global MarketEventBus singleton maintained active callback references in its internal listeners array that lexically closed over the DOM elements.'
        },
        {
          step: 4,
          question: 'Why were the callbacks still present in the event bus listeners array after unmounting?',
          answer: 'The `useMarketDepth` hook registered the listener in `useEffect` but did not return a teardown cleanup function to unregister it.'
        },
        {
          step: 5,
          question: 'Why was this not caught in automated CI tests prior to deployment?',
          answer: 'Existing unit tests tested the hook using React Testing Library without simulating route transitions or measuring heap deltas between mount/unmount cycles.'
        }
      ],
      detectionGaps: [
        'Heap size telemetry was sampled every 15 minutes instead of streaming continuous percentiles.',
        'No automated memory-leak regression gate in CI/CD pipeline.'
      ],
      preventions: {
        immediate: [
          'Deployed hotfix PR #4412 with strict AbortController and unsubscribe cleanup.',
          'Added heap snapshot alerting rule in Datadog RUM for client heap > 250 MB.'
        ],
        shortTerm: [
          'Implemented Playwright E2E memory leak test suite running 20 tab-switch cycles with Chrome DevTools Protocol (CDP) `Performance.getMetrics`.',
          'Enforced AST linting rule requiring every `useEffect` with `.subscribe()` to return an explicit cleanup function.'
        ],
        longTermArchitectural: [
          'Migrated event publishing to native EventTarget with WeakRef listener bindings to guarantee automatic GC even if cleanup is omitted.',
          'Architected shared Web Worker offload for market telemetry buffers, moving heavy data off the UI thread completely.'
        ]
      }
    }
  },
  {
    id: 'INC-02',
    title: 'Interaction to Next Paint (INP) Collapse in 50k-Row Enterprise Data Grid',
    tagline: 'Synchronous 740ms main-thread long tasks causing UI freezes and Core Web Vitals penalty',
    category: 'inp-performance',
    severity: 'P1',
    status: 'RESOLVED',
    affectedSystem: 'Global Operations Ledger & Reconciliations Grid (/ledger)',
    activeUsersAffected: '4,500 daily operations specialists and compliance analysts',
    summary:
      'Following a feature release adding multi-column fuzzy search, operations specialists experienced massive UI freezes (700ms - 2,400ms) on keystroke entry. Keystrokes were delayed or buffered, search inputs failed to update, and scrolling dropped to 3 FPS, causing a critical Core Web Vitals INP degradation from 48ms to 920ms.',
    timelineEvents: [
      {
        id: 't2-1',
        timestamp: '14:02 UTC',
        phase: 'ALERT',
        role: 'Google RUM Monitor',
        message: 'WARNING: 75th percentile Interaction to Next Paint (INP) on route /ledger breached 500ms threshold (measured: 920ms).',
        severity: 'critical'
      },
      {
        id: 't2-2',
        timestamp: '14:15 UTC',
        phase: 'TRIAGE',
        role: 'Operations Desk Lead',
        message: 'Multiple complaints: "Typing into the customer search box locks the screen for 2 seconds. Characters appear in wrong order."',
        severity: 'warning'
      },
      {
        id: 't2-3',
        timestamp: '14:30 UTC',
        phase: 'DIAGNOSIS',
        role: 'Performance Architect',
        message: 'DevTools performance profile recorded on 4x CPU throttling. A 740ms Long Task dominates the main thread immediately after input dispatch.',
        severity: 'critical'
      },
      {
        id: 't2-4',
        timestamp: '14:45 UTC',
        phase: 'DIAGNOSIS',
        role: 'Staff Engineer',
        message: 'Root cause identified: synchronous filter() and sort() executing across 50,000 nested records on every keystroke inside standard onChange event handler, starving the browser compositor.',
        severity: 'warning'
      },
      {
        id: 't2-5',
        timestamp: '15:10 UTC',
        phase: 'HOTFIX',
        role: 'Frontend Core Squad',
        message: 'PR #4429: Offloaded fuzzy search to Web Worker via Comlink with Transferable ArrayBuffers; integrated React 19 useTransition and scheduler.yield() cooperative time slicing.',
        severity: 'info'
      },
      {
        id: 't2-6',
        timestamp: '15:40 UTC',
        phase: 'RESOLVED',
        role: 'Incident Commander',
        message: 'Production verified: 75th percentile INP plunged from 920ms to 24ms. Main thread runs at solid 60 FPS during intensive searching. Incident closed.',
        severity: 'success'
      }
    ],
    telemetry: {
      metricName: 'Interaction to Next Paint - INP (ms)',
      description: '75th percentile input delay measured by Google Web Vitals RUM on /ledger',
      unit: 'ms',
      healthyThreshold: 200,
      peakBreach: 920,
      dataPoints: [
        { time: '13:00', value: 42, threshold: 200, unit: 'ms' },
        { time: '13:30', value: 46, threshold: 200, unit: 'ms' },
        { time: '14:02', value: 710, threshold: 200, unit: 'ms' },
        { time: '14:20', value: 920, threshold: 200, unit: 'ms' },
        { time: '14:45', value: 890, threshold: 200, unit: 'ms' },
        { time: '15:10', value: 650, threshold: 200, unit: 'ms' },
        { time: '15:40', value: 24, threshold: 200, unit: 'ms' },
        { time: '16:00', value: 26, threshold: 200, unit: 'ms' }
      ]
    },
    diagnosticActions: [
      {
        id: 'diag-2-1',
        label: 'Performance Flame Chart Profiling',
        category: 'performance',
        commandOrTool: 'Chrome DevTools > Performance > Record (4x CPU throttling, user types "Morgan")',
        hypothesis: 'Synchronous scripting execution in the render thread is causing Long Tasks (>50ms).',
        outputSummary: 'A single 740ms continuous task monopolizes the main thread with 0 idle slices.',
        detailedFindings: [
          'Main thread blocked for 740ms continuously during input event dispatch.',
          'Top flame chart function: `fuzzySearch50kRecords` consumes 680ms pure CPU execution time.',
          'Browser rendering frame budget (16.6ms) missed by 44x; compositor completely unable to paint the cursor or typed glyph.'
        ],
        evidenceBadge: 'DevTools Profile: 740ms Main-Thread Long Task'
      },
      {
        id: 'diag-2-2',
        label: 'Event Loop Blocking & TBT Analysis',
        category: 'performance',
        commandOrTool: 'Lighthouse & Web Vitals Audit on Ledger Route',
        hypothesis: 'Total Blocking Time (TBT) has breached acceptable thresholds due to unyielding event queues.',
        outputSummary: 'Total Blocking Time: 1,840ms. INP rating downgraded from Good (<200ms) to Poor (>500ms).',
        detailedFindings: [
          'Every keystroke queues another 700ms task before the previous task finishes.',
          'Input events are buffered in the OS queue and fired sequentially in a burst, creating an "accordion typing" glitch where characters appear suddenly in clumps.'
        ],
        evidenceBadge: 'Total Blocking Time: 1,840ms'
      },
      {
        id: 'diag-2-3',
        label: 'Worker Thread Offload Feasibility Audit',
        category: 'dependencies',
        commandOrTool: 'Memory inspection of 50k dataset transfer serialization cost',
        hypothesis: 'Structured cloning overhead of 50k objects might exceed the benefits of Web Worker offloading unless structured as transferable buffers.',
        outputSummary: 'Structured clone of 50k nested objects took 32ms; flattening to SharedArrayBuffer / Transferables reduced transfer cost to < 1ms.',
        detailedFindings: [
          'Pre-indexing strings into a flat Uint32Array index enables zero-copy transfer between Main Thread and Web Worker.',
          'Worker can execute search in parallel without ever touching the UI thread event loop.'
        ],
        evidenceBadge: 'Worker Transfer: < 1ms Zero-Copy'
      }
    ],
    hotfix: {
      filename: 'LedgerSearchController.tsx',
      language: 'typescript',
      explanation:
        'Replaced synchronous main-thread filtering with React 19 useTransition for immediate input responsiveness, paired with cooperative multitasking via scheduler.yield() and dedicated Web Worker search offloading.',
      beforeCode: `// ❌ VULNERABLE PRODUCTION CODE (740ms Main-Thread Blocking)
import React, { useState } from 'react';

export function LedgerGrid({ records }: { records: LedgerItem[] }) {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState(records);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val); // Synchronous state update

    // 💥 DISASTER: Heavy CPU loop blocks main thread for 740ms!
    // Browser cannot paint the typed character until this loop finishes.
    const results = records.filter(item => {
      return (
        item.counterparty.toLowerCase().includes(val.toLowerCase()) ||
        item.accountNumber.includes(val) ||
        item.ledgerCode.toLowerCase().includes(val.toLowerCase())
      );
    }).sort((a, b) => b.timestamp - a.timestamp);

    setFiltered(results);
  };

  return <input value={query} onChange={handleSearch} />;
}`,
      afterCode: `// ✅ ENTERPRISE ARCHITECTURAL HOTFIX (Concurrent Transition + Yielding)
import React, { useState, useTransition, useDeferredValue } from 'react';
import { searchWorkerClient } from '../workers/searchWorkerClient';

export function LedgerGrid({ records }: { records: LedgerItem[] }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [filtered, setFiltered] = useState(records);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // 1. High-priority urgent update: input paints immediately at 60 FPS (INP < 20ms)
    setQuery(val);

    // 2. Low-priority non-urgent transition: offloaded to Web Worker
    startTransition(async () => {
      // Offload 50k search to background worker; zero main-thread blockage
      const results = await searchWorkerClient.search(val);
      
      // Cooperative yield ensures compositor paints before state commit
      if ('scheduler' in window && 'yield' in (window as any).scheduler) {
        await (window as any).scheduler.yield();
      }
      
      setFiltered(results);
    });
  };

  return (
    <div>
      <input value={query} onChange={handleSearch} placeholder="Search 50k records..." />
      {isPending && <span className="search-spinner">Filtering in background...</span>}
    </div>
  );
}`,
      architecturalGuardrail:
        'Established CI Lighthouse INP assertion gate (< 100ms) with automated Synthetic User Journey typing tests on 50k simulated datasets.'
    },
    rca: {
      title: 'Post-Mortem: Ledger Grid Interaction to Next Paint (INP) Collapse',
      incidentCommander: 'Principal Performance Engineer',
      blastRadius: '4,500 daily operations users on /ledger',
      financialOrSlaImpact: 'High operational friction; operations teams lost ~35 minutes of productivity per analyst',
      timeToDetect: '13 minutes (Google RUM Real-Time Alert)',
      timeToMitigate: '68 minutes (Triage to PR #4429 rollout)',
      timeToResolve: '98 minutes (Full validation)',
      executiveSummary:
        'Deployment of a new multi-column fuzzy search feature degraded the Ledger route INP from 48ms to 920ms. The search function executed synchronously across 50,000 records inside the `onChange` event handler on the JavaScript main thread. This created 740ms Long Tasks that blocked user keystrokes and prevented the browser compositor from painting frames.',
      rootCause:
        'CPU-intensive search and sort algorithms running synchronously on the main thread without debouncing, concurrent transitions, or background worker delegation.',
      fiveWhys: [
        {
          step: 1,
          question: 'Why did the UI freeze when users typed into the search box?',
          answer: 'The browser main thread was continuously blocked by a 740ms Long Task.'
        },
        {
          step: 2,
          question: 'What was executing during this 740ms Long Task?',
          answer: 'A multi-column string regex filter and sort algorithm iterating over 50,000 ledger records.'
        },
        {
          step: 3,
          question: 'Why did this algorithm run on the main thread?',
          answer: 'The developer implemented the logic directly inside the React `onChange` event handler.'
        },
        {
          step: 4,
          question: 'Why was the algorithm not split into chunks or offloaded to a worker?',
          answer: 'The developer tested locally on high-end M3 Max hardware with 100 mock records, where execution took only 1.2ms.'
        },
        {
          step: 5,
          question: 'Why did staging CI tests fail to catch the performance collapse?',
          answer: 'Synthetic end-to-end tests did not enforce Core Web Vitals thresholds (INP/TBT) against realistic production data volumes (50k rows).'
        }
      ],
      detectionGaps: [
        'Lack of real-time INP alerting in staging environment before production cutover.',
        'Mock test fixtures were 500x smaller than production datasets.'
      ],
      preventions: {
        immediate: [
          'Rolled out PR #4429 with React 19 `useTransition` and Web Worker offloading.',
          'Configured RUM real-time alerting for any route with INP > 150ms.'
        ],
        shortTerm: [
          'Mandated all search operations over 5,000 items must execute in dedicated Web Workers.',
          'Integrated Playwright performance audits in CI testing against seeded 50,000-row SQLite test databases.'
        ],
        longTermArchitectural: [
          'Built standard enterprise `<VirtualGrid />` component with built-in Web Worker search engine and `scheduler.yield()` fallback.',
          'Adopted server-side paginated search with TanStack Query caching for datasets exceeding 100,000 records.'
        ]
      }
    }
  },
  {
    id: 'INC-03',
    title: 'Third-Party Analytics Compromise & LocalStorage JWT Exfiltration',
    tagline: 'Supply-chain CDN injection exploiting localStorage access token storage via un-sandboxed analytics SDK',
    category: 'security-xss',
    severity: 'P0',
    status: 'RESOLVED',
    affectedSystem: 'Identity & Authentication Boundary (All Authenticated Web Routes)',
    activeUsersAffected: '12,400 active sessions across enterprise banking portal',
    summary:
      'An external CDN vendor hosting a third-party analytics script was compromised, injecting an obfuscated payload that traversed window.localStorage to harvest `auth_token` and `refresh_token`. The stolen credentials were exfiltrated via `navigator.sendBeacon` to an unauthorized command-and-control server before detection.',
    timelineEvents: [
      {
        id: 't3-1',
        timestamp: '03:15 UTC',
        phase: 'ALERT',
        role: 'SecOps Egress Monitor',
        message: 'SECURITY ALERT: High-volume anomalous outbound network beacons detected from client browsers to unapproved domain https://analytics-telemetry-cdn.ru/collect.',
        severity: 'critical'
      },
      {
        id: 't3-2',
        timestamp: '03:22 UTC',
        phase: 'TRIAGE',
        role: 'Incident Commander / CISO',
        message: 'Declared P0 Security Incident. Invoked emergency response team. Paged Principal Frontend Architect and Auth squad.',
        severity: 'critical'
      },
      {
        id: 't3-3',
        timestamp: '03:40 UTC',
        phase: 'DIAGNOSIS',
        role: 'AppSec Lead',
        message: 'Forensic payload de-obfuscation complete: vendor-metrics.js (loaded from cdn.partner-metrics.com) was tampered with at source; it extracts localStorage.getItem("access_token") and beacons it.',
        severity: 'critical'
      },
      {
        id: 't3-4',
        timestamp: '04:05 UTC',
        phase: 'HOTFIX',
        role: 'Edge Infra Lead',
        message: 'Emergency edge mitigation: Injected strict Content Security Policy (CSP) connect-src header via Cloudflare Workers blocking the rogue domain; revoked all active JWT refresh tokens globally.',
        severity: 'warning'
      },
      {
        id: 't3-5',
        timestamp: '05:15 UTC',
        phase: 'HOTFIX',
        role: 'Frontend Architect',
        message: 'Permanent architectural remediation deployed: Migrated authentication to Backend-For-Frontend (BFF) HTTP-Only SameSite=Strict cookies; completely eliminated client-accessible token storage in JS.',
        severity: 'info'
      },
      {
        id: 't3-6',
        timestamp: '06:30 UTC',
        phase: 'RESOLVED',
        role: 'CISO / Incident Commander',
        message: 'Penetration testing and telemetry audit verified: Zero client JavaScript has access to session credentials. Third-party CDN scripts sandboxed with Subresource Integrity (SRI). Incident closed.',
        severity: 'success'
      }
    ],
    telemetry: {
      metricName: 'Unauthorized Egress Beacons / min',
      description: 'Anomalous network beacons to malicious C2 domain detected by Cloudflare Edge',
      unit: 'req/min',
      healthyThreshold: 0,
      peakBreach: 4200,
      dataPoints: [
        { time: '02:30', value: 0, threshold: 0, unit: 'req/min' },
        { time: '03:00', value: 45, threshold: 0, unit: 'req/min' },
        { time: '03:15', value: 1800, threshold: 0, unit: 'req/min' },
        { time: '03:30', value: 4200, threshold: 0, unit: 'req/min' },
        { time: '04:05', value: 210, threshold: 0, unit: 'req/min' },
        { time: '04:30', value: 0, threshold: 0, unit: 'req/min' },
        { time: '05:15', value: 0, threshold: 0, unit: 'req/min' },
        { time: '06:00', value: 0, threshold: 0, unit: 'req/min' }
      ]
    },
    diagnosticActions: [
      {
        id: 'diag-3-1',
        label: 'Network Egress Trace & Payload Forensics',
        category: 'network',
        commandOrTool: 'Cloudflare Edge Logs & Chrome DevTools Network Tab Export',
        hypothesis: 'A client-side script is transmitting sensitive authentication tokens over unapproved network channels.',
        outputSummary: 'Confirmed POST requests via navigator.sendBeacon containing base64 JWT payload.',
        detailedFindings: [
          'Endpoint: `https://analytics-telemetry-cdn.ru/collect`',
          'Payload structure: `{ user_id, org_id, jwt: "eyJhbGciOi..." }`',
          'Initiator: `vendor-metrics.js:442` (external third-party script loaded via `<script>` tag).'
        ],
        evidenceBadge: 'Network Egress: 4,200 rogue beacons/min'
      },
      {
        id: 'diag-3-2',
        label: 'Storage Vulnerability Audit',
        category: 'storage',
        commandOrTool: 'Browser Console & Security Panel Storage Inspection',
        hypothesis: 'Sensitive session tokens are stored in accessible browser storage mechanisms (localStorage / sessionStorage).',
        outputSummary: 'JWT access and refresh tokens stored in unencrypted window.localStorage.',
        detailedFindings: [
          'Keys discovered: `access_token`, `refresh_token`, `user_profile`.',
          'Any script running on the origin (including third-party analytics or XSS vectors) has unrestricted synchronous read access via `localStorage.getItem()`.',
          'No Content Security Policy `connect-src` was in place to restrict destination endpoints.'
        ],
        evidenceBadge: 'Storage Audit: Plaintext JWT in localStorage'
      },
      {
        id: 'diag-3-3',
        label: 'Subresource Integrity (SRI) Hash Check',
        category: 'dependencies',
        commandOrTool: 'HTML Source Inspection of `<script src="...vendor-metrics.js">`',
        hypothesis: 'The external script tag was loaded without integrity hash pinning.',
        outputSummary: 'Script tag lacked `integrity` attribute, allowing CDN to deliver modified malicious payload without browser validation failure.',
        detailedFindings: [
          'Existing tag: `<script src="https://cdn.partner-metrics.com/v2/analytics.js"></script>`',
          'Because no SHA-384 hash was specified, the browser faithfully executed the modified hostile code.'
        ],
        evidenceBadge: 'Integrity Audit: Missing SRI Hash'
      }
    ],
    hotfix: {
      filename: 'authClient.ts',
      language: 'typescript',
      explanation:
        'Abolished client-side localStorage token persistence. Replaced with Backend-For-Frontend (BFF) proxy architecture using HttpOnly, Secure, SameSite=Strict cookies that JavaScript cannot access even in the event of full XSS.',
      beforeCode: `// ❌ VULNERABLE PRODUCTION CODE (Plaintext JWT in localStorage)
export const authService = {
  login: async (credentials: Credentials) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    const { accessToken, refreshToken } = await res.json();

    // 💥 CATASTROPHIC RISK: Stored in localStorage!
    // Any third-party script, analytics tag, or XSS flaw can steal this token!
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },

  getAuthHeader: () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: \`Bearer \${token}\` } : {};
  }
};`,
      afterCode: `// ✅ ENTERPRISE ARCHITECTURAL HOTFIX (BFF + HttpOnly Secure Cookies)
// Token is stored strictly server-side in encrypted HttpOnly cookie.
// Client JavaScript has ZERO access to raw credentials (Immune to XSS token theft).

export const authService = {
  login: async (credentials: Credentials) => {
    // 1. BFF sets Set-Cookie: __Host-SessionToken=...; HttpOnly; Secure; SameSite=Strict; Path=/
    const res = await fetch('/api/bff/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin', // Browser automatically sends and receives cookies
      body: JSON.stringify(credentials)
    });

    if (!res.ok) throw new Error('Authentication failed');
    return await res.json(); // Returns non-sensitive user metadata only
  },

  apiFetch: async (endpoint: string, options: RequestInit = {}) => {
    // 2. Cookie is attached automatically by browser; no client Authorization header needed
    return fetch(endpoint, {
      ...options,
      credentials: 'same-origin',
      headers: {
        ...options.headers,
        'X-Requested-With': 'XMLHttpRequest' // Anti-CSRF defense
      }
    });
  }
};`,
      architecturalGuardrail:
        'Configured strict CSP response headers (`default-src self; script-src self https://trusted.cdn.com nonce-...; connect-src self;`) and enforced automated GitHub Actions dependency hash verification.'
    },
    rca: {
      title: 'Post-Mortem: Third-Party Analytics CDN Compromise & Token Exfiltration',
      incidentCommander: 'Chief Information Security Officer & Staff Architect',
      blastRadius: '12,400 active enterprise user sessions',
      financialOrSlaImpact: 'Zero confirmed monetary loss due to prompt session revocation; external compliance disclosures filed within 72 hours',
      timeToDetect: '7 minutes (Automated egress telemetry monitor)',
      timeToMitigate: '50 minutes (Global session invalidation + Edge CSP block)',
      timeToResolve: '195 minutes (Full BFF architecture transition)',
      executiveSummary:
        'A compromised CDN vendor delivered a modified `vendor-metrics.js` script containing malicious credential-harvesting code. The script read JWT tokens stored in `localStorage` and exfiltrated them to an external C2 server. The incident was mitigated by an immediate global session revocation and edge CSP firewall rule, followed by migrating all token storage to an enterprise Backend-For-Frontend (BFF) HTTP-Only cookie architecture.',
      rootCause:
        'Storing sensitive authentication bearer tokens in client-accessible `localStorage` while executing un-sandboxed external third-party JavaScript without Subresource Integrity (SRI) or strict Content Security Policy (CSP).',
      fiveWhys: [
        {
          step: 1,
          question: 'Why were user authentication tokens transmitted to an unauthorized external domain?',
          answer: 'A third-party analytics script executing in the browser read the tokens and dispatched them via beacon requests.'
        },
        {
          step: 2,
          question: 'Why was the third-party script able to read the authentication tokens?',
          answer: 'The tokens were stored in `window.localStorage`, which is globally accessible to all scripts running within the origin.'
        },
        {
          step: 3,
          question: 'Why were tokens stored in localStorage instead of HttpOnly cookies?',
          answer: 'Initial MVP developers used localStorage to facilitate client-side Authorization header injection without building a BFF proxy.'
        },
        {
          step: 4,
          question: 'Why was the compromised script allowed to execute in the browser?',
          answer: 'The script was loaded from an external CDN without Subresource Integrity (SRI) hashes, so the browser executed the modified code.'
        },
        {
          step: 5,
          question: 'Why was outbound network traffic to the rogue domain not blocked immediately by the browser?',
          answer: 'The application lacked a strict Content Security Policy (CSP) `connect-src` header restriction.'
        }
      ],
      detectionGaps: [
        'Lack of client-side Content Security Policy reporting endpoints (report-to / report-uri).',
        'No automated integrity hash verification for external script tags in CI.'
      ],
      preventions: {
        immediate: [
          'Revoked all active JWT refresh tokens and terminated user sessions.',
          'Deployed Cloudflare Workers edge rule enforcing strict CSP `connect-src self`.'
        ],
        shortTerm: [
          'Migrated all authentication to BFF architecture with HttpOnly, Secure, SameSite=Strict cookies.',
          'Added Subresource Integrity (SRI) hashes to all external script tags.'
        ],
        longTermArchitectural: [
          'Banned all third-party script execution in the primary authenticated banking origin; isolated analytics tags into an unprivileged sandbox iframe.',
          'Implemented automated continuous CSP violation monitoring via Sentry / Datadog.'
        ]
      }
    }
  },
  {
    id: 'INC-04',
    title: 'Production Micro-Frontend Cascade Outage (Diamond Dependency Skew)',
    tagline: 'Module Federation dual React 18/19 runtime instantiation triggering null useContext dispatcher crashes',
    category: 'mfe-dependency',
    severity: 'P1',
    status: 'RESOLVED',
    affectedSystem: 'E-Commerce Global Checkout & Payment Gateway (/checkout)',
    activeUsersAffected: '100% of checkout sessions ($240,000/hr revenue impact)',
    summary:
      'Immediately following a patch deployment of the `@payments-mfe` remote module, the main checkout container crashed with `TypeError: Cannot read properties of null (reading "useContext")`. Module Federation configuration lacked strict version constraints, allowing the remote to instantiate an isolated React 19 runtime on a host running React 18.2, corrupting the React hook dispatcher.',
    timelineEvents: [
      {
        id: 't4-1',
        timestamp: '11:04 UTC',
        phase: 'ALERT',
        role: 'PagerDuty Alert Bot',
        message: 'SEV-1 ALERT: Checkout error rate jumped from 0.02% to 99.4% following deployment of payments-mfe v2.4.1.',
        severity: 'critical'
      },
      {
        id: 't4-2',
        timestamp: '11:12 UTC',
        phase: 'TRIAGE',
        role: 'Release Commander',
        message: 'War room opened. Initiated immediate rollback of payments-mfe remote container to v2.4.0.',
        severity: 'critical'
      },
      {
        id: 't4-3',
        timestamp: '11:24 UTC',
        phase: 'TRIAGE',
        role: 'Infra Lead',
        message: 'Rollback complete. Checkout error rate returned to 0.02%. Revenue flow restored. Investigation underway.',
        severity: 'info'
      },
      {
        id: 't4-4',
        timestamp: '12:10 UTC',
        phase: 'DIAGNOSIS',
        role: 'Staff Architect',
        message: 'Bundle inspection: payments-mfe v2.4.1 upgraded package.json to react@19.0.0, while checkout host container is on react@18.2.0.',
        severity: 'warning'
      },
      {
        id: 't4-5',
        timestamp: '12:35 UTC',
        phase: 'DIAGNOSIS',
        role: 'Frontend Architect',
        message: 'Root cause: Module Federation config specified shared: { react: { singleton: true } } WITHOUT strictVersion: true or requiredVersion. Remote fell back to bundling its own React 19 copy, causing dual React runtime dispatcher collisions.',
        severity: 'critical'
      },
      {
        id: 't4-6',
        timestamp: '13:15 UTC',
        phase: 'HOTFIX',
        role: 'MFE Core Team',
        message: 'PR #882: Enforced strict shared contract in Module Federation configs (strictVersion: true, requiredVersion: "^18.2.0"), added circuit-breaker fallback UI, and cross-repo contract verification.',
        severity: 'info'
      },
      {
        id: 't4-7',
        timestamp: '14:00 UTC',
        phase: 'RESOLVED',
        role: 'Incident Commander',
        message: 'Payments v2.4.2 redeployed with strict contracts. Verified in staging and canary ring. Zero dispatcher crashes. Incident closed.',
        severity: 'success'
      }
    ],
    telemetry: {
      metricName: 'Checkout Error Rate (%)',
      description: 'Percentage of checkout page loads resulting in uncaught client runtime exceptions',
      unit: '%',
      healthyThreshold: 0.1,
      peakBreach: 99.4,
      dataPoints: [
        { time: '10:30', value: 0.02, threshold: 0.1, unit: '%' },
        { time: '11:00', value: 0.03, threshold: 0.1, unit: '%' },
        { time: '11:04', value: 99.4, threshold: 0.1, unit: '%' },
        { time: '11:15', value: 98.8, threshold: 0.1, unit: '%' },
        { time: '11:24', value: 0.02, threshold: 0.1, unit: '%' },
        { time: '12:00', value: 0.02, threshold: 0.1, unit: '%' },
        { time: '13:15', value: 0.01, threshold: 0.1, unit: '%' },
        { time: '14:00', value: 0.01, threshold: 0.1, unit: '%' }
      ]
    },
    diagnosticActions: [
      {
        id: 'diag-4-1',
        label: 'Runtime Dispatcher Sanity Probe',
        category: 'dependencies',
        commandOrTool: 'Browser Console: Inspect ReactCurrentDispatcher.current',
        hypothesis: 'Multiple copies of React exist in memory, resulting in hooks being invoked on an uninitialized dispatcher.',
        outputSummary: 'Two distinct React instances found in window scope; dispatcher was null in payments component.',
        detailedFindings: [
          'Host container loaded React 18.2 from `https://app.corp/assets/react-18.js`.',
          'Remote container loaded React 19.0 from `https://payments.corp/assets/remoteEntry.js`.',
          'When the payments component executed `useContext(PaymentContext)`, it invoked the React 19 hook engine which had no active Fiber rendering context, throwing null dereference.'
        ],
        evidenceBadge: 'Dual Runtime: React 18.2 + React 19.0'
      },
      {
        id: 'diag-4-2',
        label: 'Module Federation Negotiation Audit',
        category: 'dependencies',
        commandOrTool: 'Inspect __webpack_require__.S.default and shared scope map',
        hypothesis: 'Shared dependency negotiation failed to enforce a shared singleton contract.',
        outputSummary: 'Webpack shared scope shows version mismatch without strict error bailout.',
        detailedFindings: [
          'Shared configuration had `singleton: true`, but omitted `strictVersion: true`.',
          'Because `strictVersion` was false, Webpack logged a non-fatal console warning and fell back to instantiating the remote’s local bundled version.',
          'Result: Silent catastrophic split-brain state in production.'
        ],
        evidenceBadge: 'Federation Audit: Missing strictVersion'
      },
      {
        id: 'diag-4-3',
        label: 'Fault Containment Boundary Inspection',
        category: 'performance',
        commandOrTool: 'Component Tree Inspection in React DevTools',
        hypothesis: 'The remote MFE was rendered without an isolated Error Boundary, bringing down the entire host shell.',
        outputSummary: 'Zero Error Boundary between host container and remote payment widget.',
        detailedFindings: [
          'Crash in child `<RemotePaymentForm />` unmounted the entire parent `<CheckoutPage />`, showing users a completely blank white screen.',
          'Missing Circuit Breaker pattern.'
        ],
        evidenceBadge: 'Blast Radius: Uncontained Host Crash'
      }
    ],
    hotfix: {
      filename: 'webpack.config.js & RemoteBoundary.tsx',
      language: 'typescript',
      explanation:
        'Configured strict semantic version constraints in Module Federation configuration to prevent silent runtime version skew, and wrapped remote module imports in a fault-tolerant Circuit Breaker Error Boundary.',
      beforeCode: `// ❌ VULNERABLE PRODUCTION CONFIGURATION (Loose Federation Contract)
// webpack.config.js (payments-mfe)
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'payments_mfe',
      filename: 'remoteEntry.js',
      exposes: { './PaymentForm': './src/PaymentForm' },
      shared: {
        // 💥 BUG: singleton without strictVersion or requiredVersion bounds!
        // When remote upgrades to React 19, it silently instantiates a dual runtime.
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};`,
      afterCode: `// ✅ ENTERPRISE ARCHITECTURAL HOTFIX (Strict Contract & Circuit Breaker)
// 1. webpack.config.js: Enforce strict semantic versioning contract
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'payments_mfe',
      filename: 'remoteEntry.js',
      exposes: { './PaymentForm': './src/PaymentForm' },
      shared: {
        react: {
          singleton: true,
          strictVersion: true, // Bail immediately if version mismatches host
          requiredVersion: '^18.2.0' // Explicit semver compatibility range
        },
        'react-dom': {
          singleton: true,
          strictVersion: true,
          requiredVersion: '^18.2.0'
        }
      }
    })
  ]
};

// 2. RemoteBoundary.tsx: Circuit breaker prevents unhandled MFE crashes from taking down host
export function FederatedComponentBoundary({ children, fallback }: Props) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="mfe-circuit-breaker">
          <h4>Payment service temporarily degraded</h4>
          <p>Please select an alternate payment method or retry.</p>
          <button onClick={resetErrorBoundary}>Retry Payment</button>
        </div>
      )}
    >
      <Suspense fallback={<PaymentSkeleton />}>{children}</Suspense>
    </ErrorBoundary>
  );
}`,
      architecturalGuardrail:
        'Implemented cross-repository contract tests in CI using `@module-federation/sdk` that validate host and remote dependency compatibility prior to container deployment.'
    },
    rca: {
      title: 'Post-Mortem: Checkout Cascade Outage Caused by Micro-Frontend Dependency Skew',
      incidentCommander: 'Staff Enterprise Architect',
      blastRadius: '100% of global checkout users for 20 minutes',
      financialOrSlaImpact: 'Estimated $80,000 in delayed orders during 20-minute outage window',
      timeToDetect: '8 minutes (PagerDuty error rate alert)',
      timeToMitigate: '20 minutes (Container rollback to v2.4.0)',
      timeToResolve: '176 minutes (Strict contract redesign and deployment)',
      executiveSummary:
        'A minor release of the Payments Micro-Frontend caused a 99.4% crash rate across the entire checkout funnel. The root cause was an uncoordinated upgrade to React 19 in the remote repository while the host shell was running React 18.2. Because Module Federation lacked strict version constraints, both React runtimes were loaded simultaneously, causing `useContext` null reference crashes in the shared context tree.',
      rootCause:
        'Module Federation `singleton: true` configuration without `strictVersion: true` or `requiredVersion` bounds, resulting in dual React runtime instantiation and hook dispatcher collapse.',
      fiveWhys: [
        {
          step: 1,
          question: 'Why did the checkout page display a blank white screen?',
          answer: 'An uncaught `TypeError: Cannot read properties of null (reading "useContext")` unmounted the root component.'
        },
        {
          step: 2,
          question: 'Why did `useContext` fail with a null reference?',
          answer: 'The React hook dispatcher was null because the component was executing inside a secondary, uninitialized React runtime instance.'
        },
        {
          step: 3,
          question: 'Why were two different React runtime instances loaded on the page?',
          answer: 'The checkout host was running React 18.2, while the newly deployed payments remote was bundled with React 19.0.'
        },
        {
          step: 4,
          question: 'Why did Module Federation not reuse the host React instance?',
          answer: 'The shared configuration specified `singleton: true` without `strictVersion: true`, so Webpack logged a warning and fell back to loading the remote copy.'
        },
        {
          step: 5,
          question: 'Why did the Payments squad upgrade to React 19 without host coordination?',
          answer: 'Autonomous team deployment pipelines operated in isolated repositories without federated contract compatibility verification in CI.'
        }
      ],
      detectionGaps: [
        'No cross-micro-frontend integration tests in CI verifying that remote bundles load cleanly into the host container.',
        'Absence of an isolated `<ErrorBoundary>` around the remote payment widget.'
      ],
      preventions: {
        immediate: [
          'Rolled back payments container to v2.4.0 immediately.',
          'Deployed PR #882 with strict Module Federation versioning and Circuit Breaker Error Boundaries.'
        ],
        shortTerm: [
          'Added cross-repository federated contract test suite in GitHub Actions prior to remote deployment.',
          'Wrapped all remote module imports in `<FederatedComponentBoundary>` to isolate blast radius.'
        ],
        longTermArchitectural: [
          'Adopted an enterprise centralized Monorepo or federated schema registry for core singleton dependencies (`react`, `react-dom`, `@tanstack/react-query`).',
          'Implemented progressive canary ring deployment (1% -> 10% -> 100%) for all remote micro-frontend updates.'
        ]
      }
    }
  }
];
