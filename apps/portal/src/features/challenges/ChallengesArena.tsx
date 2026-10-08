import React, { useState } from 'react';
import { VirtualizerChallengeArena } from './virtualizer/VirtualizerChallengeArena';
import { ConcurrentStoreChallengeArena } from './store/ConcurrentStoreChallengeArena';
import { OfflineOutboxChallengeArena } from './outbox/OfflineOutboxChallengeArena';
import { 
  Code2, 
  Layers, 
  Zap, 
  Database, 
  FileText, 
  BookOpen, 
  Play, 
  CheckCircle2, 
  AlertTriangle,
  Award,
  Terminal,
  Copy,
  Check,
  ShieldCheck,
  Scale,
  Sparkles
} from 'lucide-react';

export type ChallengeTab = 'simulator' | 'spec' | 'theory';

export interface CodeBlockData {
  title: string;
  language: string;
  code: string;
  annotations: string[];
}

export interface TradeoffRow {
  approach: string;
  pros: string;
  cons: string;
}

export interface DefenseItem {
  trap: string;
  rebuttal: string;
}

export interface ChallengeTheoryData {
  architecturalPattern: string;
  complexityAnalysis: string;
  foundations: string;
  codeBlock: CodeBlockData;
  pillars: string[];
  tradeoffs: TradeoffRow[];
  staffDefense: DefenseItem[];
  keyTakeaways: string[];
}

interface ChallengeMeta {
  id: string;
  number: string;
  title: string;
  tagline: string;
  icon: React.ComponentType<{ size: number }>;
  color: string;
  spec: {
    roleTarget: string;
    problemStatement: string;
    requirements: string[];
    rubricPoints: string[];
    edgeCases: string[];
  };
  theory: ChallengeTheoryData;
}

const CHALLENGES_CONFIG: ChallengeMeta[] = [
  {
    id: 'ch-01-virtualizer',
    number: 'CH-01',
    title: 'Dynamic-Height Virtual Windowing Engine',
    tagline: 'Variable row heights via ResizeObserver, cumulative prefix-sum & O(log N) binary search.',
    icon: Layers,
    color: '#0ea5e9',
    spec: {
      roleTarget: 'Staff / Principal Frontend Architect',
      problemStatement: 'Rendering datasets of 10,000+ items in standard React causes severe DOM bloat, high V8 heap allocation, and paint jank during rapid scrolling. Implement a zero-dependency virtualizer component and hook that recycles a small physical pool of DOM nodes, calculates variable row heights dynamically without scroll jumps, and locks at 60 FPS.',
      requirements: [
        'Calculate item positions dynamically using ResizeObserver without layout thrashing.',
        'Binary search cumulative offset prefix-sum in O(log N) rather than O(N) linear array scans.',
        'Support configurable overscan buffer rows to prevent blank white scroll frames.',
        'Zero layout jitter or scroll jumping when accordions or dynamic elements expand.',
        'Provide bi-directional programmatic scrolling (scrollToIndex) with auto/start/center/end alignment.'
      ],
      rubricPoints: [
        'Staff candidates understand that naive height caches break when elements resize asynchronously (images, fonts, text wrap).',
        'Staff candidates replace O(N) visible slice finder loops with O(log N) binary search over prefix sums.',
        'Staff candidates isolate layout measurements from React render loops to prevent ResizeObserver infinite loops.'
      ],
      edgeCases: [
        'Rapid continuous mousewheel scroll causing overscan boundary clipping.',
        'Dynamic item height expansion above current viewport causing scroll anchor drift.',
        'Dynamic deletion of items requiring cumulative offset prefix sum invalidation.'
      ]
    },
    theory: {
      architecturalPattern: 'Cumulative Running Offset Prefix-Sum with ResizeObserver Feedback Loop',
      complexityAnalysis: 'Item Lookup: O(log N) binary search vs O(N) linear scan | Memory Footprint: O(V) active DOM nodes (~15 nodes) vs O(N) (100,000 nodes) | Render Frequency: 60 FPS compositor pinned',
      foundations: 'When rendering large collections (10,000+ items), mounting all physical DOM nodes consumes over 200MB of V8 heap memory and forces cascading layout reflows during scroll. Virtual windowing constrains the physical DOM footprint to only the visible slice V = ceil(viewportHeight / itemHeight) + 2 * overscan (~15-20 nodes). When row heights vary dynamically (localized text wraps, accordions, dynamic media), static mathematical multiplication (index * height) is invalid. We construct a monotonic cumulative prefix-sum offset index paired with binary search to guarantee O(log N) position lookups with zero layout thrashing.',
      codeBlock: {
        title: 'Core Binary Search & Dynamic Prefix-Sum Engine',
        language: 'typescript',
        code: `// 1. Binary Search: Find starting visible item index in O(log N)
export function findStartIndex(offsets: number[], scrollTop: number): number {
  let low = 0;
  let high = offsets.length - 1;
  let result = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (offsets[mid] <= scrollTop) {
      result = mid;     // Item mid starts before or at current scroll
      low = mid + 1;    // Search higher to find closest lower bound
    } else {
      high = mid - 1;   // Search lower
    }
  }
  return result;
}

// 2. Cumulative Prefix-Sum Recalculation
const { offsets, totalHeight } = useMemo(() => {
  const arr = new Array(itemCount);
  let currentOffset = 0;
  for (let i = 0; i < itemCount; i++) {
    arr[i] = currentOffset;
    const measured = measuredHeights.get(i);
    currentOffset += measured !== undefined ? measured : estimatedItemHeight;
  }
  return { offsets: arr, totalHeight: currentOffset };
}, [itemCount, estimatedItemHeight, measurementVersion]);

// 3. Decoupled ResizeObserver Measurement Callback
const measureElement = useCallback((index: number, node: HTMLElement | null) => {
  if (!node) return;
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const height = Math.ceil(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height);
      if (height > 0 && measuredHeightsRef.current.get(index) !== height) {
        measuredHeightsRef.current.set(index, height);
        // Batch invalidation: version bump triggers memoized prefix-sum update
        setMeasurementVersion(v => v + 1);
      }
    }
  });
  observer.observe(node);
}, []);`,
        annotations: [
          'Binary Search Invariant: Because all row heights are strictly positive, prefix sums are strictly monotonically increasing, making binary search guaranteed correct in O(log N).',
          'Prefix-Sum Precomputation: offsets[i] stores the exact CSS top offset for row i in O(1) retrieval time without triggering DOM reflows.',
          'ResizeObserver Isolation: Element heights are measured asynchronously off the main scroll loop, preventing forced synchronous layout reflow.'
        ]
      },
      pillars: [
        'Cumulative Running Prefix-Sums: Pre-aggregates offsets into an array where offsets[i] = sum(heights[0...i-1]). Any item position is retrieved in O(1) time without querying browser DOM geometry.',
        'Monotonic Binary Search: Because heights are strictly positive, prefix sums are strictly monotonically increasing. This mathematical guarantee allows binary searching the start index in O(log N) rather than O(N).',
        'Zero-Thrashing ResizeObserver: Reading element.offsetHeight inside scroll listeners forces synchronous layout reflow. Delegating measurements to asynchronous ResizeObserver callbacks keeps scroll handling strictly non-blocking.',
        'Compositor-Layer Positioning: Visible items use position: absolute with transform: translateY(offsetY px) rather than mutating top or margin, allowing Chromium/Gecko compositor threads to handle scrolling on GPU layers.'
      ],
      tradeoffs: [
        {
          approach: 'Static Fixed-Height Virtualizer (react-window FixedSizeList)',
          pros: 'O(1) instant math calculation (index * H), 0 byte cache overhead.',
          cons: 'Inflexible; truncates text or breaks layouts when user content has variable heights.'
        },
        {
          approach: 'O(N) Linear Scan on Scroll',
          pros: 'Simple to code in a 30-minute interview whiteboard.',
          cons: 'Drops frames during continuous fast scrolling (100,000 items = 100,000 loop iterations per scroll event).'
        },
        {
          approach: 'Dynamic Prefix-Sum + Binary Search (Our Architecture)',
          pros: 'O(log N) speed, dynamic element resizing support, zero layout thrashing.',
          cons: 'Requires cache invalidation and ResizeObserver cleanup bookkeeping.'
        }
      ],
      staffDefense: [
        {
          trap: 'Why not read offsetTop on elements when the user scrolls?',
          rebuttal: 'Reading offsetTop, offsetHeight, or getBoundingClientRect() during a scroll event forces synchronous layout (reflow) on the browser main thread. In our architecture, geometry is fully virtualized in JavaScript memory via the prefix-sum array. The browser only measures newly mounted rows through ResizeObserver off the scroll tick.'
        },
        {
          trap: 'What happens if an accordion expands above the current viewport?',
          rebuttal: 'If an item above the viewport expands, the cumulative offset of all items below shifts, causing content to visually jump. A Staff-level virtualizer implements Scroll Anchoring: when an element above scrollTop resizes by Delta H, we adjust container.scrollTop += Delta H in the same microtask, neutralizing visual shift.'
        }
      ],
      keyTakeaways: [
        'Prefix-Sum Array: Running totals of measured heights enable instant offset mapping for any index i in O(1).',
        'ResizeObserver Self-Healing: Dynamic DOM size changes update measured heights in a Map and trigger a single measurementVersion bump.',
        'Compositor Thread Anchoring: translateY(offsetY) keeps recycled DOM elements pinned on GPU layers without triggering document reflow.'
      ]
    }
  },
  {
    id: 'ch-02-concurrent-store',
    number: 'CH-02',
    title: 'Zero-Dependency Concurrent State Store',
    tagline: 'Concurrent React 18/19 immunity, useSyncExternalStore, selector memoization & batching.',
    icon: Zap,
    color: '#8b5cf6',
    spec: {
      roleTarget: 'Senior / Staff React Runtime Engineer',
      problemStatement: 'Building global state management without Redux or Zustand. The store must integrate seamlessly with React 18/19 Concurrent Mode (time-slicing and startTransition), preventing tearing bugs where two concurrent sibling components render different snapshots of the external state during a single frame.',
      requirements: [
        'Pure TypeScript createStore<T> with getState(), setState(), and subscribe().',
        'Custom useStore hook powered by React native useSyncExternalStore.',
        'Selector memoization with referential equality (Object.is) preventing unnecessary renders.',
        'Microtask batching: multiple synchronous setState dispatches consolidated into one listener trigger.',
        'Demonstrable zero-tearing guarantee verified across 25 concurrent dispatches.'
      ],
      rubricPoints: [
        'Staff candidates know why useEffect + useState stores tear in React 18 Concurrent Mode (lack of synchronous getSnapshot consistency).',
        'Staff candidates implement selector memoization to prevent getSnapshot infinite render loops.',
        'Staff candidates implement microtask queuing to coalesce high-frequency mutations.'
      ],
      edgeCases: [
        'Returning a newly created object in selector causing getSnapshot referential mismatch loops.',
        'Unsubscribing a listener in the middle of a notification loop (handled via Set iteration snapshot).',
        'State mutations dispatched inside concurrent startTransition transitions.'
      ]
    },
    theory: {
      architecturalPattern: 'External Store Subscription via useSyncExternalStore Contract',
      complexityAnalysis: 'Mutation Dispatch: O(1) state replacement | Subscriber Notification: O(L) where L = active subscribers | Microtask Coalescing: N synchronous mutations -> 1 render pass | Referential Check: O(1) via Object.is',
      foundations: 'In React 18/19 Concurrent Mode, rendering is interruptible and can be paused or yielded across multiple animation frames. Traditional state libraries that synchronize via useEffect + useState suffer from Tearing: if an external store dispatches a mutation while a low-priority transition is paused, sibling components render inconsistent states within the same frame. To guarantee strict consistency, React introduced useSyncExternalStore. We implement a zero-dependency store from first principles that integrates with useSyncExternalStore, adds selector memoization to prevent render loops, and batches rapid mutations using queueMicrotask.',
      codeBlock: {
        title: 'createStore Engine & useStore useSyncExternalStore Hook',
        language: 'typescript',
        code: `// 1. Core Reactive Store Factory with Microtask Batching
export function createStore<T>(initialState: T): Store<T> {
  let state = initialState;
  const listeners = new Set<() => void>();
  let isBatching = false;

  const getState = () => state;

  const notifyListeners = () => {
    isBatching = false;
    // Iterate over a snapshot of listeners in case listeners mutate during iteration
    const listenersSnapshot = Array.from(listeners);
    listenersSnapshot.forEach(listener => listener());
  };

  const setState = (updater: Partial<T> | ((prev: T) => Partial<T>)) => {
    const nextState = typeof updater === 'function' ? updater(state) : updater;
    state = Object.assign({}, state, nextState);

    // Coalesce high-frequency synchronous updates into a single microtask
    if (!isBatching) {
      isBatching = true;
      queueMicrotask(notifyListeners);
    }
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, setState, subscribe };
}

// 2. Custom useStore Hook Guaranteeing Zero-Tearing
export function useStore<T, S>(
  store: Store<T>,
  selector: (state: T) => S,
  isEqual: (a: S, b: S) => boolean = Object.is
): S {
  // Memoize slice to prevent getSnapshot returning fresh references
  const lastSliceRef = useRef<S | undefined>(undefined);

  const getSnapshot = useCallback(() => {
    const currentSlice = selector(store.getState());
    if (lastSliceRef.current === undefined || !isEqual(lastSliceRef.current, currentSlice)) {
      lastSliceRef.current = currentSlice;
    }
    return lastSliceRef.current;
  }, [store, selector, isEqual]);

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}`,
        annotations: [
          'Microtask Queueing: queueMicrotask(notifyListeners) coalesces rapid synchronous setState calls so subscribers only run once per event loop turn.',
          'Set Snapshot Safety: Array.from(listeners) protects against unsubscription mutations while in the middle of a listener dispatch loop.',
          'Snapshot Stability: getSnapshot memoizes the selected slice with isEqual, preventing React infinite loop warnings.'
        ]
      },
      pillars: [
        'The useSyncExternalStore Invariant: During concurrent rendering, React checks getSnapshot() before and after yielding. If an external mutation occurred during the render, React discards the torn fiber work and restarts reconciliation synchronously.',
        'Referential Cache Invariant: getSnapshot must return cached references unless the underlying state has strictly mutated, preventing React render loop failures.',
        'Batching via queueMicrotask: Multiple synchronous mutations update state immediately while deferring component notification to the end of the event loop tick.',
        'Set Snapshot Iteration: Listeners are cloned to an Array before invoking callbacks to prevent mutation-during-iteration bugs when a listener unregisters itself.'
      ],
      tradeoffs: [
        {
          approach: 'React Context + useState',
          pros: 'Built into React, zero dependencies.',
          cons: 'Context changes re-render every consumer component regardless of selectors, creating rendering bottlenecks.'
        },
        {
          approach: 'useEffect + Custom Event Emitter',
          pros: 'Simple pub-sub design pattern.',
          cons: 'Highly vulnerable to Tearing in React 18/19 Concurrent Mode (transitions render outdated state snapshots).'
        },
        {
          approach: 'useSyncExternalStore with Microtask Batching (Our Architecture)',
          pros: '100% tear-free in concurrent mode, selector-level surgical re-renders, microtask coalesced mutations.',
          cons: 'Requires strict referential memoization discipline in getSnapshot.'
        }
      ],
      staffDefense: [
        {
          trap: 'Why can\'t we use useEffect to subscribe to the store?',
          rebuttal: 'In React 18+, effects run asynchronously after the paint commit phase. During a concurrent transition, React can yield execution to higher-priority work. If an external event mutates the store while a transition is suspended, components reading state via useEffect will render mismatched (torn) values. useSyncExternalStore solves this by forcing a synchronous check against the snapshot.'
        },
        {
          trap: 'Why use queueMicrotask instead of setTimeout(..., 0) for batching?',
          rebuttal: 'setTimeout schedules a macrotask which runs after browser rendering and paint, causing visible UI flicker of intermediate states. queueMicrotask executes immediately after the current JavaScript execution stack finishes and before the browser renders the next frame, ensuring atomic paint consistency.'
        }
      ],
      keyTakeaways: [
        'The useSyncExternalStore Primitive: Enforces that React reconciles the workInProgress tree against an immutable snapshot, de-optimizing to synchronous commit if a tear is detected.',
        'Referential Cache Invariant: getSnapshot must return cached references unless the underlying state has strictly mutated.',
        'Batching via queueMicrotask: Multiple synchronous mutations update state immediately while deferring component notification to the end of the event loop tick.'
      ]
    }
  },
  {
    id: 'ch-03-offline-outbox',
    number: 'CH-03',
    title: 'Resilient Offline Mutation Outbox',
    tagline: 'FIFO queue with IndexedDB persistence, exponential backoff with full jitter & optimistic rollback.',
    icon: Database,
    color: '#10b981',
    spec: {
      roleTarget: 'Staff Distributed Systems & Frontend Architect',
      problemStatement: 'In mobile field applications and unreliable networks, mutations (POST/PUT/PATCH) fail frequently. Implement a Local-First resilient mutation outbox that queues mutations in strict FIFO order, detects online/offline transitions, retries with exponential backoff and randomized full jitter, and triggers atomic UI rollbacks if retries exhaust.',
      requirements: [
        'Persistent FIFO mutation queue preserving execution ordering.',
        'Online/offline state listener (navigator.onLine + heartbeat probe).',
        'Full-jitter exponential backoff formula: delay = rand(0, min(maxDelay, baseDelay * 2^attempt)).',
        'Optimistic UI state integration with rollback snapshot upon terminal mutation rejection.',
        'Queue status inspector with live countdowns to next retry attempt.'
      ],
      rubricPoints: [
        'Staff candidates recognize that naive exponential backoff causes thundering herd problems on recovery; full jitter is mandatory.',
        'Staff candidates preserve FIFO serialization: downstream mutations must not leapfrog an earlier pending mutation on the same entity.',
        'Staff candidates provide atomic rollbacks for optimistic state.'
      ],
      edgeCases: [
        'False online reports when WiFi is connected but internet gateway is down (requires heartbeat probe).',
        'Tab crashes during mutation sync: outbox items must survive page reload.',
        'Out-of-order responses from asynchronous network latency.'
      ]
    },
    theory: {
      architecturalPattern: 'Local-First Resilient Outbox with Full-Jitter Retry Policy',
      complexityAnalysis: 'Enqueue Mutation: O(1) IndexedDB write-ahead log append | Dequeue Head: O(1) FIFO transition | Jitter Delay: O(1) uniform random calculation | Rollback: O(1) atomic snapshot restoration',
      foundations: 'Mobile and field applications operate in unstable network environments where HTTP requests drop intermittently. A naive client that fails immediately drops user transactions. An enterprise Local-First application treats client storage (IndexedDB) as the primary write target (Write-Ahead Log), applies optimistic updates to UI state immediately, and manages an asynchronous mutation outbox worker. To prevent server stampedes when network connectivity restores, retries must use Full-Jitter Exponential Backoff.',
      codeBlock: {
        title: 'Transactional FIFO Outbox & Full-Jitter Backoff Algorithm',
        language: 'typescript',
        code: `// 1. Amazon AWS / Google Full-Jitter Exponential Backoff Formula
export function calculateFullJitterDelay(
  attempt: number,
  baseDelayMs: number = 1000,
  maxDelayMs: number = 30000
): number {
  // Exponential ceiling: C = min(maxDelay, baseDelay * 2^attempt)
  const exponentialCap = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
  // Full Jitter: Uniformly distributed random delay between 0 and exponentialCap
  return Math.floor(Math.random() * exponentialCap);
}

// 2. FIFO Outbox Processing Loop with Strict Serialization
const processOutbox = useCallback(async () => {
  if (isProcessingRef.current || !isOnline) return;
  isProcessingRef.current = true;

  try {
    // Find oldest pending or scheduled retry mutation
    const pending = mutations.filter(m => m.status === 'pending' || m.status === 'retrying');
    for (const item of pending) {
      if (item.nextRetryAt && Date.now() < item.nextRetryAt) continue;

      // Update item status to syncing
      updateMutationStatus(item.id, 'syncing');

      try {
        // Execute network request with Idempotency-Key
        await executeNetworkMutation(item);
        // On success: Remove from outbox and discard snapshot
        removeMutation(item.id);
      } catch (err: any) {
        if (item.retryCount + 1 >= maxRetries) {
          // Terminal failure: Atomic rollback to snapshot
          updateMutationStatus(item.id, 'failed', err.message);
          restoreOptimisticSnapshot(item.snapshot);
        } else {
          // Schedule retry with Full Jitter
          const nextAttempt = item.retryCount + 1;
          const jitterDelay = calculateFullJitterDelay(nextAttempt);
          scheduleRetry(item.id, nextAttempt, Date.now() + jitterDelay);
        }
        // Strict FIFO serialization: stop loop to prevent downstream leapfrogging
        break;
      }
    }
  } finally {
    isProcessingRef.current = false;
  }
}, [mutations, isOnline, maxRetries]);`,
        annotations: [
          'Full-Jitter Spread: By choosing uniformly from [0, exponentialCap], network reconnect bursts are spread evenly across the time window, preventing server DDOS.',
          'FIFO Serialization Break: The break on failure guarantees that dependent mutations (e.g., Update Item after Create Item) never leapfrog the failed parent.',
          'Optimistic Rollback: restoreOptimisticSnapshot cleanly reverts the UI state only when retries are permanently exhausted or on 4xx validation errors.'
        ]
      },
      pillars: [
        'Full-Jitter vs Standard Exponential Backoff: Equal or naive exponential backoff causes the Thundering Herd problem: when a downed API gateway recovers, thousands of clients retry at the exact same discrete intervals (1s, 2s, 4s, 8s). Full Jitter scatters retries uniformly across the entire time spectrum, reducing server load spikes by over 80%.',
        'Strict FIFO Serialization: Dependent mutations (e.g. Create Tenant -> Add User -> Assign Role) must never execute out of order. If mutation 1 fails and enters retry, mutations 2 and 3 must pause rather than leapfrog.',
        'Optimistic Snapshot Isolation: Every mutation captures the affected entity\'s state before applying optimistic UI mutations. If all retry attempts are exhausted, the system restores the snapshot atomically.',
        'Idempotency Key Invariant: Every mutation generates a UUID v4 idempotency token stored in IndexedDB and transmitted via HTTP headers, guaranteeing at-most-once execution on the backend.'
      ],
      tradeoffs: [
        {
          approach: 'Fire-and-Forget Network Request',
          pros: 'Trivial implementation with fetch() or Axios.',
          cons: 'Catastrophic in offline or low-connectivity environments; permanently loses customer transactions.'
        },
        {
          approach: 'In-Memory Retry Queue',
          pros: 'Easy to manage in basic React state.',
          cons: 'Fragile; all queued offline actions are lost if user closes the tab or refreshes.'
        },
        {
          approach: 'Persistent Outbox with Full Jitter (Our Architecture)',
          pros: '100% durable across reloads, zero server stampeding via full jitter, atomic rollback protection.',
          cons: 'Requires transactional storage (IndexedDB) and strict idempotency handling.'
        }
      ],
      staffDefense: [
        {
          trap: 'Why not just use navigator.onLine to trigger syncing?',
          rebuttal: 'navigator.onLine is notoriously unreliable—it only reports whether the physical network interface has an IP address. It returns true on public Wi-Fi captive portals and dead router links. A resilient production system combines navigator.onLine with active HTTP HEAD heartbeat probes and retry timeouts.'
        },
        {
          trap: 'Why is Full Jitter superior to Equal Jitter or Decorrelated Jitter?',
          rebuttal: 'As documented in Amazon Web Services architecture benchmarks, Full Jitter (random between 0 and exponential cap) achieves the lowest server competition and the minimum total synchronization time compared to Equal Jitter (half-fixed, half-random). It maximizes entropy, spreading retry requests evenly across the timeline.'
        }
      ],
      keyTakeaways: [
        'Full Jitter vs Equal Jitter: Full jitter (random from 0 to exponential cap) achieves minimum total completion time with lowest peak server stress.',
        'Optimistic Snapshotting: Cache initial state snapshot before mutation; roll back atomically if max attempts (4) are exceeded.',
        'FIFO Dependency Chains: Dependent mutations (e.g. Create Order -> Add Order Item) must execute in strict dependency order.'
      ]
    }
  }
];

export const ChallengesArena: React.FC = () => {
  const [activeChallengeId, setActiveChallengeId] = useState<string>('ch-01-virtualizer');
  const [activeTab, setActiveTab] = useState<ChallengeTab>('simulator');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const activeChallenge = CHALLENGES_CONFIG.find(c => c.id === activeChallengeId) || CHALLENGES_CONFIG[0];

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem 2rem' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.6rem' }}>
            <Code2 size={16} /> Staff Machine Coding Arena
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
            Production-Grade Frontend Challenges
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem', maxWidth: '780px', lineHeight: 1.5 }}>
            Handcraft core engineering systems from scratch without external libraries. Rigorously tested against Staff-level interview rubrics, concurrency tearing, and 60 FPS performance budgets.
          </p>
        </div>
      </div>

      {/* Main Grid: Sidebar + Arena Content */}
      <div className="challenges-arena-grid">
        {/* Sidebar: Challenge Selector */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Machine Coding Curriculum
          </div>

          {CHALLENGES_CONFIG.map(challenge => {
            const Icon = challenge.icon;
            const isSelected = challenge.id === activeChallenge.id;
            return (
              <button
                key={challenge.id}
                onClick={() => {
                  setActiveChallengeId(challenge.id);
                  setActiveTab('simulator');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: isSelected ? `1px solid ${challenge.color}` : '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  padding: '0.5rem',
                  borderRadius: '8px',
                  background: isSelected ? `${challenge.color}20` : 'var(--bg-secondary)',
                  color: challenge.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '0.1rem'
                }}>
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: challenge.color }}>
                      {challenge.number}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.35rem' }}>
                    {challenge.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {challenge.tagline}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail Panel: Arena Header + Tabs */}
        <div>
          {/* Sub-Header Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '0.35rem',
            marginBottom: '1.5rem',
            width: 'fit-content'
          }}>
            <button
              onClick={() => setActiveTab('simulator')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'simulator' ? 'var(--bg-tertiary)' : 'transparent',
                color: activeTab === 'simulator' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <Play size={14} /> 1. Interactive Solution Arena
            </button>
            <button
              onClick={() => setActiveTab('spec')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'spec' ? 'var(--bg-tertiary)' : 'transparent',
                color: activeTab === 'spec' ? '#f59e0b' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <FileText size={14} /> 2. Problem Spec &amp; Staff Rubric
            </button>
            <button
              onClick={() => setActiveTab('theory')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'theory' ? 'var(--bg-tertiary)' : 'transparent',
                color: activeTab === 'theory' ? '#8b5cf6' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <BookOpen size={14} /> 3. Architectural Deep Dive &amp; Theory
            </button>
          </div>

          {/* Tab 1: Interactive Solution Arena */}
          {activeTab === 'simulator' && (
            <div>
              {activeChallenge.id === 'ch-01-virtualizer' && <VirtualizerChallengeArena />}
              {activeChallenge.id === 'ch-02-concurrent-store' && <ConcurrentStoreChallengeArena />}
              {activeChallenge.id === 'ch-03-offline-outbox' && <OfflineOutboxChallengeArena />}
            </div>
          )}

          {/* Tab 2: Problem Spec & Staff Rubric */}
          {activeTab === 'spec' && (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.75rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.25rem 0.65rem', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                <Award size={14} /> Target Level: {activeChallenge.spec.roleTarget}
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.6rem 0' }}>
                Challenge Problem Statement
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                {activeChallenge.spec.problemStatement}
              </p>

              {/* Functional Requirements */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>
                  Technical &amp; Functional Requirements:
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.4rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.88rem' }}>
                  {activeChallenge.spec.requirements.map((req, idx) => (
                    <li key={idx} style={{ marginBottom: '0.35rem' }}>{req}</li>
                  ))}
                </ul>
              </div>

              {/* Staff Evaluation Rubric */}
              <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.9rem', fontWeight: 700, color: '#10b981', marginBottom: '0.6rem' }}>
                  <CheckCircle2 size={16} /> Staff Evaluation Rubric (What Interviewers Look For):
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.4rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.86rem' }}>
                  {activeChallenge.spec.rubricPoints.map((rubric, idx) => (
                    <li key={idx} style={{ marginBottom: '0.4rem' }}>{rubric}</li>
                  ))}
                </ul>
              </div>

              {/* Edge Cases */}
              <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.9rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.6rem' }}>
                  <AlertTriangle size={16} /> Critical Edge Cases to Address in Code:
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.4rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.86rem' }}>
                  {activeChallenge.spec.edgeCases.map((edge, idx) => (
                    <li key={idx} style={{ marginBottom: '0.35rem' }}>{edge}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 3: Architectural Deep Dive & Theory */}
          {activeTab === 'theory' && (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.75rem' }}>
              {/* Header Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '0.25rem 0.65rem', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                <BookOpen size={14} /> Architecture &amp; Algorithmic Foundations
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.6rem 0' }}>
                {activeChallenge.theory.architecturalPattern}
              </h2>
              
              {/* Complexity Analysis Box */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--react-cyan)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                {activeChallenge.theory.complexityAnalysis}
              </div>

              {/* Conceptual Foundations */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Sparkles size={16} color="#8b5cf6" /> System Model &amp; Core Mechanics
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem', margin: 0 }}>
                  {activeChallenge.theory.foundations}
                </p>
              </div>

              {/* Annotated Production Code Snippet */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Terminal size={16} color="#38bdf8" /> {activeChallenge.theory.codeBlock.title}
                  </h3>
                  <button
                    onClick={() => handleCopyCode(activeChallenge.theory.codeBlock.code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '0.35rem 0.65rem',
                      color: copiedCode ? '#10b981' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                    {copiedCode ? 'Copied' : 'Copy Code'}
                  </button>
                </div>

                <div style={{
                  background: 'var(--code-bg, #0b1120)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <pre style={{
                    margin: 0,
                    padding: '1.25rem',
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    lineHeight: 1.6,
                    color: 'var(--code-text, #e2e8f0)',
                    overflowX: 'auto',
                    whiteSpace: 'pre'
                  }}>
                    {activeChallenge.theory.codeBlock.code}
                  </pre>
                </div>

                {/* Code Annotations */}
                <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activeChallenge.theory.codeBlock.annotations.map((ann, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      background: 'var(--bg-tertiary)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <span style={{ color: '#38bdf8', fontWeight: 700 }}>▸</span>
                      <span>{ann}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architectural Pillars & Invariants */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <ShieldCheck size={16} color="#10b981" /> Architectural Pillars &amp; Runtime Invariants
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.65rem' }}>
                  {activeChallenge.theory.pillars.map((pillar, idx) => (
                    <div key={idx} style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      fontSize: '0.86rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6
                    }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{idx + 1}. </span>
                      {pillar}
                    </div>
                  ))}
                </div>
              </div>

              {/* Architectural Trade-offs Matrix */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Scale size={16} color="#f59e0b" /> Architectural Trade-off Matrix
                </h3>
                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Approach</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#10b981' }}>Advantages (Pros)</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#ef4444' }}>Trade-offs (Cons)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeChallenge.theory.tradeoffs.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: idx < activeChallenge.theory.tradeoffs.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', verticalAlign: 'top' }}>{row.approach}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', verticalAlign: 'top', lineHeight: 1.5 }}>{row.pros}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', verticalAlign: 'top', lineHeight: 1.5 }}>{row.cons}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Staff Interview Defense */}
              <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.9rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '0.85rem' }}>
                  <Award size={16} /> Staff &amp; Principal Interview Defense (Socratic Traps &amp; Rebuttals):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {activeChallenge.theory.staffDefense.map((item, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                      <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.84rem', marginBottom: '0.35rem' }}>
                        ⚠️ Socratic Probing Question: "{item.trap}"
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.6 }}>
                        <span style={{ color: '#10b981', fontWeight: 700 }}>Staff Defense: </span>
                        {item.rebuttal}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
