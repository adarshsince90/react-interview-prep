# Engineering Handbook & Learning Portal: Sprint Execution Plan & Agent Handover

> **Authoritative Multi-Agent Roadmap & Progress Tracker**  
> **Repository:** `react-interview-prep`  
> **Active Subsystems:**  
> - Study Notes: `notes/phase-01` through `phase-07` (Single Source of Truth)  
> - Interactive Portal: `apps/portal` (React 19 + TypeScript 5.8 + Vite 8)  
> - Architecture Decision Records: [`docs/adr/`](../adr/README.md)  
> - Active Backlog & Bug Reports: [`docs/sdlc/backlog/backlog.md`](./backlog/backlog.md)  
> - Master Progress Metric: [`PROGRESS.md`](../../PROGRESS.md)  
> - Governance & Pedagogy: [`AGENTS.md`](../../AGENTS.md)  
> - Portal SDLC & Quality Gates: [`docs/sdlc/portal-sdlc.md`](./portal-sdlc.md)

---

## 1. Multi-Agent Handover Protocol (Read This First)

If you are an agent resuming this repository, execute this orientation:
1. **Check Active Sprint Status:** Review Section 2 below to identify the currently active sprint.
2. **Consult ADRs:** Check [`docs/adr/`](../adr/README.md) before making architectural choices (e.g. ADR-001 for markdown SSOT, ADR-002 for typography/diagram layout, ADR-003 for publication workflow).
3. **Verify Quality Gates:** Run the verification pipeline before and after any changes:
   ```powershell
   cd apps/portal
   npm run manifest     # Syncs notes to public/notes and regenerates manifest.json
   npm test             # Validates manifest integrity and simulation lab files
   npx tsc --noEmit     # Validates TypeScript compilation
   npm run build        # Verifies production bundle build
   ```
4. **Inspect Dev Server:** Dev server runs on `http://localhost:5173/`.

---

## 2. Sprint Roadmap & Execution Board

```mermaid
flowchart TD
    S1["Sprint 1: Navigation & Wayfinding (v0.3.0) ✅"] --> S2["Sprint 2: LaTeX Sanitization & CI Validator (v0.3.1) ✅"]
    S2 --> S3["Sprint 3: Portal UI/UX Modernization (v0.4.0) ✅"]
    S3 --> S4["Sprint 4: Phase 05 State Curriculum (10/10) ✅"]
    S4 --> S5["Sprint 5: Next.js & Full-Stack React Architecture (Phase 06)"]
    S5 --> S6["Sprint 6: Dedicated Browser Platform Engine (Phase 02)"]
    S6 --> S7["Sprint 7: Enterprise Security, Auth & Identity (Phase 07)"]
    S7 --> S8["Sprint 8: Performance Engineering & Web Vitals (Phase 08)"]
    S8 --> S9["Sprint 9: Clean Architecture, Monorepos & MFEs (Phase 09)"]
    S9 --> S10["Sprint 10: Modern Testing Strategy & QA (Phase 10)"]
    S10 --> S11["Sprint 11: Frontend System Design at Scale (Phase 11)"]
    S11 --> S12["Sprint 12: Angular ➔ React Synthesis Capstone (Phase 12)"]
    S12 --> S13["Sprint 13: Socratic Mentorship & Mock Interviews"]
```

| Sprint | Goal & Scope | Status | Primary Skill | Deliverables |
| :--- | :--- | :---: | :---: | :--- |
| **Sprint 1** | **Core Wayfinding & History Navigation (`apps/portal`)** | [x] **Complete** (v0.3.0) | `portal-developer` | Breadcrumbs (`FEAT-NAV-01`), Navigation History Stack (`FEAT-NAV-02`), Browser `popstate` sync, Sequential Next/Prev Cards (`FEAT-NAV-03`), Section Anchor Jumps (`FEAT-NAV-04`). |
| **Sprint 2** | **Formatting Cleanup, LaTeX Sanitization & CI Validator** | [x] **Complete** (v0.3.1) | `portal-developer` / `generate-markdown` | Sanitized raw LaTeX across all notes; added markdown preprocessor in `TopicReader.tsx`; added CI test in `test-manifest-integrity.mjs`. |
| **Sprint 3** | **Portal UI/UX Modernization & Defect Resolution** | [x] **Complete** (v0.4.0) | `portal-developer` | TOC sync, sticky sidebar, diagram SVG bounding, uniform badges (`[01]`, `[02]`, `[AC]`), 780px reading container, micro-animations, Back to Top button. |
| **Sprint 4** | **Phase 05 Curriculum Completion (Advanced State)** | [x] **Complete** | `generate-markdown` | Published 7 publication-grade 20-section chapters (Topics 04–10: TanStack Query, Cache Invalidation, Reselect, URL State, WebSockets, XState, Offline Persistence). Manifest indexed (41 topics). CI passed 100%. |
| **Sprint 5** | **Phase 06 Full Publication (Next.js & Full-Stack React)** | 🚀 **In Progress** (3/10) | `generate-markdown` | Author 10 chapters covering App Router, RSC Flight stream, Server Actions, SSG/ISR, Middleware, Auth, Route Handlers, Caching, Code Splitting, and Cloud Deployment. Topics 01, 02 & 03 published. |
| **Sprint 6** | **Phase 02 Dedicated Browser Platform Engine** | 📋 *Queued* | `generate-markdown` | Author 10 chapters covering Browser Architecture, DOM/CSSOM, Rendering Pipeline, Layout Thrashing, Event Propagation & Delegation, Network Stack, CORS/CSP, and Storage. |
| **Sprint 7** | **Phase 07 Enterprise Security, Auth & Identity** | 📋 *Queued* | `generate-markdown` | Author 8 chapters covering OAuth2, OIDC PKCE, Entra ID (Azure AD), JWT storage, Session rotation, RBAC, and CSP. |
| **Sprint 8** | **Phase 08 Performance Engineering & Web Vitals** | 📋 *Queued* | `generate-markdown` | Author 8 chapters covering INP, LCP, CLS, DevTools Flamecharts, Heap Snapshots, Long Tasks, Tree-shaking, and Virtualization. |
| **Sprint 9** | **Phase 09 Clean Architecture, Monorepos & Micro-Frontends** | 📋 *Queued* | `generate-markdown` | Author 8 chapters covering Domain-Driven Design in frontend, Nx vs Turborepo, Module Federation, and Design Systems. |
| **Sprint 10** | **Phase 10 Modern Testing Strategy & QA** | 📋 *Queued* | `generate-markdown` | Author 8 chapters covering Testing Pyramid, Vitest, React Testing Library, Mock Service Worker (MSW), and Playwright E2E. |
| **Sprint 11** | **Phase 11 Frontend System Design at Scale** | 📋 *Queued* | `generate-markdown` | Author 8 chapters covering Collaborative Canvas, Trading Terminals, Multi-Tenant SaaS, BFF Pattern, and Edge Compute. |
| **Sprint 12** | **Phase 12 Angular to React Enterprise Synthesis (Capstone)** | 📋 *Queued* | `generate-markdown` | Author Topics 01 through 08 providing 1-to-1 migration playbooks between Angular patterns (Zone.js, Signals, RxJS, DI, NgRx) and React/Next.js clean architecture. |
| **Sprint 13** | **Architectural Mentorship, Walkthrough & Mock Interviews** | 📋 *Queued* | Mentor / Coach | Guided chapter-by-chapter walkthrough, in-depth doubt resolution, refactoring drills, and Staff-level technical mock interviews. |

---

## 3. Sprint 3 Detailed Work Breakdown: Portal UI/UX Modernization (Complete - v0.4.0)

### Backlog Reference:
Items UI-01 through UI-05 in [`docs/sdlc/backlog/backlog.md`](./backlog/backlog.md).  
Architecture Reference: [`docs/adr/ADR-002`](../adr/ADR-002-portal-ux-typographic-reading-system.md).

### Tasks:
- [x] **TASK-UI-01 (TOC Navigation):** Unified heading slugification in `scripts/generate-manifest.mjs`, `TopicReader.tsx`, and `src/core/utils/slugify.ts`. Implemented offset smooth-scrolling with fallback element matching.
- [x] **TASK-UI-02 (Sticky TOC):** Fixed sticky layout on right sidebar (`position: sticky; top: 78px; maxHeight: calc(100vh - 96px); overflowY: auto`) and removed parent overflow clipping on `<main>`.
- [x] **TASK-UI-03 (Diagram Bounding):** Added `.mermaid svg` bounding rules (`max-height: 520px; width: 100%; object-fit: contain`) and prevented `foreignObject` label compression into narrow columns.
- [x] **TASK-UI-04 (Sidebar Consistency):** Created `formatTopicBadgeAndTitle()` utility rendering clean `[01]`, `[02]`, `[AC]` badge pills uniformly across all phases in both sidebar and dashboard.
- [x] **TASK-UI-05 (Prose Width & Typography):** Applied `prose-reading-container` (`max-width: 800px; margin: 0 auto;`) to markdown reading body. Polished line-height (`1.78`), font hierarchy, and alert box styles.
- [x] **TASK-UI-06 (Interactivity):** Added floating "Back to Top" action button, dashboard phase card hover lift, and smooth chapter entrance transitions.

---

## 4. Sprint 4 Detailed Work Breakdown: Phase 05 State Curriculum Completion (Complete)

### Curriculum Output:
- [x] **TASK-STATE-04:** Authored [`04-tanstack-query-server-state.md`](../../notes/phase-05-advanced-state-architecture/04-tanstack-query-server-state.md) (Server State vs Client State, QueryClient/Cache/Observer internals, Stale-While-Revalidate, GC vs Stale timers, structural sharing, Angular Resource/RxJS & .NET Distributed Caching).
- [x] **TASK-STATE-05:** Authored [`05-cache-invalidation-optimistic-ui.md`](../../notes/phase-05-advanced-state-architecture/05-cache-invalidation-optimistic-ui.md) (Pessimistic vs Optimistic lifecycles, 4-phase transaction contract, Ghost Rollback bug & `cancelQueries`, cache invalidation topologies, Angular NgRx Effects & .NET Unit of Work / Sagas).
- [x] **TASK-STATE-06:** Authored [`06-reselect-memoization-performance.md`](../../notes/phase-05-advanced-state-architecture/06-reselect-memoization-performance.md) (Derived state projections, Reselect 5.x `weakMapMemoize` Ephemeron trie, reference stability, multi-instance cache thrashing, Angular `computed()` & .NET LINQ deferred execution).
- [x] **TASK-STATE-07:** Authored [`07-url-state-management.md`](../../notes/phase-05-advanced-state-architecture/07-url-state-management.md) (URL as single source of truth, History API `pushState`/`replaceState`/`popstate`, type-safe `nuqs`, search throttling, History API rate limits, Angular Router & ASP.NET Core QueryString binders).
- [x] **TASK-STATE-08:** Authored [`08-realtime-websockets-sync.md`](../../notes/phase-05-advanced-state-architecture/08-realtime-websockets-sync.md) (Push vs Pull, SSE vs WebSockets, 60 FPS `requestAnimationFrame` ring buffer batching, TanStack Query cache patching, heartbeats, exponential backoff with jitter, Angular SignalR & ASP.NET Core SignalR Channels).
- [x] **TASK-STATE-09:** Authored [`09-state-machines-xstate.md`](../../notes/phase-05-advanced-state-architecture/09-state-machines-xstate.md) (Boolean Explosion elimination, David Harel Statecharts, XState v5 Actor model, guards, actions, invoked actors, Angular State Routing & .NET Stateless / MassTransit Sagas).
- [x] **TASK-STATE-10:** Authored [`10-offline-first-persistence.md`](../../notes/phase-05-advanced-state-architecture/10-offline-first-persistence.md) (Local-First architecture, IndexedDB vs localStorage, TanStack Query persistence pipeline with `idb-keyval`, FIFO mutation outbox, conflict resolution OCC vs LWW, Angular PWA & .NET SQLite / EF Core Offline).

---

## 5. Verification Checklist for Closing Sprints

Every sprint milestone must pass this automated checklist:
1. `npm run manifest` exits with code 0.
2. `npm test` passes 100% of assertions.
3. `npx tsc --noEmit` returns 0 compiler errors.
4. `npm run build` generates production bundle cleanly.
5. [`PROGRESS.md`](../../PROGRESS.md), [`docs/sdlc/sprint-plan.md`](./sprint-plan.md), and [`docs/sdlc/backlog/backlog.md`](./backlog/backlog.md) are synchronized.
