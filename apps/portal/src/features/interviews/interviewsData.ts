import type { InterviewScenario } from './types';

export const MOCK_INTERVIEWS: InterviewScenario[] = [
  {
    id: 'mock-01',
    number: 'MOCK-01',
    title: 'Real-Time HFT Telemetry Terminal System Design',
    track: 'System Design & Graphics',
    difficulty: 'Staff Architect',
    durationMinutes: 45,
    tagline: 'Stream 10,000 WebSocket updates/sec with 60 FPS pinned rendering, Web Workers, and zero GC pauses.',
    color: '#0ea5e9',
    scenarioIntroduction:
      'You are interviewing for a Staff / Principal Frontend Architect role at a leading quantitative trading firm. The hedge fund operates an internal institutional algorithmic trading desk. Traders execute multi-million dollar equity and FX orders simultaneously. The current trading portal experiences catastrophic browser freezes, 4-second input lag, and "Aw, Snap!" Out-of-Memory browser tab crashes when market volatility surges during FOMC rate announcements.',
    interviewerProfile: {
      name: 'Marcus Vance',
      role: 'Principal Trading Systems Architect',
      companyProfile: 'Tier-1 Quantitative Market Making & HFT Hedge Fund',
      interviewStyle: 'Rigorous, benchmark-driven, hyper-focused on V8 memory topologies and frame budgets (<16.6ms).'
    },
    socraticTurns: [
      {
        id: 'turn-01',
        phaseNumber: 1,
        phaseTitle: 'Phase 1: Scope, Latency SLAs & Ambiguity Clarification',
        interviewerPrompt:
          '"Welcome. Today I want you to architect our flagship institutional web terminal. We stream real-time Level 2 order books and execution telemetry. Our quantitative gateway pushes up to 10,000 price ticks and trade fills per second during peak market hours across 2,000 active tickers. How would you begin this architecture, and what questions do you have for me?"',
        interviewerTone: 'Authoritative, testing if the candidate immediately jumps to "use React state" or clarifies non-functional bounds.',
        candidateClarifications: [
          'What is the acceptable end-to-end latency budget from gateway socket frame arrival to screen pixel phosphor (e.g., < 16ms, < 50ms)?',
          'Is the target display hardware 60 Hz standard monitors or high-refresh 120/144 Hz trader multi-display workstations?',
          'What is the data protocol: raw JSON strings, binary Protocol Buffers, FlatBuffers, or raw binary ArrayBuffers?',
          'Are traders viewing all 2,000 active tickers simultaneously on screen, or is there a viewport window with ~50-100 visible rows and background aggregation?',
          'Do we need persistence / time-travel replays in IndexedDB, or is this strictly a low-latency live telemetry stream?'
        ],
        keySignalsToDemonstrate: [
          'Immediate recognition that 10,000 JSON messages/sec will instantly saturate the V8 main thread and choke garbage collection.',
          'Distinguishing between network ingestion frequency (10 kHz) and human optical perception / display refresh frequency (60 Hz = 16.6ms).',
          'Establishing clear SLA boundaries: Interaction to Next Paint (INP) < 50ms, main thread idle capacity > 70% to ensure trader order execution clicks never queue.'
        ],
        candidateResponseDefense:
          'Before designing components, let us decouple the two fundamental physical rates: the network ingestion rate (10,000 msgs/sec = 1 message every 100 microseconds) and the display refresh rate (60 Hz = 1 frame every 16.67ms). If we trigger a React state setter (`setState`) or execute JSON.parse on the main thread for every tick, the main thread will experience 100% CPU lock, completely starving user input and violating our SLA.\n\nTherefore, our architectural foundation requires a 3-Tier Decoupled Pipeline:\n1. Dedicated Background Web Worker: Owns the WebSocket connection, ingests binary ArrayBuffers, decodes payloads, and maintains an in-memory high-speed circular ring buffer.\n2. Coalescing Synchronization Bridge: Batches and flushes consolidated tick deltas to the main thread exactly once per animation frame tick (every 16.6ms) using zero-copy Transferable ArrayBuffers.\n3. Split Presentation Engine: Uses virtualized DOM windowing for textual numeric tabular data (Order Book, Fills) and OffscreenCanvas with 2D/WebGL for high-frequency candlestick and depth charts.',
        },
      {
        id: 'turn-02',
        phaseNumber: 2,
        phaseTitle: 'Phase 2: Data Pipeline & Thread Topology',
        interviewerPrompt:
          '"Good. You separated network ingestion from display rendering. But let us drill into the worker-to-main-thread bridge. Transferring 10,000 objects every second via postMessage triggers structured cloning overhead. In Chrome, postMessage with heavy JSON objects serializes on the V8 C++ heap. How do you pass data without memory allocation spikes and GC stutter?"',
        interviewerTone: 'Technical challenge on browser IPC and V8 heap mechanics.',
        candidateClarifications: [
          'Can we assume Cross-Origin Isolation headers (COOP & COEP) are enabled to unlock SharedArrayBuffer?',
          'What is the schema density per tick: fixed numeric schema (symbolId, bid, ask, volume, timestamp)?'
        ],
        keySignalsToDemonstrate: [
          'Deep understanding of structured clone algorithm cost vs Transferable Objects vs SharedArrayBuffer.',
          'Pre-allocated contiguous typed arrays (Float64Array / Int32Array) eliminating garbage collection allocations.',
          'Double-buffering / Ping-Pong buffer technique between worker and UI compositor.'
        ],
        candidateResponseDefense:
          'To eliminate serialization and V8 Garbage Collection churn, we implement a Zero-Allocation Typed Binary Protocol:\n\n1. Contiguous Memory Schema: Each market tick has a fixed 32-byte layout:\n   - `symbolIndex`: Uint16 (2 bytes)\n   - `flags`: Uint16 (2 bytes - bid/ask update, side)\n   - `bidPrice`: Float64 (8 bytes)\n   - `askPrice`: Float64 (8 bytes)\n   - `volume`: Float32 (4 bytes)\n   - `timestamp`: Float64 (8 bytes)\n   Total: 32 bytes.\n\n2. Dual Operating Modes:\n   - Ideal Enterprise Setup: With `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`, we allocate a `SharedArrayBuffer` ring buffer shared between the Worker and Main Thread. The Worker writes atomically using `Atomics.store()`, and the Main Thread reads directly during `requestAnimationFrame` with zero IPC overhead.\n   - Standard Fallback Setup: If SharedArrayBuffer is unavailable, we allocate two pre-sized `ArrayBuffer` pools (Ping-Pong buffers). The worker collects ticks into Buffer A during the 16ms window, then transfers Buffer A as a `Transferable` object via `postMessage(buffer, [buffer])` (0ms instantaneous pointer swap). While the main thread processes Buffer A, the worker writes into Buffer B.\n\nBecause the underlying memory is transferred rather than cloned, V8 GC allocation on both threads is exactly zero bytes per second.',
        },
      {
        id: 'turn-03',
        phaseNumber: 3,
        phaseTitle: 'Phase 3: The Curveball: Out-of-Order Packets & Burst Throttling',
        interviewerPrompt:
          '"Now, the market opens. Non-Farm Payrolls data drops. A sudden burst causes 40,000 ticks in 500 milliseconds. Due to network TCP packet retransmission, ticks arrive with microsecond out-of-order sequence IDs. Meanwhile, the trader frantically clicks \'SELL ALL\'. How does your terminal guarantee that: 1) stale prices never overwrite fresher prices, 2) the main thread stays responsive to the trader\'s click, and 3) the UI does not suffer visual tearing?"',
        interviewerTone: 'Stress-testing concurrency, race conditions, and user interaction responsiveness.',
        candidateClarifications: [
          'Does the market gateway provide monotonic sequence numbers (e.g. sequence_id: 64-bit int)?',
          'Is the trader\'s SELL ALL action an outgoing WebSocket command or REST HTTP POST?'
        ],
        keySignalsToDemonstrate: [
          'Monotonic sequence number verification in the Worker state cache to discard out-of-order stale ticks.',
          'Prioritization of user interactions using React 18/19 Concurrent features (`startTransition` / `useTransition` and native `scheduler.yield()`).',
          'Frame budget discipline: dropping intermediate frame draws if processing exceeds 10ms, preserving 6ms for DOM paint and input processing.'
        ],
        candidateResponseDefense:
          'This requires a three-layer defense:\n\n1. Worker-Level Monotonic Sequence Gate:\n   The worker maintains a flat `Uint32Array(2000)` storing the latest sequence number per ticker. When a packet arrives, if `packet.seq <= lastSeenSeq[tickerId]`, it is an out-of-order stale packet and is immediately dropped. Only strictly monotonic ticks update the worker\'s state cache.\n\n2. Priority-Lane Main Thread Protection (Guaranteeing <16ms Frame Budget):\n   The trader\'s "SELL ALL" click is classified as Urgent User Input. We execute order dispatch immediately on the main thread or via a dedicated high-priority Command WebSocket channel.\n   In React, we wrap telemetry table synchronization in `startTransition()` or consume the buffer via a custom `useSyncExternalStore` that yields using `scheduler.yield()` if execution exceeds 8ms.\n\n3. Dynamic Coalescing (Conflation):\n   Under a 40,000 tick surge, human optical persistence is ~16-30 Hz. Rendering 40,000 intermediate price steps is useless to the human eye. The worker aggregates price state: if Ticker #42 moves 100 times in 16ms, only the net latest state at the 16.6ms frame boundary is dispatched to the UI. Thus, render complexity scales strictly with O(visibleTickers) rather than O(networkPacketRate).',
        },
      {
        id: 'turn-04',
        phaseNumber: 4,
        phaseTitle: 'Phase 4: DOM Virtualization vs Canvas Rendering Strategy',
        interviewerPrompt:
          '"Let us conclude with rendering. A trader has 4 4K monitors open with 12 open terminal widgets: an L2 Depth Ladder, a Real-Time Candlestick Chart, a Trade Execution Blotter with 5,000 historical rows, and a Heatmap. Would you render all of this in React DOM, Canvas, or WebGL? Defend your architectural breakdown."',
        interviewerTone: 'Evaluating pragmatic architectural judgment vs dogmatic tool selection.',
        candidateClarifications: [
          'Do traders need text selection, clipboard copying, and screen-reader accessibility on the trade execution blotter?'
        ],
        keySignalsToDemonstrate: [
          'Hybrid Architecture: Choosing the right rendering technology based on pixel density and DOM overhead.',
          'Canvas/WebGL for high-frequency graphical matrices and depth charts.',
          'Dynamic virtualized DOM for accessible tabular data where accessibility, text selection, and inline inputs are required.',
          'OffscreenCanvas with Worker rendering for charts to keep chart repaints completely off the UI thread.'
        ],
        candidateResponseDefense:
          'A Staff Architect never forces a single rendering technology across contradictory workloads. We employ a Hybrid Multi-Surface Architecture:\n\n1. Trade Blotter & Order Book (Virtualized DOM):\n   Traders need to right-click rows, select order IDs, copy execution hashes, and see accessible text. We use our handcrafted virtual windowing engine (`useDynamicVirtualizer`) keeping only ~30 physical DOM rows in the tree. We patch text nodes directly via `textContent` or scoped micro-subscribers to bypass parent component re-renders.\n\n2. Depth Ladder & Real-Time Candlestick Chart (OffscreenCanvas + WebGL/2D):\n   Drawing 60 FPS price curves and depth histograms in DOM creates thousands of SVG/DIV elements, triggering massive Blink layout reflows. We transfer an `OffscreenCanvas` to our Web Worker. The Worker renders candlestick ticks directly in the background thread. Even if the main UI thread is briefly executing a React re-render, the canvas charts continue rendering smoothly at 60 FPS without a single microsecond of stutter.\n\n3. Market Heatmap Matrix (WebGL 2.0 / WebGPU):\n   For visualizing 2,000 tickers with color-graded volatility simultaneously, we pass the typed array directly as a WebGL texture uniform, updating shaders at 60 FPS with zero CPU overhead.',
        deepDiveTip:
          'Emphasize OffscreenCanvas transferred to a Web Worker—this guarantees 60 FPS charts even when React is heavily re-rendering on the main thread.'
      }
    ],
    specs: {
      functionalRequirements: [
        'Ingest and render live Level 2 market data (Bids, Asks, Trades) for 2,000 instruments.',
        'Real-time order execution blotter tracking active, filled, and cancelled trader orders.',
        'Sub-millisecond visual price flashes (Green for uptick, Red for downtick) with automatic decay.',
        'Instant order placement modal with keyboard hotkeys and one-click execution.'
      ],
      nonFunctionalRequirements: [
        'Pinned 60 FPS (frame budget < 16.6ms) during market volatility surges of 10,000 ticks/sec.',
        'Interaction to Next Paint (INP) < 50ms at all times to guarantee trader order execution responsiveness.',
        'Zero V8 Out-Of-Memory crashes; heap usage bounded strictly under 150MB per terminal tab.',
        'Automatic WebSocket reconnection with exponential backoff and sequence gap synchronization.'
      ],
      trafficAndVolumeCalculations: [
        {
          metric: 'Peak Ingestion Throughput',
          value: '10,000 msgs/sec',
          implication: '1 update every 100 microseconds. Main thread JSON parsing will cause 100% CPU lock; must offload to Web Worker.'
        },
        {
          metric: 'Raw Data Bandwidth',
          value: '320 KB/sec (Binary) vs 4.5 MB/sec (JSON)',
          implication: 'Binary fixed 32-byte protocol saves 93% network bandwidth and eliminates V8 string parsing.'
        },
        {
          metric: 'Display Coalescing Ratio',
          value: '166:1 Conflation',
          implication: '166 ticks arrive per 16.6ms frame. We only need to paint the latest net state once per rAF tick.'
        },
        {
          metric: 'Physical DOM Nodes',
          value: '< 500 nodes total',
          implication: 'Virtualized viewport renders only 30 visible rows out of 5,000, avoiding Blink tree layout thrashing.'
        }
      ],
      outOfScope: [
        'Server-side order matching engine implementation (handled by C++ exchange gateway).',
        'Complex algorithmic strategy authoring IDE (handled by backend quant platform).'
      ]
    },
    rubricCriteria: [
      {
        id: 'rubric-01',
        name: '1. Problem Framing & Non-Functional Boundaries',
        description: 'Demonstrates deep first-principles intuition regarding frame budgets, network ingestion rates, and thread isolation.',
        weight: '20%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Immediately distinguishes network ingestion (10 kHz) from human visual persistence (60 Hz). Formulates a 3-tier worker pipeline before writing a single line of UI code.' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Recognizes main-thread bottleneck and proposes Web Workers and frame-rate batching.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Identifies performance issue but suggests throttling Redux or using React.memo without calculating thread budgets.' },
          { score: 2, title: 'Developing', description: 'Assumes standard React state and hooks can handle 10,000 updates/sec.' }
        ]
      },
      {
        id: 'rubric-02',
        name: '2. Memory Architecture & Zero-GC Discipline',
        description: 'Understands V8 heap topology, structured cloning overhead, and zero-allocation typed binary buffers.',
        weight: '25%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Designs fixed 32-byte typed array schema, SharedArrayBuffer with Atomics, or zero-copy Transferable ArrayBuffer Ping-Pong pools.' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Proposes Transferable ArrayBuffers and pre-allocated object pools to minimize GC pressure.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Suggests JSON serialization with lodash debounce; unaware of structured clone serialization cost.' },
          { score: 2, title: 'Developing', description: 'Relies on standard JSON objects, creating heavy garbage collection pauses.' }
        ]
      },
      {
        id: 'rubric-03',
        name: '3. Concurrency, Race Conditions & UI Responsiveness',
        description: 'Ensures urgent trader interactions are never starved by background telemetry streams.',
        weight: '25%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Implements sequence number monotonic verification, React Concurrent transitions / scheduler.yield(), and separate priority command channels for order dispatch.' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Applies requestAnimationFrame coalescing and protects input handlers from blocking.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Understands race conditions conceptually but has vague implementation ideas.' },
          { score: 2, title: 'Developing', description: 'Overlooks out-of-order packets and user input starvation entirely.' }
        ]
      },
      {
        id: 'rubric-04',
        name: '4. Rendering Strategy & Technology Selection',
        description: 'Architects a hybrid rendering solution leveraging Virtualized DOM, OffscreenCanvas, and WebGL.',
        weight: '15%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Articulates hybrid model: Virtual DOM for accessible order book rows, OffscreenCanvas in Worker for charts, WebGL shaders for heatmaps.' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Recommends Canvas for charts and virtualized tables for blotters.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Attempts to render complex candlestick charts in SVG or pure DOM.' },
          { score: 2, title: 'Developing', description: 'Does not know the difference between DOM reflow overhead and Canvas immediate mode rendering.' }
        ]
      },
      {
        id: 'rubric-05',
        name: '5. Communication & Executive Presence',
        description: 'Delivers a crisp, structured architectural defense with authoritative trade-off articulation.',
        weight: '15%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Commands the interview with executive composure, structured diagrams, and deep first-principles trade-off clarity.' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Clear technical communication with well-reasoned architectural decisions.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Communicates adequately but requires frequent interviewer guidance.' },
          { score: 2, title: 'Developing', description: 'Scattered thoughts, defensive when probed, unable to articulate trade-offs.' }
        ]
      }
    ],
    defenseTranscript: {
      elevatorPitch:
        'To build an institutional HFT telemetry terminal handling 10,000 updates/sec at 60 FPS, we decouple ingestion from presentation. A dedicated Web Worker ingests binary ticks, validates monotonic sequences, and conflates updates into a pre-allocated circular ring buffer. Once every 16.6ms, consolidated deltas transfer to the main thread via zero-copy Transferable ArrayBuffers or SharedArrayBuffer. Textual order books render via a virtualized DOM window with direct DOM text-node patching, while high-frequency candlestick charts render in the background thread using OffscreenCanvas. Trader order clicks execute on a prioritized synchronous command channel, guaranteeing INP < 50ms and zero GC pauses.',
      asciiDiagram: `
+=========================================================================================+
|                           HIGH-FREQUENCY TELEMETRY TERMINAL                             |
+=========================================================================================+
                                                                                           
 [Market Gateway] (10,000 binary ticks/sec)                                               
         |                                                                                
         | WebSocket (wss://)                                                             
         v                                                                                
+---------------------------------------------------------------------------------------+ 
| BACKGROUND WEB WORKER THREAD (Dedicated CPU Core)                                     | 
|                                                                                       | 
|  [WebSocket Client]                                                                   | 
|          |                                                                            | 
|          v                                                                            | 
|  [Binary Decoder] ---> Fixed 32-Byte Struct Parsing (Uint8Array -> Float64Array)      | 
|          |                                                                            | 
|          v                                                                            | 
|  [Sequence Gate] ----> Monotonic Filter: Drop out-of-order stale packets (seq <= curr) | 
|          |                                                                            | 
|          v                                                                            | 
|  [In-Memory Cache] -> Flat State Table: 2,000 Tickers (Double-Buffered Typed Array)   | 
|          |                                                                            | 
|          +----------------------------------+                                         | 
|          | Conflation (16.6ms Flush)        | OffscreenCanvas Render Loop (60 FPS)    | 
|          v                                  v                                         | 
|  [Transferable ArrayBuffer]        [WebGL / 2D Canvas Engine]                         | 
|          |                         (Candlestick Charts, Depth Curves)                 | 
+----------|----------------------------------|-----------------------------------------+ 
           | Zero-Copy Pointer Swap           | Direct GPU Phosphor Paint               | 
           | postMessage(buffer, [buffer])    | (Bypasses UI Main Thread completely!)   | 
           v                                  v                                         | 
+---------------------------------------------------------------------------------------+ 
| MAIN UI THREAD (Chromium Compositor & React 19)                                       | 
|                                                                                       | 
|  [requestAnimationFrame Dispatcher] (16.6ms Ticks)                                    | 
|          |                                                                            | 
|          +----------------------------------+                                         | 
|          |                                  |                                         | 
|          v                                  v                                         | 
|  [Order Book & Blotter]             [Trader Interaction Lane]                         | 
|  - Virtualized DOM (~30 rows)       - SELL / BUY Hotkey Buttons                       | 
|  - Direct textContent updates       - INP Guaranteed < 50ms (85% idle thread)         | 
|  - Non-blocking layout reflows      - Dedicated Order Outbound API Channel            | 
+---------------------------------------------------------------------------------------+ 
`,
      coreArchitectureText:
        '### 1. Architectural Philosophy: The Conflation & Zero-Copy Engine\n\nThe fundamental failure mode of real-time web applications is treating every network packet as a UI state transition. At 10,000 packets per second, the JavaScript call stack is permanently occupied, event loop microtasks exhaustively starve layout and paint cycles, and V8 Scavenger garbage collections trigger periodic 100-300ms jank spikes.\n\nOur architecture adheres to three non-negotiable principles:\n1. **Thread Separation:** The UI main thread never establishes a WebSocket or parses raw network bytes.\n2. **Conflation over Churn:** If market data arrives faster than 60 Hz, the intermediate prices are mathematically irrelevant to human vision. We conflate updates in the worker and project the latest state vector once per 16.6ms animation frame.\n3. **Zero-Allocation Memory Topology:** Every byte flowing through the system resides in pre-allocated typed arrays. We never allocate heap objects or create closures inside the hot telemetry path.',
      codeSnippets: [
        {
          title: 'Web Worker: Zero-Copy Double-Buffered Conflation Engine',
          language: 'typescript',
          code: `// telemetry.worker.ts - High-Performance Conflation & Double Buffer
const TICKER_COUNT = 2000;
const BYTES_PER_TICK = 32; // struct: symbolId(u16), flags(u16), bid(f64), ask(f64), vol(f32), time(f64)

// Pre-allocated Ping-Pong Buffers for Zero-GC Memory Transfer
let bufferA = new ArrayBuffer(TICKER_COUNT * BYTES_PER_TICK);
let bufferB = new ArrayBuffer(TICKER_COUNT * BYTES_PER_TICK);
let activeView = new DataView(bufferA);

// Monotonic Sequence Filter
const sequenceTracker = new Uint32Array(TICKER_COUNT);
const dirtyFlags = new Uint8Array(TICKER_COUNT);

const socket = new WebSocket('wss://gateway.firm.internal/feed');
socket.binaryType = 'arraybuffer';

socket.onmessage = (event: MessageEvent<ArrayBuffer>) => {
  const view = new DataView(event.data);
  const symbolId = view.getUint16(0, true);
  const seq = view.getUint32(2, true);

  // Monotonic Sequence Check: Drop stale out-of-order packets
  if (seq <= sequenceTracker[symbolId]) return;
  sequenceTracker[symbolId] = seq;

  // Write directly into active Ping-Pong buffer at fixed byte offset
  const offset = symbolId * BYTES_PER_TICK;
  activeView.setFloat64(offset + 8, view.getFloat64(8, true), true);   // Bid
  activeView.setFloat64(offset + 16, view.getFloat64(16, true), true); // Ask
  activeView.setFloat32(offset + 24, view.getFloat32(24, true), true); // Volume
  dirtyFlags[symbolId] = 1;
};

// 60 FPS Coalesced Flush to Main Thread via Zero-Copy Pointer Swap
setInterval(() => {
  // Swap buffers: Transfer current buffer to main thread (0ms cost)
  const transferBuffer = activeView.buffer;
  self.postMessage({ type: 'TELEMETRY_FRAME', buffer: transferBuffer }, [transferBuffer]);

  // Point activeView to other pre-allocated buffer
  activeView = new DataView(activeView.buffer === bufferA ? bufferB : bufferA);
}, 16);`,
          explanation:
            'The worker ingests binary packets directly into a fixed-offset memory block. Every 16ms, it transfers the entire ArrayBuffer to the main thread with zero memory cloning via Transferable Objects, swapping back and forth between two pre-allocated buffers.'
        },
        {
          title: 'Main Thread: High-Speed Micro-Subscriber Store for Virtual DOM',
          language: 'typescript',
          code: `// useTelemetryStore.ts - High-Speed Micro-Subscription Bridge
import { useSyncExternalStore } from 'react';

const BYTES_PER_TICK = 32;
let latestBuffer: ArrayBuffer | null = null;
const subscribers = new Map<number, Set<() => void>>();

// Worker Listener on Main Thread
const worker = new Worker(new URL('./telemetry.worker.ts', import.meta.url), { type: 'module' });

worker.onmessage = (event) => {
  if (event.data.type === 'TELEMETRY_FRAME') {
    latestBuffer = event.data.buffer;
    // Notify only active mounted rows rather than re-rendering the entire table tree
    subscribers.forEach((callbacks, symbolId) => {
      callbacks.forEach(cb => cb());
    });
  }
};

// Targeted Cell Hook: Rerenders ONLY the specific row that changed
export function useTickerPrice(symbolId: number) {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (!subscribers.has(symbolId)) subscribers.set(symbolId, new Set());
      subscribers.get(symbolId)!.add(onStoreChange);
      return () => subscribers.get(symbolId)!.delete(onStoreChange);
    },
    () => {
      if (!latestBuffer) return null;
      const view = new DataView(latestBuffer);
      const offset = symbolId * BYTES_PER_TICK;
      return {
        bid: view.getFloat64(offset + 8, true),
        ask: view.getFloat64(offset + 16, true)
      };
    }
  );
}`,
          explanation:
            'By using `useSyncExternalStore` combined with symbol-keyed micro-subscriptions, updates bypass root component reconciliation. Only the ~30 visible rows in the virtualized viewport subscribe to price changes, keeping main-thread CPU under 15%.'
        }
      ],
      tradeoffMatrix: [
        {
          approach: 'Naive React State (useState / Redux)',
          latencyAndPerf: '4 FPS under peak load. 4,000ms input delay.',
          memoryAndComplexity: '300MB V8 heap churn. Frequent GC stutter.',
          resilienceAndRisk: 'Severe risk of browser tab crash ("Aw, Snap!").',
          verdict: 'Completely unviable for institutional trading.'
        },
        {
          approach: 'Throttled Global Store (Zustand + 100ms throttle)',
          latencyAndPerf: '10 FPS. 100ms artificial latency introduced.',
          memoryAndComplexity: 'Moderate JSON allocation; causes visual lag.',
          resilienceAndRisk: 'Acceptable for retail apps, rejected by quant desks.',
          verdict: 'Violates institutional 60 FPS and low-latency SLAs.'
        },
        {
          approach: 'Worker + Zero-Copy Transferable Buffer + Micro-Subscribers (Our Architecture)',
          latencyAndPerf: 'Locked 60 FPS (16.6ms). INP < 35ms.',
          memoryAndComplexity: 'Bounded 45MB heap. Zero GC pauses.',
          resilienceAndRisk: '100% resilient. Main thread isolated from burst spikes.',
          verdict: 'Staff / Principal Enterprise Gold Standard.'
        }
      ],
      staffProTips: [
        'Always start by establishing the physical display boundary: 60 Hz = 16.67ms. Explain that updating pixels faster than monitor refresh is physically wasted computation.',
        'Use the word "Conflation"—it proves you understand high-frequency market data architecture.',
        'Address Cross-Origin Isolation (COOP/COEP) when proposing SharedArrayBuffer; interviewers will immediately respect your browser security model knowledge.',
        'Highlight OffscreenCanvas transferred to a Web Worker as the definitive technique to prevent chart rendering from ever dropping frames during UI heavy loads.'
      ]
    }
  },
  {
    id: 'mock-02',
    number: 'MOCK-02',
    title: 'Multi-Tenant SaaS Micro-Frontend Dashboard System Design',
    track: 'Enterprise Architecture',
    difficulty: 'Staff Architect',
    durationMinutes: 45,
    tagline: 'Architect an enterprise multi-tenant platform with 12 domain teams, dynamic Module Federation, and strict blast-radius isolation.',
    color: '#8b5cf6',
    scenarioIntroduction:
      'You are interviewing for a Staff / Principal Frontend Architect role at a global enterprise SaaS company. The company is migrating from an unwieldy 1.2-million-line monolithic SPA to a distributed Micro-Frontend (MFE) architecture. Over 12 independent product teams (Billing, Analytics, Auth, User Management, Marketplace, Settings, etc.) deploy to production dozens of times a week. The current monolith suffers from 45-minute CI/CD deployment queues, dependency version conflicts, and cross-team deployment blocks.',
    interviewerProfile: {
      name: 'Dr. Elena Rostova',
      role: 'VP of Frontend Platform Engineering',
      companyProfile: 'Fortune 50 Enterprise Multi-Tenant Cloud Platform',
      interviewStyle: 'Strategic, governance-focused, deeply probing blast-radius isolation, dependency hell, and performance.'
    },
    socraticTurns: [
      {
        id: 'turn-01',
        phaseNumber: 1,
        phaseTitle: 'Phase 1: Framing the Multi-Tenant Architecture & Governance',
        interviewerPrompt:
          '"Welcome. Our platform serves 50,000 corporate tenants with custom domains, permissions, and white-label branding. We have 12 autonomous engineering squads deploying independently. How would you design our Micro-Frontend architecture so teams can deploy to production without coordinated release trains, while maintaining sub-second load times and cohesive user experience?"',
        interviewerTone: 'Testing architectural vision, team autonomy models, and enterprise governance.',
        candidateClarifications: [
          'Are micro-frontends integrated at build time (npm packages) or at runtime (Module Federation / Web Components / dynamic remotes)?',
          'Do all 12 teams use React, or is there a heterogeneous framework requirement (Angular / Vue)?',
          'What is our tenant isolation model: URL subdomain (`tenant.company.com`), route paths (`/tenant-id/...`), or JWT tenant claims?',
          'Do tenants have customized white-label styling (custom CSS tokens, logos, dark/light themes)?'
        ],
        keySignalsToDemonstrate: [
          'Explicit rejection of build-time npm package micro-frontends (which re-introduces monolithic coupling and rebuild queues).',
          'Selection of Runtime Module Federation with a dynamic Tenant Configuration Manifest.',
          'Establishing a clear organizational contract: Host Shell owns Authentication, Routing, and Global Design Tokens; Remote MFEs own bounded business domains.'
        ],
        candidateResponseDefense:
          'To achieve true deployment autonomy, we must implement Runtime Micro-Frontends powered by Module Federation and an Orchestrated Shell Architecture:\n\n1. Host Shell Responsibility (Platform Core):\n   The Host Shell is lightweight (<50 KB initial bundle). It owns:\n   - Authentication & Identity (OAuth2 / Entra ID token lifecycle)\n   - Root Navigation & Route Layout (Top navigation, sidebar, breadcrumbs)\n   - Multi-Tenant Configuration Gateway (fetching tenant permissions, feature flags, and custom theme tokens)\n   - Shared Infrastructure Singletons (React, ReactDOM, Core Router, Event Bus)\n\n2. Remote Domain MFEs (Autonomous Squads):\n   Each domain team (Billing, Analytics, Catalog) manages an independent git repository, CI/CD pipeline, and CDN bucket. They expose dynamic remote entry points configured via a Tenant Manifest (`/api/v1/tenant/manifest.json`).\n\n3. Dynamic Remote Loading:\n   Instead of hardcoding remote URLs in the Vite/Webpack build configuration, the Host Shell dynamically loads remotes at runtime based on the authenticated tenant\'s entitled subscription tier, completely isolating deployment cycles.',
        },
      {
        id: 'turn-02',
        phaseNumber: 2,
        phaseTitle: 'Phase 2: Shared Dependencies & Version Skew Prevention',
        interviewerPrompt:
          '"A classic pitfall of Module Federation is dependency duplication and version drift. Suppose Team Billing upgrades to React 19 to use Actions, but Team Analytics is stuck on React 18.2 due to a legacy third-party charting dependency. Furthermore, both teams bundle their own copies of lodash and date-fns. How do you prevent users from downloading 8 MB of duplicate runtime libraries without breaking applications?"',
        interviewerTone: 'Targeting bundle bloat, runtime singleton invariants, and version skew.',
        candidateClarifications: [
          'Can we enforce a monorepo policy or shared library governance across the 12 squads?',
          'What is our performance budget for initial page load across remote chunks?'
        ],
        keySignalsToDemonstrate: [
          'Understanding `shared` singleton configuration in Module Federation (`singleton: true`, `strictVersion: true`, `requiredVersion`).',
          'Distinguishing between libraries that CANNOT be duplicated (React, ReactDOM, React Router context) vs libraries that CAN be duplicated if necessary.',
          'Automated CI/CD dependency skew governance (Renovate bot / Shared Core Contracts package).'
        ],
        candidateResponseDefense:
          'We address this through a 3-Layer Dependency Governance Contract:\n\n1. Strict Singleton Layer (Zero Duplication Permitted):\n   React, ReactDOM, and the Root Navigation Context are marked with `{ singleton: true, strictVersion: true }`. Two copies of React in the same browser window will corrupt hook dispatcher state (`Invalid hook call`). Therefore, the Host Shell dictates the runtime React major version (React 19). Remote teams must compile against this contract.\n\n2. SemVer Range Sharing for Utility Libraries:\n   For utility libraries (e.g., TanStack Query, date-fns, Lucide), we configure `{ singleton: false, requiredVersion: "^5.0.0" }`. If Team A uses 5.1 and Team B uses 5.4, Module Federation shares the highest compatible version. If a team requires an incompatible major version, Module Federation safely loads an isolated secondary copy rather than breaking the application.\n\n3. Zero-Dependency Core Contract Package (`@company/core-contracts`):\n   We publish an ultra-lightweight npm package containing TypeScript interfaces for cross-MFE event bus messages, shared theme token types, and error boundaries. This contract has zero dependencies and guarantees compile-time type safety across all 12 repositories.',
        },
      {
        id: 'turn-03',
        phaseNumber: 3,
        phaseTitle: 'Phase 3: Blast Radius Isolation & Circuit Breakers',
        interviewerPrompt:
          '"Now imagine a catastrophic Friday deployment. Team Billing pushes a bug that throws an uncaught JavaScript runtime exception inside their remote component during initial mount. In a standard React application, an unhandled error unmounts the entire component tree, leaving the user with a blank white screen. How does your architecture ensure that a failure in Billing has ZERO impact on Analytics, Navigation, or the user\'s current session?"',
        interviewerTone: 'Focusing on fault tolerance, resilience, and high-availability frontend architecture.',
        candidateClarifications: [
          'Do we have automated CDN fallback versions for failed remote deployments?',
          'Should the user be notified with a contextual degradation message?'
        ],
        keySignalsToDemonstrate: [
          'Hierarchical Error Boundaries with Circuit Breaker pattern.',
          'Autonomous fallback rendering (graceful degradation) for failed remotes.',
          'Real-time automated remote health telemetry and CDN fallback version rollbacks.'
        ],
        candidateResponseDefense:
          'We enforce strict Blast Radius Containment through our Micro-Frontend Circuit Breaker Pattern:\n\n1. Isolated Remote Mounting Boundaries:\n   Every remote MFE is wrapped in an `MFEBoundary` component that combines a React Error Boundary, an asynchronous Suspense fallback, and a circuit breaker state machine.\n\n2. 3-Tier Fallback Lifecycle:\n   - Tier 1 (Transient Failure): If the remote chunk fails to load due to network glitch, the boundary retries with exponential backoff up to 2 times.\n   - Tier 2 (Circuit Trip & Version Rollback): If the remote component throws an unhandled error, the circuit breaker trips. It logs an automated error event to Sentry with the remote\'s git commit hash and tenant ID. It immediately attempts to fetch the previous stable remote entry from the CDN (`remoteEntry.stable.js`).\n   - Tier 3 (Graceful Domain Degradation): If the rollback fails, the error boundary renders a localized degraded widget ("Billing service temporarily unavailable; other systems fully operational") with a manual retry button. The Host Shell, header, navigation, and other 11 micro-frontends remain 100% interactive.\n\n3. CSS & Style Blast Radius Isolation:\n   To prevent CSS collisions (e.g. Billing styling `button { padding: 20px }`), all remote styles are encapsulated using CSS Modules, Tailwind prefixed namespaces, or Shadow DOM for third-party embeds.',
        },
      {
        id: 'turn-04',
        phaseNumber: 4,
        phaseTitle: 'Phase 4: Cross-MFE Communication & Multi-Tenant State Isolation',
        interviewerPrompt:
          '"Final question. When a user switches tenants in the global header, or when an action in the User Management MFE invites a user, how does the Billing MFE immediately update its license count? And how do you guarantee Tenant A\'s cached data never leaks into Tenant B\'s view when a multi-tenant user switches organizations?"',
        interviewerTone: 'Testing cross-MFE event architecture, state hygiene, and multi-tenant security.',
        candidateClarifications: [
          'Can users switch tenants dynamically without a hard browser page reload?'
        ],
        keySignalsToDemonstrate: [
          'Decoupled event bus pattern (CustomEvent / BroadcastChannel / Micro-EventEmitter) with schema validation rather than shared global stores.',
          'Complete query cache and local storage invalidation on tenant context switch to eliminate cross-tenant data leaks.',
          'Tenant-scoped cache key namespacing in TanStack Query / IndexedDB.'
        ],
        candidateResponseDefense:
          '1. Decoupled Typed Event Bus (Zero Store Coupling):\n   We explicitly prohibit sharing a global Redux or Zustand store between MFEs, as shared stores create tight coupling and deployment bottlenecks. Instead, we implement a Publish-Subscribe Event Bus via the browser\'s native `CustomEvent` or `BroadcastChannel` API, wrapped with TypeScript type contracts from `@company/core-contracts`:\n   - Event Schema: `{ type: "USER_INVITED", tenantId: string, payload: { userId, role } }`\n   - The Billing MFE subscribes to `USER_INVITED` and selectively invalidates its internal license query.\n\n2. Multi-Tenant Cache Isolation & Memory Purging:\n   To prevent cross-tenant data contamination (a critical SOC2 / GDPR violation):\n   - Tenant-Scoped Query Keys: All TanStack Query cache keys are strictly prefixed with the active tenant ID: `queryKey: [tenantId, "licenses"]`.\n   - Hard Cache Invalidation on Tenant Switch: When the user switches tenants in the header, the Host Shell executes `queryClient.clear()`, revokes all tenant-scoped memory buffers, updates the auth token, and triggers a clean re-mount of active remote components. This guarantees zero residual memory state from the previous organization.',
        deepDiveTip:
          'Mentioning SOC2 and GDPR compliance during multi-tenant cache purging shows Principal-level business and security awareness.'
      }
    ],
    specs: {
      functionalRequirements: [
        'Dynamic runtime loading of 12 domain micro-frontends based on tenant entitlements.',
        'Seamless unified shell with global navigation, notifications, and user profile.',
        'White-label tenant branding: custom typography, color palettes, and logos applied instantly.',
        'Decoupled cross-MFE event communication for domain updates (e.g., license usage changes).'
      ],
      nonFunctionalRequirements: [
        'Host shell initial bundle size < 50 KB (excluding shared vendor singletons).',
        'Independent CI/CD pipelines: any squad can deploy in < 5 minutes without testing other MFEs.',
        'Strict blast radius isolation: zero single-point-of-failure; 1 failing remote cannot crash the app.',
        'Zero cross-tenant data leaks: absolute memory and cache isolation across tenant switches.'
      ],
      trafficAndVolumeCalculations: [
        {
          metric: 'Active Corporate Tenants',
          value: '50,000 tenants',
          implication: 'Tenant manifests must be cached at the CDN edge (Cloudflare / CloudFront) with sub-10ms response.'
        },
        {
          metric: 'Engineering Squads',
          value: '12 autonomous squads',
          implication: '12 independent git repositories and CI/CD pipelines; zero shared monorepo release locks.'
        },
        {
          metric: 'Daily Production Deploys',
          value: '40+ deploys/day',
          implication: 'Runtime Module Federation required; build-time npm linking would cause constant build queues.'
        },
        {
          metric: 'Initial Page Load Time (LCP)',
          value: '< 1.2s across all routes',
          implication: 'Shared singletons (React, Router) must be cached permanently across remote navigation.'
        }
      ],
      outOfScope: [
        'Backend microservice database migrations (handled by domain backend teams).',
        'Native mobile iOS/Android applications (this is an enterprise desktop web cloud platform).'
      ]
    },
    rubricCriteria: [
      {
        id: 'rubric-01',
        name: '1. Micro-Frontend Topology & Runtime Federation',
        description: 'Designs dynamic runtime remote federation rather than static build-time coupling.',
        weight: '25%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Designs dynamic tenant manifest loader with edge CDN caching, asynchronous remote injection, and strict Host Shell boundaries.' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Selects Module Federation with runtime remotes and clear singleton policies.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Proposes npm packages or iframe embedding, overlooking runtime coordination.' },
          { score: 2, title: 'Developing', description: 'Confuses micro-frontends with simple code-splitting in a monolith.' }
        ]
      },
      {
        id: 'rubric-02',
        name: '2. Dependency Management & Version Skew Governance',
        description: 'Architects robust singleton contracts for React and handles multi-version utility libraries.',
        weight: '25%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Articulates V8 hook dispatcher singleton invariants for React, SemVer range fallback for utilities, and lightweight contracts package.' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Configures Module Federation shared singletons and identifies version conflict risks.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Assumes all dependencies can simply be bundled into each micro-frontend.' },
          { score: 2, title: 'Developing', description: 'Unaware of duplicate library bundle penalties.' }
        ]
      },
      {
        id: 'rubric-03',
        name: '3. Blast Radius Containment & Fault Tolerance',
        description: 'Implements Circuit Breakers, version rollbacks, and graceful degradation for failing remotes.',
        weight: '25%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Builds comprehensive 3-tier circuit breaker: transient retry, stable CDN fallback rollback, and localized domain degradation.' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Wraps each remote in React Error Boundaries and provides localized fallback UI.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Uses a generic global error boundary that still unmounts large layout sections.' },
          { score: 2, title: 'Developing', description: 'Does not account for remote chunk loading failures or runtime exceptions.' }
        ]
      },
      {
        id: 'rubric-04',
        name: '4. Multi-Tenant Security & State Hygiene',
        description: 'Guarantees zero cross-tenant memory leakage and designs loosely coupled event buses.',
        weight: '15%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Strict tenant-scoped query key namespacing, explicit cache clearing on tenant switch, and typed CustomEvent / BroadcastChannel communication.' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Uses an event bus with typed messages and invalidates query caches on tenant change.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Attempts to share a single global Redux store across all micro-frontends.' },
          { score: 2, title: 'Developing', description: 'Ignores tenant data isolation risks.' }
        ]
      },
      {
        id: 'rubric-05',
        name: '5. Executive Presence & Enterprise Governance',
        description: 'Demonstrates organizational leadership, SLA ownership, and clear domain boundaries.',
        weight: '10%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Balances technical excellence with developer autonomy, CI/CD speed, and enterprise security compliance.' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Clear structured reasoning with strong architectural communication.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Focuses purely on code implementation rather than organizational scalability.' },
          { score: 2, title: 'Developing', description: 'Struggles to justify architectural complexity.' }
        ]
      }
    ],
    defenseTranscript: {
      elevatorPitch:
        'To scale our multi-tenant SaaS platform across 12 autonomous squads, we implement an Orchestrated Host Shell powered by Dynamic Runtime Module Federation. The Shell owns authentication, global layout, and shared singletons (React 19, Router), while domain squads independently deploy remote entries to dedicated CDN paths. Remotes are discovered at runtime via an edge-cached Tenant Manifest. Blast radius is strictly contained via MFE Circuit Breakers: if a remote throws an unhandled error, it automatically falls back to the previous stable CDN version and degrades gracefully without affecting other domains. Cross-MFE communication relies on a zero-dependency typed event bus, and multi-tenant security is guaranteed via tenant-scoped cache keys and comprehensive cache purges on organization switches.',
      asciiDiagram: `
+=========================================================================================+
|                        ENTERPRISE MULTI-TENANT MFE ARCHITECTURE                         |
+=========================================================================================+

  [User Browser]
         |
         | 1. GET /dashboard (Tenant: "acme-corp")
         v
+---------------------------------------------------------------------------------------+
| HOST SHELL CONTAINER (Vite + React 19 + TypeScript) (< 50 KB Bundle)                 |
|                                                                                       |
|  [Auth Gateway] ----> Validates JWT / Entra ID Claims (Tenant: "acme-corp")           |
|  [Design Tokens] ---> Scopes CSS Variables (--primary: #0ea5e9, --logo: acme.svg)      |
|  [Tenant Manifest Gateway]                                                            |
|          |                                                                            |
|          v (Fetch /api/v1/tenant/manifest.json from Edge CDN)                         |
|  +---------------------------------------------------------------------------------+  |
|  | Tenant Entitlement Manifest:                                                    |  |
|  | - billingRemote:    "https://cdn.company.com/billing/v2.4.1/remoteEntry.js"      |  |
|  | - analyticsRemote:  "https://cdn.company.com/analytics/v1.9.0/remoteEntry.js"    |  |
|  | - catalogRemote:    "https://cdn.company.com/catalog/v3.1.2/remoteEntry.js"      |  |
|  +---------------------------------------------------------------------------------+  |
|                                                                                       |
|  [Shared Singleton Registry]                                                          |
|  - React 19.0.0 (singleton: true, strictVersion: true)                                |
|  - ReactDOM 19.0.0 (singleton: true, strictVersion: true)                             |
|  - @company/core-contracts (Typed Event Bus Interfaces)                               |
+---------------------------------------------------------------------------------------+
         |                                |                               |
         | Dynamic import()               | Dynamic import()              | Dynamic import()
         v                                v                               v
+------------------------+      +------------------------+      +------------------------+
| BILLING REMOTE MFE     |      | ANALYTICS REMOTE MFE   |      | CATALOG REMOTE MFE     |
| (Squad: Revenue Team)  |      | (Squad: Data Team)     |      | (Squad: Commerce Team) |
|                        |      |                        |      |                        |
| [Circuit Breaker]      |      | [Circuit Breaker]      |      | [Circuit Breaker]      |
|  - Error Boundary      |      |  - Error Boundary      |      |  - Error Boundary      |
|  - Stable Fallback CDN |      |  - Stable Fallback CDN |      |  - Stable Fallback CDN |
|                        |      |                        |      |                        |
| [Internal State]       |      | [Internal State]       |      | [Internal State]       |
|  - TanStack Query      |      |  - Apache ECharts      |      |  - Zustand Store       |
|  - Keys: [tenantId, ..]|      |  - Keys: [tenantId, ..]|      |  - Keys: [tenantId, ..]|
+------------------------+      +------------------------+      +------------------------+
         |                                ^                               |
         +--------------------------------+-------------------------------+
                                          |
               Typed Event Bus: window.dispatchEvent(CustomEvent)
               Event: { type: "PLAN_UPGRADED", tenantId: "acme-corp" }
`,
      coreArchitectureText:
        '### 1. Dynamic Remote Discovery vs Hardcoded Build Manifests\n\nTraditional Module Federation configurations hardcode remote URLs in `vite.config.ts` or `webpack.config.js`. In an enterprise with 50,000 tenants and 40 deploys a day, this is an anti-pattern. If Team Billing deploys hotfix `v2.4.2`, rebuilding the Host Shell is unacceptable.\n\nOur solution is Dynamic Runtime Remote Injection. When the Host Shell bootstraps, it requests the tenant manifest from the Edge CDN. The Host dynamically injects the `<script>` tag for `remoteEntry.js` and initializes the container via `window[scope].init(__webpack_share_scopes__.default)`. This grants 100% deployment decoupling.\n\n### 2. Multi-Tenant Cache Hygiene\n\nCross-tenant contamination occurs when cached client queries persist across authentication switches. In our architecture, every API request and query key is strictly parameterized: `["tenants", tenantId, "domain", entityId]`. When the user switches tenants or signs out, the Host Shell executes an immediate `queryClient.clear()` and wipes sessionStorage, eliminating all tenant leakage.',
      codeSnippets: [
        {
          title: 'Host Shell: Dynamic Remote Component Loader with Circuit Breaker',
          language: 'tsx',
          code: `// DynamicRemoteLoader.tsx - Fault-Tolerant Remote Component Mounting
import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react';

interface MFEBoundaryProps {
  remoteName: string;
  fallbackUi: ReactNode;
  children: ReactNode;
}

interface MFEBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class MFEBoundary extends Component<MFEBoundaryProps, MFEBoundaryState> {
  state: MFEBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): MFEBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Telemetry: Log fault directly with squad attribution
    console.error('[MFE Fault] Remote ' + this.props.remoteName + ' failed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--amber-warning)' }}>
          <h4 style={{ color: 'var(--amber-warning)', margin: '0 0 0.5rem 0' }}>
            {this.props.remoteName} Temporarily Unavailable
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            An unexpected error occurred in this module. Other platform services remain unaffected.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ padding: '0.4rem 0.8rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', cursor: 'pointer' }}
          >
            Retry Module
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}`,
          explanation:
            'The MFEBoundary isolates runtime errors strictly to the failing micro-frontend. It logs telemetry to Sentry and renders an in-situ degraded state while keeping the rest of the application alive.'
        },
        {
          title: 'Decoupled Cross-MFE Typed Event Bus',
          language: 'typescript',
          code: `// eventBus.ts - Zero-Dependency Type-Safe Cross-MFE Communication
export interface MFEEventMap {
  'TENANT_SWITCHED': { tenantId: string; organizationName: string };
  'PLAN_UPGRADED': { tenantId: string; newTier: 'pro' | 'enterprise'; seatLimit: number };
  'USER_INVITED': { tenantId: string; email: string; role: string };
}

export const mfeEventBus = {
  publish<K extends keyof MFEEventMap>(eventType: K, payload: MFEEventMap[K]) {
    const event = new CustomEvent('MFE_GLOBAL_BUS', {
      detail: { type: eventType, payload, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  },

  subscribe<K extends keyof MFEEventMap>(
    eventType: K,
    handler: (payload: MFEEventMap[K]) => void
  ): () => void {
    const listener = (event: Event) => {
      const customEvent = event as CustomEvent<{ type: string; payload: any }>;
      if (customEvent.detail.type === eventType) {
        handler(customEvent.detail.payload);
      }
    };
    window.addEventListener('MFE_GLOBAL_BUS', listener);
    return () => window.removeEventListener('MFE_GLOBAL_BUS', listener);
  }
};`,
          explanation:
            'A lightweight, type-safe event bus built on standard browser CustomEvents. Domain teams communicate without sharing stores or importing heavy external libraries.'
        }
      ],
      tradeoffMatrix: [
        {
          approach: 'Monolithic Single-Page App (Existing Status Quo)',
          latencyAndPerf: '45-minute build and deploy pipelines. Heavy 8MB bundle.',
          memoryAndComplexity: 'Low architectural complexity initially, but unmanageable code sprawl.',
          resilienceAndRisk: 'Single point of failure: 1 bad line breaks the entire company.',
          verdict: 'Does not scale beyond 50 engineers.'
        },
        {
          approach: 'Build-Time Micro-Frontends (Shared NPM Packages)',
          latencyAndPerf: 'Fast runtime, but rebuilds require re-releasing the entire host.',
          memoryAndComplexity: 'High build orchestration overhead; leads to release trains.',
          resilienceAndRisk: 'Dependency skew forces endless npm version bumping.',
          verdict: 'Recreates the monolith with extra friction.'
        },
        {
          approach: 'Runtime Module Federation with Circuit Breakers (Our Architecture)',
          latencyAndPerf: 'Sub-second LCP. Remotes deploy independently in < 5 mins.',
          memoryAndComplexity: 'Shared singletons contract required; high platform governance.',
          resilienceAndRisk: 'Zero single point of failure; blast radius strictly isolated.',
          verdict: 'The Staff / Principal Enterprise Standard for 100+ engineers.'
        }
      ],
      staffProTips: [
        'Differentiate between build-time npm package micro-frontends (which fail at scale) and runtime Module Federation.',
        'Always establish that React MUST be a shared singleton. If asked why, explain that React hook state is stored in module-scoped global closures that break if duplicated.',
        'Emphasize dynamic remote manifests fetched from the CDN rather than baking remote URLs into the Webpack/Vite build config.',
        'Mention Tenant Data Hygiene (SOC2 / GDPR cache clearing) when addressing multi-tenant context switching.'
      ]
    }
  },
  {
    id: 'mock-03',
    number: 'MOCK-03',
    title: 'React 19 Internals & Fiber Scheduler Deep Defense',
    track: 'Runtime Internals',
    difficulty: 'Staff Architect',
    durationMinutes: 45,
    tagline: 'Defend the Fiber linked-list work loop, 31-bit Lane bitmasks, and React 19 Compiler auto-memoization.',
    color: '#10b981',
    scenarioIntroduction:
      'You are in a Staff / Senior Staff React Internals Deep-Dive technical round with a former React Core contributor. The interviewer bypasses all high-level API questions ("how to use useState") and dives directly into the V8 C++ runtime, Fiber linked-list data structures, cooperative scheduling, and React 19 compiler transforms.',
    interviewerProfile: {
      name: 'Julian Thorne',
      role: 'Staff Framework Architect & Ex-React Core Contributor',
      companyProfile: 'Tier-1 Silicon Valley Tech Giant (React Architecture Platform Team)',
      interviewStyle: 'Relentlessly Socratic, inspecting bytecode, memory pointers, and runtime edge cases.'
    },
    socraticTurns: [
      {
        id: 'turn-01',
        phaseNumber: 1,
        phaseTitle: 'Phase 1: The First Principle of Fiber: Why Linked Lists Over Call Stack?',
        interviewerPrompt:
          '"Let us begin at the engine level. Prior to React 16, the reconciler (Stack Reconciler) recursively traversed the Virtual DOM tree using standard JavaScript function execution contexts. Why was this structurally incapable of supporting asynchronous rendering, and why did the team rewrite the entire core into a singly-linked list of Fiber nodes (`child`, `sibling`, `return`)?"',
        interviewerTone: 'Testing first-principles memory topology and call-stack mechanics.',
        candidateClarifications: [
          'Should I focus on the V8 C++ Call Stack execution model vs heap-allocated execution units?'
        ],
        keySignalsToDemonstrate: [
          'Understanding that the native JavaScript call stack is synchronous and uninterruptible; once a recursive function begins, it cannot pause until the base case returns.',
          'Virtualizing the call stack into heap-allocated Fiber nodes, making execution pauseable, resumeable, and abortable.',
          'The 3 pointer mechanics: `child` (first child), `sibling` (next sibling), and `return` (parent).'
        ],
        candidateResponseDefense:
          'In JavaScript, the native C++ Call Stack is completely synchronous. When the legacy Stack Reconciler executed a recursive tree walk (`reconcileChildren`), it pushed stack frames onto V8\'s execution stack. If reconciliation took 40ms on a large tree, the main thread was 100% blocked until the final frame popped off. The browser could not process user clicks, keyboard events, or layout frames.\n\nFiber solves this by Virtualizing the Call Stack on the V8 Heap:\n1. Singly-Linked List Pointers: Instead of relying on function stack frames, every component is represented by a `FiberNode` object with three structural pointers:\n   - `child`: Points to its first child.\n   - `sibling`: Points to its adjacent sibling.\n   - `return`: Points back to its parent (acting as the return address when a subtree completes).\n2. Cooperative Time-Slicing: Because execution state is stored as a linked list in heap memory rather than on the call stack, the `workLoopConcurrent` loop can pause between any two nodes whenever the frame deadline expires (`shouldYield()`), yield to the browser compositor to paint or handle clicks, and resume exactly where it left off on the next microtask/macrotask tick.',
        },
      {
        id: 'turn-02',
        phaseNumber: 2,
        phaseTitle: 'Phase 2: Dual Buffering & 31-bit Lane Priority Scheduling',
        interviewerPrompt:
          '"Excellent. Now explain how React guarantees zero visual tearing during interruptible concurrent rendering. Specifically, explain the relationship between the `current` and `workInProgress` Fiber trees, and how the 31-bit Lane priority bitmask determines which subtree reconciles first."',
        interviewerTone: 'Deep dive into computer graphics double-buffering and bitwise priority scheduling.',
        candidateClarifications: [
          'Do you want me to write the bitwise masking operators (`&`, `|`, `~`) used by React scheduler?'
        ],
        keySignalsToDemonstrate: [
          'Dual Buffering (borrowed from graphics engines: front buffer vs back buffer) to prevent partial render states from reaching the physical DOM.',
          'Lanes as 31-bit binary bitmasks: `SyncLane` (1), `InputContinuousLane` (2), `DefaultLane` (16), `TransitionLane` (64+).',
          'Bitwise intersection (`workInProgressLanes & renderLanes`) allowing high-priority lanes to interrupt and discard low-priority transition work.'
        ],
        candidateResponseDefense:
          '1. Dual-Buffering Engine (`current` vs `workInProgress`):\n   React maintains two linked-list trees at all times:\n   - `current`: The Fiber tree currently projected onto the physical DOM.\n   - `workInProgress`: The alternate tree being constructed in memory.\n   Every Fiber node has an `alternate` pointer linking to its twin (`fiber.alternate`). When an update triggers, React reconciles on the `workInProgress` tree. If rendering is interrupted by urgent user input, the `workInProgress` tree can be paused or completely discarded without affecting the screen. Only during the synchronous Commit phase does React swap the root pointer (`root.current = workInProgress`), flashing the completed tree in a single atomic DOM mutation.\n\n2. 31-bit Lane Priority Scheduling:\n   React uses a 31-bit integer bitmask (since 32-bit signed integers in V8 SMIs fit in 31 bits without heap allocation):\n   - `SyncLane = 0b0000000000000000000000000000001` (Direct clicks, controlled inputs)\n   - `InputContinuousLane = 0b0000000000000000000000000000010` (Hover, mousemove, scroll)\n   - `DefaultLane = 0b0000000000000000000000010000000` (Network fetch completion)\n   - `TransitionLane = 0b0000000000000000010000000000000` (`useTransition` tab switches)\n   \n   By using bitwise operations (`lanes & -lanes` to find the highest priority bit via two\'s complement), the scheduler instantly determines if an incoming urgent click has higher priority than an active Transition. If an urgent lane arrives, the scheduler aborts the current `workInProgress` tree, immediately processes the urgent click, and restarts the low-priority transition afterward.',
        },
      {
        id: 'turn-03',
        phaseNumber: 3,
        phaseTitle: 'Phase 3: React 19 Compiler (Forget) & AST Auto-Memoization',
        interviewerPrompt:
          '"In React 19, the React Compiler eliminates manual `useMemo`, `useCallback`, and `React.memo`. Many engineers believe the compiler is just syntactic sugar that injects useMemo at build time. Is that accurate? Explain the exact Babel/AST compilation pipeline, how it constructs memoization blocks (`c()`), and how it solves the transitive memoization breakdown."',
        interviewerTone: 'Testing modern compiler architecture vs naive syntactic sugar assumptions.',
        candidateClarifications: [
          'Should I detail the Static Single Assignment (SSA) intermediate representation (IR) used by the compiler?'
        ],
        keySignalsToDemonstrate: [
          'Clarifying that the React Compiler does NOT inject `useMemo`; it rewrites code into low-level memoization slots (`useMemoCache`) driven by SSA graph analysis.',
          'Eliminating transitive memoization breakdown (where a single un-memoized object breaks memoization for all children downstream).',
          'Preserving JavaScript referential equality semantics while eliminating manual dependency arrays.'
        ],
        candidateResponseDefense:
          'Calling the React Compiler "syntactic sugar for useMemo" is a fundamental misconception.\n\n1. SSA (Static Single Assignment) Graph Analysis:\n   The compiler converts JavaScript AST into a High-Level Intermediate Representation (HIR) and lowers it into SSA form. It performs escape analysis and mutability analysis:\n   - It traces every variable to determine whether it is mutated after creation, read during render, or passed across component boundaries.\n   - It identifies independent reactive scopes within the component body.\n\n2. Low-Level `useMemoCache` Slot Allocation:\n   Instead of `useMemo` with dependency arrays (which carries runtime overhead: array allocation, loop comparison, hook list iteration), the compiler emits a flat cache array via an internal primitive: `const $ = _c(slotCount)`.\n   For each reactive block, it compiles an inline guard:\n   ```javascript\n   let t0;\n   if ($[0] !== propA || $[1] !== propB) {\n     t0 = expensiveCompute(propA, propB);\n     $[0] = propA;\n     $[1] = propB;\n     $[2] = t0;\n   } else {\n     t0 = $[2];\n   }\n   ```\n3. Solving Transitive Breakdown:\n   With manual `useMemo`, if a developer forgot to wrap an inline object prop `<Child style={{ color }} />`, every downstream `React.memo(Child)` was invalidated. Because the React Compiler analyzes the entire component and JSX element graph holistically, it caches the JSX element itself (`$[3] = <Child ... />`), completely eliminating transitive memoization leaks.',
        },
      {
        id: 'turn-04',
        phaseNumber: 4,
        phaseTitle: 'Phase 4: React Server Components (RSC) Wire Format & Flight Deserializer',
        interviewerPrompt:
          '"Final question. RSC separates server rendering from client hydration. Contrast the RSC Flight Payload wire format with traditional SSR HTML + JSON hydration. When the client browser streams an RSC payload (`1:I[...]`, `2:[\"$\",\"div\",null,{...}]`), how does the client runtime deserialize this without freezing the UI?"',
        interviewerTone: 'Drilling full-stack React primitives and streaming protocol mechanics.',
        candidateClarifications: [
          'Should I walk through the row-by-row Flight stream tokens (Modules, Slots, Suspense boundaries)?'
        ],
        keySignalsToDemonstrate: [
          'Traditional SSR produces static HTML + a duplicate JSON state blob (waterfall hydration).',
          'RSC Flight Wire Format streams a compact acyclic graph of React elements, client module references, and unresolved Promises.',
          'Client runtime parses chunks incrementally using `ReadableStream` and resolves Suspense boundaries as stream chunks arrive without blocking DOM painting.'
        ],
        candidateResponseDefense:
          '1. Fundamental Difference from SSR:\n   Traditional SSR renders HTML strings on the server and serializes client state into a massive `__NEXT_DATA__` JSON block. The client downloads HTML, downloads JavaScript bundles, and must re-execute the entire component tree to hydrate event listeners (Double Data Cost & Hydration Waterfall).\n\n2. RSC Flight Wire Format:\n   RSC does not stream HTML; it streams a compact serialized representation of the React virtual tree:\n   - Client Module References (`M` lines): `M1:{"id":"./Button.client.tsx","name":"Button","async":false}`\n   - Element Tree (`J` lines or numeric rows): `1:["$","div",null,{"children":["$","@1",null,{"label":"Submit"}]}]`\n   - Suspense Boundaries (`S` lines): `S2:react.suspense` (with promise markers resolved downstream via `2:P[...]`)\n\n3. Non-Blocking Incremental Deserialization:\n   The client runtime reads the chunk stream via the browser\'s native `ReadableStreamDefaultReader`:\n   - When an `M` (Module) row arrives, the browser starts preloading the client component chunk asynchronously in parallel.\n   - When a Suspense boundary placeholder arrives, React mounts the `<Suspense fallback>` immediately on screen.\n   - As downstream data promises resolve, the Flight deserializer resolves the corresponding Promise references in the client Fiber tree, seamlessly inserting the completed subtree without re-hydrating the parent tree.\n   Because Flight parsing is interleaved with browser microtasks, large payloads stream and render with zero UI freezing.',
        deepDiveTip:
          'Explain that Client Components in the RSC payload are represented as pointers (`@1`), meaning server component code and large server libraries (e.g. markdown parsers, DB drivers) NEVER touch the client bundle.'
      }
    ],
    specs: {
      functionalRequirements: [
        'Detailed architectural explanation of the Fiber linked list data structures (`child`, `sibling`, `return`).',
        'Mathematical explanation of 31-bit Lane bitmask priority and concurrent time-slicing interrupts.',
        'AST compilation explanation of React 19 Compiler (`_c` slots and SSA analysis).',
        'Protocol-level analysis of React Server Components (RSC) Flight streaming wire format.'
      ],
      nonFunctionalRequirements: [
        'Zero hand-waving: every explanation must ground in V8 memory topologies, byte layouts, or compiler passes.',
        'Precision in explaining cooperative multitasking, frame deadlines, and scheduler queues.',
        'Accurate distinction between React 18 manual memoization and React 19 automated compiler transforms.'
      ],
      trafficAndVolumeCalculations: [
        {
          metric: 'Fiber Node Memory Footprint',
          value: '~128-192 bytes per Fiber',
          implication: '10,000 components = ~2 MB heap footprint. Reusing alternate Fiber nodes via dual-buffering prevents heap allocation.'
        },
        {
          metric: 'Lane Priority Space',
          value: '31 bits (0 to 30)',
          implication: 'Stored as V8 Small Integer (Smi) with zero heap pointer allocation; bitwise operations run in single CPU clock cycles.'
        },
        {
          metric: 'Frame Budget Deadline',
          value: '5ms yield slice (scheduler)',
          implication: 'React yields after 5ms of work loop execution via MessageChannel macrotasks, leaving 11ms for browser paint and input.'
        }
      ],
      outOfScope: [
        'Higher-level component styling solutions (CSS-in-JS, Tailwind).',
        'State management libraries (Zustand, Redux) - focus strictly on React Core engine mechanics.'
      ]
    },
    rubricCriteria: [
      {
        id: 'rubric-01',
        name: '1. Fiber Engine Topology & Memory Structures',
        description: 'Explains virtualized call stack, linked-list pointers, and dual-buffering alternates.',
        weight: '25%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Deep first-principles explanation of V8 call-stack limitations, pointer mechanics (child, sibling, return), and atomic commit swap.' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Accurate description of Fiber tree traversal and workInProgress alternate buffer.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Understands Fiber conceptually but struggles to explain why linked lists replaced recursion.' },
          { score: 2, title: 'Developing', description: 'Thinks Virtual DOM is still a simple recursive tree diff.' }
        ]
      },
      {
        id: 'rubric-02',
        name: '2. Lane Priority Scheduling & Concurrency',
        description: 'Details bitmask arithmetic, two\'s complement lowest-bit isolation, and cooperative time-slicing.',
        weight: '25%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Articulates 31-bit Smi limits, bitwise lane priority math, MessageChannel yielding, and interruptible transition lifecycles.' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Understands Lane priority levels and how transitions yield to urgent inputs.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Understands useTransition API but cannot explain how React schedules or aborts renders.' },
          { score: 2, title: 'Developing', description: 'Unaware of Lane priority or concurrent scheduling.' }
        ]
      },
      {
        id: 'rubric-03',
        name: '3. React 19 Compiler (Forget) Architecture',
        description: 'Explains Static Single Assignment (SSA) analysis, escape analysis, and _c(slotCount) output.',
        weight: '25%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Refutes "syntactic sugar" myth; explains SSA intermediate representation, reactive scope graph, and useMemoCache flat array slotting.' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Explains automatic dependency tracking and flat memoization cache without manual hooks.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Assumes compiler simply inserts useMemo and useCallback hooks into code.' },
          { score: 2, title: 'Developing', description: 'Unfamiliar with the React Compiler.' }
        ]
      },
      {
        id: 'rubric-04',
        name: '4. RSC Flight Protocol & Wire Deserialization',
        description: 'Analyzes client module references, element streaming, and incremental Suspense resolution.',
        weight: '15%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Accurately breaks down Flight format (M lines, J lines, S markers) and non-blocking ReadableStream client hydration.' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Explains how RSC streams component trees without bundling server code to the client.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Confuses RSC with traditional SSR and hydration.' },
          { score: 2, title: 'Developing', description: 'Does not know how RSC differs from client components.' }
        ]
      },
      {
        id: 'rubric-05',
        name: '5. Technical Precision & Socratic Defense',
        description: 'Responds to deep technical probes with clarity, confidence, and authoritative engine terminology.',
        weight: '10%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Exemplary technical mastery; speaks fluently about runtime engine mechanics and compiler design.' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Solid technical depth with strong articulacy.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Competent but lacks precision under pressure.' },
          { score: 2, title: 'Developing', description: 'Struggles to provide deep technical answers.' }
        ]
      }
    ],
    defenseTranscript: {
      elevatorPitch:
        'React\'s modern architecture is built on three core pillars: 1) The Fiber linked list (`child`, `sibling`, `return`) virtualizes the synchronous C++ call stack onto the V8 heap, enabling interruptible cooperative time-slicing without blocking the main thread. Dual-buffering (`current` vs `workInProgress`) guarantees zero UI tearing during concurrent yields. 2) 31-bit Lane bitmasks leverage fast CPU bitwise operations to prioritize urgent input lanes (SyncLane) over non-blocking transitions (TransitionLane). 3) React 19 Compiler replaces manual memoization hooks with compile-time SSA analysis, emitting flat `useMemoCache` array slots that eliminate transitive memoization leakage. Together with the streaming RSC Flight protocol, React delivers high-throughput server execution with non-blocking client hydration.',
      asciiDiagram: `
+=========================================================================================+
|                     REACT 19 FIBER SCHEDULER & RUNTIME TOPOLOGY                         |
+=========================================================================================+

 [User Clicks Urgent Input]                 [Network Data Returns]
          |                                          |
          v                                          v
   [SyncLane: 0b0001]                     [TransitionLane: 0b1000000]
          |                                          |
          +-------------------+----------------------+
                              |
                              v
        +-------------------------------------------+
        | REACT SCHEDULER: 31-BIT LANE BITMASK      |
        | - Isolates highest priority bit (lanes & -lanes)
        | - Yields every 5ms via MessageChannel     |
        +-------------------------------------------+
                              |
                              v
               workLoopConcurrent(root, lanes)
                              |
       +----------------------+----------------------+
       |                                             |
       v                                             v
+-------------------------------+             +-------------------------------+
| CURRENT FIBER TREE            |             | WORK-IN-PROGRESS FIBER TREE   |
| (Active on Physical DOM)      |  alternate  | (Under Construction in Heap)  |
|                               |<===========>|                               |
| [FiberNode: App]              |             | [FiberNode: App]              |
|   | child                     |             |   | child                     |
|   v                           |             |   v                           |
| [FiberNode: Header]           |             | [FiberNode: Header]           |
|   | sibling                   |             |   | sibling                   |
|   v                           |             |   v                           |
| [FiberNode: Main]             |             | [FiberNode: Main]             |
|   | return                    |             |   | return                    |
|   +-(Points to App)           |             |   +-(Points to App)           |
+-------------------------------+             +-------------------------------+
                                                             |
                                      Atomic Pointer Swap    |
                                      root.current = WIP     v
                                              +-------------------------------+
                                              | COMMIT PHASE (Synchronous)    |
                                              | - Mutates Physical Blink DOM  |
                                              | - Runs useLayoutEffect        |
                                              | - Schedules useEffect         |
                                              +-------------------------------+
`,
      coreArchitectureText:
        '### 1. Fiber Memory Layout: Virtualizing the Call Stack\n\nA `FiberNode` is an instance of a V8 JavaScript object that acts as a unit of work. Key fields include:\n- `tag`: WorkTag identifying component type (FunctionComponent, HostComponent, SuspenseComponent).\n- `key` & `elementType`: Identity and prototype.\n- `child`, `sibling`, `return`: Structural linked-list topology.\n- `lanes` & `childLanes`: 31-bit bitmasks representing pending updates on this node and its descendants.\n- `memoizedState`: Singly-linked list of hook records (`Hook: { memoizedState, next }`).\n- `alternate`: Pointer to its twin Fiber in the alternate tree.\n\n### 2. Time-Slicing & The 5ms Yield Deadline\n\nInside `workLoopConcurrent`, after each Fiber is reconciled via `performUnitOfWork`, React calls `shouldYield()`. Under the hood, React Scheduler measures elapsed time via `performance.now()`. When execution exceeds the 5ms quantum, React suspends the loop, posts a task via `MessageChannel.port2.postMessage(null)`, and returns control to the browser. The browser paints at 60 FPS, processes keyboard/mouse events, and the port listener immediately resumes the Fiber loop in the next macrotask.',
      codeSnippets: [
        {
          title: 'React Concurrent Work Loop with Cooperative Yielding',
          language: 'typescript',
          code: `// Conceptual React Fiber Work Loop (Simplified Core Mechanics)
let workInProgress: Fiber | null = null;
let renderLanes: number = NoLanes;

function workLoopConcurrent() {
  // Perform work on one fiber node at a time until complete or time sliced
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork: Fiber): void {
  const current = unitOfWork.alternate;
  
  // 1. Begin phase: reconcile children and get first child
  let next = beginWork(current, unitOfWork, renderLanes);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  if (next === null) {
    // 2. Complete phase: reached bottom of branch, bubble up siblings/parents
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}

// Low-overhead frame deadline check
function shouldYield(): boolean {
  return performance.now() >= frameDeadline;
}`,
          explanation:
            'The concurrent work loop checks `shouldYield()` between every unit of work. Because work state is preserved in heap-allocated Fiber nodes rather than stack frames, execution pauses and resumes with zero state loss.'
        },
        {
          title: 'React 19 Compiler: Desugared useMemoCache Output',
          language: 'javascript',
          code: `// Output of React 19 Compiler (Forget) for a Reactive Component
import { c as _c } from "react/compiler-runtime";

export function TransactionSummary({ account, transactions }) {
  // The compiler allocates a flat cache slot array for this component
  const $ = _c(4);

  let total;
  // Reactive Scope 0: Total calculation depends strictly on [transactions]
  if ($[0] !== transactions) {
    total = transactions.reduce((acc, t) => acc + t.amount, 0);
    $[0] = transactions;
    $[1] = total;
  } else {
    total = $[1];
  }

  let formattedAccount;
  // Reactive Scope 1: Formatted string depends strictly on [account.id]
  if ($[2] !== account.id) {
    formattedAccount = account.name + ' (#' + account.id.slice(-4) + ')';
    $[2] = account.id;
    $[3] = formattedAccount;
  } else {
    formattedAccount = $[3];
  }

  return (
    <div className="summary-card">
      <h3>{formattedAccount}</h3>
      <span>Total: {'$' + total.toFixed(2)}</span>
    </div>
  );
}`,
          explanation:
            'Notice the compiler does NOT emit `useMemo` hooks. It allocates 4 flat cache slots (`_c(4)`) and emits ultra-fast inline equality checks. This eliminates dependency array heap allocations and hook linked-list overhead.'
        }
      ],
      tradeoffMatrix: [
        {
          approach: 'Stack Reconciler (React 15 and earlier)',
          latencyAndPerf: 'Synchronous and blocking. 50ms+ tree walks cause severe frame drops.',
          memoryAndComplexity: 'Lower heap memory (uses native C++ call stack).',
          resilienceAndRisk: 'Zero resilience against UI freezes on large apps.',
          verdict: 'Obsolete historical architecture.'
        },
        {
          approach: 'Manual Memoization (React 16.8 - 18 with useMemo/useCallback)',
          latencyAndPerf: 'Fast when written correctly, but fragile and prone to human error.',
          memoryAndComplexity: 'High developer cognitive load; constant dependency array bugs.',
          resilienceAndRisk: 'One missed memoization breaks downstream pure components.',
          verdict: 'High maintenance cost; transitive memoization leakage.'
        },
        {
          approach: 'React 19 Compiler + Fiber Lanes (Modern Standard)',
          latencyAndPerf: 'Optimal 60 FPS. Automatic granular slot-level memoization.',
          memoryAndComplexity: 'Slightly larger compiled bundle size, but zero developer cognitive load.',
          resilienceAndRisk: '100% stable; compiler guarantees referential stability.',
          verdict: 'The Staff-Level State of the Art.'
        }
      ],
      staffProTips: [
        'Always contrast heap-allocated execution frames (Fiber) with synchronous C++ call stack execution frames (Stack Reconciler).',
        'State why 31 bits: V8 stores Small Integers (Smis) as 31-bit integers without heap pointer indirection.',
        'When discussing React 19, explicitly mention `useMemoCache` and Static Single Assignment (SSA) intermediate representation.',
        'For RSC, describe the Flight format as an acyclic graph with client module reference tokens (`M`) and promise markers (`S`).'
      ]
    }
  },
  {
    id: 'mock-04',
    number: 'MOCK-04',
    title: 'Enterprise Angular/.NET to React Executive Migration Defense',
    track: 'Executive Migration',
    difficulty: 'Principal Architect',
    durationMinutes: 45,
    tagline: 'Defend a multi-million dollar monolithic migration from Angular & ASP.NET Core to React 19 & Next.js before the executive committee.',
    color: '#f59e0b',
    scenarioIntroduction:
      'You are interviewing for a Principal Enterprise Frontend Architect / Director of Engineering role. You are presenting before the Executive Architecture Committee: the CTO, VP of Product, and Head of Infrastructure. The core enterprise product is an 8-year-old monolithic portal generating $200M annual revenue built on Angular (Zone.js, NgRx, RxJS) backed by monolithic ASP.NET Core MVC controllers. Developers complain of sluggish velocity, build times exceed 18 minutes, and page load times (LCP: 4.8s) hurt customer conversion. The CTO is skeptical: "A rewrite is high risk and expensive. Why shouldn\'t we just upgrade Angular? Defend your migration strategy, ROI, and risk mitigation plan."',
    interviewerProfile: {
      name: 'Sarah Jenkins (CTO) & David Zhao (VP Eng)',
      role: 'Chief Technology Officer & VP of Engineering Operations',
      companyProfile: 'Global B2B Enterprise SaaS ($200M ARR)',
      interviewStyle: 'Business-driven, risk-averse, evaluating ROI, timeline realism, customer impact, and team upskilling.'
    },
    socraticTurns: [
      {
        id: 'turn-01',
        phaseNumber: 1,
        phaseTitle: 'Phase 1: The Executive Challenge: Why React Over Modern Angular?',
        interviewerPrompt:
          '"Welcome. Let us be direct. Our Angular and ASP.NET Core stack works. It processes millions in transactions every day. Migrating to React and Next.js will cost an estimated $3.5M in engineering hours and distract our teams for over a year. Angular now has Signals and SSR. Why should the executive committee approve this massive disruption rather than incrementally upgrading our existing Angular codebase?"',
        interviewerTone: 'Skeptical, defending the bottom line and demanding hard business and technical ROI.',
        candidateClarifications: [
          'What are the primary business pain points today: customer churn due to slow page loads, engineering hiring bottlenecks, or slow feature velocity?',
          'What is our current engineering team composition: are developers full-stack .NET/Angular or specialized frontend engineers?',
          'Does our product require public SEO / performance-sensitive customer-facing landing and onboarding pages?'
        ],
        keySignalsToDemonstrate: [
          'Refusing to attack Angular emotionally; acknowledging modern Angular strengths while providing factual comparative metrics.',
          'Quantifying the business cost of the status quo: hiring pool constraints, build time productivity loss, and Core Web Vitals conversion drop.',
          'Articulating the Next.js full-stack React advantage: Server Components (RSC), Edge Middleware, and seamless integration with existing C# backend APIs.'
        ],
        candidateResponseDefense:
          'Sarah, David, your skepticism is 100% justified. If this proposal were a "Big Bang rewrite because React is trendier," I would advise you to vote NO today. Big Bang rewrites fail in over 70% of enterprise cases.\n\nOur justification rests on three measurable business and architectural pillars:\n\n1. Talent Pool & Hiring Velocity (The 4:1 Ratio):\n   Our engineering recruiters take an average of 95 days to fill a Senior Angular engineer role versus 32 days for Senior React engineers. The broader web ecosystem has gravitated toward React (over 4x the available senior talent pool). Every month a key role sits open costs us $25,000 in delayed feature delivery.\n\n2. Customer Conversion & Core Web Vitals:\n   Our monolithic Angular application delivers a Largest Contentful Paint (LCP) of 4.8 seconds on initial load because it downloads a 3.4 MB JavaScript bundle before Zone.js can bootstrap. In our enterprise sales demos, prospective clients perceive this as sluggish. Next.js App Router with React Server Components delivers pre-rendered zero-bundle HTML in under 1.1s (a 77% speed improvement), directly impacting trial-to-paid conversion rates.\n\n3. Preserving Our Core Asset (The .NET Backend):\n   Crucially, this is NOT a backend rewrite. Our C# ASP.NET Core services, EF Core data pipelines, and business logic remain 100% intact. We are modernizing the presentation and integration layer by wrapping our .NET APIs with automated OpenAPI TypeScript contract generation, boosting frontend feature delivery speed by 40% within 6 months.',
        },
      {
        id: 'turn-02',
        phaseNumber: 2,
        phaseTitle: 'Phase 2: The De-risking Strategy: The Strangler Fig Pattern',
        interviewerPrompt:
          '"You mentioned avoiding a Big Bang rewrite. But how do you realistically run Angular and React side-by-side in production without confusing users, doubling bundle downloads, or breaking session state? Walk us through the phased migration architecture and how you ensure we continue shipping product features during the transition."',
        interviewerTone: 'Probing execution feasibility, coexistence mechanics, and delivery continuity.',
        candidateClarifications: [
          'What edge reverse proxy infrastructure is currently deployed: Cloudflare, AWS CloudFront, or an ASP.NET Core YARP gateway?'
        ],
        keySignalsToDemonstrate: [
          'The Strangler Fig Architecture: routing traffic incrementally at the reverse proxy level.',
          'Unified Shell Coexistence: embedding React micro-apps inside Angular (or vice versa via Web Components) for intra-page transitions.',
          'Single Sign-On (SSO) session sharing via secure HttpOnly cookies across both frontend domains.'
        ],
        candidateResponseDefense:
          'We de-risk execution through the Strangler Fig Architectural Playbook across 3 Phased Horizons:\n\n1. Edge Routing Layer (Zero Blast Radius):\n   We deploy an Edge Reverse Proxy (using Cloudflare Workers or ASP.NET Core YARP - Yet Another Reverse Proxy). The proxy inspects the URL route:\n   - `/auth/*`, `/onboarding/*`, `/analytics/*` -> Routes to the new Next.js application.\n   - `/billing/*`, `/legacy-settings/*` -> Routes transparently to the legacy Angular app.\n   To the end-user, it is a single domain (`app.company.com`). Both applications share the same session via secure HTTP-only cookies and Entra ID JWTs.\n\n2. In-Page Coexistence via Web Components:\n   For complex pages where a full route split is impossible, we wrap new React 19 components as standard Custom Elements (Web Components) using `@r2wc/react-to-web-component` or native wrappers. The legacy Angular team embeds `<react-analytics-widget [token]="jwt"></react-analytics-widget>` directly inside their Angular templates. Feature teams start writing React on Day 1 without waiting for the full page to migrate.\n\n3. Zero Feature Freeze:\n   No team stops shipping product features. New greenfield domains are built 100% in React/Next.js. Legacy modules are strangled domain-by-domain based on business priority and ROI rather than arbitrary technical milestones.',
        },
      {
        id: 'turn-03',
        phaseNumber: 3,
        phaseTitle: 'Phase 3: Bridging the Mindset: Angular/RxJS & .NET to React Primitives',
        interviewerPrompt:
          '"Our 40 software engineers have written Angular, TypeScript, and C# for 8 years. They think in terms of Dependency Injection (`@Injectable`), RxJS Observable streams (`pipe`, `switchMap`), and two-way change detection. When we transition them to React, how do you prevent them from writing anti-patterns like useEffect dependency loops, stale closures, and chaotic prop drilling?"',
        interviewerTone: 'Testing engineering mentorship, architectural standards, and team enablement.',
        candidateClarifications: [
          'Are the engineers receptive to modern patterns, and what training/mentorship budget is allocated?'
        ],
        keySignalsToDemonstrate: [
          'Direct 1-to-1 conceptual mapping between Angular/.NET patterns and React primitives (The Rosetta Stone).',
          'Eliminating raw useEffect for data fetching; enforcing TanStack Query (React Query) as the server-state manager.',
          'Establishing Clean Architecture boundaries with Zustand / custom hooks instead of chaotic prop drilling.'
        ],
        candidateResponseDefense:
          'Engineers with a deep Angular and .NET background are exceptional engineers; their instincts for type safety, clean architecture, and modularity are an asset, not a hindrance. We guide them via the Enterprise Rosetta Stone:\n\n1. Mapping Angular/RxJS to React 19 Primitives:\n   - `RxJS BehaviorSubject` & NgRx -> Replaced by **Zustand** (predictable, typed, lightweight atomic store without Redux boilerplate).\n   - `HttpClient` + RxJS caching -> Replaced by **TanStack Query** (`useQuery`). TanStack Query handles caching, deduplication, background re-fetching, and stale-while-revalidate out of the box, completely eliminating the need for manual `useEffect` data fetching.\n   - Angular Dependency Injection (`@Injectable`) -> Replaced by **React Context** for scoping and TypeScript repository interfaces.\n   - `async` pipe in templates -> Replaced by **React 19 Suspense** and `use()`, providing clean asynchronous streaming.\n\n2. Automated OpenAPI Code Generation:\n   Because our backend is ASP.NET Core, we expose OpenAPI / Swagger schemas. We introduce automated client code generation via Orval / openapi-typescript-codegen. When a C# backend engineer adds a new Controller endpoint, the generator automatically produces type-safe TypeScript models and TanStack Query hooks. The frontend team never writes manual fetch calls or risks type desynchronization.\n\n3. Architectural Guardrails in CI/CD:\n   We implement custom ESLint rules (including `eslint-plugin-react-compiler`) and strict code review checklists in PRs to catch `useEffect` anti-patterns before they merge.',
        },
      {
        id: 'turn-04',
        phaseNumber: 4,
        phaseTitle: 'Phase 4: Risk Mitigation, Rollback Plan & Executive KPIs',
        interviewerPrompt:
          '"Final question. Suppose at Month 6, we deploy the newly migrated Analytics and Dashboard modules to 10,000 enterprise customers, and we experience an unexpected surge in browser memory leaks or edge routing errors. What is your rollback strategy, and what exact KPIs will you report to this committee every month to prove this migration is succeeding?"',
        interviewerTone: 'Examining risk containment, business accountability, and executive telemetry.',
        candidateClarifications: [
          'Do we have canary / feature flagging infrastructure (e.g., LaunchDarkly, Split)?'
        ],
        keySignalsToDemonstrate: [
          'Canary progressive rollouts with instant edge kill-switch (< 30 second rollback).',
          'Comprehensive Executive KPIs across 3 axes: Business Metrics, System Health, and Developer Velocity.',
          'Executive presence: Taking accountability for SLA integrity and customer trust.'
        ],
        candidateResponseDefense:
          '1. Instant Edge Kill-Switch & Progressive Canary Rollout:\n   We never flip 10,000 enterprise customers at once. We execute a 5-tier canary rollout:\n   - 1% Internal Alpha (Employees)\n   - 5% Beta Customer Opt-in\n   - 25% Cohort Rollout\n   - 50% Cohort Rollout\n   - 100% General Availability\n   At the Edge Reverse Proxy layer, we maintain a real-time configuration flag. If an anomaly occurs at 25%, a single command flips the route traffic back to the legacy Angular endpoint in under 30 seconds. The legacy system remains warm in standby for 30 days after every phase.\n\n2. Monthly Executive KPI Dashboard:\n   Every month, I report three balanced scorecard dimensions to this committee:\n   - Axis 1: Business & Customer Impact:\n     - LCP (Target: < 1.2s vs Baseline: 4.8s)\n     - Trial-to-Paid Conversion rate lift (Target: +5%)\n     - Customer-reported UI defect tickets (Target: 40% reduction)\n   - Axis 2: Engineering Velocity:\n     - CI/CD build and deploy cycle time (Target: < 4 mins vs Baseline: 18 mins)\n     - Lead Time for Changes (commit to production) (Target: < 2 days vs Baseline: 9 days)\n   - Axis 3: Financial & Resource Health:\n     - Budget variance against the $3.5M allocation\n     - Cloud infrastructure compute cost per session\n     - Recruiter time-to-hire for engineering positions (Target: < 35 days vs Baseline: 95 days).',
        deepDiveTip:
          'Presenting a balanced scorecard covering Business Impact, System Health, and Developer Velocity establishes you as a true Director / Principal Architect, not just a technical lead.'
      }
    ],
    specs: {
      functionalRequirements: [
        'Strangler Fig migration plan routing traffic incrementally between Angular and React.',
        'Preservation of all ASP.NET Core C# backend API contracts and authentication cookies.',
        'Side-by-side component coexistence via Web Components during in-flight migration.',
        'Comprehensive team upskilling roadmap transitioning 40 engineers to modern React.'
      ],
      nonFunctionalRequirements: [
        'Sub-30-second edge routing kill switch for instant rollback in case of regression.',
        'Zero downtime and zero customer disruption throughout the 14-month phased rollout.',
        'Core Web Vitals improvement: LCP reduction from 4.8s to < 1.2s, CLS < 0.05.',
        'CI/CD pipeline acceleration from 18 minutes to < 4 minutes via Turbopack/Vite.'
      ],
      trafficAndVolumeCalculations: [
        {
          metric: 'Legacy Bundle Footprint',
          value: '3.4 MB JS payload',
          implication: 'Zone.js and monolithic Angular vendor bundles take 4.8s to bootstrap on mobile/laptop connections.'
        },
        {
          metric: 'Migrated Next.js Footprint',
          value: '< 85 KB initial client JS',
          implication: 'RSC streams zero-bundle server HTML; client downloads only interactive widgets.'
        },
        {
          metric: 'Engineering Time Saved',
          value: '14 minutes per build',
          implication: 'Across 40 engineers deploying 3x/day = 28 hours of developer productivity recovered every day.'
        }
      ],
      outOfScope: [
        'Rewriting the backend ASP.NET Core C# microservices or SQL/PostgreSQL databases.',
        'Changing the product design language or rebranding during Phase 1.'
      ]
    },
    rubricCriteria: [
      {
        id: 'rubric-01',
        name: '1. Executive Business Case & Financial ROI',
        description: 'Justifies migration using hard financial metrics, hiring velocity, and customer conversion.',
        weight: '25%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Quantifies recruiting cycle cost savings, LCP conversion lift, and developer productivity hours recovered; rejects emotion.' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Articulates clear business reasons beyond technical preference.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Focuses primarily on developer ergonomics and community popularity.' },
          { score: 2, title: 'Developing', description: 'Advocates a rewrite simply because React is newer.' }
        ]
      },
      {
        id: 'rubric-02',
        name: '2. De-Risking Strategy: Strangler Fig & Coexistence',
        description: 'Designs an incremental reverse proxy rollout and in-page Web Component coexistence.',
        weight: '25%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Architects edge proxy (YARP/Cloudflare), unified HTTP-only cookie SSO, and custom element bridging with zero feature freezes.' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Proposes route-by-route migration using a proxy without freezing feature work.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Suggests a dual-app setup but lacks concrete details on session sharing and coexistence.' },
          { score: 2, title: 'Developing', description: 'Advocates a high-risk Big Bang cutover.' }
        ]
      },
      {
        id: 'rubric-03',
        name: '3. Architectural Rosetta Stone & Engineering Enablement',
        description: 'Bridges Angular/.NET mental models to React primitives and automates API contracts.',
        weight: '25%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Maps RxJS/NgRx to Zustand/TanStack Query, leverages OpenAPI code generation from C# endpoints, and establishes strict linting guardrails.' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Provides training curriculum and replaces manual data fetching with TanStack Query.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Assumes engineers will pick up React on their own without architectural guidance.' },
          { score: 2, title: 'Developing', description: 'Underestimates the difficulty of transitioning RxJS-trained developers to React hooks.' }
        ]
      },
      {
        id: 'rubric-04',
        name: '4. Risk Containment & Executive Scorecards',
        description: 'Defines canary rollout stages, sub-30-second kill switch, and monthly executive KPI metrics.',
        weight: '15%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Establishes 5-tier canary deployment, edge rollback, and 3-axis executive scorecard (Business, Velocity, Financial).' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Proposes feature flags, gradual customer rollout, and monitoring.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Mentions rollbacks vaguely without edge proxy automation.' },
          { score: 2, title: 'Developing', description: 'Lacks a rollback plan.' }
        ]
      },
      {
        id: 'rubric-05',
        name: '5. Executive Communication & Strategic Leadership',
        description: 'Communicates with executive poise, strategic gravitas, and business empathy.',
        weight: '10%',
        levels: [
          { score: 5, title: 'Principal Architect (L7)', description: 'Commands executive confidence, acknowledges committee risks with empathy, and projects unquestioned leadership.' },
          { score: 4, title: 'Staff Engineer (L6)', description: 'Clear, persuasive presentation with strong technical answers.' },
          { score: 3, title: 'Senior Engineer (L5)', description: 'Gets defensive when challenged on cost or timeline.' },
          { score: 2, title: 'Developing', description: 'Struggles to address non-technical executive concerns.' }
        ]
      }
    ],
    defenseTranscript: {
      elevatorPitch:
        'We defend migrating our $200M revenue portal from monolithic Angular/.NET to React 19/Next.js by de-risking execution through the Strangler Fig Pattern. Traffic is routed route-by-route at an Edge Reverse Proxy (YARP/Cloudflare), preserving all ASP.NET Core C# API contracts and session cookies with zero downtime. Greenfield domains ship in React on Day 1, while existing pages embed React via Web Components. The business ROI is compelling: hiring cycle time reduced from 95 to 32 days, LCP dropping from 4.8s to 1.1s (driving higher demo conversion), and CI/CD build times reduced by 77%. Risk is fully contained via a 5-tier canary rollout with an automated 30-second edge kill switch.',
      asciiDiagram: `
+=========================================================================================+
|                     STRANGLER FIG ENTERPRISE MIGRATION TOPOLOGY                         |
+=========================================================================================+

  [Enterprise User: browser] (https://app.company.com)
            |
            | Single Domain / Unified Session (HttpOnly Auth Cookie)
            v
+---------------------------------------------------------------------------------------+
| EDGE REVERSE PROXY LAYER (Cloudflare Workers / ASP.NET Core YARP Gateway)             |
|                                                                                       |
|  - Sub-30-Second Kill Switch (Instant Rollback to Legacy if Canary Error Rate > 0.5%)  |
|  - Route Dispatcher:                                                                  |
|      /analytics/* , /dashboard/*  ===> Forward to NEW Next.js Application (Port 3000)  |
|      /billing/* , /settings/*     ===> Forward to LEGACY Angular Application (Port 4200)|
+---------------------------------------------------------------------------------------+
            |                                                      |
            | Route: /analytics/*                                  | Route: /billing/*
            v                                                      v
+------------------------------------+               +----------------------------------+
| NEW NEXT.JS APP ROUTER (REACT 19)  |               | LEGACY MONOLITHIC ANGULAR SPA    |
|                                    |               | (Angular 15, Zone.js, RxJS)      |
| - RSC Server Streaming (Zero JS)   |               |                                  |
| - LCP: 1.1s (77% faster)           |               | - Embedded React Web Component:  |
| - TanStack Query (Server State)    |               |   <react-chart-widget            |
| - Zustand (Client Store)           |               |      [token]="jwt">              |
| - Auto-generated OpenAPI Hooks     |               |   </react-chart-widget>          |
+------------------------------------+               +----------------------------------+
            |                                                      |
            +--------------------------+---------------------------+
                                       |
                                       | Standard REST / gRPC JSON APIs
                                       v
+---------------------------------------------------------------------------------------+
| EXISTING ENTERPRISE BACKEND ASSETS (100% UNTOUCHED & PRESERVED)                       |
|                                                                                       |
|  - ASP.NET Core 9.0 Web APIs & Microservices (C#)                                     |
|  - Microsoft Entra ID (Azure AD) OAuth2 / OIDC Token Verification                     |
|  - Entity Framework Core / PostgreSQL & SQL Server Enterprise Databases               |
|  - OpenAPI / Swagger Contract Auto-Generators (Orval -> TypeScript Client Hooks)       |
+---------------------------------------------------------------------------------------+
`,
      coreArchitectureText:
        '### 1. The Strangler Fig Pattern: Reverse Proxy Routing\n\nThe fundamental rule of enterprise software engineering is: **Never rewrite in the dark for 12 months.**\n\nIn our Strangler Fig architecture, we place an edge gateway (YARP or Cloudflare Workers) in front of both applications. The gateway inspects the path and streams the appropriate frontend response. Authentication is anchored on a shared, secure `HttpOnly` session cookie issued by ASP.NET Core Identity / Microsoft Entra ID. Because both frontends run under the exact same parent domain (`app.company.com`), the browser automatically sends the session cookie with every fetch request, achieving zero-friction single sign-on across the two tech stacks.\n\n### 2. Automated Contract Generation: C# to TypeScript\n\nThe most common failure mode in frontend migrations is contract drift: a backend engineer modifies a C# DTO or Controller return type, breaking the frontend silently. We integrate Orval and OpenAPI generation into our CI/CD pipeline. Every C# API compilation automatically generates typed TypeScript interfaces and TanStack Query hooks. This ensures 100% compile-time type safety across the entire engineering organization.',
      codeSnippets: [
        {
          title: 'ASP.NET Core YARP (Yet Another Reverse Proxy) Route Configuration',
          language: 'json',
          code: `// appsettings.json - YARP Reverse Proxy Strangler Route Dispatcher
{
  "ReverseProxy": {
    "Routes": {
      "nextjs-analytics-route": {
        "ClusterId": "nextjs-cluster",
        "Match": {
          "Path": "/analytics/{**catch-all}"
        }
      },
      "nextjs-dashboard-route": {
        "ClusterId": "nextjs-cluster",
        "Match": {
          "Path": "/dashboard/{**catch-all}"
        }
      },
      "legacy-angular-fallback-route": {
        "ClusterId": "angular-cluster",
        "Match": {
          "Path": "{**catch-all}"
        }
      }
    },
    "Clusters": {
      "nextjs-cluster": {
        "Destinations": {
          "destination1": { "Address": "https://nextjs-production.internal" }
        }
      },
      "angular-cluster": {
        "Destinations": {
          "destination1": { "Address": "https://angular-legacy.internal" }
        }
      }
    }
  }
}`,
          explanation:
            'YARP intercepts all incoming web traffic at the .NET layer. Migrated routes are transparently forwarded to the Next.js production cluster, while un-migrated routes fall through to the legacy Angular monolith with sub-millisecond proxy latency.'
        },
        {
          title: 'Custom Elements Bridge: Embedding React 19 inside Legacy Angular',
          language: 'typescript',
          code: `// ReactWidgetWrapper.tsx - Web Component Bridge for Angular Coexistence
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AnalyticsChartWidget } from './AnalyticsChartWidget';

class ReactAnalyticsElement extends HTMLElement {
  private root: ReturnType<typeof createRoot> | null = null;

  connectedCallback() {
    const token = this.getAttribute('token') || '';
    const accountId = this.getAttribute('account-id') || '';

    this.root = createRoot(this);
    this.root.render(
      <React.StrictMode>
        <AnalyticsChartWidget token={token} accountId={accountId} />
      </React.StrictMode>
    );
  }

  disconnectedCallback() {
    this.root?.unmount();
  }
}

// Register native custom element: Angular can now render this in any template!
if (!customElements.get('react-analytics-widget')) {
  customElements.define('react-analytics-widget', ReactAnalyticsElement);
}`,
          explanation:
            'By packaging modern React 19 components as native Web Components, legacy Angular teams embed React directly inside Angular HTML templates (`<react-analytics-widget [token]="userToken">`). This allows feature shipping in React immediately on Day 1.'
        }
      ],
      tradeoffMatrix: [
        {
          approach: 'Status Quo (Maintain & Upgrade Angular Monolith)',
          latencyAndPerf: 'LCP remains 4.8s. 18-minute CI/CD build bottlenecks persist.',
          memoryAndComplexity: 'Low immediate risk, but compound technical debt accumulates.',
          resilienceAndRisk: '95-day recruiting delays stall critical product roadmaps.',
          verdict: 'Slow degradation of market competitiveness.'
        },
        {
          approach: 'Big Bang Full Rewrite (Freeze Features for 12 Months)',
          latencyAndPerf: 'Theoretical clean architecture at the end.',
          memoryAndComplexity: 'High organizational stress; zero business revenue delivered for a year.',
          resilienceAndRisk: '70%+ failure rate in enterprise software. Extreme risk.',
          verdict: 'Completely rejected by executive leadership.'
        },
        {
          approach: 'Strangler Fig Migration + YARP Edge Routing (Our Architecture)',
          latencyAndPerf: 'Instant LCP improvements per route (< 1.2s). CI/CD under 4 mins.',
          memoryAndComplexity: 'Requires disciplined reverse proxy governance and coexistence bridges.',
          resilienceAndRisk: 'Zero downtime; 30-second kill switch; continuous feature delivery.',
          verdict: 'The Executive Standard for Enterprise Modernization.'
        }
      ],
      staffProTips: [
        'Lead with business metrics: hiring velocity, developer cycle time, and LCP conversion lift. Never complain about "ugly syntax."',
        'Name-drop the Strangler Fig pattern and YARP (Yet Another Reverse Proxy)—this resonates deeply with enterprise leadership.',
        'Explicitly state that the C# backend is preserved 100%. Reassuring the CTO that their business logic is untouched instantly earns trust.',
        'Always provide a concrete rollback plan (5-tier canary deployment with an automated 30-second edge kill switch).'
      ]
    }
  }
];
