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
- **Current Active Topic:** **Phase 03: React Foundations → Topic 06: Props vs. State Immutability & Structural Sharing**
- **Discussion Cadence:** Layered 5-Level First-Principles & Interview Drills
- **Next Interactive Simulation Lab:** Lab 12: The 3-Phase Render Cycle Stepper (`RenderCycleLab.tsx`)

### B. Curriculum Publication Summary (Handbook Availability)
```text
[Phase 01: JS Runtime Foundations]               [==========] 100% (9/9 Core Chapters Published) 🚀 Mastered!
[Phase 02: Browser Platform & Web APIs]           [----------]   0% (0/10 Chapters Planned)
[Phase 03: React Foundations & Core Mechanics]    [==========] 100% (11/11 Core Chapters Published) 🚀 Mastered!
[Phase 04: React Rendering Internals & Fiber]     [==========] 100% (10/10 Core Chapters Published) 🚀 Mastered!
[Phase 05: Advanced State & Data Architecture]    [==========] 100% (10/10 Chapters Published) 🚀 Mastered!
[Phase 06: Next.js & Full-Stack React]            [----------]   0% (0/10 Chapters Planned)
[Phase 07: Enterprise Security, Auth & Identity]  [----------]   0% (0/8 Chapters Planned)
[Phase 08: Performance Engineering & Web Vitals]  [----------]   0% (0/8 Chapters Planned)
[Phase 09: Clean Architecture, Monorepos & MFEs]  [----------]   0% (0/8 Chapters Planned)
[Phase 10: Modern Testing Strategy & QA]          [----------]   0% (0/8 Chapters Planned)
[Phase 11: Frontend System Design at Scale]       [----------]   0% (0/8 Chapters Planned)
[Phase 12: Angular -> React Enterprise Synthesis] [=---------]  11% (1/9 Capstone Chapters Published)
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

### Phase 02: Browser Platform & Web APIs (Dedicated Platform Engine) — 0% Published
- [ ] **01: Browser Architecture & Multi-Process Model** (Browser, Renderer, GPU, Network processes, IPC, Site Isolation)
- [ ] **02: DOM & CSSOM Tree Construction** (HTML/CSS Tokenization, Speculative Parsing, C++ Blink DOM Node allocation)
- [ ] **03: The Critical Rendering Path** (Style Recalculation, Layout / Reflow, Paint, Compositing & GPU Layers)
- [ ] **04: Layout Thrashing & Forced Synchronous Reflow** (Batching DOM reads/writes, `requestAnimationFrame`, FastDOM patterns)
- [ ] **05: Browser Event Architecture & Event Propagation** (Bubbling, Capturing, `composedPath`, Passive event listeners)
- [ ] **06: Event Delegation & Memory Optimization** (Ancestor event dispatch, why React 17/18 moved listeners from `document` to root)
- [ ] **07: Browser Networking & Network Stack** (HTTP/1.1 vs HTTP/2 multiplexing, HTTP/3 QUIC, TCP Handshakes, Fetch Streams)
- [ ] **08: Same-Origin Policy, CORS & Security Headers** (Preflight OPTIONS, CORS headers, Content Security Policy / CSP)
- [ ] **09: Browser Storage Architecture** (Cookie Jars & SameSite, Quotas, IndexedDB transactional engine, OPFS)
- [ ] **10: Service Workers, PWA & Background Synchronization** (Service Worker lifecycle, Cache Storage API, Background Sync, Push)

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

### Phase 06: Next.js & Full-Stack React Architecture
- [ ] **01: Next.js App Router Architecture & Server-First Mental Model**
- [ ] **02: React Server Components (RSC) Wire Format & Payload Streaming**
- [ ] **03: Server Actions & Form Mutations**
- [ ] **04: Static Site Generation (SSG) vs Incremental Static Regeneration (ISR)**
- [ ] **05: Middleware & Edge Runtime Mechanics**
- [ ] **06: Authentication & Session Management in Full-Stack Next.js**
- [ ] **07: Route Handlers & REST/GraphQL API Design**
- [ ] **08: Caching Architecture (Request Memoization, Data Cache, Full Route Cache)**
- [ ] **09: Dynamic Imports, Bundling & Code Splitting Optimization**
- [ ] **10: Enterprise Next.js Deployment & Observability (Docker, Vercel, Azure)**

---

### Phase 07: Enterprise Security, Authentication & Identity — 0% Published
- [ ] **01: Enterprise Authentication & Identity Landscape** (OAuth 2.0, OpenID Connect / OIDC protocols, identity providers)
- [ ] **02: The PKCE Flow in Modern SPAs & Next.js** (Proof Key for Code Exchange, authorization code exchange, state parameters)
- [ ] **03: Microsoft Entra ID (Azure AD) Enterprise Integration** (MSAL.js, tenant authority, app registrations, silent token acquisition)
- [ ] **04: JWT Storage Architecture & Security Vectors** (HttpOnly cookies vs in-memory closures, XSS mitigation, CSRF double-submit cookies)
- [ ] **05: Session Management & Refresh Token Rotation** (Sliding sessions, silent renewal, refresh token family revocation)
- [ ] **06: Role-Based Access Control (RBAC) & Route Protection** (Permission matrix, claim verification, client & edge middleware guards)
- [ ] **07: Content Security Policy (CSP) & Nonce Generation** (CSP level 3 directives, script nonces in Next.js, anti-tamper security)
- [ ] **08: OWASP Top 10 for Frontend Applications** (XSS DOM sanitization, clickjacking frameguards, CORS preflight defense)

---

### Phase 08: Performance Engineering, Web Vitals & Production Profiling — 0% Published
- [ ] **01: Core Web Vitals Deep Dive** (INP Interaction to Next Paint, LCP Largest Contentful Paint, CLS, TTFB thresholds)
- [ ] **02: Chrome DevTools Performance Profiling** (Flamecharts, Long Tasks >50ms, main thread blocking, CPU throttling)
- [ ] **03: Memory Leak Diagnosis & V8 Heap Snapshots** (Detached DOM trees, retainer graphs, Ephemeron tracking, leak reproduction)
- [ ] **04: Long Task Optimization & Main Thread Yielding** (`scheduler.yield()`, message passing, time slicing long loops)
- [ ] **05: Advanced Bundle Optimization & Tree-Shaking** (Rollup/Webpack AST tree-shaking, sideEffects flags, bundle analyzer audits)
- [ ] **06: Image, Asset & Font Optimization Pipelines** (AVIF/WebP formats, responsive picture sets, font subsetting, layout shift prevention)
- [ ] **07: List & Table Virtualization at 60 FPS** (`@tanstack/react-virtual`, DOM node recycled windows, overscan buffers)
- [ ] **08: Real-User Monitoring (RUM) & Performance Observability** (PerformanceObserver API, web-vitals telemetry beacons, Datadog/Sentry)

---

### Phase 09: Enterprise Clean Architecture, Monorepos & Micro-Frontends — 0% Published
- [ ] **01: Domain-Driven Design (DDD) in Frontend** (Bounded contexts, entities, value objects, domain services, anti-corruption layers)
- [ ] **02: Monorepo Architecture: Nx vs Turborepo** (Task execution pipelines, computation caching, dependency graphs, affected pruning)
- [ ] **03: Shared Libraries & Enterprise Package Governance** (Publishable vs internal libs, semantic versioning, tsconfig path aliases)
- [ ] **04: Micro-Frontends & Module Federation** (Webpack 5 / Rspack Module Federation, remote containers, shared runtime dependencies)
- [ ] **05: Design System Architecture & Component Libraries** (Headless UI tokens, Radix UI primitives, design tokens with Style Dictionary)
- [ ] **06: Feature-Sliced Design (FSD) Architectural Standard** (App, processes, pages, widgets, features, entities, shared layers)
- [ ] **07: Scalable State & Service Scaffolding** (Multi-team state governance, service abstraction layers, clean dependency injection)
- [ ] **08: Case Study: Refactoring Monolithic SPAs to Modular Clean Architecture**

---

### Phase 10: Modern Testing Strategy & Quality Assurance — 0% Published
- [ ] **01: The Modern Frontend Testing Pyramid** (Unit vs Integration vs Component vs E2E cost/confidence distribution)
- [ ] **02: Vitest & Jest Runner Architecture** (Vite-native execution, JSDOM vs Happy-DOM environments, snapshot assertions)
- [ ] **03: React Testing Library (RTL) Philosophy** (Testing user behavior over implementation details, `getByRole` accessibility queries)
- [ ] **04: Mock Service Worker (MSW) Network Mocking** (Service Worker request interception, declarative REST/GraphQL handlers)
- [ ] **05: Testing Asynchronous React Hooks & Stores** (`renderHook`, act() mechanics, testing Zustand & RTK stores in isolation)
- [ ] **06: Integration Testing Complex Workflows** (Multi-step forms, optimistic mutations, error boundaries, router integration)
- [ ] **07: Playwright End-to-End (E2E) Testing Architecture** (Browser contexts, storage state auth reuse, parallel test shards)
- [ ] **08: Visual Regression Testing & CI Quality Gates** (Pixel-diffing with Playwright, PR automated verification workflows)

---

### Phase 11: Frontend System Design at Scale — 0% Published
- [ ] **01: The Frontend System Design Interview Framework** (Requirements triage, data modeling, architecture, performance, resilience)
- [ ] **02: System Design: Real-Time Collaborative Canvas** (Figma-style CRDT conflict resolution, WebSocket streaming, spatial indexing)
- [ ] **03: System Design: High-Frequency Trading & Telemetry Terminal** (1,000 msgs/sec, virtualized data grids, memory footprint control)
- [ ] **04: System Design: Multi-Tenant Enterprise SaaS Dashboard** (Dynamic white-labeling, RBAC entitlement engines, schema-driven widgets)
- [ ] **05: System Design: Global Streaming Media Player** (Adaptive bitrate HLS/DASH, offline buffering, telemetry beaconing)
- [ ] **06: System Design: Backend-For-Frontend (BFF) vs API Gateway** (Node/Next BFF vs ASP.NET Core YARP, data aggregation, caching)
- [ ] **07: System Design: Resilient Offline-First Mobile Field Worker App** (IndexedDB durability, FIFO outbox, conflict reconciliation)
- [ ] **08: System Design: Global CDN Edge Compute & Caching Strategy** (Cloudflare Workers, Edge middleware, cache-control directives)

---

### Phase 12: Angular to React Enterprise Synthesis (Senior / Staff Capstone) — 11% Published
- [x] **00: Angular vs. React Mental Model** ([00-angular-vs-react-mental-model.md](notes/phase-12-angular-to-react-enterprise-synthesis/00-angular-vs-react-mental-model.md))
  *Core concepts:* Two-way binding vs one-way data flow, OOP/DI vs Functional Composition, Zone.js vs React Schedulers.
- [ ] **01: Angular to React Architectural Mapping Guide**
- [ ] **02: Angular Change Detection (Zone.js/Signals) vs React Reconciliation (Fiber)**
- [ ] **03: RxJS Reactive Streams vs React Hooks & State Primitives**
- [ ] **04: Angular Hierarchical Dependency Injection vs React Composition & Context**
- [ ] **05: NgRx Store Architecture vs Redux Toolkit & Zustand**
- [ ] **06: Angular Route Guards & Interceptors vs React Routers & Middleware**
- [ ] **07: Angular Signals (Fine-Grained) vs React State & React Compiler**
- [ ] **08: Enterprise Clean Architecture: Scalable Angular vs Scalable React Applications**

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

### Lab 04: The 4-Lane Event Loop & 60 FPS Frame Budget Simulator
- **Reference:** [`04-event-loop.md`](notes/phase-01-javascript-runtime-foundations/04-event-loop.md)
- **Concept:** Real-time visual simulator of the browser Event Loop and rendering pipeline.
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
| **Phase P4: Render Internals & Fiber Labs** | - Lab 04: Event Loop & Microtasks Simulator.<br>- Lab 13: Reconciliation & Diffing Algorithm Visualizer.<br>- Lab 14: Fiber Linked-List Work Loop Explorer. | 🚀 *In Progress* |
| **Phase P5: Flashcards & GitHub Pages Deployment** | - Memory Anchors Hub ("Museum Rule", "Wax Signet", "Photocopier Rule").<br>- Lead & Architect interview drill cards.<br>- Automated GitHub Pages build script (`npm run build:pages`). | 📋 *Queued* |

*Local Dev Server:* Active at `http://localhost:5174/`

---

## 6. Next Immediate Steps
1. **Advance Phase 05 Handbook Curriculum:** Deep-dive and generate Topic 02: `notes/phase-05-advanced-state-architecture/02-redux-toolkit-rtk-vs-ngrx.md` (Redux Toolkit vs Angular NgRx Architecture) with full 20 sections, quarantined comparative architecture, and embedded Mermaid diagrams.
2. **Continue Phase 05 Topics 03 through 10:** Zustand, TanStack Query, Cache Invalidation, Selector Memoization, URL state, WebSockets, XState, and Offline-First state.


