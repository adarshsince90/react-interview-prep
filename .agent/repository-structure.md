# Frontend Engineering Handbook
### Senior Angular + .NET Engineer → Senior React + Next.js Engineer

---

# Repository Structure

```text
react-interview-prep/
│
├── README.md                                  # Repository Mission & Overview
├── PROGRESS.md                                # Master Progress Tracker & Simulation Backlog
├── AGENTS.md                                  # Agent Guidelines, Pedagogy & 20-Section Rules
│
├── .agent/                                    # Mentor Architecture & Skills
│   ├── followup-prompts.md
│   ├── initial-prompt.md
│   ├── repository-structure.md
│   └── skills/
│       ├── generate-markdown/SKILL.md         # Handbook markdown generator skill
│       └── portal-developer/SKILL.md          # Interactive portal developer skill
│
├── apps/
│   └── portal/                                # ⚛️ Living Revision & Simulation App (Vite + React + TS)
│       ├── scripts/
│       │   ├── generate-manifest.mjs          # Auto-indexes notes/ into manifest.json
│       │   └── test-manifest-integrity.mjs
│       ├── src/
│       │   ├── core/                          # Shell, layout, theme, manifest loader
│       │   └── features/
│       │       ├── dashboard/                 # Roadmap, metrics, progress tracker
│       │       ├── topic-reader/              # Markdown reader, syntax highlight, TOC
│       │       ├── visualizers/               # Interactive Simulation Labs
│       │       └── flashcards/                # Memory anchors & interview drills
│       ├── package.json
│       └── vite.config.ts
│
├── notes/                                     # 📚 Study Notes (Single Source of Truth)
│   ├── phase-00-angular-to-react-transition/
│   │   └── 00-angular-vs-react-mental-model.md
│   │
├── phase-01-javascript-runtime-foundations/
│   ├── 01-javascript-execution-model.md
│   ├── 02-scope-hoisting-tdz.md
│   ├── 03-closures.md
│   ├── 04-event-loop.md
│   ├── 05-promises-async-await.md
│   ├── 06-objects-prototypes-this.md
│   ├── 07-functional-javascript.md
│   ├── 08-modern-es6-plus.md
│   ├── 09-memory-management-garbage-collection.md
│   ├── 10-modules-and-bundlers.md
│   ├── 11-browser-storage.md
│   └── 12-browser-networking.md
│
├── phase-02-browser-platform/
│   ├── 01-browser-architecture.md
│   ├── 02-dom-and-render-tree.md
│   ├── 03-browser-rendering-pipeline.md
│   ├── 04-layout-paint-compositing.md
│   ├── 05-browser-events.md
│   ├── 06-event-delegation.md
│   ├── 07-fetch-api-and-network-stack.md
│   ├── 08-cors.md
│   ├── 09-cookies-and-storage.md
│   └── 10-service-workers.md
│
├── phase-03-react-foundations/
│   ├── 01-why-react-exists.md
│   ├── 02-history-of-react.md
│   ├── 03-jsx.md
│   ├── 04-component-model.md
│   ├── 05-render-cycle.md
│   ├── 06-props.md
│   ├── 07-state.md
│   ├── 08-hooks-introduction.md
│   ├── 09-context-api.md
│   └── 10-react-forms.md
│
├── phase-04-react-rendering-internals/
│   ├── 01-virtual-dom.md
│   ├── 02-reconciliation.md
│   ├── 03-fiber-architecture.md
│   ├── 04-render-phase-vs-commit-phase.md
│   ├── 05-concurrent-rendering.md
│   ├── 06-react-scheduler.md
│   ├── 07-transitions.md
│   ├── 08-suspense.md
│   └── 09-server-components-foundation.md
│
├── phase-05-react-state-management/
│   ├── 01-state-management-landscape.md
│   ├── 02-usestate.md
│   ├── 03-usereducer.md
│   ├── 04-context-api-deep-dive.md
│   ├── 05-redux-fundamentals.md
│   ├── 06-redux-toolkit.md
│   ├── 07-zustand.md
│   ├── 08-jotai.md
│   ├── 09-signals-comparison.md
│   └── 10-state-management-decision-guide.md
│
├── phase-06-data-fetching-and-server-state/
│   ├── 01-client-state-vs-server-state.md
│   ├── 02-tanstack-query-introduction.md
│   ├── 03-query-cache.md
│   ├── 04-mutations.md
│   ├── 05-optimistic-updates.md
│   ├── 06-revalidation-strategies.md
│   ├── 07-caching-patterns.md
│   ├── 08-api-layer-design.md
│   └── 09-repository-pattern-in-react.md
│
├── phase-07-nextjs-foundations/
│   ├── 01-why-nextjs-exists.md
│   ├── 02-react-vs-nextjs.md
│   ├── 03-project-structure.md
│   ├── 04-file-system-routing.md
│   ├── 05-layouts.md
│   ├── 06-app-router.md
│   ├── 07-metadata.md
│   └── 08-middleware.md
│
├── phase-08-nextjs-rendering-and-server-components/
│   ├── 01-rendering-strategies.md
│   ├── 02-csr.md
│   ├── 03-ssr.md
│   ├── 04-ssg.md
│   ├── 05-isr.md
│   ├── 06-server-components.md
│   ├── 07-client-components.md
│   ├── 08-server-actions.md
│   ├── 09-streaming.md
│   ├── 10-hydration.md
│   ├── 11-caching-model.md
│   └── 12-edge-runtime.md
│
├── phase-09-authentication-security/
│   ├── 01-authentication-landscape.md
│   ├── 02-jwt.md
│   ├── 03-oauth2.md
│   ├── 04-openid-connect.md
│   ├── 05-session-authentication.md
│   ├── 06-token-authentication.md
│   ├── 07-authjs-nextauth.md
│   ├── 08-entra-id-integration.md
│   ├── 09-route-protection.md
│   ├── 10-middleware-authentication.md
│   ├── 11-api-security.md
│   └── 12-xss-csrf-cors.md
│
├── phase-10-performance-engineering/
│   ├── 01-react-performance-mental-model.md
│   ├── 02-rerenders.md
│   ├── 03-usememo.md
│   ├── 04-usecallback.md
│   ├── 05-react-memo.md
│   ├── 06-code-splitting.md
│   ├── 07-lazy-loading.md
│   ├── 08-bundle-optimization.md
│   ├── 09-web-vitals.md
│   ├── 10-performance-profiling.md
│   ├── 11-nextjs-performance.md
│   └── 12-cdn-and-caching.md
│
├── phase-11-enterprise-react-architecture/
│   ├── 01-feature-based-architecture.md
│   ├── 02-domain-driven-frontend.md
│   ├── 03-monorepos.md
│   ├── 04-nx.md
│   ├── 05-turborepo.md
│   ├── 06-shared-libraries.md
│   ├── 07-design-systems.md
│   ├── 08-component-libraries.md
│   ├── 09-micro-frontends.md
│   ├── 10-module-federation.md
│   ├── 11-enterprise-folder-structures.md
│   └── 12-large-scale-react-applications.md
│
├── phase-12-testing-strategy/
│   ├── 01-testing-pyramid.md
│   ├── 02-jest.md
│   ├── 03-react-testing-library.md
│   ├── 04-component-testing.md
│   ├── 05-integration-testing.md
│   ├── 06-e2e-testing.md
│   ├── 07-playwright.md
│   └── 08-performance-testing.md
│
├── phase-13-system-design-for-frontend/
│   ├── 01-designing-large-react-applications.md
│   ├── 02-multi-tenant-frontends.md
│   ├── 03-realtime-applications.md
│   ├── 04-dashboard-architecture.md
│   ├── 05-bff-pattern.md
│   ├── 06-caching-strategies.md
│   ├── 07-offline-first-applications.md
│   └── 08-frontends-at-scale.md
│
├── phase-14-interview-preparation/
│   ├── 01-javascript-interview-questions.md
│   ├── 02-react-interview-questions.md
│   ├── 03-nextjs-interview-questions.md
│   ├── 04-state-management-interview-questions.md
│   ├── 05-authentication-interview-questions.md
│   ├── 06-performance-interview-questions.md
│   ├── 07-architecture-interview-questions.md
│   ├── 08-system-design-interview-questions.md
│   ├── 09-senior-engineer-scenarios.md
│   ├── 10-lead-engineer-scenarios.md
│   └── 11-architect-scenarios.md
│
├── diagrams/
│   ├── javascript-runtime/
│   ├── browser/
│   ├── react/
│   ├── nextjs/
│   ├── authentication/
│   ├── performance/
│   └── architecture/
│
├── cheat-sheets/
│   ├── javascript-cheat-sheet.md
│   ├── react-cheat-sheet.md
│   ├── nextjs-cheat-sheet.md
│   ├── state-management-cheat-sheet.md
│   ├── authentication-cheat-sheet.md
│   ├── performance-cheat-sheet.md
│   └── interview-cheat-sheet.md
│
├── reference-material/
│   ├── glossary.md
│   ├── javascript-to-react-mapping.md
│   ├── angular-react-mapping.md
│   ├── dotnet-react-mapping.md
│   ├── architecture-patterns.md
│   ├── design-decisions.md
│   ├── decision-matrix.md
│   └── commonly-used-interview-diagrams.md
│
└── assets/
    ├── images/
    ├── screenshots/
    └── architecture-diagrams/
```

---

# Recommended Learning Sequence

```text
PHASE 00
Angular → React Transition

PHASE 01
JavaScript Runtime Foundations (Completed: Chapters 01-09)

PHASE 03 (Fast-Tracked Focus)
React Foundations & Core Mechanics
*(Note: Browser Platform, Storage, Networking, and Bundlers are pragmatically folded directly into React and Next.js architecture chapters where they naturally come alive.)*

PHASE 04
React Rendering Internals

PHASE 05
React State Management

PHASE 06
Data Fetching & Server State

PHASE 07
Next.js Foundations

PHASE 08
Next.js Rendering & Server Components

PHASE 09
Authentication & Security

PHASE 10
Performance Engineering

PHASE 11
Enterprise React Architecture

PHASE 12
Testing Strategy

PHASE 13
Frontend System Design

PHASE 14
Interview Preparation
```

---

# Priority Order (What We Should Actually Deep Dive First)

```text
1.  01-javascript-execution-model.md
2.  02-scope-hoisting-tdz.md
3.  03-closures.md
4.  04-event-loop.md
5.  05-promises-async-await.md
6.  06-objects-prototypes-this.md
7.  07-functional-javascript.md
8.  08-modern-es6-plus.md
9.  09-memory-management-garbage-collection.md

--------------------------------

10. why-react-exists.md
11. jsx.md
12. render-cycle.md
13. state.md
14. hooks-introduction.md

--------------------------------

15. virtual-dom.md
16. reconciliation.md
17. fiber-architecture.md
18. concurrent-rendering.md

--------------------------------

19. redux-toolkit.md
20. tanstack-query.md

--------------------------------

21. why-nextjs-exists.md
22. app-router.md
23. server-components.md
24. rendering-strategies.md
25. hydration.md

--------------------------------

26. authentication-security

--------------------------------

27. enterprise-react-architecture

--------------------------------

28. interview-preparation
```

---

# Final Goal

By the end of this repository, you should be able to comfortably explain:

- How JavaScript executes code internally
- How React uses JavaScript runtime concepts
- Why Hooks rely on closures
- Why React re-renders
- How Fiber works
- How Reconciliation works
- How Concurrent Rendering works
- When to use Redux Toolkit vs TanStack Query
- Why Next.js exists
- How Server Components work
- SSR vs SSG vs ISR vs CSR tradeoffs
- React authentication patterns
- Enterprise React architecture decisions
- Frontend system design at scale
- Senior/Lead/Architect interview scenarios

This structure is effectively a complete **Senior React + Next.js Architecture Handbook**, analogous to the deep Angular, .NET, Systems, Networking, Authentication, and Architecture handbooks you've been building.