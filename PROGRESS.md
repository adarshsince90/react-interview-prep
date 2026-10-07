# Learning Progress & Interactive Portal Roadmap

> **Tracking:** Senior Angular + .NET Engineer → Senior / Staff React + Next.js Engineer  
> **Study Material Location:** [`notes/`](notes)  
> **Interactive App Target:** React / Next.js Interactive Revision Portal with Live Simulators & Labs  
> **Sprint Execution Plan:** [`docs/sdlc/sprint-plan.md`](docs/sdlc/sprint-plan.md)  
> **Architecture Decision Records:** [`docs/adr/`](docs/adr/README.md)  
> **Active Product Backlog:** [`docs/sdlc/backlog/backlog.md`](docs/sdlc/backlog/backlog.md)

---

## 1. Repository Architectural Layout

To keep the repository clean and scalable for both **deep-dive study materials** and our companion **Interactive React Learning & Simulation Portal**, the repository is structured as follows:

```text
react-interview-prep/
├── apps/                                      # ⚛️ Living Revision & Simulation App (Vite + React + TS)
│   └── portal/
│       ├── scripts/
│       │   ├── generate-manifest.mjs          # Auto-indexes notes/ into manifest.json
│       │   └── test-manifest-integrity.mjs
│       ├── src/
│       │   ├── core/                          # Shell, layout, theme, manifest loader
│       │   └── features/
│       │       ├── dashboard/                 # Roadmap, metrics, progress tracker
│       │       ├── topic-reader/              # Markdown reader, syntax highlight, TOC
│       │       ├── visualizers/               # Interactive Simulation Labs (React & Runtime)
│       │       └── flashcards/                # Memory anchors & interview drills
│       ├── package.json
│       └── vite.config.ts
│
├── notes/                                     # 📚 Study Notes & Handbook Chapters (Single Source of Truth)
│   ├── phase-01-javascript-runtime-foundations/# Phase 01 Chapters
│   ├── phase-03-react-foundations/             # Phase 03 Chapters
│   ├── phase-04-react-rendering-internals/     # Phase 04 Chapters
│   ├── phase-05-advanced-state-architecture/   # Phase 05 Chapters
│   ├── phase-06-nextjs-fullstack-react/        # Phase 06 Chapters
│   └── phase-07-angular-to-react-enterprise-synthesis/ # Phase 07 Chapters
│
├── docs/                                      # 🏛️ Unified Documentation & Governance Hub
│   ├── adr/                                   # Architecture Decision Records (ADRs)
│   │   ├── README.md
│   │   ├── ADR-001-dual-track-curriculum-and-manifest-ssot.md
│   │   ├── ADR-002-portal-ux-typographic-reading-system.md
│   │   ├── ADR-003-curriculum-generation-and-mentorship-cadence.md
│   │   └── ADR-004-consolidated-docs-sdlc-architecture.md
│   └── sdlc/                                  # SDLC, Agile Sprints & Product Backlog
│       ├── README.md                          # Delivery governance framework
│       ├── sprint-plan.md                     # Active multi-agent sprint execution board
│       ├── portal-sdlc.md                     # Portal feature inventory & quality gates
│       └── backlog/                           # Groomed backlog & user defect evidence
│           ├── backlog.md
│           └── *.png
│
├── .agent/                                    # 🤖 Mentor Prompts, Skills & Architecture Docs
│   ├── skills/
│   │   ├── generate-markdown/SKILL.md         # Handbook markdown generator skill
│   │   └── portal-developer/SKILL.md          # Interactive portal developer skill
│   └── repository-structure.md
│
├── AGENTS.md                                  # 🧠 Mentor Role, Philosophy & 20-Section Rules
├── PROGRESS.md                                # 🎯 Learning Progress & Interactive Simulator Backlog
└── README.md                                  # 📖 Repository Overview & Vision
```

---

## 2. Phase Completion & Curriculum Status

### A. Active Deep-Dive Mentorship Focus
- **Current Curriculum Status:** **All 12 Phases 100% Published & Mastered! (110 Total Topics)**
- **Interactive Simulation Labs:** **9 Full Living Arena Laboratories** active in `apps/portal` (Event Loop, Fiber Reconciler, RSC Flight, JSX AST, Purity, Render Stepper, Architecture, Testing Trophy, System Design Canvas)
- **Learning & Assessment Engine:** Flashcards Arena (`FEAT-LEARN-01`), Staff Scenario Quizzes (`FEAT-LEARN-02`), and Global Instant Full-Text Search (`FEAT-LEARN-03`)
- **Automated CI/CD Pipeline:** GitHub Actions workflow (`deploy.yml`) with automated manifest checks, test suites, and GitHub Pages deployment (`FEAT-LEARN-04`)
- **Active Focus:** Socratic Mentorship, Code Walkthroughs & Staff-Level Technical Mock Interviews

### B. Curriculum Publication Summary (Handbook Availability)
```text
[Phase 01: JS Runtime Foundations]               [==========] 100% (9/9 Core Chapters Published) 🚀 Mastered!
[Phase 02: Browser Platform & Web APIs]           [==========] 100% (10/10 Chapters Published) 🚀 Mastered!
[Phase 03: React Foundations & Core Mechanics]    [==========] 100% (11/11 Core Chapters Published) 🚀 Mastered!
[Phase 04: React Rendering Internals & Fiber]     [==========] 100% (10/10 Core Chapters Published) 🚀 Mastered!
[Phase 05: Advanced State & Data Architecture]    [==========] 100% (10/10 Chapters Published) 🚀 Mastered!
[Phase 06: Next.js & Full-Stack React]            [==========] 100% (11/11 Core Chapters Published) 🚀 Mastered!
[Phase 07: Enterprise Security, Auth & Identity]  [==========] 100% (8/8 Chapters Published) 🚀 Mastered!
[Phase 08: Performance Engineering & Web Vitals]  [==========] 100% (8/8 Chapters Published) 🚀 Mastered!
[Phase 09: Clean Architecture, Monorepos & MFEs]  [==========] 100% (8/8 Chapters Published) 🚀 Mastered!
[Phase 10: Modern Testing Strategy & QA]          [==========] 100% (8/8 Chapters Published) 🚀 Mastered!
[Phase 11: Frontend System Design at Scale]       [==========] 100% (8/8 Chapters Published) 🚀 Mastered!
[Phase 12: Angular -> React Enterprise Synthesis] [==========] 100% (9/9 Capstone Chapters Published) 🚀 Mastered!
```

---

## 3. Topic-by-Topic Learning Tracker

### Phase 01: JavaScript Runtime Foundations (The Core Engine) — 100% Published & Mastered
- [x] **01: JavaScript Execution Model** ([01-javascript-execution-model.md](notes/phase-01-javascript-runtime-foundations/01-javascript-execution-model.md))
  *Core concepts:* V8 Parser, AST, Ignition Bytecode, TurboFan JIT, Hidden Classes (`Map`), Inline Caches (IC).
- [x] **02: Scope, Hoisting & Temporal Dead Zone** ([02-scope-hoisting-tdz.md](notes/phase-01-javascript-runtime-foundations/02-scope-hoisting-tdz.md))
  *Core concepts:* Lexical Environments, Scope Chains, `var` vs `let`/`const`, TDZ byte-level mechanics.
- [x] **03: Closures & Lexical Memory Retention** ([03-closures.md](notes/phase-01-javascript-runtime-foundations/03-closures.md))
  *Core concepts:* Escape Analysis, `v8::internal::Context`, `[[Scopes]]` pointer, Stale Closures in React, Meteor leak.
- [x] **04: The Event Loop & Asynchronous Architecture** ([04-event-loop.md](notes/phase-01-javascript-runtime-foundations/04-event-loop.md))
  *Core concepts:* Call Stack, Microtask queue (exhaustive drain), Render pipeline (rAF, style, layout, paint), Macrotasks, MessageChannel, INP.
- [x] **05: Promises, Async/Await Internals & Error Propagation** ([05-promises-async-await.md](notes/phase-01-javascript-runtime-foundations/05-promises-async-await.md))
  *Core concepts:* `v8::PromiseReaction`, push-based microtask transition, async/await generator desugaring, unhandled rejections, `return await` nuances, and `AbortController`.
- [x] **06: Objects, Prototypes & `this` Mechanics** ([06-objects-prototypes-this.md](notes/phase-01-javascript-runtime-foundations/06-objects-prototypes-this.md))
  *Core concepts:* Delegative prototypal inheritance, `[[Prototype]]` vs `prototype`, V8 Shapes & Prototype Inline Caches (IC), the 4 Rules of `this` binding, Prototype Pollution, and why React abandoned class `this`.
- [x] **07: Functional JavaScript Foundations** ([07-functional-javascript.md](notes/phase-01-javascript-runtime-foundations/07-functional-javascript.md))
  *Core concepts:* Pure functions & referential transparency, immutability & structural sharing on V8 heap, array spread operator mechanics, `useState` destructuring & Fiber linked list storage, currying, and `pipe()` composition.
- [x] **08: Modern ECMAScript (ES6+) Features** ([08-modern-es6-plus.md](notes/phase-01-javascript-runtime-foundations/08-modern-es6-plus.md))
  *Core concepts:* Destructuring nuances & `=== undefined` default triggers, Rest vs Spread dual facets, Optional Chaining (`?.`) & Nullish Coalescing (`??`) short-circuit bytecode, Symbols & Iteration protocols, Generators (`function*`) heap state machines, and V8 Hidden Class impacts (`delete` vs Rest destructuring).
- [x] **09: Memory Management & V8 Garbage Collection** ([09-memory-management-garbage-collection.md](notes/phase-01-javascript-runtime-foundations/09-memory-management-garbage-collection.md))
  *Core concepts:* V8 Heap Topology (New Space semi-spaces, Old Pointer/Data Space, Large Object Space), Cheney's Copying Scavenger (Minor GC), Tri-Color Marking (White/Grey/Black) & Write Barrier (`v8::internal::WriteBarrier`), Orinoco Concurrent/Incremental GC pipeline, Detached DOM Trees, Ephemeron mechanics (`WeakMap`), and DevTools Heap Snapshot analysis.

---

### Phase 02: Browser Platform & Web APIs (Dedicated Platform Engine) — 100% Published & Mastered
- [x] **01: Browser Architecture & Multi-Process Model** ([01-browser-architecture-multi-process.md](notes/phase-02-browser-platform-web-apis/01-browser-architecture-multi-process.md))
  *Core concepts:* Browser/Renderer/GPU/Network processes, Mojo IPC, Site Isolation, OOPIFs, Spectre mitigations, crash isolation.
- [x] **02: DOM & CSSOM Tree Construction** ([02-dom-cssom-tree-construction.md](notes/phase-02-browser-platform-web-apis/02-dom-cssom-tree-construction.md))
  *Core concepts:* HTML byte stream parsing, state machine tokenization, speculative preload scanner, Blink C++ DOM Node allocation, CSSOM script blocking.
- [x] **03: The Critical Rendering Path** ([03-critical-rendering-path.md](notes/phase-02-browser-platform-web-apis/03-critical-rendering-path.md))
  *Core concepts:* Recalculate Style, Layout (Reflow), Paint, Compositing & GPU Layers, Render Tree vs DOM Tree, `will-change` layer promotion.
- [x] **04: Layout Thrashing & Forced Synchronous Reflow** ([04-layout-thrashing-reflow.md](notes/phase-02-browser-platform-web-apis/04-layout-thrashing-reflow.md))
  *Core concepts:* Geometry query invalidation, FastDOM read/write batching, `requestAnimationFrame`, `ResizeObserver`, CSS `contain: layout size`.
- [x] **05: Browser Event Architecture & Event Propagation** ([05-browser-event-architecture.md](notes/phase-02-browser-platform-web-apis/05-browser-event-architecture.md))
  *Core concepts:* Capturing -> Target -> Bubbling phases, `composedPath()`, `stopPropagation` vs `stopImmediatePropagation`, passive event listeners (`{ passive: true }`), event listener GC leaks.
- [x] **06: Event Delegation & Memory Optimization** ([06-event-delegation-memory-optimization.md](notes/phase-02-browser-platform-web-apis/06-event-delegation-memory-optimization.md))
  *Core concepts:* Ancestor event dispatch, `target` vs `currentTarget`, `closest()` selector matching, memory footprint reduction, React 17/18 root-level event delegation switch.
- [x] **07: Browser Networking & Network Stack** ([07-browser-networking-stack.md](notes/phase-02-browser-platform-web-apis/07-browser-networking-stack.md))
  *Core concepts:* HTTP/1.1 head-of-line blocking, HTTP/2 binary framing & multiplexing, HTTP/3 QUIC UDP streams, TCP/TLS handshakes, Fetch Streams API, connection pooling.
- [x] **08: Same-Origin Policy, CORS & Security Headers** ([08-cors-csp-security-headers.md](notes/phase-02-browser-platform-web-apis/08-cors-csp-security-headers.md))
  *Core concepts:* Same-Origin Policy (SOP), Preflight OPTIONS caching, CSP Level 3 nonces/hashes, HSTS, X-Frame-Options / `frame-ancestors`, Permissions-Policy.
- [x] **09: Browser Storage Architecture** ([09-browser-storage-architecture.md](notes/phase-02-browser-platform-web-apis/09-browser-storage-architecture.md))
  *Core concepts:* Cookies & SameSite/HttpOnly/Secure, LocalStorage/SessionStorage synchronous blocking, IndexedDB transactional LevelDB engine, Origin Private File System (OPFS) SQLite WASM, ITP cross-site tracking mitigations.
- [x] **10: Service Workers, PWA & Background Synchronization** ([10-service-workers-pwa-offline.md](notes/phase-02-browser-platform-web-apis/10-service-workers-pwa-offline.md))
  *Core concepts:* Dedicated WorkerGlobalScope, lifecycle (`install` -> `waiting` -> `activate`), Cache Storage API strategies (Cache-First, Stale-While-Revalidate), Background Sync API (`SyncManager`), Web Push & VAPID, Navigation Preload.

---

### Phase 03: React Foundations & Core Mechanics — 100% Published
- [x] **00: Architectural Companion: React Application Lifecycle & Runtime Architecture** ([00-react-application-lifecycle-architecture.md](notes/phase-03-react-foundations/00-react-application-lifecycle-architecture.md))
  *Core concepts:* End-to-end lifecycle, HTML bootstrap, V8 AST & Ignition bytecode, Blink C++ DOM bridge, `createRoot` event delegation, `dispatchSetState` eager bailout, `useLayoutEffect` flicker prevention, and Vite toolchain.
- [x] **01: Why React Exists & The Virtual DOM Problem** ([01-why-react-exists.md](notes/phase-03-react-foundations/01-why-react-exists.md))
  *Core concepts:* Imperative action chains vs declarative state projection, UI = f(State), C++ Blink to V8 cross-context bridge penalty, Virtual DOM object anatomy, `$$typeof: Symbol.for('react.element')` anti-XSS injection security, Render phase vs Commit phase, and layout thrashing prevention.
- [x] **02: Evolution of React (From Class Components to Hooks & Server Components)** ([02-evolution-of-react.md](notes/phase-03-react-foundations/02-evolution-of-react.md))
  *Core concepts:* Class lifecycle fragmentation vs Hook colocation, Mixins/HOCs/Render Props dead-ends, Fiber memoizedState singly linked list, Rules of Hooks engine enforcement, React Server Components (RSC) zero-bundle footprint, and "use client" boundary semantics.
- [x] **03: JSX Compilation & React Elements (`React.createElement` vs Modern JSX Transform)** ([03-jsx-compilation.md](notes/phase-03-react-foundations/03-jsx-compilation.md))
  *Core concepts:* AST compilation, Classic `React.createElement` vs Modern `_jsx`/`_jsxs` (`react/jsx-runtime`), `key` extraction preserving V8 Hidden Classes (`Map`), `$$typeof: Symbol.for('react.element')` anti-XSS security barrier, expression evaluation matrix (`0` vs falsy bug), and memory topology (New Space elements vs Old Space fibers).
- [x] **04: Component Model & Pure Functions (`UI = f(State)`)** ([04-component-model-pure-functions.md](notes/phase-03-react-foundations/04-component-model-pure-functions.md))
  *Core concepts:* Mathematical projection UI = f(State, Props), Render phase (pure & interruptible) vs Commit phase (impure & synchronous), StrictMode double-invocation engine test, frame immutability vs Fiber memoizedState, ES2023 toSorted() immutability, and React Compiler purity prerequisites.
- [x] **05: The React Render Cycle (Trigger -> Render -> Commit)** ([05-render-cycle.md](notes/phase-03-react-foundations/05-render-cycle.md))
  *Core concepts:* Trigger -> Render -> Commit phases, `dispatchSetState` & Eager Bailout (`Object.is`), `workInProgress` vs `current` Double Buffering, Before-Mutation / Mutation / Layout sub-phases, Browser Paint timing, and asynchronous passive effects (`useEffect`).
- [x] **06: Props vs. State Immutability & Structural Sharing** ([06-props-vs-state-immutability.md](notes/phase-03-react-foundations/06-props-vs-state-immutability.md)) 🎯 *Current Discussion Focus*
  *Core concepts:* Certified Photocopier vs Private Blackboard, V8 Heap topology of shallow copy vs deep clone, structural sharing copy-on-write trees, Fiber `oldProps === newProps` bailout, and ES2023 `toSorted()` memory patterns.
- [x] **07: State Architecture & Automatic Batching (React 18 & 19)** ([07-state-batching-react18.md](notes/phase-03-react-foundations/07-state-batching-react18.md))
  *Core concepts:* Synthetic event context vs Root-level automatic batching, `ensureRootIsScheduled`, Microtask queue coalescing, functional updater purity invariant, and emergency `flushSync` DOM measurement.
- [x] **08: Hooks Philosophy & Rules Mechanics (Linked List under the Hood)** ([08-hooks-philosophy-mechanics.md](notes/phase-03-react-foundations/08-hooks-philosophy-mechanics.md))
  *Core concepts:* Numbered Lockers in the Train Station, `fiber.memoizedState` singly linked list, `ReactCurrentDispatcher.current` Chameleon switch (Mount vs Update vs ContextOnly), dynamic child decomposition, and React 19 Compiler AST auto-memoization.
- [x] **09: Context API & Scoped State Architecture** ([09-context-api-architecture.md](notes/phase-03-react-foundations/09-context-api-architecture.md))
  *Core concepts:* Municipal Radio Station vs Bucket Brigade, `createContext` heap record, `fiber.dependencies` linked list, `propagateContextChange` childLanes bypass through `React.memo`, Split Context Pattern (State vs Dispatch), and Low- vs High-frequency state boundaries.
- [x] **10: Controlled vs. Uncontrolled Forms & Performance** ([10-controlled-vs-uncontrolled.md](notes/phase-03-react-foundations/10-controlled-vs-uncontrolled.md))
  *Core concepts:* Puppeteer vs Physical Ballot Box, V8-to-Blink C++ cross-context bridge penalty, `HTMLInputElement.value` property vs attribute, native `new FormData()` extraction, schema validation with Zod, and React 19 Form Actions (`useActionState`, `<form action>`).

---

### Phase 04: React Rendering Internals & Fiber Architecture — 100% Published
- [x] **01: Virtual DOM Under the Hood & Object Anatomy** ([01-virtual-dom-under-the-hood.md](notes/phase-04-react-rendering-internals/01-virtual-dom-under-the-hood.md))
  *Core concepts:* Declarative abstraction vs imperative DOM, V8 Nursery heap representation (~64 bytes) vs Blink C++ HTMLDivElement (300+ fields), `$$typeof: Symbol.for('react.element')` anti-XSS security barrier, Ephemeral Elements vs Persistent Fibers, and modern compiler-driven direct DOM benchmarks.
- [x] **02: Reconciliation & Diffing Algorithm** ([02-reconciliation-diffing-algorithm.md](notes/phase-04-react-rendering-internals/02-reconciliation-diffing-algorithm.md))
  *Core concepts:* Mathematical $O(n^3)$ Tree Edit Distance reduction to $O(n)$, Heterogeneous Type vs Key Stability axioms, Two-Pass array diffing algorithm, `lastPlacedIndex` watermark move detection, and why array index keys cause state bleed.
- [x] **03: Fiber Architecture & Linked List Work Trees** ([03-fiber-architecture.md](notes/phase-04-react-rendering-internals/03-fiber-architecture.md))
  *Core concepts:* Virtualized call stack on V8 heap, `child`, `sibling`, and `return` pointer navigation, Double Buffering pattern (`current` vs `workInProgress` via `alternate`), atomic pointer swaps (`fiberRoot.current = workInProgress`), and `beginWork` vs `completeWork` work loops.
- [x] **04: Fiber Schedulers & Cooperative Time Slicing** ([04-fiber-schedulers-time-slicing.md](notes/phase-04-react-rendering-internals/04-fiber-schedulers-time-slicing.md))
  *Core concepts:* 5ms frame slice budget (`yieldInterval`), abandonment of `requestIdleCallback`, zero-clamping macrotask trampoline via `MessageChannel`, binary Min-Heaps (`taskQueue` and `timerQueue`), and anti-starvation timestamp escalation.
- [x] **05: Lanes & Priority Mechanics** ([05-lanes-priority-mechanics.md](notes/phase-04-react-rendering-internals/05-lanes-priority-mechanics.md))
  *Core concepts:* 31-bit integer bitmasks, V8 unboxed Smi zero-allocation optimization, `lanes & -lanes` two's-complement lowest-bit isolation, 16 parallel `TransitionLanes`, subtree pruning via `childLanes`, and Lane Entanglement.
- [x] **06: Concurrent Features (`startTransition`, `useDeferredValue`)** ([06-concurrent-features.md](notes/phase-04-react-rendering-internals/06-concurrent-features.md))
  *Core concepts:* Urgent vs Transition classification, `ReactCurrentBatchConfig.transition`, background WIP abandonment during urgent interrupts, value forking via `useDeferredValue`, mandatory `React.memo` pairing, and UI Tearing prevention via `useSyncExternalStore`.
- [x] **07: Suspense Architecture & Error Boundaries** ([07-suspense-error-boundaries.md](notes/phase-04-react-rendering-internals/07-suspense-error-boundaries.md))
  *Core concepts:* Asynchronous control flow via thrown Promises, `ping` listeners scheduling `RetryLanes`, `OffscreenComponent` Fiber preserving DOM state off-screen with `display: none`, and Error Boundary blast radius containment (`getDerivedStateFromError` vs `componentDidCatch`).
- [x] **08: Server-Side Rendering (SSR) & Streaming Hydration** ([08-ssr-streaming-hydration.md](notes/phase-04-react-rendering-internals/08-ssr-streaming-hydration.md))
  *Core concepts:* Breaking the All-or-Nothing SSR waterfall, `renderToPipeableStream` with `onShellReady` vs `onAllReady`, out-of-order HTML chunk streaming via inline `<template id="B:0">` and `$RC()` replacement scripts, and Selective Hydration with click event buffering and replaying.
- [x] **09: React Server Components (RSC) Internals** ([09-rsc-internals.md](notes/phase-04-react-rendering-internals/09-rsc-internals.md))
  *Core concepts:* Zero-bundle architecture (0 KB client bundle size for Server Components), the Flight Wire Format protocol (`M`, `J`, `S`, `H` chunks), `'use client'` demarcation boundaries, Module References (`$M`), serialization contracts, and the Interleaving Slot Pattern.
- [x] **10: The React Compiler & React Forget Internals** ([10-react-compiler-internals.md](notes/phase-04-react-rendering-internals/10-react-compiler-internals.md))
  *Core concepts:* Elimination of manual `useMemo`/`useCallback` tax, AST $\rightarrow$ HIR $\rightarrow$ SSA (Static Single Assignment) compiler pipeline, Reactive Scope inference, low-level Memo Cache runtime (`_c(N)`), auto-memoization of returned JSX elements, and the `'use no memo'` escape hatch.

---

### Phase 05: Advanced State Architecture & Data Patterns — 100% Published
- [x] **01: State Modeling & Normalization** ([01-state-modeling-normalization.md](notes/phase-05-advanced-state-architecture/01-state-modeling-normalization.md))
  *Core concepts:* Relational state modeling (1NF), eliminating split-brain UI desync, canonical schema (`byId: Record<string, T>` and `allIds: string[]`), O(1) surgical updates without memory churn, Redux Toolkit `createEntityAdapter`, Zustand normalized stores, and Reselect denormalization.
- [x] **02: Redux Toolkit (RTK) vs Angular NgRx Architecture** ([02-redux-toolkit-rtk-vs-ngrx.md](notes/phase-05-advanced-state-architecture/02-redux-toolkit-rtk-vs-ngrx.md))
  *Core concepts:* Unidirectional Data Flow (`dispatch -> middleware -> reducer -> store -> selector -> UI`), Immer 10 ES6 Proxy copy-on-write trees, `createSlice` unified action/reducer generation, `createAsyncThunk` life cycle states, Middleware Onion architecture, NgRx Store & Effects comparison, and .NET MediatR / CQRS pipeline equivalence.
- [x] **03: Zustand & Atomic State Management** ([03-zustand-atomic-state.md](notes/phase-05-advanced-state-architecture/03-zustand-atomic-state.md))
  *Core concepts:* Zero-Provider closure architecture, `useSyncExternalStoreWithSelector` concurrent integration, fine-grained selector subscriptions with `useShallow`, 60/120 FPS transient DOM updates bypassing Fiber reconciliation, Slices pattern composition, Angular Signals/ComponentStore comparison, and .NET Singleton reactive service equivalence.
- [x] **04: Server State & TanStack Query (React Query) Architecture** ([04-tanstack-query-server-state.md](notes/phase-05-advanced-state-architecture/04-tanstack-query-server-state.md))
  *Core concepts:* Server vs Client state boundaries, QueryClient & QueryCache Map architecture, Stale-While-Revalidate (RFC 5861), `staleTime` (network) vs `gcTime` (heap GC), request deduplication, structural sharing (`replaceEqualDeep`), and React 19 concurrent integration via `useSyncExternalStore`.
- [x] **05: Cache Invalidation & Optimistic UI Updates** ([05-cache-invalidation-optimistic-ui.md](notes/phase-05-advanced-state-architecture/05-cache-invalidation-optimistic-ui.md))
  *Core concepts:* Pessimistic vs Optimistic UI lifecycles, 4-phase transaction contract (`onMutate`, `onError`, `onSuccess`, `onSettled`), the Ghost Rollback bug and mandatory `cancelQueries`, exact/prefix cache invalidation, and eventual consistency reconciliation.
- [x] **06: Reselect, Memoization & Selector Performance** ([06-reselect-memoization-performance.md](notes/phase-05-advanced-state-architecture/06-reselect-memoization-performance.md))
  *Core concepts:* Derived state projections, Reselect 5.x architecture, `lruMemoize` vs `weakMapMemoize` (Trie-based Ephemeron caching), referential equality (`===`), solving multi-instance cache thrashing, and V8 Inline Cache (IC) stability.
- [x] **07: URL State Management & Deep Linking** ([07-url-state-management.md](notes/phase-05-advanced-state-architecture/07-url-state-management.md))
  *Core concepts:* URL as Single Source of Truth, History API mechanics (`pushState`, `replaceState`, `popstate`), type-safe URL state with `nuqs`, debounced search replace vs paginated push, History API rate limiting (`SecurityError`), and React 19 concurrent transitions.
- [x] **08: Real-Time State (WebSockets, SSE) & React Synchronization** ([08-realtime-websockets-sync.md](notes/phase-05-advanced-state-architecture/08-realtime-websockets-sync.md))
  *Core concepts:* Push vs Pull protocols (SSE vs WebSockets), High-frequency re-render meltdown prevention, Ring buffer + `requestAnimationFrame` 60 FPS batching loop, TanStack Query cache patching, connection heartbeats (Ping/Pong), exponential backoff with jitter, and multi-tab `SharedWorker` coordination.
- [x] **09: State Machines with XState in Complex UI Workflows** ([09-state-machines-xstate.md](notes/phase-05-advanced-state-architecture/09-state-machines-xstate.md))
  *Core concepts:* Eliminating the Boolean Explosion ($2^N$ impossible states), David Harel Statecharts, XState v5 Actor Model (`setup`, `createMachine`), finite state (`value`) vs extended state (`context`), guards, actions, invoked actors, and `@xstate/react` `useSelector`.
- [x] **10: Enterprise Offline-First & Persistent State Strategies** ([10-offline-first-persistence.md](notes/phase-05-advanced-state-architecture/10-offline-first-persistence.md))
  *Core concepts:* Local-First architecture, Browser storage tiers (IndexedDB vs localStorage), TanStack Query persistence pipeline (dehydration/rehydration with `idb-keyval`), offline mutation outbox queue (FIFO), conflict resolution (Last-Write-Wins vs Version Vectors / OCC), schema busters, and poison-pill error quarantining.

---

### Phase 06: Next.js & Full-Stack React Architecture — 100% Published & Mastered
- [x] **00: Architectural Companion: Next.js Full-Stack Directory, Syntax & Primitives Rosetta Stone** ([00-nextjs-syntax-conventions-architecture.md](notes/phase-06-nextjs-fullstack-react/00-nextjs-syntax-conventions-architecture.md))
  *Core concepts:* Comprehensive full-stack directory hierarchy (`layout.tsx`, `template.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `route.ts`), compiler pragmas (`'use client'`, `'use server'`, `server-only`), modern routing hooks (`next/navigation`), cache eviction primitives (`next/cache`), and direct 1-to-1 .NET & Angular Rosetta Stone comparison table.
- [x] **01: Next.js App Router Architecture & Server-First Mental Model** ([01-nextjs-app-router-architecture.md](notes/phase-06-nextjs-fullstack-react/01-nextjs-app-router-architecture.md))
  *Core concepts:* Paradigm shift from client-heavy SPAs to server-first UI projection, Heterogeneous Component Graph, `'use client'` customs gate ($M client reference), RSC Flight wire format, directory conventions (`layout.tsx`, `template.tsx`, `page.tsx`), Hollow Doughnut pattern, URL searchParams state synchronization, and 4-way comparison against ASP.NET Core Razor Pages, Blazor Server, and Angular SSR.
- [x] **02: React Server Components (RSC) Wire Format & Payload Streaming** ([02-rsc-wire-format-streaming.md](notes/phase-06-nextjs-fullstack-react/02-rsc-wire-format-streaming.md))
  *Core concepts:* The Flight Wire Protocol (`text/x-component`), `M` (Module Reference), `J` (JSON Element Tree), `S` (Suspense), and `$@` (Deferred Promise) chunks, client deserialization via `ReadableStreamDefaultReader`, Out-of-Order Suspense streaming over single HTTP chunked connection, `<template id="B:0">` and inline `$RC()` swapping scripts, prop serialization security audits (DTO sanitization), and comparison with Angular `@defer` and ASP.NET Core Blazor Server SignalR circuits.
- [x] **03: Server Actions & Form Mutations** ([03-server-actions-form-mutations.md](notes/phase-06-nextjs-fullstack-react/03-server-actions-form-mutations.md))
  *Core concepts:* `'use server'` as an RPC export directive, cryptographic Action ID hashing, Single-Flight Mutation & Revalidation protocol (`revalidatePath` returning action result + updated Flight tree in 1 round-trip), Progressive Enhancement over native HTML POST, React 19 action primitives (`useActionState`, `useFormStatus`, `useOptimistic`), enterprise Safe Action Pipeline (RBAC + Zod), Next.js as the enterprise BFF orchestrating .NET microservices, and static hosting constraints (Docker/ACA vs GitHub Pages).
- [x] **04: Static Site Generation (SSG) vs Incremental Static Regeneration (ISR)** ([04-ssg-vs-isr.md](notes/phase-06-nextjs-fullstack-react/04-ssg-vs-isr.md))
  *Core concepts:* Pre-rendering build pipeline, `generateStaticParams`, RFC 5861 `stale-while-revalidate` protocol, background worker deduplication locks, atomic filesystem swaps (`fs.rename`), on-demand tag invalidation (`revalidateTag`), and distributed cache handlers with Redis.
- [x] **05: Middleware & Edge Runtime Mechanics** ([05-middleware-edge-runtime.md](notes/phase-06-nextjs-fullstack-react/05-middleware-edge-runtime.md))
  *Core concepts:* Edge V8 Isolates vs Node.js processes (<5ms cold start), Web Standards runtime constraints, `NextResponse.redirect` vs `NextResponse.rewrite` for multi-tenant subdomain mapping, request header mutation and propagation, cryptographic CSP nonce generation, and negative-lookahead matcher optimization.
- [x] **06: Authentication & Session Management in Full-Stack Next.js** ([06-authentication-session-management.md](notes/phase-06-nextjs-fullstack-react/06-authentication-session-management.md))
  *Core concepts:* 3-Tier Defense-in-Depth model (Edge Middleware -> Server Components -> Server Actions), `HttpOnly` `SameSite=Lax` cookie encryption via `jose`, cookie mutability rules (Server Components read-only, Server Actions read/write), hybrid instant revocation via Redis token epoch, and Auth.js / NextAuth v5 architecture.
- [x] **07: Route Handlers & REST/GraphQL API Design** ([07-route-handlers-api-design.md](notes/phase-06-nextjs-fullstack-react/07-route-handlers-api-design.md))
  *Core concepts:* Web Standard `Request` and `Response` interfaces in `route.ts`, route segment coexistence prohibition (`page.tsx` vs `route.ts`), static vs dynamic `GET` evaluation, Web Streams API `ReadableStream` for token-by-token AI streaming, raw body HMAC webhook verification (Stripe), and CORS preflight handling.
- [x] **08: Caching Architecture (Request Memoization, Data Cache, Full Route Cache)** ([08-caching-architecture.md](notes/phase-06-nextjs-fullstack-react/08-caching-architecture.md))
  *Core concepts:* The 4 distinct caching tiers (Request Memoization, Client Router Cache, Server Data Cache, Full Route Cache), React `cache()` single-render deduplication, Next.js 15 un-cached defaults (`no-store`), cascading tag invalidation, and multi-tenant cache leakage prevention.
- [x] **09: Dynamic Imports, Bundling & Code Splitting Optimization** ([09-dynamic-imports-bundling-optimization.md](notes/phase-06-nextjs-fullstack-react/09-dynamic-imports-bundling-optimization.md))
  *Core concepts:* V8 CPU compilation tax reduction, `next/dynamic` with `{ ssr: false }` for client-only libraries, Turbopack incremental computation graph vs Webpack SplitChunks, tree-shaking with `sideEffects: false`, barrel file pruning with `optimizePackageImports`, and bundle analysis.
- [x] **10: Enterprise Next.js Deployment & Observability (Docker, Vercel, Azure)** ([10-enterprise-deployment-observability.md](notes/phase-06-nextjs-fullstack-react/10-enterprise-deployment-observability.md))
  *Core concepts:* `output: 'standalone'` AST dependency tracing slashing Docker image from 1.5GB to 84MB, multi-stage Alpine Dockerfile with unprivileged `nextjs` user, Azure Container Apps (ACA) deployment, `instrumentation.ts` lifecycle hook, W3C `traceparent` distributed tracing across Next.js and ASP.NET Core, and Kubernetes `/api/healthz` probes.

---

### Phase 07: Enterprise Security, Authentication & Identity — 100% Published & Mastered
- [x] **01: Enterprise Authentication & Identity Landscape** ([01-enterprise-authentication-identity-landscape.md](notes/phase-07-enterprise-security-auth-identity/01-enterprise-authentication-identity-landscape.md))
  *Core concepts:* Authentication (OIDC) vs Authorization (OAuth 2.0), RFC 6749 roles, Token family anatomy (ID Token vs Access Token vs Refresh Token), Public vs Confidential clients, JWKS public key rotation (`jwks_uri`), and Backend-For-Frontend (BFF) architecture.
- [x] **02: The PKCE Flow in Modern SPAs & Next.js** ([02-pkce-flow-spa-nextjs.md](notes/phase-07-enterprise-security-auth-identity/02-pkce-flow-spa-nextjs.md))
  *Core concepts:* RFC 7636 Proof Key for Code Exchange, deprecation of Implicit Grant, `code_verifier` entropy, SHA-256 `code_challenge` (`S256`), CSRF `state` vs Replay `nonce`, Web Cryptography API generation, and server-side PKCE in Next.js App Router.
- [x] **03: Microsoft Entra ID (Azure AD) Enterprise Integration** ([03-entra-id-azure-ad-integration.md](notes/phase-07-enterprise-security-auth-identity/03-entra-id-azure-ad-integration.md))
  *Core concepts:* Entra ID architecture, Single vs Multi-Tenant authority URIs, MSAL.js `PublicClientApplication` cache engine, Delegated Scopes vs App Roles, `acquireTokenSilent` with interactive fallback (`interaction_required`), Continuous Access Evaluation (CAE), and On-Behalf-Of (OBO) downstream flow.
- [x] **04: JWT Storage Architecture & Security Vectors** ([04-jwt-storage-security-vectors.md](notes/phase-07-enterprise-security-auth-identity/04-jwt-storage-security-vectors.md))
  *Core concepts:* Client storage tiers (`localStorage` vs `sessionStorage` vs In-Memory vs `HttpOnly` cookies), XSS token exfiltration vs CSRF ambient credentials, the `__Host-` cookie prefix envelope (`HttpOnly; Secure; SameSite=Lax; Path=/`), Web Worker V8 isolate heap shielding, and Web Crypto non-extractable keys (`extractable: false`).
- [x] **05: Session Management & Refresh Token Rotation** ([05-session-management-refresh-token-rotation.md](notes/phase-07-enterprise-security-auth-identity/05-session-management-refresh-token-rotation.md))
  *Core concepts:* Refresh Token Rotation (RTR) protocol, Token Family tracking and automatic reuse intrusion revocation, Web Locks API (`navigator.locks.request`) solving multi-tab Thundering Herd race conditions, cross-tab `BroadcastChannel` synchronization, and sliding vs absolute session timeouts.
- [x] **06: Role-Based Access Control (RBAC) & Route Protection** ([06-rbac-route-protection.md](notes/phase-07-enterprise-security-auth-identity/06-rbac-route-protection.md))
  *Core concepts:* RBAC vs ABAC vs ReBAC, Bitwise permission masks, UI visibility vs API authorization ("UI hiding is NOT security"), declarative `<Can perform="...">` components, O(1) `Set` permission checks, and Next.js Edge Middleware route guards.
- [x] **07: Content Security Policy (CSP) & Nonce Generation** ([07-csp-nonce-generation.md](notes/phase-07-enterprise-security-auth-identity/07-csp-nonce-generation.md))
  *Core concepts:* CSP Level 3 directives, cryptographic per-request nonces (`script-src 'nonce-...' 'strict-dynamic'`), Next.js Edge Middleware nonce propagation via HTTP headers, Subresource Integrity (SRI) CDN defense, W3C Trusted Types API eliminating DOM-XSS sinks, and Clickjacking defense via `frame-ancestors 'none'`.
- [x] **08: OWASP Top 10 for Frontend Applications** ([08-owasp-top-10-frontend.md](notes/phase-07-enterprise-security-auth-identity/08-owasp-top-10-frontend.md))
  *Core concepts:* Frontend OWASP Top 10 matrix, DOM-based XSS sanitization via DOMPurify, Prototype Pollution prevention (`Map`, `Object.create(null)`), Client-side Open Redirect mitigation, tab-nabbing defense (`rel="noopener noreferrer"`), security headers (HSTS, Permissions-Policy, nosniff), and npm supply chain audit gates.

---

### Phase 08: Performance Engineering, Web Vitals & Production Profiling — 100% Published & Mastered
- [x] **01: Core Web Vitals Deep Dive** ([01-core-web-vitals-deep-dive.md](notes/phase-08-performance-engineering-web-vitals/01-core-web-vitals-deep-dive.md))
  *Core concepts:* The 4 Core Web Vitals thresholds (INP <200ms, LCP <2.5s, CLS <0.1, TTFB <800ms), why INP permanently replaced FID in 2024, the 3 phases of INP (Input Delay, Processing Duration, Presentation Delay), LCP 4-phase breakdown, CLS Impact/Distance fraction calculation, and native `PerformanceObserver` implementation.
- [x] **02: Chrome DevTools Performance Profiling** ([02-chrome-devtools-performance-profiling.md](notes/phase-08-performance-engineering-web-vitals/02-chrome-devtools-performance-profiling.md))
  *Core concepts:* Deterministic profiling setups (4x/6x CPU Throttling, clean incognito), Main Thread Flamechart reading (width=time, depth=call stack), Long Tasks (>50ms red dogear warning), diagnosing Forced Synchronous Reflow (Layout Thrashing purple bars), User Timing API (`performance.mark/measure`), and React `<Profiler>` integration.
- [x] **03: Memory Leak Diagnosis & V8 Heap Snapshots** ([03-memory-leak-diagnosis-v8-heap-snapshots.md](notes/phase-08-performance-engineering-web-vitals/03-memory-leak-diagnosis-v8-heap-snapshots.md))
  *Core concepts:* V8 GC reachability from GC Roots, Shallow Size vs Retained Size, the Three-Snapshot Technique for deterministic leak isolation, Detached DOM Trees, Retainer graph navigation, the Meteor closure retention leak, and modern leak-proof caching via `WeakMap` and `FinalizationRegistry`.
- [x] **04: Long Task Optimization & Main Thread Yielding** ([04-long-task-optimization-main-thread-yielding.md](notes/phase-08-performance-engineering-web-vitals/04-long-task-optimization-main-thread-yielding.md))
  *Core concepts:* The 50ms Long Task problem and browser Rendering Opportunities, cooperative multitasking evolution (`setTimeout(0)` vs `MessageChannel` vs `scheduler.yield()`), native W3C `scheduler.yield()` continuation priority, microtask starvation pitfalls, time-budgeted chunked array processing, and React Concurrent time-slicing.
- [x] **05: Advanced Bundle Optimization & Tree-Shaking** ([05-advanced-bundle-optimization-tree-shaking.md](notes/phase-08-performance-engineering-web-vitals/05-advanced-bundle-optimization-tree-shaking.md))
  *Core concepts:* The dual cost of JavaScript (Network transfer vs V8 CPU parsing/compilation tax), static ESM syntax (`import`/`export`) prerequisites, `sideEffects: false` package contract, the Barrel File anti-pattern (`index.ts` bloat), deterministic vendor chunk splitting in Vite/Rollup, and Next.js 15 `optimizePackageImports`.
- [x] **06: Image, Asset & Font Optimization Pipelines** ([06-image-asset-font-optimization-pipelines.md](notes/phase-08-performance-engineering-web-vitals/06-image-asset-font-optimization-pipelines.md))
  *Core concepts:* Media payload weight on LCP/CLS (>60% of web bytes), Next-Gen image formats (JPEG vs WebP vs AVIF), responsive `<picture>` with `srcset` and `sizes`, `next/image` internal pipeline, FOIT vs FOUT, and Zero-CLS font metric overrides using CSS `@font-face` `size-adjust`.
- [x] **07: List & Table Virtualization at 60 FPS** ([07-list-table-virtualization-60fps.md](notes/phase-08-performance-engineering-web-vitals/07-list-table-virtualization-60fps.md))
  *Core concepts:* C++ Blink DOM node memory tax, the Sliding Window virtualization pattern, Fixed-height O(1) vs Dynamic-height `ResizeObserver` measurement, `@tanstack/react-virtual` deep dive, Overscan buffer tuning, GPU translation via `transform: translateY()`, CSS `contain: strict`, and accessibility preservation (`aria-rowcount`).
- [x] **08: Real-User Monitoring (RUM) & Performance Observability** ([08-rum-performance-observability.md](notes/phase-08-performance-engineering-web-vitals/08-rum-performance-observability.md))
  *Core concepts:* Synthetic (Lab) testing vs Real-User Monitoring (RUM), why Google ranks by Field Data (CrUX p75 over 28 days), `web-vitals/attribution` build integration, non-blocking beacon delivery via `navigator.sendBeacon()` on `visibilitychange`, telemetry sampling strategies, and full-stack distributed tracing via W3C `traceparent`.

---

### Phase 09: Enterprise Clean Architecture, Monorepos & Micro-Frontends — 100% Published & Mastered
- [x] **01: Domain-Driven Design (DDD) in Frontend** ([01-domain-driven-design-frontend.md](notes/phase-09-enterprise-architecture-monorepos/01-domain-driven-design-frontend.md))
  *Core concepts:* Bounded contexts, Entities vs Value Objects, Aggregates & Invariants, Domain Services, and Anti-Corruption Layers (ACL).
- [x] **02: Monorepo Architecture: Nx vs Turborepo** ([02-monorepo-architecture-nx-turborepo.md](notes/phase-09-enterprise-architecture-monorepos/02-monorepo-architecture-nx-turborepo.md))
  *Core concepts:* Task execution pipelines, Computation Caching (Remote Cache), Dependency Graphs (Project Graph DAG), and Affected Task Pruning.
- [x] **03: Shared Libraries & Enterprise Package Governance** ([03-shared-libraries-package-governance.md](notes/phase-09-enterprise-architecture-monorepos/03-shared-libraries-package-governance.md))
  *Core concepts:* Publishable vs Internal workspace packages, SemVer 2.0.0, Changesets release automation, `peerDependencies` singleton invariants, and ESLint boundary rules.
- [x] **04: Micro-Frontends & Module Federation** ([04-micro-frontends-module-federation.md](notes/phase-09-enterprise-architecture-monorepos/04-micro-frontends-module-federation.md))
  *Core concepts:* Webpack 5 / Rspack Module Federation, Host vs Remote containers, `__webpack_share_scopes__`, strict React singletons, dynamic remote manifests, and Error Boundaries.
- [x] **05: Design System Architecture & Component Libraries** ([05-design-system-architecture-component-libraries.md](notes/phase-09-enterprise-architecture-monorepos/05-design-system-architecture-component-libraries.md))
  *Core concepts:* Three-tier design system, W3C Design Tokens Community Group (DTCG), Style Dictionary pipeline, Headless primitives (Radix UI), Slot (`asChild`) polymorphism, and WCAG 2.2 AA.
- [x] **06: Feature-Sliced Design (FSD) Architectural Standard** ([06-feature-sliced-design-architecture.md](notes/phase-09-enterprise-architecture-monorepos/06-feature-sliced-design-architecture.md))
  *Core concepts:* 6 standardized layers (App, Pages, Widgets, Features, Entities, Shared), Slices and Segments, Unidirectional Dependency Rule, and public API encapsulation.
- [x] **07: Scalable State & Service Scaffolding** ([07-scalable-state-service-scaffolding.md](notes/phase-09-enterprise-architecture-monorepos/07-scalable-state-service-scaffolding.md))
  *Core concepts:* Clean Architecture in frontend, Repository Pattern, Dependency Inversion with React Context, runtime boundary validation with Zod, and hermetic unit testing.
- [x] **08: Case Study: Refactoring Monolithic SPAs to Modular Clean Architecture** ([08-refactoring-monolith-to-clean-architecture.md](notes/phase-09-enterprise-architecture-monorepos/08-refactoring-monolith-to-clean-architecture.md))
  *Core concepts:* The Strangler Fig pattern for SPAs, Edge Reverse Proxy route delegation, automated AST codemods with jscodeshift, and cross-boundary state bridges via BroadcastChannel.

---

### Phase 10: Modern Testing Strategy & Quality Assurance — 100% Published & Mastered
- [x] **01: The Modern Frontend Testing Pyramid & Testing Trophy** ([01-modern-frontend-testing-pyramid.md](notes/phase-10-testing-strategy/01-modern-frontend-testing-pyramid.md))
  *Core concepts:* The Testing Pyramid vs Testing Trophy, Confidence vs Cost Distribution, Integration as the highest-ROI layer, test boundary definition, and risk-weighted testing in FinTech/HealthTech.
- [x] **02: Vitest & Jest Runner Architecture** ([02-vitest-jest-runner-architecture.md](notes/phase-10-testing-strategy/02-vitest-jest-runner-architecture.md))
  *Core concepts:* Vitest vs Jest compilation pipelines, native ESM execution, Happy-DOM vs JSDOM memory/speed benchmarks, thread worker pools (`isolate: true`), and module hoisting (`vi.hoisted`).
- [x] **03: React Testing Library Philosophy & User-Centric Testing** ([03-react-testing-library-philosophy.md](notes/phase-10-testing-strategy/03-react-testing-library-philosophy.md))
  *Core concepts:* User-observable behavior over implementation details, `getByRole` accessibility query hierarchy, `getBy` vs `queryBy` vs `findBy`, and `@testing-library/user-event` full event chains.
- [x] **04: Mock Service Worker (MSW v2) Network Mocking Architecture** ([04-msw-mock-service-worker-architecture.md](notes/phase-10-testing-strategy/04-msw-mock-service-worker-architecture.md))
  *Core concepts:* Network-level socket interception vs brittle module mocks, Service Worker vs Node.js socket patching, `HttpResponse.json()`, runtime overrides via `server.use()`, and eliminating mock drift.
- [x] **05: Testing Asynchronous React Hooks & Stores** ([05-testing-async-react-hooks-stores.md](notes/phase-10-testing-strategy/05-testing-async-react-hooks-stores.md))
  *Core concepts:* `renderHook` synthetic component harness, React 19 `act()` reconciliation flushing, pure Zustand store isolation with deterministic resets, and TanStack Query `createWrapper` setups.
- [x] **06: Integration Testing Complex User Workflows** ([06-integration-testing-complex-workflows.md](notes/phase-10-testing-strategy/06-integration-testing-complex-workflows.md))
  *Core concepts:* Multi-step wizards with `MemoryRouter`, optimistic UI mutations with rollback verification on HTTP 500, React Error Boundary testing with self-healing recovery, and accessible dialogs.
- [x] **07: Playwright End-to-End (E2E) Testing Architecture** ([07-playwright-e2e-testing-architecture.md](notes/phase-10-testing-strategy/07-playwright-e2e-testing-architecture.md))
  *Core concepts:* Out-of-process WebSocket protocol control, `Browser` vs `BrowserContext` vs `Page`, session caching via `storageState`, actionability auto-waiting, Page Object Models, and test sharding.
- [x] **08: Visual Regression Testing & CI Quality Gates** ([08-visual-regression-testing-ci-quality-gates.md](notes/phase-10-testing-strategy/08-visual-regression-testing-ci-quality-gates.md))
  *Core concepts:* Pixelmatch raster diffing vs DOM snapshots, font anti-aliasing drift between OS engines, Dockerized Linux test execution, dynamic element masking, and Storybook visual PR quality gates.

---

### Phase 11: Frontend System Design at Scale — 100% Published & Mastered
- [x] **01: The Frontend System Design Interview Framework** ([01-frontend-system-design-interview-framework.md](notes/phase-11-frontend-system-design/01-frontend-system-design-interview-framework.md))
  *Core concepts:* Requirements triage, functional & non-functional SLAs, component data contracts, state topologies, and end-to-end architecture diagrams.
- [x] **02: System Design: Real-Time Collaborative Canvas** ([02-realtime-collaborative-canvas-crdts.md](notes/phase-11-frontend-system-design/02-realtime-collaborative-canvas-crdts.md))
  *Core concepts:* Figma-style CRDT conflict resolution (Yjs / Automerge), WebSocket awareness protocol, and QuadTree spatial indexing for 100k shapes at 60 FPS.
- [x] **03: System Design: High-Frequency Trading & Telemetry Terminal** ([03-high-frequency-trading-telemetry-terminal.md](notes/phase-11-frontend-system-design/03-high-frequency-trading-telemetry-terminal.md))
  *Core concepts:* Ingesting 10,000 ticks/sec, Web Worker binary parsing, zero-copy `ArrayBuffer` transfer lists, Circular Ring Buffers, and OffscreenCanvas.
- [x] **04: System Design: Multi-Tenant Enterprise SaaS Dashboard** ([04-multi-tenant-enterprise-saas-dashboard.md](notes/phase-11-frontend-system-design/04-multi-tenant-enterprise-saas-dashboard.md))
  *Core concepts:* Zero-runtime CSS Custom Property theming, bitmask RBAC/ABAC entitlement engine, schema-driven JSON widget layout engine, and plugin sandboxing.
- [x] **05: System Design: Global Streaming Media Player** ([05-global-streaming-media-player.md](notes/phase-11-frontend-system-design/05-global-streaming-media-player.md))
  *Core concepts:* Media Source Extensions (MSE) pipeline, HLS/DASH chunking, BOLA buffer-based adaptive bitrate (ABR) algorithm, EME DRM, and QoE telemetry.
- [x] **06: System Design: Backend-For-Frontend (BFF) vs API Gateway** ([06-bff-pattern-vs-api-gateway.md](notes/phase-11-frontend-system-design/06-bff-pattern-vs-api-gateway.md))
  *Core concepts:* Eliminating over/under-fetching, Token-Mediating BFF with encrypted cookies, gRPC to JSON/RSC translation, and resilient fan-out via `Promise.allSettled`.
- [x] **07: System Design: Resilient Offline-First Mobile Field Worker App** ([07-resilient-offline-first-mobile-field-app.md](notes/phase-11-frontend-system-design/07-resilient-offline-first-mobile-field-app.md))
  *Core concepts:* Local-First paradigm, IndexedDB persistence, atomic FIFO mutation outbox, Dead-Letter Queue (DLQ), and optimistic concurrency control (OCC).
- [x] **08: System Design: Global CDN Edge Compute & Caching Strategy** ([08-global-cdn-edge-compute-caching.md](notes/phase-11-frontend-system-design/08-global-cdn-edge-compute-caching.md))
  *Core concepts:* Global Anycast routing, RFC 5861 `stale-while-revalidate`, V8 Isolates vs Node containers, Cache-Tag surrogate keys, and streaming `HTMLRewriter` edge personalization.

---

### Phase 12: Angular to React Enterprise Synthesis (Senior / Staff Capstone) — 100% Published & Mastered
- [x] **00: Angular vs. React Mental Model** ([00-angular-vs-react-mental-model.md](notes/phase-12-angular-to-react-enterprise-synthesis/00-angular-vs-react-mental-model.md))
  *Core concepts:* Two-way binding vs one-way data flow, OOP/DI vs Functional Composition, Zone.js vs React Schedulers.
- [x] **01: Angular to React Architectural Mapping Guide** ([01-angular-to-react-architectural-mapping-guide.md](notes/phase-12-angular-to-react-enterprise-synthesis/01-angular-to-react-architectural-mapping-guide.md))
  *Core concepts:* 1-to-1 Rosetta Stone mapping for modules, `@Component`, `@Input`/`@Output`, lifecycle hooks, structural directives (`*ngIf`, `*ngFor`), and templates.
- [x] **02: Angular Change Detection (Zone.js/Signals) vs React Reconciliation (Fiber)** ([02-angular-change-detection-vs-react-reconciliation.md](notes/phase-12-angular-to-react-enterprise-synthesis/02-angular-change-detection-vs-react-reconciliation.md))
  *Core concepts:* Monkey-patched `Zone.js` dirty checking vs Fiber reconciler dual-buffering work loop; `ChangeDetectionStrategy.OnPush` vs `React.memo`.
- [x] **03: RxJS Reactive Streams vs React Hooks & State Primitives** ([03-rxjs-reactive-streams-vs-react-hooks.md](notes/phase-12-angular-to-react-enterprise-synthesis/03-rxjs-reactive-streams-vs-react-hooks.md))
  *Core concepts:* Push-based asynchronous event streams (`Observable`, `Subject`, `pipe`) vs pull-based continuous component re-execution with hooks; `switchMap` vs `AbortController`.
- [x] **04: Angular Hierarchical Dependency Injection vs React Composition & Context** ([04-angular-di-vs-react-composition-context.md](notes/phase-12-angular-to-react-enterprise-synthesis/04-angular-di-vs-react-composition-context.md))
  *Core concepts:* Injector bubbling trees (`ElementInjector`, `EnvironmentInjector`, `@Injectable`) vs React Context and Higher-Order Components / custom hooks.
- [x] **05: NgRx Store Architecture vs Redux Toolkit & Zustand** ([05-ngrx-store-vs-redux-toolkit-zustand.md](notes/phase-12-angular-to-react-enterprise-synthesis/05-ngrx-store-vs-redux-toolkit-zustand.md))
  *Core concepts:* NgRx Actions, Reducers, Effects, and Selectors vs RTK slices, `createAsyncThunk`, and Zustand bare-metal closures; boilerplate reduction.
- [x] **06: Angular Route Guards & Interceptors vs React Routers & Middleware** ([06-angular-route-guards-interceptors-vs-react.md](notes/phase-12-angular-to-react-enterprise-synthesis/06-angular-route-guards-interceptors-vs-react.md))
  *Core concepts:* `CanActivate`, `CanDeactivate`, and `HttpInterceptor` vs React Router loaders, layout route wrappers, and Axios / Fetch interceptor patterns.
- [x] **07: Angular Signals (Fine-Grained) vs React State & React Compiler** ([07-angular-signals-vs-react-state-compiler.md](notes/phase-12-angular-to-react-enterprise-synthesis/07-angular-signals-vs-react-state-compiler.md))
  *Core concepts:* Signal dependency graph & fine-grained DOM mutation without component re-evaluation vs React coarse component re-rendering optimized by React Compiler (Forget).
- [x] **08: Enterprise Clean Architecture: Scalable Angular vs Scalable React Applications** ([08-enterprise-clean-architecture-angular-vs-react.md](notes/phase-12-angular-to-react-enterprise-synthesis/08-enterprise-clean-architecture-angular-vs-react.md))
  *Core concepts:* Clean Architecture / Hexagonal Ports & Adapters across both ecosystems; domain entities, use-case interactors, repository interfaces, and framework independence.


---

## 4. Interactive Web App: Simulation & Demo Backlog

This backlog catalogs interactive simulations, visual labs, and responsive demos to be implemented into our dedicated **React-based Revision & Learning Portal**.

### Lab 01: V8 Ignition & TurboFan JIT Optimizer
- **Reference:** [`01-javascript-execution-model.md`](notes/phase-01-javascript-runtime-foundations/01-javascript-execution-model.md)
- **Concept:** Visualize how V8 optimizes dynamic JavaScript into near-native assembly.
- **Interactive Controls:**
  - Code sandbox to mutate object shapes on the fly (`{x, y}` vs `{x, y, z}`).
  - "Monomorphic $\rightarrow$ Polymorphic $\rightarrow$ Megamorphic" state indicator.
  - Button: "Trigger De-optimization" to watch TurboFan discard compiled machine code and bail back to Ignition bytecode.

### Lab 02: Lexical Scope & TDZ Visual Scanner
- **Reference:** [`02-scope-hoisting-tdz.md`](notes/phase-01-javascript-runtime-foundations/02-scope-hoisting-tdz.md)
- **Concept:** Step-by-step compilation and execution scanner.
- **Interactive Controls:**
  - Step Forward / Step Backward execution controls.
  - Memory inspector showing identifiers moving from `uninitialized` (TDZ) to `initialized` to value binding.
  - Interactive "Read Variable in TDZ" button triggering visual engine exceptions.

### Lab 03: React Stale Closure & Locket Timeline
- **Reference:** [`03-closures.md`](notes/phase-01-javascript-runtime-foundations/03-closures.md)
- **Concept:** An interactive timeline slider showing state across multiple React render passes.
- **Interactive Controls:**
  - "Trigger Render" button (increments state from 0 $\rightarrow$ 1 $\rightarrow$ 2).
  - "Fire Asynchronous Callback" button with customizable delay (e.g. 3000ms).
  - Strategy Switcher:
    - Capture by value (`count` - produces stale closure).
    - `useRef.current` (live pointer to current heap).
    - Functional updater (`setCount(prev => prev + 1)`).
    - OOP Class instance vs Closure Factory toggle.
  - Visual panel showing the frozen lexical "photograph" retained in the callback's `[[Scopes]]`.

### Lab 04: The 4-Lane Event Loop & 60 FPS Frame Budget Simulator ✅ (Live in Portal: `lab-04-event-loop`)
- **Reference:** [`04-event-loop.md`](notes/phase-01-javascript-runtime-foundations/04-event-loop.md)
- **Concept:** Real-time visual simulator of the browser Event Loop and rendering pipeline.
- **Component:** [`EventLoopLab.tsx`](apps/portal/src/features/visualizers/topic-04-event-loop/EventLoopLab.tsx)
- **Interactive Controls:**
  - Visual lanes: **Call Stack**, **Microtask Queue**, **Render Gate (16.6ms V-Sync)**, **Macrotask Queue**.
  - Action buttons:
    - "Queue Microtask (`Promise.then`)"
    - "Queue Macrotask (`setTimeout 0ms`)"
    - "Schedule Animation (`requestAnimationFrame`)"
    - "Simulate 80ms Heavy CPU Task (Trigger INP regression)"
    - "Switch on Microtask Starvation Loop" (visualizes the infinite freeze).
  - Real-time frame rate (FPS) meter and Core Web Vital **INP meter** updating based on main-thread blocking.

### Lab 05: Promise State Machine & Push-Based Microtask Trampoline
- **Reference:** [`05-promises-async-await.md`](notes/phase-01-javascript-runtime-foundations/05-promises-async-await.md)
- **Concept:** Visualizing the internal V8 `JSPromise` state machine, `PromiseReaction` listener lists, and how `resolve()` physically pushes continuations into the Microtask Queue.
- **Interactive Controls:**
  - Visualizer showing `[[PromiseState]]`, `[[PromiseResult]]`, and `[[PromiseFulfillReactions]]` heap records.
  - "Fire Network Response" button: Watch the Promise transition from `"pending"` $\rightarrow$ `"fulfilled"` and push its `PromiseReaction` directly into the Microtask Queue.
  - "Step through `async/await`" slider: Watch the generator suspend, pop off the Call Stack, preserve local registers on the heap, and re-enter upon microtask drain.
### Lab 06: Prototype Chain Traversal & The Microphone (`this`) Stage
- **Reference:** [`06-objects-prototypes-this.md`](notes/phase-01-javascript-runtime-foundations/06-objects-prototypes-this.md)
- **Concept:** Visualizing property delegation walking up the prototype chain and interactive call-site `this` binding.
- **Interactive Controls:**
  - Interactive "Office Desk & Supply Room" tree visualizer: click "Lookup Property" to watch the pointer hop from Desk → Team Lead → Central Supply Room (`Object.prototype`) → `null`.
  - Prototype Pollution Sandbox: inject an object and observe all downstream objects inherit the polluted property in real time.
  - The "Who Holds the Microphone?" Call-Site Tester: select call patterns (`obj.fn()`, `const f = obj.fn; f()`, `fn.call(custom)`, `new fn()`, `() => {}`) and watch the visual microphone jump to the active `this` context.

### Lab 07: Pure State Visualizer, Immutability Inspector & Pipeline Composer
- **Reference:** [`07-functional-javascript.md`](notes/phase-01-javascript-runtime-foundations/07-functional-javascript.md)
- **Concept:** Visualizing why in-place state mutation (`todos.push`) fails React reference equality (`Object.is`), how structural sharing works on the heap, and interactive `pipe()` conveyor belts.
- **Interactive Controls:**
  - "Mutate State In-Place vs. Immutable Spread" Dual Simulator: watch `0x1000 == 0x1000` abort re-rendering in the Fiber inspector vs `0x2000` triggering an instant UI re-render.
  - Fiber `memoizedState` Singly-Linked List Explorer: walk through how `useState()` pairs state values with dispatchers across render passes.
  - Interactive Pipeline Builder: drag and drop pure functions (`trim`, `uppercase`, `exclaim`) into a live `pipe()` conveyor belt and inspect the data transformation at each step.

### Lab 08: ES6+ Engine Explorer & V8 Hidden Class Profiler
- **Reference:** [`08-modern-es6-plus.md`](notes/phase-01-javascript-runtime-foundations/08-modern-es6-plus.md)
- **Concept:** Visualizing bytecode evaluation of `?.` / `??` vs `||`, tracking default values with `undefined` vs `null`, and testing V8 Shape degradation (`delete` vs Rest destructuring).
- **Interactive Controls:**
  - "Overzealous Bouncer vs Strict Doorman" Sandbox: test values (`0`, `""`, `false`, `null`, `undefined`) against `||` and `??` side-by-side with live visual output.
  - V8 Hidden Class & Inline Cache Profiler: run `delete obj.prop` and watch the object state switch from Fast Properties to Dictionary Mode / Megamorphic vs Rest Destructuring `{ prop, ...clean }` staying Monomorphic.
  - Generator Stepper & Stack Freezing Demo: step through an active `function*` generator, observing the Call Stack frame popping off while local variables remain preserved in the Heap Generator Record.

### Lab 09: V8 Generational Heap & Tri-Color GC Visualizer
- **Reference:** [`09-memory-management-garbage-collection.md`](notes/phase-01-javascript-runtime-foundations/09-memory-management-garbage-collection.md)
- **Concept:** Visualizing the V8 heap topology (New Space semi-spaces, Old Space, Large Object Space), Cheney's Copying Scavenger, and the Tri-Color Marking algorithm with Write Barrier interception.
- **Interactive Controls:**
  - "Allocate Young Objects" button: watch objects bump-allocate into `From-Space`.
  - "Trigger Scavenge (Minor GC)": animate live objects ping-ponging into `To-Space` with automatic compaction, and surviving objects tenuring into Old Space.
  - "Tri-Color Marking Sandbox": step through concurrent marking from GC Roots; paint nodes White, Grey, and Black.
  - "Trigger Write Barrier Violation": mutate a Black object to point to a White object mid-cycle and watch the Write Barrier intervene to dye the child Grey.
  - "Detached DOM Tree Simulator": sever a parent DOM node from the document root while retaining an inner child reference in a JS closure; inspect the retained memory weight preventing Blink deallocation.

### Lab 10: Modern JSX Compiler & React Element Inspector
- **Reference:** [`03-jsx-compilation.md`](notes/phase-03-react-foundations/03-jsx-compilation.md)
- **Concept:** Live side-by-side AST desugaring from JSX to modern `_jsx` calls and inspecting the raw V8 heap React Element object.
- **Interactive Controls:**
  - Live JSX Editor: Type any JSX snippet and see real-time compiler output: `_jsx` vs `_jsxs` vs classic `React.createElement`.
  - Heap Object Inspector: View live properties: `type`, `props`, `key` (separated as 3rd arg), and `$$typeof: Symbol.for('react.element')`.
  - Stored XSS Simulation: Attempt to inject an attacker JSON object and watch React's reconciler reject it because the Symbol wax seal is missing!
  - Expression Matrix Sandbox: Toggle expressions (`{false}`, `{null}`, `{undefined}`, `{"text"}`, `{0}`) to watch the classic `0` rendering bug in real time.

### Lab 11: Component Purity & StrictMode Stress-Tester
- **Reference:** [`04-component-model-pure-functions.md`](notes/phase-03-react-foundations/04-component-model-pure-functions.md)
- **Concept:** Visualizing why React StrictMode double-invokes components in development and how in-place mutations corrupt parent state.
- **Interactive Controls:**
  - Mutation Strategy Toggle:
    - ❌ Impure In-Place: `transactions.sort()` (mutates shared V8 memory reference).
    - ✅ Pure ES2023: `transactions.toSorted()` (allocates fresh shallow copy).
  - StrictMode Simulator Toggle: Turn `<React.StrictMode>` ON/OFF and watch duplicate rendering or silent state desynchronization.
  - Frame Snapshot Explorer: Inspect `const [count] = useState()` showing that state is immutable for the duration of a single render frame.

### Lab 12: The 3-Phase Render Cycle Stepper: Trigger -> Render -> Commit
- **Reference:** `notes/phase-03-react-foundations/05-render-cycle.md`
- **Concept:** Visualizing the complete pipeline: State Trigger → Render Phase (Fiber diffing in workInProgress) → Commit Phase (DOM mutations + Layout/Passive Effects).
- **Interactive Controls:**
  - "Step Forward" button to pause mid-render before DOM commit.
  - Visual distinction between interruptible Virtual DOM reconciliation and synchronous physical DOM mutation.
  - Telemetry console showing exact execution microsecond timestamps for `render()`, `useLayoutEffect`, and `useEffect`.

---

## 5. Portal Development Roadmap (Phased Execution)

The portal development is executed incrementally in parallel with our handbook chapters to maintain steady momentum:

| Phase | Scope & Deliverables | Status |
| :--- | :--- | :--- |
| **Phase P1: Core Scaffolding & Manifest Pipeline** | - Scaffolding `apps/portal` (Vite + React 19 + TypeScript).<br>- Automated manifest script (`scripts/generate-manifest.mjs`) indexing `notes/`.<br>- Global dark-mode design system with Vanilla CSS tokens & JetBrains typography. | [x] **Complete** |
| **Phase P2: Dashboard & Topic Reader** | - Dynamic Dashboard with phase progress bars, search, and quick resume.<br>- Topic Reader powered by `marked` + `prismjs` + `dompurify`.<br>- "Architect Bridge Mode" toggle for Angular & .NET side-by-side comparisons. | [x] **Complete** |
| **Phase P2.5: Navigation, History & Knowledge Graph** | - `FEAT-NAV-01`: Interactive Breadcrumb Trail (`Dashboard > Phase XX > Chapter`).<br>- `FEAT-NAV-02`: Topic Navigation History Stack with `← Back to [Previous Topic]` button & browser history sync.<br>- `FEAT-NAV-03`: Sequential Previous / Next Topic bottom cards.<br>- `FEAT-NAV-04`: Cross-article link interception & section anchor jumping. | [x] **Complete** |
| **Phase P3: First React Simulation Labs** | - Lab 10: JSX Compiler & `$$typeof` Security Barrier Inspector.<br>- Lab 11: Component Purity & StrictMode Stress-Tester.<br>- Lab 12: Render Cycle Stepper (Trigger -> Render -> Commit). | [x] **Complete** |
| **Phase P4: Render Internals, Fiber & System Design Labs** | - Lab 04: Event Loop & Microtasks Simulator.<br>- Lab 14: Fiber Linked-List Work Loop & Key Diffing Algorithm Visualizer.<br>- Lab 19: RSC Flight Wire Format Stream Parser.<br>- Lab 09: Clean Architecture & Strangler Fig.<br>- Lab 10: Testing Trophy & MSW Interceptor.<br>- Lab 11: Real-Time CRDT Canvas & HFT Terminal. | [x] **Complete** |
| **Phase P5: Learning Engine, Flashcards, Quizzes & CI/CD** | - Flashcards Arena (`FEAT-LEARN-01`) drilling Layer 3 Memory Anchors.<br>- Staff Scenario Quizzes (`FEAT-LEARN-02`) with trade-off dilemmas & Staff critiques.<br>- Global Instant Search (`FEAT-LEARN-03`) with `Ctrl+K` across all 110 topics.<br>- Automated GitHub Actions CI/CD deployment (`deploy.yml`) (`FEAT-LEARN-04`). | [x] **Complete** |

*Local Dev Server:* Active at `http://localhost:5173/`

---

## 6. Next Immediate Steps
1. **Socratic Mentorship & Chapter Deep-Dives:** Conduct guided chapter reviews, discuss edge cases, and solve architectural code puzzles.
2. **Staff Architect Mock Interviews:** Simulate technical interview rounds covering System Design at scale, React rendering internals, framework defense (Angular vs React vs Next.js), and clean architecture governance.


