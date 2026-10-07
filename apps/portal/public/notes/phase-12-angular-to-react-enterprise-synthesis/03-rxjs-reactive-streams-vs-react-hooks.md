# 03: RxJS Reactive Streams vs React Hooks & State Primitives

---

## 1. Why This Topic Exists

For an engineer with extensive experience in **Angular**, reactivity is virtually synonymous with **RxJS** (`Observable`, `Subject`, `BehaviorSubject`, and pipeline operators like `switchMap`, `debounceTime`, `combineLatest`). In Angular, asynchronous data flow is modeled as a continuous, push-based stream through which values travel over time. The template connects to these streams declaratively using the `| async` pipe.

When an Angular engineer transitions to React, they immediately encounter a radical paradigm shift: **React does not use Observables for component reactivity.** Instead, React models reactivity as **Declarative Re-render Cycles driven by Hooks and Closures**.

Attempting to force RxJS patterns directly into React components without understanding React's native execution model produces catastrophic antipatterns:
1. Creating subscriptions inside component bodies without proper cleanup, triggering massive memory leaks.
2. Manually forcing component re-renders on every `stream$.next()` using dummy state (`const [, forceUpdate] = useState()`), creating uncoordinated render cascades.
3. Suffering from UI tearing under React 18/19 Concurrent rendering because raw RxJS subscriptions violate `useSyncExternalStore` invariants.
4. Over-engineering simple form inputs with multi-operator RxJS pipelines when a simple `useState` or `useDeferredValue` achieves identical behavior with 90% less code.

This chapter provides the definitive architectural bridge between **Push-Based Reactive Streams (RxJS)** and **Pull-Based Declarative Re-render Projections (React Hooks)**.

---

## 2. Learning Objectives

By the end of this chapter, you will be able to:
- Contrast the push-based stream topology of RxJS with React's pull-based functional execution model.
- Translate every major RxJS operator (`switchMap`, `debounceTime`, `combineLatest`, `distinctUntilChanged`, `catchError`) into idiomatic React hooks.
- Replace Angular's Async Pipe (`| async`) with modern React server state patterns (TanStack Query) and concurrent state primitives.
- Integrate RxJS safely into React using the W3C-compliant `useSyncExternalStore` hook without risking UI tearing.
- Model complex asynchronous race conditions using `AbortController` inside `useEffect` cleanup closures.
- Map browser reactive paradigms to .NET `System.Reactive` (Rx.NET) and `System.Threading.Channels`.

---

## 3. Historical Evolution

The relationship between web frameworks and reactive programming has evolved through three distinct eras:

1. **The Comprehensive RxJS Standard Era (Angular 2+ / 2016–2021):**
   Angular standardized on ReactiveX (`rxjs`). Routing events, HTTP client requests (`HttpClient.get()`), reactive forms (`valueChanges`), and state management (NgRx) were all modeled as Observables. Mastering Angular required mastering cold vs hot observables, higher-order mapping operators (`switchMap` vs `mergeMap` vs `concatMap`), and defensive unsubscription strategies (`takeUntil(this.destroy$)`).
2. **The React Hooks Revolution (React 16.8 / 2019):**
   React introduced Hooks (`useState`, `useEffect`, `useReducer`), deliberately rejecting external stream abstractions. React argued that UI is a function of state snapshot projections (`UI = f(State)`). Rather than piping streams through intermediate operators, components re-evaluate as clean functional closures whenever their dependencies update.
3. **The Convergence & Concurrent Invariant Era (2022–Present):**
   React 18 introduced Concurrent features (`startTransition`, `useDeferredValue`) and standardized `useSyncExternalStore` to connect external reactive stores (including RxJS) safely to Fiber without UI tearing. Meanwhile, Angular 16+ introduced **Signals**, reducing its own internal reliance on complex RxJS pipelines for simple synchronous UI state.

---

## 4. First Principles & Intuitive Physical Analogies (Layer 1)

### The Continuous Pressurized Pipe vs The Strobe-Lit Photo Studio

Imagine two different ways to monitor a dynamic sporting event:
- **The RxJS Model (The Pressurized Water Pipeline):**
  - Data is liquid under pressure flowing through a continuous network of clear pipes (the Observable stream).
  - Along the pipe, you install valves, filters, and junctions:
    - A pressure damper: `debounceTime(300)`
    - A selective filter: `filter(val => val > 10)`
    - A diversion valve that dumps old water when new water rushes in: `switchMap()`
  - The destination is a water wheel (`subscribe()`). The water actively *pushes* the wheel whenever it moves. If you forget to close the drain valve when leaving the room (`unsubscribe()`), the factory floods (memory leak).
- **The React Model (The Strobe-Lit Photographic Studio):**
  - There are no pipes, no flowing water, and no valves.
  - The studio is dark. Whenever an event occurs (a batter hits a ball), a strobe flash fires.
  - The camera captures a single, frozen photograph of the entire field at that exact microsecond (`Render Frame Snapshot`).
  - The photographer inspects the photograph from top to bottom, notes what changed compared to the last photo, and hangs the new picture on the wall.
  - Between strobe flashes, **absolutely nothing is running**. There are no background pipes pressurized on the heap.

---

## 5. Internal Working & Engine Architecture (Layer 2)

### The Master RxJS to React Primitive Rosetta Stone

| RxJS Primitive / Pattern | Angular Usage Pattern | Idiomatic React Equivalent | Runtime Execution Difference |
| :--- | :--- | :--- | :--- |
| **`BehaviorSubject<T>`** | Holds current value; emits to new subscribers immediately. | **`useState<T>` / `useReducer`** | `BehaviorSubject` is a persistent mutable heap record; `useState` retrieves state from Fiber's `memoizedState` on each render pass. |
| **`switchMap()`** | Cancels previous in-flight asynchronous observable when a new value arrives. | **`useEffect` with `AbortController`** or **TanStack Query** | `switchMap` unsubscribes the previous inner observable; React invokes the previous effect's cleanup closure before running the new effect. |
| **`debounceTime(300)`** | Delays emission until 300ms of silence. | **`useDebounce()` hook** or **`useDeferredValue`** | RxJS uses internal timer operators; React uses `setTimeout` inside effect closures or low-priority Concurrent Lanes. |
| **`combineLatest([a$, b$])`** | Emits latest values whenever either source emits. | **Evaluating variables in render body** | RxJS tracks latest cached emissions in memory; React simply reads both state variables in the same component execution frame. |
| **`distinctUntilChanged()`** | Suppresses identical consecutive values. | **`Object.is()` / `React.memo`** | RxJS compares consecutive stream emissions; React enforces shallow reference checks before scheduling reconciliation. |
| **`catchError()`** | Intercepts stream failure; returns fallback observable. | **`try/catch` in async effects** or **`ErrorBoundary`** | RxJS routes errors through the observer's error channel; React catches rendering errors at Fiber boundary components. |
| **`takeUntilDestroyed()`** | Auto-unsubscribes when component destroys. | **`useEffect` cleanup return (`return () => ...`)** | Angular hooks into `DestroyRef`; React executes the returned cleanup function when Fiber unmounts. |
| **Async Pipe (`\| async`)** | Automatically subscribes in template and unwraps latest value. | **`useQuery()` / Native hook state read** | Angular marks view for check on emission; React re-executes component function on state update. |

---

## 6. Runtime Flow & Execution Traces

Let us compare an auto-complete search box handling rapid user keystrokes:

### The Angular RxJS Pipeline (`switchMap` + `debounceTime`)

```
Keystroke "r" -> valueChanges emits "r"
Keystroke "re" -> valueChanges emits "re" (Timer reset)
Keystroke "rea" -> valueChanges emits "rea"
  │
  ▼ debounceTime(300) holds execution for 300ms
  │
  ▼ distinctUntilChanged() verifies value is new
  │
  ▼ switchMap() cancels previous HTTP request #1, dispatches HTTP #2
  │
  ▼ HTTP #2 completes -> Emits results array
  │
  ▼ Async pipe receives emission -> cdr.markForCheck() -> UI updates
```

### The React Hooks Pipeline (`useState` + `useEffect` with `AbortController`)

```
User types "r"   -> setQuery("r")   -> Render 1: query="r", debouncing timer scheduled
User types "re"  -> setQuery("re")  -> Cleanup 1 runs (cancels timer); Render 2 schedules timer
User types "rea" -> setQuery("rea") -> Cleanup 2 runs (cancels timer); Render 3 schedules timer
  │
  ▼ 300ms elapses without input -> setTimeout callback fires
  │
  ▼ Dispatches search fetch with new AbortController
  │
  ▼ If user types again mid-flight:
    useEffect cleanup fires -> controller.abort() cancels network socket!
  │
  ▼ Fetch resolves -> setResults(data) -> Render 4 renders results
```

---

## 7. Memory Model & Heap Layout

```
ANGULAR RXJS HEAP TOPOLOGY (Stream Graphs & Closures):
+---------------------------------------------------------------+
| V8 Heap (Persistent Observer Graph)                          |
|                                                               |
|  [ SearchComponent Instance ]                                 |
|    ├── searchControl.valueChanges (Subject)                   |
|    │     └── Observers: [ DebounceOperator ]                  |
|    │           └── Observers: [ SwitchMapOperator ]           |
|    │                 └── Observers: [ AsyncPipe Subscriber ]  |
|    └── activeSubscription: Subscription (Kept alive in memory)|
|                                                               |
|  * Must be explicitly unsubscribed or memory leaks occur      |
+---------------------------------------------------------------+

REACT HOOKS HEAP TOPOLOGY (Fiber Node & Ephemeral Closures):
+---------------------------------------------------------------+
| FiberNode (Persistent Framework Record)                       |
|   ├── memoizedState -> [ query: "rea" ] -> [ results: [...] ] |
|   └── updateQueue   -> Scheduled update actions               |
+---------------------------------------------------------------+
| Call Stack & Microtask Queue:                                 |
|   Active AbortController signal listening to network socket   |
|   Stack frames discard after render evaluation (< 1ms)        |
+---------------------------------------------------------------+
```

---

## 8. Visual Diagrams (ASCII / Text)

### Safely Connecting RxJS to React via `useSyncExternalStore`

```
+-----------------------------------------------------------------+
| EXTERNAL RXJS STREAM (Module or Service Scope)                 |
| const marketFeed$ = new BehaviorSubject<PriceTick>(initial);    |
+-----------------------------------------------------------------+
                                |
                                | subscribe(notifyReact)
                                v
+-----------------------------------------------------------------+
| useSyncExternalStore (React 18/19 Concurrent Bridge)            |
|                                                                 |
|   1. subscribe: (callback) => marketFeed$.subscribe(callback)   |
|   2. getSnapshot: () => marketFeed$.getValue()                  |
|                                                                 |
|   * Guarantees ZERO UI Tearing under Concurrent Time-Slicing    |
|   * Bypasses useEffect latency; synchronous read on render      |
+-----------------------------------------------------------------+
                                |
                                v
+-----------------------------------------------------------------+
| REACT COMPONENT (Pure Functional Projection)                    |
| const price = useSyncExternalStore(subscribe, getSnapshot);     |
| return <div>${price.amount}</div>;                              |
+-----------------------------------------------------------------+
```

---

## 9. Real World Usage & Production Patterns

> 🧪 **Companion Interactive Lab:** [CanvasDesignLab.tsx](../../apps/portal/src/features/visualizers/topic-11-system-design/CanvasDesignLab.tsx) | Live in Portal: topic-11-system-design

### Side-by-Side Architectural Transformation: Auto-Complete Search Box

Below is a complete, production-grade enterprise comparison translating an Angular RxJS search component into idiomatic React:

#### 1. The Angular RxJS Search Component (`search.component.ts`)

```typescript
// Angular 17+ RxJS Pipeline
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, takeUntil } from 'rxjs/operators';
import { SearchService, SearchResult } from '../services/search.service';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="search-box">
      <input [formControl]="searchControl" placeholder="Search enterprise catalog..." />
      
      <div *ngIf="loading" class="spinner">Searching...</div>

      <ul *ngIf="results$ | async as results">
        <li *ngFor="let item of results">{{ item.title }}</li>
      </ul>
    </div>
  `
})
export class SearchBoxComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  results$!: Observable<SearchResult[]>;
  loading = false;

  private destroy$ = new Subject<void>();
  private searchService = inject(SearchService);

  ngOnInit(): void {
    this.results$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => {
        if (!query || query.trim().length < 2) {
          return of([]);
        }
        this.loading = true;
        return this.searchService.search(query).pipe(
          catchError(() => of([])),
          // Side-effect cleanup
          switchMap(res => { this.loading = false; return of(res); })
        );
      }),
      takeUntil(this.destroy$) // Defensive unsubscription
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

#### 2. The Idiomatic React 19 Search Component (`SearchBox.tsx`)

```typescript
// React 19 Functional Search with AbortController
import React, { useState, useEffect } from 'react';
import { searchCatalogApi, SearchResult } from '../api/searchApi';

export const SearchBox: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // 1. Guard against short inputs
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    // 2. AbortController replaces RxJS switchMap cancellation
    const abortController = new AbortController();

    // 3. setTimeout replaces RxJS debounceTime(300)
    const debounceTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchCatalogApi(query, {
          signal: abortController.signal,
        });
        setResults(data);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Search query failed:', err);
          setResults([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    // 4. Cleanup function replaces takeUntil / unsubscribe
    return () => {
      clearTimeout(debounceTimer);
      abortController.abort(); // Automatically cancels in-flight fetch!
    };
  }, [query]);

  return (
    <div className="search-box">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search enterprise catalog..."
      />

      {loading && <div className="spinner">Searching...</div>}

      <ul>
        {results.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
};
```

---

## 10. Angular Comparison

For an experienced Angular developer, the cognitive friction centers on unlearning the "Stream Piping" mindset:

| Angular RxJS Strategy | Operational Mechanic | React Strategic Realignment |
| :--- | :--- | :--- |
| **`valueChanges.pipe(...)`** | Form control emits stream of characters piped through operators. | Input binds directly to `value` and `onChange`; debounce managed via custom hook or `useEffect`. |
| **`switchMap` for Auto-Cancellation** | Discarding previous observable execution when new action arrives. | Native browser **`AbortController`** passed to `fetch(url, { signal })` and triggered in effect cleanup. |
| **Async Pipe Unwrapping** | Template handles subscription, dirty checking notification, and unsubscription. | Component reads state directly; **TanStack Query (`useQuery`)** handles caching, re-fetching, and cancellation. |
| **`combineLatest` Synchronization** | Waiting for all streams to emit before evaluating template expressions. | React components evaluate all state variables synchronously within the same render function body. |

---

## 11. .NET Comparison

For engineers experienced with .NET, RxJS maps to Rx.NET (`System.Reactive`), while React Hooks align with async delegates and Task-based programming:

| .NET / C# Architecture Pattern | Angular RxJS Equivalent | React Hooks Equivalent |
| :--- | :--- | :--- |
| **`IObservable<T>` / `IObserver<T>` (Rx.NET)** | `Observable<T>` / `Observer<T>`. | Push streams are abstracted away; components render discrete snapshots. |
| **`CancellationTokenSource` / `CancellationToken`** | `takeUntil(destroy$)` or `switchMap()`. | **`AbortController` / `signal`** inside `useEffect` cleanup. |
| **`System.Threading.Channels.Channel<T>`** | `Subject<T>` / `BehaviorSubject<T>`. | External state store (Zustand / EventTarget) bound via `useSyncExternalStore`. |
| **LINQ Operators (`.Throttle()`, `.DistinctUntilChanged()`)** | RxJS pipe operators (`debounceTime()`, `distinctUntilChanged()`). | Memoization primitives (`useMemo`, `React.memo`) or utility hooks. |

---

## 12. Enterprise Perspective & Production Risks (Layer 4)

Deploying reactive applications in enterprise environments carries distinct failure modes:

### 1. The Stale Closure Race Condition in Asynchronous Streams
- **The Risk:** An engineer subscribes to an external event stream inside `useEffect`, but the subscription callback reads a local state variable that changes frequently.
- **The Failure Mode:** The callback closes over the initial render's state value and **never sees subsequent updates**. The user submits outdated data.
- **The Enterprise Defense:** Either list all read variables in the effect's dependency array (forcing clean re-subscription), store the latest value in a mutable `useRef`, or use functional state updaters: `setState(prev => calculate(prev, streamVal))`.

### 2. UI Tearing under Concurrent React
- **The Risk:** Subscribing to an external RxJS store using naive `useState` inside a standard `useEffect` listener.
- **The Failure Mode:** Under React 18/19 Concurrent Mode, React may pause rendering to handle an urgent user event. If the external RxJS store emits a new value while rendering is suspended, different components on the screen read different versions of the state, causing **UI Tearing** (inconsistent visual data).
- **The Enterprise Defense:** Always use the official W3C/React primitive **`useSyncExternalStore`** when subscribing to external stores, guaranteeing atomic snapshots across concurrent work trees.

---

## 13. Performance Considerations

```
STREAM VS HOOKS PERFORMANCE BUDGET:
-------------------------------------------------------------
Memory Footprint:         RxJS Stream: Operator closure chain retained on heap
                          React Hook: Ephemeral stack execution (< 1ms)
Garbage Collection:       RxJS: Minor allocations per emitted stream packet
                          React: Cleaned during minor GC scavenge
Concurrent Safety:        RxJS raw: Risk of UI Tearing without useSyncExternalStore
                          React Native: 100% Concurrent-safe by default
-------------------------------------------------------------
```

### Strategic Optimizations:
1. **Prefer TanStack Query over Custom Effect Pipelines:**
   Building custom auto-cancellation, deduplication, and retry logic with `useEffect` is error-prone. In enterprise React, use **TanStack Query** (`useQuery`), which handles request cancellation, caching, and background revalidation natively.
2. **When to Retain RxJS in React:**
   Keep RxJS exclusively for complex, continuous multi-event choreography: 60 FPS drag-and-drop spatial coordinate transformations, real-time audio waveform processing, or high-throughput telemetry streams where operator composition is genuinely superior to component re-renders.

---

## 14. Tradeoffs

| Architecture Choice | Advantages | Costs / Tradeoffs |
| :--- | :--- | :--- |
| **RxJS Reactive Streams** | Exceptional for complex time-based event choreography; unified cancellation model; pure mathematical composition. | Extreme learning curve; complex operator mastery; high risk of memory leaks if unsubscriptions are missed. |
| **Native React Hooks** | Vastly simpler mental model; zero external dependencies; pure functional components; seamless TypeScript inference. | Asynchronous race conditions require manual `AbortController` wiring; effect dependencies require strict discipline. |
| **TanStack Query (Server State)** | Eliminates 95% of manual asynchronous effects; automatic caching, deduplication, and cancellation. | Adds a 12 KB library dependency; opinionated query key serialization model. |

---

## 15. Common Mistakes & Interview Traps

- **Trap 1: Subscribing to an Observable inside the component render body.**
  *Why it fails:* Calling `observable$.subscribe()` directly in the render body creates a new subscription on *every single render pass*. A component that renders 10 times creates 10 duplicate active subscriptions! Subscriptions must only occur inside `useEffect` or `useSyncExternalStore`.
- **Trap 2: Forgetting to abort fetch requests on dependency changes.**
  *Why it fails:* If a user types "apple", then quickly types "banana", the "apple" request might arrive *after* the "banana" request due to network jitter, overwriting the search results with the stale query. Always use `AbortController`.
- **Trap 3: Using RxJS `Subject` as a generic event bus across React components.**
  *Why it fails:* Global event buses bypass React's unidirectional data flow, making state changes invisible to DevTools and breaking time-travel debugging. Use React Context or Zustand.

---

## 16. Interview Questions & Architectural Answers

### Question 1 (Senior Level): How do you handle race conditions in React when performing asynchronous searches, and how does this compare to RxJS `switchMap`?
**Answer**:
- **In RxJS:** The `switchMap` operator naturally handles race conditions by unsubscribing from the previous inner observable whenever the outer source emits a new value. When a new keystroke arrives, the previous HTTP request is automatically canceled or discarded, ensuring only the latest response is processed.
- **In React:** We achieve the identical guarantee using the native browser **`AbortController`** inside `useEffect`:
  1. At the start of the effect, we instantiate `const controller = new AbortController();`.
  2. We pass `controller.signal` to `fetch(url, { signal })`.
  3. In the effect's cleanup function (`return () => controller.abort()`), we abort the controller.
  When the query changes, React runs the cleanup function *before* executing the next effect, instantly aborting the previous in-flight network socket at the browser TCP layer.
- **In Enterprise Production:** We leverage **TanStack Query**, which binds the query string to the query key (`queryKey: ['search', query]`). TanStack Query automatically aborts previous in-flight requests and handles response caching out of the box.

### Question 2 (Lead Level): What is UI Tearing, and why does subscribing to an external RxJS store require `useSyncExternalStore` in React 18/19?
**Answer**:
- **UI Tearing Definition:** UI Tearing occurs when a single visual frame displays contradictory data from two different versions of the same state (e.g., a header displays "Balance: $100" while an account summary table on the same screen displays "Balance: $50").
- **Why it Occurs in Concurrent React:** In React 18/19, the reconciler can pause rendering a low-priority transition to let the browser handle an urgent event (like a keystroke). If an external RxJS store emits an update during this pause, components rendered *before* the pause read State Version 1, while components rendered *after* the pause read State Version 2, tearing the UI.
- **The Role of `useSyncExternalStore`:** `useSyncExternalStore` is React's official bridge for external state systems. It enforces a strict contract:
  1. A synchronous snapshot getter (`getSnapshot`) that returns an immutable reference.
  2. If the snapshot mutates mid-render, React detects the mismatch and automatically **re-starts the render synchronously**, guaranteeing that all components on the screen render against the exact same immutable state snapshot.

### Question 3 (Architect Level): Under what architectural circumstances would you recommend retaining RxJS inside a React enterprise application?
**Answer**:
We recommend retaining RxJS in React only under three specific architectural conditions:
1. **Complex Multi-Stream Event Choreography:** When building rich desktop-grade web applications (such as a CAD canvas, interactive diagramming tool, or DAW audio mixer) where user interactions involve coordinating multiple distinct event streams (e.g., `dragStart$.pipe(switchMap(() => mouseMove$.pipe(takeUntil(mouseUp$))))`). Modeling this declaratively in React hooks requires unwieldy ref plumbing.
2. **High-Frequency Real-Time Telemetry:** In financial trading terminals or IoT telemetry monitors receiving thousands of ticks per second, RxJS operators like `bufferTime(16, animationFrameScheduler)`, `sampleTime()`, and `windowTime()` provide unparalleled declarative stream coalescing before data ever reaches the UI layer.
3. **Shared Cross-Platform Domain Core:** If an enterprise maintains a shared TypeScript core library consumed by both an existing Angular web app and a new React / React Native app, business domain services can continue exposing Observables, while React components wrap them cleanly using custom hooks powered by `useSyncExternalStore`.

---

## 17. Senior-Level Mental Model & "How to Remember This Forever" (Memory Anchors)

### The "Pressurized Water Pipe vs Strobe-Lit Photo Studio" Anchor
- **RxJS:** Continuous pressurized water pipes. Data pushes through valves and filters. You must remember to close the valve (`unsubscribe`) or the factory floods.
- **React Hooks:** A dark photo studio with a strobe flash. Whenever something changes, the flash fires once, capturing a frozen photograph of the field (`Render Snapshot`). Between flashes, no water is running, and no pipes exist.

---

## 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)

- **Push vs Pull Reactivity:** RxJS *pushes* data to active listeners; React *pulls* state values during component function re-execution.
- **AbortController:** Web Standard interface allowing JavaScript to abort in-flight DOM requests and network streams.
- **UI Tearing:** Visual inconsistency where different UI components render different versions of the same external state in a single screen frame.
- **`useSyncExternalStore`:** React primitive for safely subscribing to external mutable stores without risking UI tearing during concurrent time-slicing.
- **Render Snapshot:** The immutable state closure captured by a component function during a single execution pass.

---

## 19. Key Takeaways

1. **Snapshots Over Streams:** React models reactivity as discrete render snapshots rather than continuous stream pipelines.
2. **`AbortController` Replaces `switchMap`:** Use the native browser `AbortController` in effect cleanup closures to cancel stale network requests.
3. **Bridge with `useSyncExternalStore`:** When integrating RxJS or external stores into React, always use `useSyncExternalStore` to prevent Concurrent UI tearing.
4. **Synchronous Derivation:** Never create RxJS subject pipelines simply to combine two state values; evaluate them directly in the component render body.
5. **Use TanStack Query for Server State:** Eliminate complex asynchronous effect plumbing by adopting TanStack Query for server state caching, deduplication, and auto-cancellation.

---

## 20. Revision Sheet

- **Q: What React hook replaces the unsubscription logic in Angular's `ngOnDestroy()` or `takeUntilDestroyed()`?**
  *A:* The cleanup return function of `useEffect` (`return () => { ... }`).
- **Q: What is the primary risk of using standard `useEffect` to subscribe to an external RxJS store in React 18/19?**
  *A:* UI Tearing under Concurrent rendering, where components render inconsistent snapshots of external state.
- **Q: How do you achieve the equivalent of RxJS `switchMap` in React?**
  *A:* By using `AbortController` inside `useEffect` and calling `controller.abort()` in the effect cleanup function.
- **Q: What is the React equivalent of Angular's `BehaviorSubject`?**
  *A:* `useState()` for local state, or an external store (Zustand) for shared state.
- **Q: When should RxJS still be considered in a modern React application?**
  *A:* For complex event choreography (drag-and-drop, audio/canvas tools) and high-frequency real-time stream aggregation.
