# Product Backlog: React & Runtime Architecture Learning Platform

> **Repository:** `react-interview-prep`  
> **Active Subsystems:** Study Notes (`notes/`), Interactive Portal (`apps/portal`), Mentorship Track  
> **Architecture Decision Records:** [`docs/adr/`](../../adr/README.md)  
> **Sprint Execution Plan:** [`docs/sdlc/sprint-plan.md`](../sprint-plan.md)  
> **Curriculum Progress:** [`PROGRESS.md`](../../../PROGRESS.md)

---

## 1. Active Sprint Backlog (Sprint 3: Portal UI/UX Modernization & Critical Fixes)

### Item UI-01: Right Panel Table of Contents Navigation & Sticky ScrollSpy
- **User Problem:**
  - The right panel navigation is not working when clicking on section headings.
  - The right panel should stay fixed/sticky in the viewport and not scroll out of view with the page, so the reader can easily navigate across different sections at any time.
- **Root Cause:**
  1. Build-time heading slugification in `scripts/generate-manifest.mjs` differed from runtime slugification in `marked.use({ renderer: { heading } })` in `TopicReader.tsx`, causing `document.getElementById(anchor)` lookups to fail on headings with numbers or punctuation.
  2. Sticky CSS positioning on the right container was compromised by viewport overflow constraints and lacked independent scrolling (`max-height: calc(100vh - 100px); overflow-y: auto`).
- **Acceptance Criteria:**
  - [x] Clicking any heading in the right panel smoothly scrolls the document to that section with an 80px offset for the fixed navbar.
  - [x] Right sidebar remains sticky in the viewport as the main content is scrolled.
  - [x] If the TOC list exceeds viewport height, the TOC container scrolls independently.
  - [x] Active section is highlighted in real-time as the user scrolls (ScrollSpy).

---

### Item UI-02: Responsive Diagram Sizing & Aspect-Ratio Clamping
- **User Problem:**
  - The diagrams (Mermaid boxes and runtime schematics) are vertically stretched, causing an excessively long page scroll and preventing a single-screen view of the diagram.
- **Root Cause:**
  - Rendered Mermaid SVG elements inside flex/grid containers default to `align-items: stretch` without a max-height bounding box.
- **Acceptance Criteria:**
  - [x] Mermaid diagrams rendered with `.mermaid-wrapper` with `max-height: 520px; width: 100%; object-fit: contain`.
  - [x] SVG aspect-ratios preserved across both light and dark themes.
  - [x] Code block ASCII diagrams rendered with uniform monospace font sizing (`0.85rem`) and fixed line-height to eliminate vertical distortion.

---

### Item UI-03: Sidebar Title Consistency & Badge Numbering
- **User Problem:**
  - In the left sidebar panel, titles are inconsistent: some show `Phase-Chapter`, others show pure numerical digits, and the last section shows `Phase - XX`.
- **Root Cause:**
  - Sidebar title parsing regex in `App.tsx` only handled one specific naming pattern (`^Chapter (\d+):`). Notes authored with different markdown titles fell back to raw file strings or bullets.
- **Acceptance Criteria:**
  - [x] Uniform badge format across all phases: `[01]`, `[02]`, `[AC]` (Architectural Companion).
  - [x] Stripped redundant `Phase XX - Chapter YY:` prefixes from display titles in the sidebar.
  - [x] Sidebar maintains clean progress counters (`X / Y` completed).

---

### Item UI-04: Typographic Polish & Constrained Prose Reading Experience
- **User Request:**
  - Spacing improvements in guide walkthrough (currently feels congested).
  - Modern fonts.
  - Improve the guide reading experience by fitting the reading view in a better way (currently rendered across excessive horizontal width).
- **Architecture Reference:** [`docs/adr/ADR-002`](../../adr/ADR-002-portal-ux-typographic-reading-system.md)
- **Acceptance Criteria:**
  - [x] Constrain prose reading container to `max-width: 780px; margin: 0 auto;` (optimal 65–75 characters per line).
  - [x] Modern typography stack: Plus Jakarta Sans for UI/body, JetBrains Mono for code.
  - [x] Standardize line-height to `1.7` with balanced paragraph, list, and heading spacing.
  - [x] Clean glassmorphic callouts for alerts (NOTE, TIP, IMPORTANT, WARNING).

---

### Item UI-05: Modern UI/UX Polish, Micro-Animations & Interactivity
- **User Request:**
  - Modernize overall UI/UX.
  - Add subtle animations and hover effects to make learning engaging and fun.
- **Acceptance Criteria:**
  - [x] Smooth chapter fade-and-slide entrance transitions.
  - [x] Card hover lift and subtle border glow effects on Dashboard roadmap cards.
  - [x] "Back to Top" floating quick action button in reading view.
  - [x] "Architect Bridge" toggle with vibrant emerald/indigo accent indicators for Sections 10 and 11.

---

### Item UI-06: URL Routing Synchronization on Dashboard Navigation & Refresh
- **User Problem:**
  - When moving to Dashboard from any guide page (e.g., `http://localhost:5173/?topic=00-react-application-lifecycle-architecture#17-senior-level-mental-model-how-to-remember-this-forever-layer-3`), the browser URL remained pinned with the active topic query parameter and section hash.
  - Hitting browser refresh (F5) while viewing the Dashboard re-parsed the stale query parameters, erroneously kicking the reader back into the guide page instead of staying on Dashboard.
- **Root Cause:**
  1. Top navbar Brand logo click (`div`) and Dashboard switcher button (`button`) invoked `setActiveView('dashboard')` directly without pushing history state or clearing `window.location.search` and `window.location.hash`.
  2. `handleNavigateHome()` previously called `searchParams.delete('topic')` on the current URL, which preserved active section hashes (`#17-...`).
  3. Lack of unified bidirectional routing between `view` parameters (`dashboard`, `reader`, `labs`), causing page refresh to lose state context.
- **Acceptance Criteria:**
  - [x] Clicking Brand logo, Dashboard tab, or breadcrumb "Home" replaces the browser URL with a clean base path (clearing query parameters and section hashes).
  - [x] Refreshing the browser while on Dashboard preserves the Dashboard view.
  - [x] Switching between Handbook, Dashboard, and Labs synchronizes the browser address bar bi-directionally.
  - [x] Browser Back and Forward buttons (`popstate`) accurately transition between topics and dashboard.

---

## 2. Curriculum Publication Backlog (Epics 4, 5, 6)

### Epic 4: Phase 05 Completion (Advanced State & Data Architecture)
*Location:* `notes/phase-05-advanced-state-architecture/` | *Format:* 20-Section Standard
- [x] Topic 01: State Modeling & Normalization (`01-state-modeling-normalization.md`)
- [x] Topic 02: Redux Toolkit vs. Angular NgRx (`02-redux-toolkit-rtk-vs-ngrx.md`)
- [x] Topic 03: Zustand & Atomic State Management (`03-zustand-atomic-state.md`)
- [x] Topic 04: Server State & TanStack Query (React Query) Architecture (`04-tanstack-query-server-state.md`)
- [x] Topic 05: Cache Invalidation, Garbage Collection & Optimistic UI Updates (`05-cache-invalidation-optimistic-ui.md`)
- [x] Topic 06: Reselect, Memoization & Selector Performance (`06-reselect-memoization-performance.md`)
- [x] Topic 07: URL State Management & Deep Linking Patterns (`07-url-state-management.md`)
- [x] Topic 08: Real-Time State (WebSockets, SSE) & React Synchronization (`08-realtime-websockets-sync.md`)
- [x] Topic 09: State Machines with XState in Complex UI Workflows (`09-state-machines-xstate.md`)
- [x] Topic 10: Enterprise Offline-First & Persistent State Strategies (`10-offline-first-persistence.md`)

---

### Epic 5: Phase 06 Full Publication (Next.js & Full-Stack React Architecture) — Complete (11/11)
*Location:* `notes/phase-06-nextjs-fullstack-react/` | *Format:* 20-Section Standard
- [x] Topic 00: Architectural Companion: Next.js Full-Stack Directory, Syntax & Primitives Rosetta Stone (`00-nextjs-syntax-conventions-architecture.md`)
- [x] Topic 01: Next.js App Router Architecture & Server-First Mental Model (`01-nextjs-app-router-architecture.md`)
- [x] Topic 02: React Server Components (RSC) Wire Format & Payload Streaming (`02-rsc-wire-format-streaming.md`)
- [x] Topic 03: Server Actions & Form Mutations (`03-server-actions-form-mutations.md`)
- [x] Topic 04: Static Site Generation (SSG) vs Incremental Static Regeneration (ISR) (`04-ssg-vs-isr.md`)
- [x] Topic 05: Middleware & Edge Runtime Mechanics (`05-middleware-edge-runtime.md`)
- [x] Topic 06: Authentication & Session Management in Full-Stack Next.js (`06-authentication-session-management.md`)
- [x] Topic 07: Route Handlers & REST/GraphQL API Design (`07-route-handlers-api-design.md`)
- [x] Topic 08: Caching Architecture (Request Memoization, Data Cache, Full Route Cache) (`08-caching-architecture.md`)
- [x] Topic 09: Dynamic Imports, Bundling & Code Splitting Optimization (`09-dynamic-imports-bundling-optimization.md`)
- [x] Topic 10: Enterprise Next.js Deployment & Observability (Docker, Vercel, Azure) (`10-enterprise-deployment-observability.md`)

---

### Epic 6: Phase 02 Dedicated Browser Platform Engine — Complete (10/10)
*Location:* `notes/phase-02-browser-platform-web-apis/` | *Format:* 20-Section Standard
- [x] Topic 01: Browser Architecture & Multi-Process Model (`01-browser-architecture-multi-process.md`)
- [x] Topic 02: DOM & CSSOM Tree Construction (`02-dom-cssom-tree-construction.md`)
- [x] Topic 03: The Critical Rendering Path (`03-critical-rendering-path.md`)
- [x] Topic 04: Layout Thrashing & Forced Synchronous Reflow (`04-layout-thrashing-reflow.md`)
- [x] Topic 05: Browser Event Architecture & Event Propagation (`05-browser-event-architecture.md`)
- [x] Topic 06: Event Delegation & Memory Optimization (`06-event-delegation-memory-optimization.md`)
- [x] Topic 07: Browser Networking & Network Stack (`07-browser-networking-stack.md`)
- [x] Topic 08: Same-Origin Policy, CORS & Security Headers (`08-cors-csp-security-headers.md`)
- [x] Topic 09: Browser Storage Architecture (`09-browser-storage-architecture.md`)
- [x] Topic 10: Service Workers, PWA & Background Synchronization (`10-service-workers-pwa-offline.md`)

---

### Epic 7: Phase 07 Enterprise Security, Auth & Identity — Complete (8/8)
*Location:* `notes/phase-07-enterprise-security-auth-identity/` | *Format:* 20-Section Standard
- [x] Topic 01: Enterprise Authentication & Identity Landscape (`01-enterprise-authentication-identity-landscape.md`)
- [x] Topic 02: The PKCE Flow in Modern SPAs & Next.js (`02-pkce-flow-spa-nextjs.md`)
- [x] Topic 03: Microsoft Entra ID (Azure AD) Enterprise Integration (`03-entra-id-azure-ad-integration.md`)
- [x] Topic 04: JWT Storage Architecture & Security Vectors (`04-jwt-storage-security-vectors.md`)
- [x] Topic 05: Session Management & Refresh Token Rotation (`05-session-management-refresh-token-rotation.md`)
- [x] Topic 06: Role-Based Access Control (RBAC) & Route Protection (`06-rbac-route-protection.md`)
- [x] Topic 07: Content Security Policy (CSP) & Nonce Generation (`07-csp-nonce-generation.md`)
- [x] Topic 08: OWASP Top 10 for Frontend Applications (`08-owasp-top-10-frontend.md`)

---

### Epic 8: Phase 08 Performance Engineering, Web Vitals & Production Profiling — Complete (8/8)
*Location:* `notes/phase-08-performance-engineering-web-vitals/` | *Format:* 20-Section Standard
- [x] Topic 01: Core Web Vitals Deep Dive (`01-core-web-vitals-deep-dive.md`)
- [x] Topic 02: Chrome DevTools Performance Profiling (`02-chrome-devtools-performance-profiling.md`)
- [x] Topic 03: Memory Leak Diagnosis & V8 Heap Snapshots (`03-memory-leak-diagnosis-v8-heap-snapshots.md`)
- [x] Topic 04: Long Task Optimization & Main Thread Yielding (`04-long-task-optimization-main-thread-yielding.md`)
- [x] Topic 05: Advanced Bundle Optimization & Tree-Shaking (`05-advanced-bundle-optimization-tree-shaking.md`)
- [x] Topic 06: Image, Asset & Font Optimization Pipelines (`06-image-asset-font-optimization-pipelines.md`)
- [x] Topic 07: List & Table Virtualization at 60 FPS (`07-list-table-virtualization-60fps.md`)
- [x] Topic 08: Real-User Monitoring (RUM) & Performance Observability (`08-rum-performance-observability.md`)

---

### Epic 9: Phase 09 Clean Architecture, Monorepos & Micro-Frontends — Complete (8/8)
*Location:* `notes/phase-09-enterprise-architecture-monorepos/` | *Format:* 20-Section Standard
- [x] Topic 01: Domain-Driven Design (DDD) in Frontend (`01-domain-driven-design-frontend.md`)
- [x] Topic 02: Monorepo Architecture: Nx vs Turborepo (`02-monorepo-architecture-nx-turborepo.md`)
- [x] Topic 03: Shared Libraries & Enterprise Package Governance (`03-shared-libraries-package-governance.md`)
- [x] Topic 04: Micro-Frontends & Module Federation (`04-micro-frontends-module-federation.md`)
- [x] Topic 05: Design System Architecture & Component Libraries (`05-design-system-architecture-component-libraries.md`)
- [x] Topic 06: Feature-Sliced Design (FSD) Architectural Standard (`06-feature-sliced-design-architecture.md`)
- [x] Topic 07: Scalable State & Service Scaffolding (`07-scalable-state-service-scaffolding.md`)
- [x] Topic 08: Case Study: Refactoring Monolithic SPAs to Modular Clean Architecture (`08-refactoring-monolith-to-clean-architecture.md`)

---

### Epic 10: Phase 10 Modern Testing Strategy & Quality Assurance — Complete (8/8)
*Location:* `notes/phase-10-testing-strategy/` | *Format:* 20-Section Standard
- [x] Topic 01: The Modern Frontend Testing Pyramid & Testing Trophy (`01-modern-frontend-testing-pyramid.md`)
- [x] Topic 02: Vitest & Jest Runner Architecture (`02-vitest-jest-runner-architecture.md`)
- [x] Topic 03: React Testing Library Philosophy & User-Centric Testing (`03-react-testing-library-philosophy.md`)
- [x] Topic 04: Mock Service Worker (MSW v2) Network Mocking Architecture (`04-msw-mock-service-worker-architecture.md`)
- [x] Topic 05: Testing Asynchronous React Hooks & Stores (`05-testing-async-react-hooks-stores.md`)
- [x] Topic 06: Integration Testing Complex User Workflows (`06-integration-testing-complex-workflows.md`)
- [x] Topic 07: Playwright End-to-End (E2E) Testing Architecture (`07-playwright-e2e-testing-architecture.md`)
- [x] Topic 08: Visual Regression Testing & CI Quality Gates (`08-visual-regression-testing-ci-quality-gates.md`)

---

### Epic 11: Phase 11 Frontend System Design at Scale — Complete (8/8) ✅
*Location:* `notes/phase-11-frontend-system-design/` | *Format:* 20-Section Standard
- [x] Topic 01: The Frontend System Design Interview Framework (Requirements, Data Modeling, Resilience)
- [x] Topic 02: System Design: Real-Time Collaborative Canvas (Figma-Style CRDTs, WebSockets)
- [x] Topic 03: System Design: High-Frequency Trading & Telemetry Terminal (1,000 msgs/sec, Virtualization)
- [x] Topic 04: System Design: Multi-Tenant Enterprise SaaS Dashboard (Dynamic Theming, RBAC Entitlements)
- [x] Topic 05: System Design: Global Streaming Media Player (Adaptive HLS/DASH, Offline Buffering)
- [x] Topic 06: System Design: Backend-For-Frontend (BFF) vs API Gateway (Node/Next BFF vs ASP.NET YARP)
- [x] Topic 07: System Design: Resilient Offline-First Mobile Field Worker App (IndexedDB, FIFO Outbox)
- [x] Topic 08: System Design: Global CDN Edge Compute & Caching Strategy (Cloudflare Workers, Cache Headers)

---

### Epic 12: Phase 12 Angular to React Enterprise Synthesis (Capstone) — Complete (9/9) ✅
*Location:* `notes/phase-12-angular-to-react-enterprise-synthesis/` | *Format:* 20-Section Standard
- [x] Topic 00: Angular vs. React Mental Model (`00-angular-vs-react-mental-model.md`)
- [x] Topic 01: Angular to React Architectural Mapping Guide (`01-angular-to-react-architectural-mapping-guide.md`)
- [x] Topic 02: Angular Change Detection (Zone.js/Signals) vs React Reconciliation (Fiber) (`02-angular-change-detection-vs-react-reconciliation.md`)
- [x] Topic 03: RxJS Reactive Streams vs React Hooks & State Primitives (`03-rxjs-reactive-streams-vs-react-hooks.md`)
- [x] Topic 04: Angular Hierarchical Dependency Injection vs React Composition & Context (`04-angular-di-vs-react-composition-context.md`)
- [x] Topic 05: NgRx Store Architecture vs Redux Toolkit & Zustand (`05-ngrx-store-vs-redux-toolkit-zustand.md`)
- [x] Topic 06: Angular Route Guards & Interceptors vs React Routers & Middleware (`06-angular-route-guards-interceptors-vs-react.md`)
- [x] Topic 07: Angular Signals (Fine-Grained) vs React State & React Compiler (`07-angular-signals-vs-react-state-compiler.md`)
- [x] Topic 08: Enterprise Clean Architecture: Scalable Angular vs Scalable React Applications (`08-enterprise-clean-architecture-angular-vs-react.md`)

---

### Epic 13: Interactive Simulation Labs Expansion (Complete - v0.12.0) ✅
*Location:* `apps/portal/src/features/visualizers/`
- [x] Lab 04: The 4-Lane Event Loop & INP Latency Simulator (`topic-04-event-loop/EventLoopLab.tsx`)
- [x] Lab 14: React Fiber Work Loop & Key Diffing Visualizer (`topic-14-fiber/FiberReconciliationLab.tsx`)
- [x] Lab 19: RSC Flight Wire Format Stream Parser (`topic-19-rsc/RscFlightLab.tsx`)
- [x] Registered and tested in `VisualizerHub.tsx`, `generate-manifest.mjs`, and `test-manifest-integrity.mjs`

---

### Epic 14: Learning Engine & Assessment Hub (Complete - v0.13.0) ✅
*Location:* `apps/portal/src/features/`
- [x] `FEAT-LEARN-01`: Flashcards Arena with Layer 3 Memory Anchors (`flashcards/FlashcardsArena.tsx`)
- [x] `FEAT-LEARN-02`: Staff Architect Scenario Quizzes & Code Puzzles (`quizzes/QuizArena.tsx`)
- [x] `FEAT-LEARN-03`: Global Instant Full-Text Search Modal with `Ctrl+K` (`search/GlobalSearchModal.tsx`)
- [x] App header view switcher tabs and URL parameter sync (`?view=flashcards`, `?view=quizzes`)

---

### Epic 15: CI/CD Automation & GitHub Pages Deployment (Complete - v0.14.0) ✅
*Location:* `.github/workflows/deploy.yml`
- [x] `FEAT-LEARN-04`: Automated GitHub Actions workflow testing manifest, integrity, TypeScript compiler, and Vite build
- [x] Static build packaging and GitHub Pages automated deployment artifact pipeline
- [x] Universal asset path configuration (`base: './'`) in `vite.config.ts`

---

### Epic 16: Portal Wayfinding, Deep Search & Handbook Generalization (Sprint 16 - v0.15.0) 📋
*Location:* `apps/portal/` & `notes/` | *Primary Skill:* `portal-developer` / Architecture Refactor
- [x] `FEAT-DASH-01`: Dynamic "Continue Learning" & Live Labs Metrics on Dashboard
  - *User Problem:* The Dashboard currently hardcodes "Active Mentorship Focus" to `Phase 03: Topic 06` and "Interactive Labs Active" to `2 Live`, which is static, outdated, and does not reflect actual progress or the 9 living arena labs.
  - *Acceptance Criteria:*
    - Dynamically load the user's last-read topic from `localStorage` (`last_read_topic_id`) and render a 1-click "Resume Reading: [Topic Title]" button.
    - Fall back to the next uncompleted topic if no history exists.
    - Dynamically calculate and display the active labs count (9 Full Arena Labs Live) with direct navigation to the Labs Arena.
    - Update hero badge to "Senior Backend & Enterprise Engineer → Senior / Staff React Architect".
- [x] `FEAT-SEARCH-01`: Deep Section Heading & Architectural Keyword Indexing
  - *User Problem:* Search modal currently only filters chapter titles, missing internal headings, runtime concepts, and vocabulary terms (e.g. searching for `scheduler.yield`, `Fiber workLoopSync`, `WriteBarrier`, `Flight wire format`, or `WeakMap ephemeron` returns zero results).
  - *Acceptance Criteria:*
    - `generate-manifest.mjs` extracts all section headings (`##` and `###`) with anchor slugs and extracts Section 18 / Section 2 vocabulary keywords.
    - `GlobalSearchModal.tsx` supports multi-tier search results: Chapters (110), Deep Sections (2,200+), and Key Concepts.
    - Selecting a section result jumps directly to that specific anchor (`?topic=XX#heading-slug`) with smooth scrolling.
- [x] `FEAT-NAV-05`: Cross-Topic Contextual Quick Peek Drawer & Return Teleport
  - *User Problem:* When reading a chapter that refers to another topic (e.g., React 18 batching referring to Event Loop microtasks), clicking a link abruptly leaves the page, causing the reader to lose their scroll position and focus.
  - *Acceptance Criteria:*
    - Clicking an inter-topic reference opens a slide-over "Quick Peek Drawer" showing the target section/definition without unloading the active article.
    - If full navigation is chosen, display a persistent floating "← Return to [Previous Topic: Section]" pill to teleport back to the exact prior scroll position.
- [x] `REFACTOR-EXP-01`: Handbook Generalization for Senior Backend / Enterprise Engineers
  - *User Problem:* Handbooks and documentation specifically cite "11+ years of experience in .NET", which is overly specific and personal rather than a publication-grade resource for senior backend and enterprise engineers transitioning to React.
  - *Acceptance Criteria:*
    - Standardize references across Phase 01 notes (`04-event-loop.md`, `05-promises-async-await.md`, `06-objects-prototypes-this.md`, `07-functional-javascript.md`, `08-modern-es6-plus.md`) to "Senior Backend & Enterprise Engineers (C#/.NET, Java, Go, Distributed Systems)".
    - Update `README.md`, `AGENTS.md`, and `PROGRESS.md` to consistently frame the audience as "Senior Backend / Full-Stack Enterprise Engineers".

---

### Epic 17: Advanced Simulation Labs & In-Browser Playground (Sprint 17 - v0.16.0) 📋
*Location:* `apps/portal/src/features/` | *Primary Skill:* `portal-developer`
- [x] `FEAT-LAB-20`: Memory Leak & Retainer Graph Visualizer (`features/visualizers/topic-09-memory/MemoryRetainerLab.tsx`)
  - *Acceptance Criteria:* Interactive graph showing GC roots, retainers, and memory weights (Detached DOM vs Scavenged).
- [x] `FEAT-LAB-21`: TanStack Query Cache Lifecycle Simulator (`features/visualizers/topic-04-state/QueryCacheLab.tsx`)
  - *Acceptance Criteria:* Visual timeline of cache states (`fresh`, `stale`, `fetching`, `inactive`, `gc`) with optimistic rollback triggers.
- [x] `FEAT-LAB-22`: Virtualization & Viewport Culling Visualizer (`features/visualizers/topic-08-performance/VirtualizationLab.tsx`)
  - *Acceptance Criteria:* Dual-view simulator showing virtual viewport vs recycled DOM node pool at 60 FPS.
- [x] `FEAT-LEARN-05`: Spaced Repetition Engine (Flashcard Retention)
  - *Acceptance Criteria:* SuperMemo SM-2 algorithm integrated into `FlashcardsArena.tsx` with IndexedDB persistence.
- [x] `FEAT-LEARN-06`: In-Browser Interactive TSX Sandbox (Code Playground)
  - *Acceptance Criteria:* Lightweight live editor/runner embedded within portal to test React 19 primitives with instant hot preview.

---

### Epic 17: Staff-Level Frontend Machine Coding Challenges (Sprint 17 - v0.16.0) 📋
*Location:* `notes/challenges/` & `apps/portal/src/challenges/` | *Primary Skill:* Mentorship / Hands-On Machine Coding
- [x] `CHALLENGE-01`: Dynamic-Height Virtualized Windowing Engine (`useDynamicVirtualizer.ts` & `VirtualizerChallengeArena.tsx`) from Scratch
  - *Problem Statement:* Implement a high-performance virtual list from first principles supporting dynamic row heights, binary search offset indexing, and scroll thrashing prevention without external libraries.
  - *Acceptance Criteria:*
    - Dynamic measurement via ResizeObserver with cached height lookups.
    - Binary search for initial visible index calculation in O(log N).
    - Zero-layout-thrashing scroll performance maintaining 60 FPS across 100,000 items.
- [x] `CHALLENGE-02`: Concurrent Reactive State Store & Cache via `useSyncExternalStore`
  - *Problem Statement:* Implement an atomic reactive store supporting selectors, structural sharing, batching, and concurrent React 18/19 rendering without tearing.
  - *Acceptance Criteria:*
    - Store interface: `createStore(initialState)`, `subscribe`, `getState`, `setState`.
    - Custom React hook `useStore(selector, equalityFn)` utilizing `useSyncExternalStore`.
    - Verification that high-frequency updates never cause tearing in concurrent transitions.
- [x] `CHALLENGE-03`: Resilient Optimistic Mutation Queue & Offline Outbox
  - *Problem Statement:* Build an enterprise-grade offline mutation manager with FIFO queueing, retry with exponential backoff and jitter, and optimistic rollback.
  - *Acceptance Criteria:*
    - IndexedDB storage for offline mutation persistence across page reloads.
    - Automatic online/offline network detection and graceful resume.
    - Optimistic cache patching contract with snapshot rollback on terminal 4xx/5xx errors.

---

### Epic 18: Staff & Principal Architect Mock Interviews & Technical Defenses (Sprint 18 / 19 - v0.18.0) 📋
*Format:* Timed 45–60 min Socratic interview simulations with Staff-level rubric evaluation. Live in Portal: `?view=interviews`.
- [x] `MOCK-01`: Frontend System Design — Real-Time High-Frequency Trading & Telemetry Terminal
  - *Focus:* 60 FPS rendering under massive WebSocket throughput, backpressure handling, Web Workers off-main-thread parsing, Canvas/WebGL vs DOM trade-offs.
- [x] `MOCK-02`: Frontend System Design — Multi-Tenant Enterprise Micro-Frontend Dashboard
  - *Focus:* Module Federation, runtime dependency sharing, design token isolation, cross-MFE event bus, backward compatibility & version drift management.
- [x] `MOCK-03`: React 19 Internals & Runtime Execution Defense
  - *Focus:* Fiber reconciler work loop, Lane priority models, compiler auto-memoization mechanics, `useSyncExternalStore` concurrency guards, RSC Flight wire format parser.
- [x] `MOCK-04`: Enterprise Migration Defense — Angular/.NET to React/Next.js
  - *Focus:* Defending an enterprise refactoring plan before an executive committee: Zone.js/RxJS vs React Compiler/Hooks, NgRx vs Zustand/TanStack Query, ASP.NET BFF vs Next.js Route Handlers, Strangler Fig phased rollout.

---

### Epic 19: Enterprise Production Post-Mortems & Incident Socratic Case Studies (Sprint 20 - v0.19.0) 📋
*Format:* Real-world architectural post-mortems and incident debugging walkthroughs. Live in Portal: `?view=incidents`.
- [x] `CASE-01`: Production Memory Leak & V8 Heap Snapshot Post-Mortem (`INC-01`)
  - *Focus:* Diagnosing detached DOM leaks, un-cleared event listeners, and closure retainers in single-page apps; reading DevTools heap snapshots and retainer trees.
- [x] `CASE-02`: INP Optimization & Main-Thread Yielding Incident Drill (`INC-02`)
  - *Focus:* Resolving severe Interaction to Next Paint (INP) degradation during rapid search and data grid interactions; refactoring with `scheduler.yield()`, `useDeferredValue`, and Web Workers.
- [x] `CASE-03`: Enterprise Auth & Token Exfiltration Vulnerability Remediation (`INC-03`)
  - *Focus:* Addressing XSS vulnerability in client-stored JWT tokens; migrating to BFF HTTP-only cookie proxy with PKCE and token rotation.
- [x] `CASE-04`: Micro-Frontend Dependency Drift & Breaking Contract Regression (`INC-04`)
  - *Focus:* Resolving production outages caused by federated shared singleton mismatches (e.g. dual React runtime instances) and version skew across distributed deployments.

---

### Epic 21: Full-Spectrum Responsive Design, Mobile Usability & UI/UX Polish (Sprint 21 - v0.20.0) 📱
*Format:* Systemic cross-platform responsiveness, touch scrolling enclosures, mobile slide-out drawer, fluid reader layout, and visual alignment fixes across all 8 modules.
- [x] `UI-HERO-ALIGNMENT`: Dashboard Hero Action Strip Alignment & Symmetrical Grid
  - *Focus:* Eliminate awkward orphan button wrap on the 4th action button ("Incident War Room"). Replaced hardcoded max-width with CSS grid `repeat(4, 1fr)` on desktop, 2x2 grid on tablet, and 1-column on mobile.
- [x] `FEAT-RESPONSIVE-SHELL`: Responsive Header, Search Trigger & Mobile Drawer
  - *Focus:* Top navigation collapses on viewports < 980px into a hamburger button and search icon trigger. Slide-over drawer provides full access to all 8 modules and auto-closes on route change.
- [x] `UI-READER-FLUID`: TopicReader Responsive Canvas & Collapsible Outlines
  - *Focus:* Converts desktop 3-column reader layout into fluid 1-column layout on screens < 1120px with an in-header collapsible Table of Contents bar with smooth-scrolling anchors. On screens < 860px, curriculum sidebar converts into an off-canvas drawer with backdrop overlay.
- [x] `UI-ARENA-STACK`: Adaptive Single-Column Layouts for Arenas & Workspaces
  - *Focus:* Incidents Arena, Challenges Arena, and Code Playground split panels gracefully stack on viewports < 900px, enabling full-width editor, console output, and diff inspection.
- [x] `UI-LAB-TOUCH-SCROLL`: Universal Touch Scroll Enclosures for Complex Labs
  - *Focus:* High-density simulation canvases (Fiber Reconciliation, RSC Flight Stream Parser, Canvas Design, Virtualization, Query Cache) wrapped with `.scroll-touch-container` to maintain desktop detail while offering friction-free horizontal scrolling on mobile and tablet.
- [x] `TEST-RESPONSIVE-INTEGRITY`: Automated Testing & Multi-Viewport Verification
  - *Focus:* Verified with automated test suites (`npm test`, `npm run build`) and visual validation across 375px, 768px, and 1920px viewports with zero regressions.

---

## 3. Completed Backlog Items

### Item FIX-01: KaTeX Formula Greedy Regex Boundary Collision (`$$typeof`)
- **Issue**: The symbol at right in Chapter 01 (Learning Objectives) is not properly understood:
  `typeof, type, key, ref, props, children`).`
  Rendered with a stray math formula box below it.
- **Root Cause**:
  1. The symbol is React's internal security property: `$$typeof: Symbol.for('react.element')` (used to prevent client-side Cross-Site Scripting (XSS) via un-sanitized JSON payloads from being treated as valid React elements).
  2. In `TopicReader.tsx`, the LaTeX formula cleaner `cleanMarkdownFormatting` used an over-eager regex `/\$\$\s*([\s\S]+?)\s*\$\$/g`. When line 37 contained `$$typeof` and line 38 contained `$$typeof`, the regex greedily matched between the two `$$` instances as if they were LaTeX display math markers, stripping backticks and rendering the text in an unintended KaTeX formula box.
- **Resolution**:
  Replaced greedy regex matching in `TopicReader.tsx` with strict negative lookaround boundaries `(?<![`\w])\$\$...\$\$(?![`\w])` and a validation check requiring LaTeX escape commands (`\`) before treating any block as math syntax. This permanently shields symbols like `$$typeof`, `$$id`, `$$async`, and `$${...}` across all 34 chapters.

---

### Item FIX-02: Dashboard Phase Roadmap Cards Uneven Stretch
- **Issue**: Excessive vertical gaps in Phase 01 and Phase 02 roadmap cards on Dashboard.
- **Root Cause**:
  1. In `Dashboard.tsx`, the roadmap card grid used default CSS Grid stretch alignment (`align-items: stretch`). Because Phase 03 contains 11 topics while Phase 01 contains 4 topics, Phase 01's card was stretched to match the height of Phase 03.
  2. Inside each card, the root container used `display: flex; flex-direction: column; justify-content: space-between;`. With stretched card heights, this pushed the phase description and topic list ~300px apart to opposite edges.
- **Resolution**:
  1. Set `alignItems: 'start'` on the phase roadmap grid container so cards scale naturally according to their topic content height.
  2. Replaced `justifyContent: 'space-between'` with uniform content `gap: '1rem'`.
  3. Added an inline phase progress bar under the description and styled topic rows with matching `[01]`, `[02]`, `[AC]` number pills for consistent visual polish.

---

### Item FIX-03: Dashboard Grid Layout Fixed Card Heights & Internal Scrollbar
- **Issue**: Roadmap phase cards had uneven heights across rows when using `align-items: start`, creating large empty gaps between cards on row 1 and row 2.
- **Root Cause**:
  Cards with few or zero authored topics (such as Phase 02) stopped early, while cards with many topics (Phase 03) extended deep. In CSS Grid, this resulted in an irregular staggered grid layout with uneven vertical voids between cards.
- **Resolution**:
  1. Enforced a uniform card height (`height: 420px`) across all `.roadmap-phase-card` components on the Dashboard.
  2. Structured cards as flex columns where header content has `flex-shrink: 0` and the topic links container uses `flex: 1; min-height: 0; overflow-y: auto;`.
  3. Cards with extensive topics (e.g. Phase 03 with 11 topics) now scroll smoothly with a custom-styled scrollbar, while cards with 0 topics vertically center an authoring status placeholder.
  4. All cards across rows and columns now maintain a pixel-perfect, cohesive grid alignment.

---

### Item FIX-04: Mermaid SVG Diagram Root Container Height Collision
- **Issue**: In `00-react-application-lifecycle-architecture.md`, the box `1. Browser Network & HTML Bootstrap` stretched excessively tall (~1000px high with massive blank vertical space), distorting the SVG aspect ratio and shrinking the entire Mermaid diagram into an unreadable, narrow vertical column.
- **Root Cause**:
  1. The Mermaid label contained `&lt;div id='root'&gt;`, which Mermaid decoded into `<div id='root'>` when injecting HTML into the SVG `<foreignObject>`.
  2. In `index.css`, the global React container selector `#root { min-height: 100vh; display: flex; flex-direction: column; }` matched this injected element, forcing that single diagram step box to expand to `100vh` (~1000px).
  3. Dagre layout engine stretched `Stage 1` to accommodate the 1000px element, creating an extreme tall-and-narrow aspect ratio that forced the responsive SVG wrapper to shrink horizontally.
- **Resolution**:
  1. Scoped the main application container selector in `apps/portal/src/index.css` to `body > #root`, completely insulating inner SVG elements and markdown content from inheriting global layout heights.
  2. Added defensive resets in `apps/portal/src/index.css` (`.mermaid .node foreignObject > div { min-height: unset !important; }` and `.mermaid [id='root'] { min-height: unset !important; }`).
  3. Updated `00-react-application-lifecycle-architecture.md` to use clean plaintext notation `div#root` instead of HTML tags in the Mermaid diagram.
  4. Resynced notes via `npm run manifest`. Step 1 and Step 2 now share a balanced ~120px height, allowing the diagram to span horizontally across full width with crystal-clear readability.

---

### Item FIX-05: Markdown Code Block Left Baseline Indentation in Lists
- **Issue**: In Section 3 ("Phase 2: V8 Compilation & Module Resolution") of `00-react-application-lifecycle-architecture.md`, the `main.tsx` code snippet box was indented inwards to the right, misaligned with the section heading, intro prose, and other code boxes.
- **Root Cause**:
  The code block was indented under list item `3. Module Graph Execution:`, causing marked to nest `<pre>` inside `<ol><li>`. This added list indentation (`padding-left: 1.75rem`) and list item marker margins, breaking the clean left vertical baseline of the document.
- **Resolution**:
  1. Realigned Section 3 in `00-react-application-lifecycle-architecture.md` to follow the consistent architectural layout of Section 2 and Section 4: placing the code block at the section level (100% full width, flush left) followed by the step-by-step breakdown.
  2. Refined standard list padding in `apps/portal/src/index.css` to `1.45rem` for balanced typographic hierarchy.
  3. Added defensive styling for code blocks nested inside list items (`.markdown-body li > .code-block-wrapper, .markdown-body li > pre { margin: 0.85rem 0; }`).

---

### Item FIX-06: Centralized ASCII & Unicode Diagram Box Auto-Alignment & Font Normalization
- **Issue**: ASCII and Unicode box diagrams across multiple handbook chapters (e.g., Phase 01 Topic 02 V8 Execution Context, Phase 06 Topic 06 3-Tier Auth Model) suffered from jagged right borders (`|` / `│`), glyph substitution (`L—` for `└──`), and width drift.
- **Root Cause**:
  1. *Font Metrics & Subset Disparity:* Web-loaded monospace fonts (like Google Fonts' Latin subset of JetBrains Mono) lacked the Unicode Box Drawing block (`U+2500–U+257F`). Browsers fell back to secondary system fonts whose glyph advance widths mismatched ASCII spaces, causing horizontal borders (`───`) to render narrower than prose spaces. Additionally, font ligatures collapsed character combinations (`--` into em-dash, `└──` into `L—`).
  2. *Markdown Authoring Column Variance:* In complex hand-drawn diagrams across 110 chapters, internal content lines or sub-boxes had slight character count variances (e.g. 88 vs 90 vs 91 columns), causing vertical border pipes to stick out.
- **Resolution**:
  1. *CSS Engine Normalization:* Updated `--font-mono` in `apps/portal/src/index.css` to prioritize native monospace fonts with built-in 1:1 box-drawing metrics (`Cascadia Code`, `Consolas`, `Menlo`, `Monaco`, `Liberation Mono`), and explicitly disabled ligatures on code elements (`font-variant-ligatures: none; font-feature-settings: "liga" 0, "calt" 0;`).
  2. *Central Runtime Box Aligner:* Added `alignDiagramCodeBlocks` to `cleanMarkdownFormatting` in `TopicReader.tsx`. It automatically detects diagram code blocks, measures the maximum content width across bounded boxes, and dynamically re-pads all content lines and borders to exact rectangular dimensions before rendering.
  3. *Central Build-Time Pipeline Integration:* Embedded the auto-aligner into `apps/portal/scripts/generate-manifest.mjs` during the `public/notes/` synchronization step, ensuring all static assets, client fetches, and tests pass with 100% geometric alignment.

---

### Item FIX-07: Markdown Code Fence Parsing swallowed Comparison Tables in Chapters 06 & 07
- **Issue**: In `06-authentication-session-management.md` and `07-route-handlers-api-design.md`, Section 10 (Angular Comparison), Section 11 (.NET Comparison), and Section 14 (Tradeoffs) markdown tables were swallowed into raw code blocks instead of rendering as rich comparison tables.
- **Root Cause**:
  In Section 9, Pattern 3 code block lacked a closing triple-backtick fence (` ``` `), causing the marked parser to treat all downstream prose, section headings, and markdown comparison tables as continuation of the code string.
- **Resolution**:
  1. Closed code fences in `06-authentication-session-management.md` and `07-route-handlers-api-design.md`.
  2. Resynced notes to `public/notes/` and verified clean rendering of all comparison callout tables via headless browser inspection.

---

### Item FEAT-08: Smart Architectural Term Hover Cards & In-Situ Definitions
- **Issue / User Need**: Instead of manual hyperlinks across 110 markdown files, readers need seamless in-situ access to canonical definitions and source chapters when encountering key runtime and architectural terms (e.g. `V8`, `Fiber`, `Event Loop`, `Microtask`, `RSC`, `CRDT`, `TDZ`, `Zone.js`, `Signals`, `Closure`).
- **Architecture Reference**: [`ADR-002`](../../adr/ADR-002-portal-ux-typographic-reading-system.md), [`termDictionary.ts`](../../../apps/portal/src/features/topic-reader/termDictionary.ts)
- **Resolution**:
  1. *Glossary Engine:* Built [`termDictionary.ts`](../../../apps/portal/src/features/topic-reader/termDictionary.ts) mapping core terms to their canonical definitions, source chapters, and section anchors.
  2. *Glassmorphic Popover:* Created [`TermHoverCard.tsx`](../../../apps/portal/src/features/topic-reader/TermHoverCard.tsx) with automatic viewport boundary collision handling, definition typography, and action buttons (`Peek Summary` and `Read Chapter`).
  3. *Non-Destructive Prose Scanner:* Integrated a pure DOM text-node walker in `TopicReader.tsx` that identifies and marks only the *first occurrence* of each architectural term across prose text (`p`, `li`, `td`, `blockquote`), completely ignoring `<code>`, `<pre>`, `<a>`, and headings.
  4. *Interaction & Accessibility:* Added hover debounce (180ms delay, 280ms grace window), scroll auto-dismiss, and direct click toggle for instant touch and mobile interaction.
  5. *Live Verification:* Tested live at `http://localhost:5173/`, capturing verified browser screenshots of the active popover and the quick peek excerpt modal.

---

### Item FIX-09: Universal Elimination of Raw LaTeX Arrow Syntax (`\to` / `\rightarrow`)
- **Issue**: In Chapter 01 (Learning Objectives), Chapter 02, and across 19 notes and 3 simulation lab components, LaTeX math tokens `$\to$` and `$\rightarrow$` rendered as unescaped raw backslashes (`\to`).
- **Root Cause**:
  1. Hand-authored notes and simulation code used LaTeX math syntax instead of native Unicode arrows (`→`).
  2. `TopicReader.tsx`'s `cleanMarkdownFormatting` lacked a mapping for `\to`.
- **Resolution**:
  1. Replaced all 124 instances of `$\to$`, `$\rightarrow$`, `\to`, and `\rightarrow` with Unicode `→` across 19 markdown files in `notes/` and `apps/portal/public/notes/`.
  2. Improved code formatting in `01-javascript-execution-model.md`: `Primitives (Small Integers / \`Smi\`s via pointer tagging)`.
  3. Replaced raw `$\rightarrow$` in `EventLoopLab.tsx`, `RenderCycleLab.tsx`, and `FiberReconciliationLab.tsx` with clean `→`.
  4. Added defensive regex replacements in `TopicReader.tsx`.
  5. Added automated CI test in `apps/portal/scripts/test-manifest-integrity.mjs` verifying zero raw LaTeX arrow violations across all 110 notes.

---

### Item UI-LABS-VERTICAL: Master-Detail Vertical Simulation Navigation
- **Issue**: As the number of interactive simulation laboratories grew to 9, the horizontal tab row in `VisualizerHub.tsx` required horizontal scrolling, hiding labs off-screen and hurting accessibility.
- **Root Cause**: All 9 lab switcher buttons were rendered in a single horizontal flex row (`overflow-x: auto; white-space: nowrap;`).
- **Resolution**:
  1. Converted `VisualizerHub.tsx` into a responsive master-detail layout.
  2. Implemented a sticky vertical left navigation panel (`width: 320px`, scrollable) displaying all 9 simulations vertically.
  3. Each simulation card includes its phase badge, colored icon box, full title, 2-line educational subtitle, and active state indicator.
  4. Main simulation canvas occupies the full right area with zero horizontal scroll clipping.
  5. Verified with automated tests and production build.

---

### Item FIX-10: Light-Theme Text Contrast & Component Purity Lab Typography
- **Issue**: In light theme, rendered component tree items in `ComponentPurityLab.tsx` (`Cloud Infrastructure (Azure)`, `Kubernetes Cluster`, `CDN & DNS Gateway`) and various lab headers rendered as invisible white text against light gray or white surfaces.
- **Root Cause**: Simulation components hardcoded `color: '#fff'` on surfaces that switch to light tones (`#f1f5f9` or `#ffffff`) in light mode, combined with hardcoded `#090d16` containers.
- **Resolution**:
  1. Converted all hardcoded text styles in `ComponentPurityLab.tsx`, `JsxCompilerLab.tsx`, and `RenderCycleLab.tsx` to design system variables (`var(--text-primary)`, `var(--text-secondary)`).
  2. Refactored container backgrounds to use `var(--bg-tertiary)`, `var(--bg-secondary)`, and `var(--code-bg)`.
  3. Verified light mode contrast with live browser screenshot tests (`lab_11_component_purity_1791386333988.png`).

---

### Item FEAT-MOCK-INTERVIEWS: Dedicated Staff Architect Mock Interviews & Technical Defenses Arena
- **Feature Target**: Sprint 19 (`v0.18.0`)
- **Deliverables**: `apps/portal/src/features/interviews/InterviewsArena.tsx`, `interviewsData.ts`, `types.ts`, `App.tsx` (`?view=interviews`).
- **Capabilities Delivered**:
  1. **Master-Detail Scenario Hub**: 4 complete Staff/Principal Architect scenarios:
     - `MOCK-01`: Real-Time HFT Telemetry Terminal System Design (10k ticks/sec, 60 FPS, Web Workers, Transferables, ring buffers, INP < 50ms).
     - `MOCK-02`: Multi-Tenant SaaS Micro-Frontend Dashboard System Design (Module Federation, dynamic remotes, shared singletons, circuit breaker boundaries).
     - `MOCK-03`: React 19 Internals & Fiber Scheduler Deep Defense (Fiber linked list, 31-bit Lane bitmasks, cooperative work loop, React 19 Compiler SSA analysis, RSC Flight wire format).
     - `MOCK-04`: Enterprise Angular/.NET to React Executive Migration Defense (Strangler Fig reverse proxy, YARP/Cloudflare, Web Components coexistence, OpenAPI TypeScript client generation, 5-tier canary rollback).
  2. **Interactive 45-Minute Interview Timer**: Live countdown, play/pause controls, visual progress bar, low-time warning.
  3. **4-Stage Socratic Simulation Stepper**: Progressive interview turns (Clarifications, High-Level Architecture, Stress-Test Curveballs, Technical Drills) with revealable Staff Architect defenses and mentor pro-tips.
  4. **Live Candidate Scratchpad**: In-situ notes editor per scenario with automatic `localStorage` persistence.
  5. **Staff Self-Evaluation Rubric**: 5 FAANG/Staff-tier criteria with 1-5 star levels, real-time total score calculator (/25 pts), and calculated Staff readiness rating (L5 Senior, L6 Staff, L7 Principal).
  6. **Publication-Grade Architectural Defense Transcripts**: 3-minute executive elevator pitches, ASCII topology blueprints, copyable TypeScript/JSON production snippets, and trade-off comparison matrices.
  7. **Quality Gates**: 100% manifest and component integrity tests passed, zero TypeScript errors (`tsc -b`), and production build validated.

---

### Item FEAT-INCIDENTS-ARENA: Dedicated Enterprise Production Post-Mortems & Incident Drills Arena
- **Feature Target**: Sprint 20 (`v0.19.0`)
- **Deliverables**: `apps/portal/src/features/incidents/IncidentsArena.tsx`, `incidentsData.ts`, `types.ts`, `App.tsx` (`?view=incidents`), `Dashboard.tsx`.
- **Capabilities Delivered**:
  1. **Interactive Incident War Room**: 4 high-severity production incident simulations:
     - `INC-01` (`CASE-01`): SPA Heap Exhaustion & Chrome Tab Crash (1.9 GB memory leak, detached DOM subtree, global EventBus retention).
     - `INC-02` (`CASE-02`): Interaction to Next Paint (INP) Collapse in 50k-Row Enterprise Grid (740ms main-thread freeze, `scheduler.yield()`, Web Worker offload).
     - `INC-03` (`CASE-03`): Third-Party Analytics Compromise & LocalStorage JWT Exfiltration (BFF HTTP-Only cookie migration, SRI hash pinning, strict CSP).
     - `INC-04` (`CASE-04`): Production Micro-Frontend Cascade Outage (Diamond dependency skew, dual React 18/19 runtimes, strict Module Federation contracts).
  2. **5-Tab War Room Workflow**:
     - *1. Live Incident Communications:* Chronological PagerDuty & Slack #war-room archive with phase pills (ALERT, TRIAGE, DIAGNOSIS, HOTFIX, RESOLVED).
     - *2. Telemetry Anomaly Monitor:* Interactive SLA threshold comparison and time-series bar chart.
     - *3. Forensic Diagnostics Sandbox:* Clickable DevTools inspection actions uncovering evidence clues.
     - *4. Architectural Hotfix Diff:* Side-by-side comparison of vulnerable code vs enterprise fix with copy-to-clipboard.
     - *5. Executive 5-Whys RCA:* SRE post-mortem report with blast radius, TTD, TTM, TTR, 5-Whys root cause analysis, detection gaps, and 3-tier prevention roadmap.
  3. **Quality Gates**: Verified with `npm test`, `npx tsc -b`, and `npm run build` in 4.56s.

---

### Item BUG-HOTFIX-LIGHT-THEME-CONTRAST: High-Contrast Code Typography in Incident War Room Light Theme
- **Issue**: In light theme, text inside the Architectural Hotfix diff box and forensic console was difficult or impossible to read.
- **Root Cause**: The container used `background: var(--code-bg)` (dark navy `#0f172a`), but child text elements used `var(--text-primary)` (which is also dark navy `#0f172a` in light theme), causing dark text on dark background.
- **Resolution**: Updated code and console containers in `IncidentsArena.tsx` to explicitly use `color: var(--code-text, #f8fafc)`.

---

### Item BUG-ROUTE-REFRESH-FLASH: SPA Route Initial Render Flash on Reload
- **Issue**: Reloading `?view=challenges`, `?view=labs`, or other routes momentarily flashed the root Dashboard before switching views.
- **Root Cause**: `activeView` was statically initialized to `'dashboard'` before URL parameters were read in `useEffect`.
- **Resolution**: Implemented synchronous `resolveInitialRoute()` in `App.tsx` reading URL parameters on initial component instantiation.

---

### Item FEAT-CHALLENGE-THEORY-DEEPDIVE: Publication-Grade Architectural Deep Dive & Self-Contained Snippets
- **Issue**: Experimental challenge view used minimal bullet points and linked to raw local file paths.
- **Resolution**: Removed all local filesystem path disclosures; embedded self-contained syntax-highlighted code implementations, algorithmic trade-off matrices, and Socratic Staff interview defense rebuttals.

---

### Item FEAT-REPO-LICENSE: Open-Source MIT License
- **Resolution**: Added standard permissive MIT License (`LICENSE`) to the repository root for clear open-source distribution and professional portfolio presentation.

---

### Item DOCS-GH-PAGES-LINK: Live Hosted Portal Deployment URL & Badges Integration
- **Issue / User Need**: The application is continuously built and published to GitHub Pages at `https://adarshsince90.github.io/react-interview-prep/`, but users, recruiters, and learners viewing documentation had no direct one-click links or badges to access the live web application.
- **Resolution**:
  1. *Root `README.md`:* Added prominent `Live_Portal-GitHub_Pages` badge, curriculum status badge, MIT license badge, and featured blockquote linking directly to `https://adarshsince90.github.io/react-interview-prep/`.
  2. *`PROGRESS.md`:* Added live hosted deployment URL into tracking header and runtime server links.
  3. *`apps/portal/README.md`:* Highlighted live hosted portal access alongside local quick-start instructions.
  4. *`docs/sdlc/README.md`:* Added live deployed web application cross-reference.
  5. *SDLC Intake:* Triaged and resolved from `unplanned-backlog.md`.

---

## Epic 21: Full-Spectrum Responsive Design, UI/UX Polish & Cross-Platform Alignment (v0.20.0)

> **Sprint:** Sprint 21 (`v0.20.0`)  
> **Target Subsystem:** `apps/portal` (Shell, Dashboard, Reader, Arenas, Simulation Labs)  
> **Source Intake:** `UNPLANNED-RESPONSIVE-ALIGNMENT` in [`unplanned-backlog.md`](./unplanned-backlog.md)

### User Story 21.1 (`UI-HERO-ALIGNMENT`): Dashboard Hero Action Grid & Symmetry Fix
- **As a** learner visiting the portal on any screen resolution,
- **I want** the hero action buttons to be arranged in an aesthetically balanced, symmetrical layout without orphan buttons wrapped onto lonely rows,
- **So that** the first impression is publication-grade and visually commanding.
- **Root Cause:** In `Dashboard.tsx`, the inner container hardcodes `maxWidth: '780px'`. Four buttons + gaps require ~853px, forcing button #4 ("Incident War Room") to wrap as a lone orphan.
- **Acceptance Criteria:**
  1. Remove the arbitrary `maxWidth: '780px'` restriction on the hero action row.
  2. Implement an auto-fit / 4-card action grid with consistent button heights, icons, and hover elevations.
  3. On tablet screens (640px–1024px), format cleanly as a 2x2 grid.
  4. On mobile screens (<640px), format as a single-column or 2-column touch-friendly action stack.
  5. Zero orphan buttons across all standard viewport widths (375px, 430px, 768px, 1024px, 1440px, 1920px).

### User Story 21.2 (`FEAT-RESPONSIVE-SHELL`): Responsive Navigation Header & Mobile Drawer
- **As a** mobile or tablet learner,
- **I want** the top navigation bar to adapt to my screen width with a compact header and slide-out drawer,
- **So that** I can easily access all 7 portal modules without horizontal page blowout.
- **Acceptance Criteria:**
  1. Under `960px`, collapse the 7 desktop navigation tabs into a smooth slide-out navigation sheet/drawer with backdrop overlay.
  2. Collapse the 320px search input into a compact search icon button that triggers `GlobalSearchModal` (Ctrl+K).
  3. Ensure the theme toggle, brand logo, and hamburger icon remain pinned and accessible.
  4. Navigating to any view from the mobile drawer automatically closes the drawer and resets scroll position to top.

### User Story 21.3 (`UI-READER-FLUID`): Fluid TopicReader, Collapsible TOC & Off-Canvas Curriculum Sidebar
- **As a** reader studying handbook chapters on mobile or tablet,
- **I want** the reading canvas to occupy full width while keeping the curriculum tree and chapter navigation easily accessible,
- **So that** reading long technical guides is seamless and comfortable.
- **Acceptance Criteria:**
  1. Under `1120px`, collapse the fixed 290px right-hand Table of Contents into a floating collapsible badge / bottom drawer so the reading column expands to 100% width.
  2. Under `860px`, convert the 320px sticky curriculum sidebar into an animated off-canvas drawer with backdrop blur.
  3. Selecting a chapter in mobile drawer immediately navigates and closes the drawer.
  4. All markdown code blocks (`pre`, `code`), tables, and Mermaid diagrams must have horizontal touch-scrolling (`overflow-x: auto`) and never cause document-level horizontal scroll.

### User Story 21.4 (`UI-ARENA-STACK`): Single-Column Adaptive Stacks for Interactive Arenas
- **As a** candidate practicing in Mock Interviews, Incident War Room, or Machine Coding Challenges on a tablet or phone,
- **I want** multi-column master-detail layouts to adapt gracefully,
- **So that** I can review scenarios and inspect telemetry without clipped panels.
- **Acceptance Criteria:**
  1. In `IncidentsArena`, convert the fixed `360px 1fr` grid to an adaptive layout (`1fr` on screens < 900px) with segmented selector tabs.
  2. In `ChallengesArena`, convert `320px 1fr` to single-column stacking with sticky scenario selection on mobile.
  3. In `CodePlayground`, convert `300px 1fr` to single-column stack on screens < 860px.
  4. Ensure all telemetry graphs, terminal outputs, and code diffs have touch scroll wrappers.

### User Story 21.5 (`UI-LAB-TOUCH-SCROLL`): Touch-Friendly Overflow Containers for Complex Visualizers
- **As a** developer exploring complex runtime simulators on a touchscreen or small display,
- **I want** complex diagrams, Fiber reconciler trees, and TanStack query caches to preserve 100% of their desktop features without being crushed,
- **So that** no educational fidelity or simulator capability is degraded.
- **Acceptance Criteria:**
  1. In `VisualizerHub`, switch to a responsive layout on screens < 960px with a compact simulation dropdown / pill selector.
  2. Wrap all high-density visualizer canvases (`FiberReconciliationLab`, `RscFlightLab`, `CanvasDesignLab`, `MemoryRetainerLab`, `VirtualizationLab`) in `.scroll-touch-container` with smooth touch inertia.
  3. Replace hardcoded 4-column/5-column stat strips with responsive auto-fit grids (`repeat(auto-fit, minmax(180px, 1fr))`).

### User Story 21.6 (`TEST-RESPONSIVE-INTEGRITY`): Quality Gates & Multi-Viewport Verification
- **As a** release engineer,
- **I want** comprehensive automated tests and multi-viewport validation,
- **So that** no existing feature, route, or theme breaks during responsive refactoring.
- **Acceptance Criteria:**
  1. `npm test` passes 100% of assertions (manifest, labs, challenges, interviews, incidents, LaTeX sanitization).
  2. `tsc -b` completes with 0 errors.
  3. `npm run build` succeeds cleanly.
  4. Verified across mobile (375px/390px), tablet (768px), and desktop (1440px/1920px).

