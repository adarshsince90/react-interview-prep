# Phase 11 — Topic 01: The Frontend System Design Interview Framework

## 1. Why This Topic Exists
In Senior, Staff, and Principal Frontend Engineer interviews at tier-1 technology companies (FAANG, high-growth decacorns, top FinTech firms), coding puzzles and algorithmic trivia are insufficient to evaluate candidates. Companies need leaders who can design large-scale, resilient, highly performant web applications capable of serving millions of concurrent users while being developed by dozens of autonomous engineering squads.

Unlike backend system design—which traditionally revolves around databases, sharding, caching tiers, and message brokers—**Frontend System Design** operates under fundamentally different physical and architectural constraints:
- Code executes on untrusted, heterogeneous client hardware (from $100 Android phones to 64-core developer workstations) over unpredictable cellular networks.
- A single JavaScript main thread must balance DOM rendering, layout calculation, garbage collection, and business logic at 60 to 120 frames per second.
- State must be synchronized across complex asynchronous boundaries: local memory, browser persistent storage, server caches, and real-time push streams.

Without a structured architectural framework, candidates either dive prematurely into low-level React hooks or give generic backend answers. The **RADIO Framework** provides a battle-tested, repeatable methodology to structure any frontend system design interview from initial requirements to production resilience.

---

## 2. Learning Objectives
By completing this chapter, you will be able to:
- Execute the 5-stage **RADIO Framework** (Requirements, Architecture, Data Model, Interface/Contracts, Optimizations) within a 45-minute interview budget.
- Clarify and negotiate Functional vs. Non-Functional requirements (Core Web Vitals budgets, target devices, offline support, compliance).
- Design high-level client-server component topologies decomposing complex apps into Host Shells, Feature Slices, and Service Adapters.
- Model normalized client-side state architectures distinguishing between Server Cache, Global Client State, URL State, and Local UI State.
- Select the optimal network communication protocol (REST vs. GraphQL vs. Server-Sent Events vs. WebSockets vs. WebTransport).
- Proactively lead discussions on enterprise non-functional concerns: Accessibility (WCAG 2.2 AA), Internationalization (i18n), Security (CSP/XSS), and Real-User Monitoring (RUM).

---

## 3. Historical Evolution
```
+---------------------------------------------------------------------------------------------------+
| 2012 - 2016: The "Can You Build an Auto-Complete?" Era                                            |
| Interviews focused on small isolated UI widgets (dropdowns, carousels, debouncing).              |
| Evaluated basic JavaScript DOM manipulation, closures, and CSS layout skills.                     |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| 2017 - 2020: The SPA Architecture Explosion (Redux & Routing)                                     |
| Emergence of full SPA systems: "Design Twitter" or "Design Pinterest".                            |
| Focus shifted to client-side routing, state normalization (normalizr), and pagination.            |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| 2021 - Present: The Staff/Principal Scale Era (Distributed & Real-Time)                           |
| Modern prompts: "Design Figma Collaborative Canvas", "Design Netflix Streaming Engine",          |
| "Design Bloomberg Financial Terminal". Focus on CRDTs, Web Workers, WebAssembly, INP <200ms,      |
| Core Web Vitals, Edge Compute, and multi-tenant enterprise governance.                             |
+---------------------------------------------------------------------------------------------------+
```

---

## 4. First Principles & Intuitive Physical Analogies (Layer 1)
Think of frontend system design through physical engineering analogs:

### Analogy 1: The Commercial Airport Terminal (The Client Architecture)
Imagine designing an international airport terminal:
- **The Runway and Gate Concourses (Network Transport)**: Connecting foreign flights (Backend microservices) to passengers (Data payloads). Whether planes land once an hour (REST polling) or passenger tunnels remain open continuously (WebSockets), passengers must disembark smoothly.
- **The Customs & Border Gate (Security & Anti-Corruption Layer)**: Inbound passengers must be inspected (Zod schema validation) before entering the terminal so no malicious cargo enters domestic circulation.
- **The Baggage Carousels (State Management)**: Passengers pick up their luggage from organized, numbered carousels (Normalized stores) rather than sifting through a giant chaotic heap of unlabelled suitcases.
- **The Departure Hall (The View Layer)**: Clear signage, wheelchair ramps (Accessibility), and wide walkways (60 FPS rendering) ensure tens of thousands of travelers navigate without pedestrian gridlock.

### Analogy 2: The Master City Planner (The Interviewee Role)
An inexperienced builder starts laying bricks for one specific house on Day 1 without knowing if the city has water pipes or electricity.
A **Master City Planner** steps back with a blank blueprint:
1. First, they survey the population size and climate (Requirements & Constraints).
2. Second, they map zones: commercial, industrial, residential (High-Level Architecture).
3. Third, they lay underground water mains and electrical grids (Data Models & Network Contracts).
4. Fourth, they detail public transport and emergency services (Optimizations, Caching & Resilience).

---

## 5. Internal Working & Engine Architecture (Layer 2)

### The RADIO Framework: Time Budget Allocation (45-Minute Interview)
```
+------------------------------------------------------------------------------------+
| 00:00 - 05:00 | [ R ] REQUIREMENTS & SCOPE (Clarify, Triage, Budget)              |
+------------------------------------------------------------------------------------+
| 05:00 - 15:00 | [ A ] ARCHITECTURE (High-Level Component Topology & Module Flow)   |
+------------------------------------------------------------------------------------+
| 15:00 - 25:00 | [ D ] DATA MODEL & STORE NORMALIZATION (Client Entities & State)   |
+------------------------------------------------------------------------------------+
| 25:00 - 35:00 | [ I ] INTERFACE DEFINITION & APIS (REST/GraphQL/WS Protocols)      |
+------------------------------------------------------------------------------------+
| 35:00 - 45:00 | [ O ] OPTIMIZATIONS, RESILIENCE & SCALE (INP, Offline, Security)   |
+------------------------------------------------------------------------------------+
```

### Deep Dive into the 5 Pillars

#### 1. Requirements (R)
- **Functional Requirements**: What are the top 3 core user journeys? (e.g., View feed, Like post, Create post). Explicitly out-of-scope non-critical items (e.g., Stories, Direct Messaging).
- **Non-Functional Requirements**:
  - Performance: LCP <2.0s, INP <100ms, CLS <0.05.
  - Scale: 10 million daily active users; 100 updates/second.
  - Device/Network: Low-end mobile (Moto G4 on 3G) vs High-end Desktop.
  - Internationalization & Accessibility: RTL (Arabic/Hebrew), WCAG 2.2 AA screen reader compatibility.

#### 2. Architecture (A)
- Client Topology: Single Page App (Vite/CSR) vs Server-Driven (Next.js SSR/RSC) vs Micro-Frontend.
- Module Separation: Presentation Layer -> State Orchestration -> Data Access Repositories.

#### 3. Data Model (D)
- What state lives on the server vs client?
- Client State Taxonomy:
  1. **Server Cache** (TanStack Query): Products, Users, Feeds.
  2. **Global Client State** (Zustand): Active Theme, Shopping Cart.
  3. **URL State** (Query parameters): Filters, Search, Active Modal ID.
  4. **Ephemeral UI State** (useState): Dropdown open/close, hover tooltip.
- Store Normalization: relational tables (`byId: Record<string, T>`, `allIds: string[]`).

#### 4. Interface & Contracts (I)
- Network Transport: REST endpoints or GraphQL Queries/Mutations or WebSocket binary messages.
- Request/Response Payload Contracts with pagination (Cursor-based vs Offset-based).

#### 5. Optimizations & Resilience (O)
- Virtualization (windowing 10,000 items at 60 FPS).
- Main thread offloading via Web Workers (OffscreenCanvas, heavy parsing).
- Resilience: Error Boundaries, Offline FIFO Mutation Outbox, Optimistic rollbacks.

---

## 6. Runtime Flow & Execution Traces

### Trace: End-to-End Client Data Flow in an Enterprise System
```
Step 1: User performs action on UI (e.g. infinite scroll down newsfeed).
Step 2: IntersectionObserver triggers triggerFetchNextPage().
Step 3: State layer checks TanStack Query memory cache:
        - If cached and not stale -> returns cached items instantly (0ms latency).
        - If stale or absent -> invokes FeedRepository.getPage(cursor).
Step 4: Network layer dispatches HTTP GET with Authorization header & cursor:
        GET /api/v1/feed?cursor=cursor_992&limit=20
Step 5: Anti-Corruption Layer (Zod) parses response:
        Validates schema, transforms snake_case to camelCase domain models.
Step 6: Normalized Cache update:
        New posts appended to feed order array; individual post entities stored in byId map.
Step 7: Virtualizer re-computes visible DOM slice:
        Renders exactly 12 active DOM items into viewport; updates translateY offsets.
Step 8: Performance telemetry recorded:
        PerformanceObserver records INP and Frame Duration; beacons to RUM collector.
```

---

## 7. Memory Model & Client State Taxonomy

```
V8 BROWSER HEAP - CLIENT STATE TAXONOMY ARCHITECTURE

+--------------------------------------------------------------------------+
| 1. SERVER STATE CACHE (TanStack Query - 0x00A10F)                        |
| - Normalized Entities: {                                                 |
|     posts: { byId: { "p1": PostEntity, "p2": PostEntity } },             |
|     users: { byId: { "u1": UserEntity } }                                |
|   }                                                                      |
| - Invalidation Timers: staleTime: 5min, gcTime: 30min                    |
+--------------------------------------------------------------------------+
| 2. GLOBAL CLIENT STORE (Zustand - 0x00B290)                              |
| - userSession: { token: "...", tenantId: "tenant-99" }                   |
| - activePreferences: { theme: "dark", highContrast: false }              |
+--------------------------------------------------------------------------+
| 3. URL STATE (Browser History API)                                       |
| - URL: https://app.acme.com/feed?tab=latest&filter=unread&modal=settings |
| - Survives page refresh and back-button navigation                       |
+--------------------------------------------------------------------------+
| 4. TRANSIENT LOCAL UI STATE (React Fiber Tree)                           |
| - isHovered: true, activeDropdownIndex: 2                                |
| - Garbage collected on component unmount                                 |
+--------------------------------------------------------------------------+
```

---

## 8. Visual Diagrams (ASCII / Text)

### The Complete Frontend System Design Blueprint
```
+----------------------------------------------------------------------------+
|                          CLIENT PRESENTATION TIER                          |
|  [ Viewport Navigation ]   [ Virtualized List / Canvas ]   [ User Controls]|
+----------------------------------------------------------------------------+
                                      |
                                      v
+----------------------------------------------------------------------------+
|                       STATE & APPLICATION ORCHESTRATION                    |
|  [ URL State (nuqs) ]   [ Zustand (Client) ]   [ TanStack Query (Server) ] |
+----------------------------------------------------------------------------+
                                      |
                                      v
+----------------------------------------------------------------------------+
|                        DATA ACCESS & TRANSPORT TIER                        |
|  [ Repositories ] <---> [ Zod Validation Gate ] <---> [ HTTP/WS Client ]   |
+----------------------------------------------------------------------------+
           |                                                |
           v                                                v
+------------------------+                        +--------------------------+
| OFFLINE STORAGE TIER   |                        | NETWORK / EDGE GATEWAY   |
| [ IndexedDB / OPFS ]   |                        | [ Cloudflare Worker / ]  |
| - Mutation Outbox      |                        | [ Next.js Edge Route  ]  |
| - Entity Cache         |                        +--------------------------+
+------------------------+                                     |
                                                               v
                                                  [ Backend Microservices ]
```

---

## 9. Real World Usage & Production Patterns

> 🧪 **Companion Interactive Lab:** [CanvasDesignLab.tsx](../../apps/portal/src/features/visualizers/topic-11-system-design/CanvasDesignLab.tsx) | Live in Portal: topic-11-system-design

### Pattern 1: Normalized Store Schema Definition (TypeScript)
```typescript
// types/normalizedState.ts
export interface EntityTable<T> {
  byId: Record<string, T>;
  allIds: string[];
}

export interface PostEntity {
  id: string;
  authorId: string;
  content: string;
  likeCount: number;
  hasLiked: boolean;
  createdAt: number;
}

export interface UserEntity {
  id: string;
  displayName: string;
  avatarUrl: string;
}

export interface NormalizedFeedState {
  posts: EntityTable<PostEntity>;
  users: EntityTable<UserEntity>;
  feedOrder: string[]; // Ordered list of post IDs
}
```

### Pattern 2: Cursor-Based Pagination Request Contract
```typescript
// api/feedContracts.ts
import { z } from 'zod';

export const PostDTOSchema = z.object({
  id: z.string(),
  author_id: z.string(),
  body_text: z.string(),
  likes: z.number().int().nonnegative(),
  created_at: z.string().datetime()
});

export const FeedResponseSchema = z.object({
  items: z.array(PostDTOSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean()
});

export type FeedResponse = z.infer<typeof FeedResponseSchema>;
```

### Pattern 3: Resilient Offline Mutation Outbox Pattern
```typescript
// services/mutationOutbox.ts
export interface OutboxMutation {
  id: string;
  type: 'LIKE_POST' | 'CREATE_COMMENT';
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

export class OfflineMutationOutbox {
  private queue: OutboxMutation[] = [];

  enqueue(type: OutboxMutation['type'], payload: Record<string, unknown>) {
    const mutation: OutboxMutation = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0
    };
    this.queue.push(mutation);
    this.persistToIndexedDB();
    this.tryFlush();
  }

  async tryFlush() {
    if (!navigator.onLine || this.queue.length === 0) return;

    while (this.queue.length > 0) {
      const current = this.queue[0];
      try {
        await this.executeMutation(current);
        this.queue.shift(); // Remove on success
        this.persistToIndexedDB();
      } catch (err) {
        current.retryCount++;
        // Apply exponential backoff jitter before retrying
        break;
      }
    }
  }

  private async executeMutation(mutation: OutboxMutation) {
    // Dispatches HTTP request over network...
  }

  private persistToIndexedDB() {
    // Saves queue to IndexedDB using idb-keyval
  }
}
```

---

## 10. Angular Comparison
For an engineer transitioning from enterprise Angular:

| Architectural Concept | Enterprise Angular System Design | Modern React System Design |
| :--- | :--- | :--- |
| **Architectural Separation** | CoreModule, SharedModule, Lazy feature modules, NgModules. | Feature-Sliced Design (FSD), Monorepo packages, Next.js route segments. |
| **State Orchestration** | NgRx ComponentStore, NgRx Global Store, RxJS `BehaviorSubject` services. | TanStack Query for server cache + Zustand for client state + URL state. |
| **Change Detection Optimization**| `ChangeDetectionStrategy.OnPush`, NgZone runOutsideAngular, Angular Signals. | Virtualization, `useMemo`/`useCallback`, React Compiler, Concurrent transitions. |
| **Data Streaming** | RxJS Observables, WebSocketSubject, SSE via EventSource observables. | WebSockets with buffer batching, SSE via Fetch Streams, TanStack Query cache patching. |

---

## 11. .NET Comparison
For a Senior .NET / ASP.NET Core Architect:

| Architectural Concept | .NET Distributed Architecture | Frontend System Design Architecture |
| :--- | :--- | :--- |
| **BFF Layer** | ASP.NET Core Web API or YARP Reverse Proxy. | Next.js Edge Middleware / Route Handlers or Node.js BFF gateway. |
| **Message Streaming** | ASP.NET Core SignalR with Redis Backplane. | WebSocket client with reconnection jitter + ring buffer batching. |
| **Local Cache** | MemoryCache / Distributed Redis Cache. | TanStack Query in-memory cache + IndexedDB persistence. |
| **Contract Validation** | FluentValidation / DataAnnotations in controller pipelines. | Zod schema validation at the HTTP boundary. |

---

## 12. Enterprise Perspective & Production Risks (Layer 4)

### The Single Main Thread Saturation Trap
- In backend systems, a slow request merely blocks one thread in a 200-thread threadpool.
- In frontend architecture, **all code shares a single JavaScript thread**.
- If a developer parses a 50MB JSON payload or runs an un-indexed search on 50,000 items in the main thread:
  - The UI freezes completely for 800ms.
  - User typing, scrolling, and clicks are dropped.
  - Core Web Vitals **INP explodes past 800ms**, destroying Google search rankings.
- **Enterprise Mitigation**: Offload heavy computational work, AST parsing, and spatial indexing to dedicated **Web Workers**.

### Data Loss from Ephemeral State on Mobile
- Mobile browsers (Safari on iOS, Chrome on Android) aggressively kill background tabs to reclaim RAM.
- If a user spends 15 minutes typing a complex corporate incident report and switches apps to look up a two-factor auth code, iOS may purge the tab.
- If state was only in React `useState`, the user returns to a blank form and lost work.
- **Enterprise Mitigation**: Auto-save draft inputs to `localStorage` or `IndexedDB` on every debounced keystroke.

---

## 13. Performance Considerations
- **Cursor-Based vs. Offset-Based Pagination**: Offset pagination (`page=50&limit=20`) suffers severe performance degradation on large datasets and produces duplicate or skipped items when new records are inserted at the top. **Always advocate for Cursor-Based Pagination** (`cursor=post_9921`) in frontend system design interviews.
- **Payload Minimization (Sparse Fieldsets)**: When designing mobile interfaces, avoid over-fetching large nested objects. Design API contracts supporting field filtering or GraphQL fragments so mobile clients download only the bytes needed for the viewport.

---

## 14. Tradeoffs

| Architecture Choice | Primary Benefit | Operational Cost / Drawback |
| :--- | :--- | :--- |
| **Cursor Pagination** | Immune to record drift; fast DB index lookups; infinite scroll optimal. | Cannot jump directly to arbitrary page numbers (e.g. Page 42). |
| **Web Workers** | Keeps main thread at 60 FPS; prevents INP freezes during heavy computation. | Serialization overhead (structured clone) passing data across postMessage. |
| **Normalized State** | Eliminates data inconsistency; updating one entity updates all UI views. | Requires mapping logic; selectors must compose denormalized trees for render. |
| **WebSockets** | Sub-millisecond bidirectional real-time push events. | Heavy server connection state; requires heartbeat reconnection management. |

---

## 15. Common Mistakes & Interview Traps
- **Trap 1: Designing a backend system instead of a frontend system.**
  - *Symptom*: Spending 30 minutes discussing Kafka partitions, Redis caches, and SQL sharding while completely ignoring UI components, state normalization, and browser rendering.
  - *Fix*: Keep the focus on the browser, the DOM, state modeling, network contracts, and user interactions.
- **Trap 2: Jumping straight into React component code.**
  - *Symptom*: Opening the interview by writing `const [data, setData] = useState()` before clarifying requirements.
  - *Fix*: Follow the RADIO framework: requirements first, then architecture, then state models.
- **Trap 3: Ignoring non-functional requirements (Offline, A11y, Performance).**
  - *Symptom*: Designing an app that works only under ideal conditions with infinite bandwidth and a 4K monitor.
  - *Fix*: Proactively bring up slow network handling, offline caching, and WCAG accessibility.

---

## 16. Interview Questions & Architectural Answers (Senior, Lead, Architect - Layer 5)

### Question 1 (Senior Level): How do you structure the first 5 minutes of a Frontend System Design interview?
**Answer**:
I spend the first 5 minutes on **Requirements Clarification and Scope Negotiation**:
1. **Clarify Core Functional Scope**: I ask targeted questions to identify the 2 or 3 most critical user flows (e.g. for Instagram: browsing the feed, uploading a photo, liking/commenting). I explicitly negotiate out-of-scope features (e.g., direct messaging, live video streaming).
2. **Establish Non-Functional Constraints**:
   - Device & Network: Are we targeting low-end mobile web on 3G, or desktop enterprise power-users on high-speed fiber?
   - Scale & Performance: What are our target Core Web Vitals (LCP <2s, INP <100ms)? What is the peak read/write throughput?
   - Availability: Does this application require offline capability (Local-First) or read-only offline fallback?
3. **Align on the High-Level Agenda**: I state my roadmap: "I will outline our high-level component architecture, model our client state and API contracts, and then deep-dive into virtualization, caching, and performance optimizations."

### Question 2 (Lead Level): When designing a real-time collaborative application, how do you decide between WebSockets and Server-Sent Events (SSE)?
**Answer**:
I evaluate the **Directionality and Protocol Overhead**:
1. **Server-Sent Events (SSE)**:
   - **Characteristics**: Unidirectional (server-to-client only), runs over standard HTTP/2 and HTTP/3, native browser reconnection via `EventSource`, automatic polyfilling, and seamless traversal of enterprise corporate firewalls/proxies.
   - **Best Fit**: Scenarios where data flows primarily one way (e.g. live financial ticker updates, notification feeds, AI LLM token streaming). Client writes are handled via standard HTTP POST calls.
2. **WebSockets**:
   - **Characteristics**: Full-duplex bidirectional communication over a single persistent TCP connection, custom framing protocol (`ws://`), lower per-message byte overhead (2-byte header vs HTTP headers).
   - **Best Fit**: High-frequency, bidirectional interactions where client writes must be acknowledged in single-digit milliseconds (e.g. multiplayer collaborative whiteboard cursors, gaming, instant chat).
For collaborative canvases (Figma), WebSockets is required due to high-frequency client mouse movements. For an activity feed or notification center, SSE is far superior due to HTTP/2 multiplexing and firewall compatibility.

### Question 3 (Architect Level): How do you architect a frontend application to guarantee sub-100ms INP when handling 1,000 real-time streaming updates per second?
**Answer**:
To handle 1,000 updates/sec without freezing the main thread:
1. **Ring Buffer Batching via `requestAnimationFrame`**: Never re-render or dispatch updates into React on every incoming WebSocket message. Instead, incoming events are pushed into an in-memory ring buffer. On every animation frame (every 16.6ms), a batch processor flushes and aggregates the updates into a single state update, reducing render triggers from 1,000/sec to 60/sec.
2. **Web Worker Offloading**: Raw message decompression, JSON parsing, and delta computation execute in a dedicated Web Worker, keeping the main thread free for DOM rendering.
3. **DOM Virtualization with Dynamic Windows**: The UI renders only the items visible in the viewport using `@tanstack/react-virtual`, recycling DOM nodes and bounding Blink memory.
4. **Main Thread Yielding**: Heavy batch reconciliation uses `scheduler.yield()` to yield control back to the browser between chunks, ensuring pending user clicks and keypresses are handled within 16ms.

---

## 17. Senior-Level Mental Model & "How to Remember This Forever" (Memory Anchors - Layer 3)

### The "RADIO Acronym" Rule
- **R** — **Requirements**: Clarify functional scope, devices, and Core Web Vitals budgets.
- **A** — **Architecture**: High-level component decomposition and client-server topology.
- **D** — **Data Model**: Normalized client stores, state taxonomy, and offline cache.
- **I** — **Interface**: API contracts, cursor pagination, and network transport protocols.
- **O** — **Optimizations**: Virtualization, Web Workers, INP tuning, and error resilience.

---

## 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)
- **RADIO Framework**: Standardized 5-step methodology for frontend system design interviews.
- **Cursor Pagination**: Pagination strategy referencing a unique record pointer rather than an offset index.
- **State Taxonomy**: Categorizing state by ownership and persistence: Server Cache, Global Client, URL, Local UI.
- **Actionability**: Playwright criteria verifying element readiness before dispatching clicks.
- **Mutation Outbox**: A persistent queue storing offline mutations to be synchronized upon network reconnection.

---

## 19. Key Takeaways
- Always follow the structured RADIO framework to prevent disorganized interview answers.
- Distinguish between Server Cache, Global Client State, URL State, and Local UI State.
- Prefer cursor-based pagination over offset pagination for real-time infinite feeds.
- Protect the single JavaScript main thread from saturation using batching, Web Workers, and virtualization.
- Proactively lead discussions on enterprise non-functional requirements (Accessibility, Security, RUM).

---

## 20. Revision Sheet
- **Q: What does the RADIO acronym stand for in frontend system design?**
  *A:* Requirements, Architecture, Data Model, Interface/APIs, Optimizations.
- **Q: Why is offset pagination problematic for real-time feeds?**
  *A:* If new items are inserted at the top, items shift across page boundaries, resulting in duplicate or skipped records for the user.
- **Q: Which state storage mechanism should be used for shareable filter and modal parameters?**
  *A:* URL state (query parameters).
- **Q: When should Server-Sent Events (SSE) be preferred over WebSockets?**
  *A:* When data streaming is primarily unidirectional (server-to-client), as SSE runs over standard HTTP/2 and handles auto-reconnections natively.
- **Q: How do you prevent high-frequency WebSocket streams (1,000 msgs/sec) from crashing the React main thread?**
  *A:* By collecting messages into an in-memory buffer and batching updates once per animation frame (`requestAnimationFrame` at 60 FPS).
