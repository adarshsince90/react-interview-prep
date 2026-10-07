# Chapter 04: Layout Thrashing & Forced Synchronous Reflow (Batching DOM Reads/Writes, `requestAnimationFrame`, FastDOM Patterns & `ResizeObserver`)

> "The browser is naturally lazy: it buffers DOM mutations and defers layout calculations until the end of the frame. But when your code interleaves DOM writes with geometric reads, you force the browser into panic mode—triggering dozens of full-document layout recalculations within a single frame. This is Layout Thrashing: the number-one killer of web animation performance."  
> — **Browser Runtime Engine Internals**

---

## 1. Why This Topic Exists

Under normal circumstances, the browser buffers DOM mutations. If your JavaScript mutates the styles of 50 elements, the browser does not calculate layout 50 times; it marks the elements as "dirty" and executes **a single, consolidated layout calculation** right before the next paint.

However, a devastating performance anti-pattern occurs when code **interleaves DOM writes with DOM reads**:
```javascript
// THE DEADLY LAYOUT THRASHING LOOP
elements.forEach((el) => {
  el.style.width = '200px';       // 1. WRITE (Invalidates Layout)
  const height = el.offsetHeight; // 2. READ  (Forces Synchronous Reflow!)
});
```

When JavaScript reads `el.offsetHeight`, the browser cannot return yesterday's cached height—it must return the truth based on the new `200px` width. Because styles are dirty, the browser **freezes JavaScript execution mid-statement, executes an expensive, full-document layout calculation immediately**, returns the number, and then proceeds.

If this loop runs 50 times, the browser executes **50 full-document layouts in a single frame**! On mobile devices, this inflates execution time from 2 milliseconds to **350 milliseconds**, causing catastrophic frame drops, frozen scroll gestures, and high Interaction to Next Paint (**INP**) penalties.

---

## 2. Learning Objectives

- Dissect the internal engine mechanics of **Forced Synchronous Reflow (FSR)** and dirty-bit marking in the Blink engine.
- Identify the complete catalog of DOM properties and methods that force a synchronous layout flush (`offsetWidth`, `clientHeight`, `getBoundingClientRect`, `getComputedStyle`, etc.).
- Master the **Read-First, Write-Second** batching pattern to eliminate layout thrashing permanently.
- Architect high-performance animation and measurement loops using **`requestAnimationFrame` (rAF)** and **FastDOM** queuing patterns.
- Leverage modern **`ResizeObserver`** and CSS **`contain: layout`** to isolate layout calculations and prevent global document reflows.
- Profile and diagnose red "Forced Reflow" warning indicators in the **Chrome DevTools Performance Panel**.
- Bridge architectural mental models directly to **Angular** (CD cycles vs direct DOM reads) and **.NET** (WPF `UpdateLayout()` forced measure passes).

---

## 3. Historical Evolution

```text
ERA 1: Unaware Procedural DOM Manipulation (1995 - 2012)
┌────────────────────────────────────────────────────────┐
│ jQuery era ($el.width(w); const h = $el.height()).     │
│ - Zero understanding of layout caching.                │
│ - Plugins constantly interleaved reads and writes.     │
│ - Result: Pervasive UI jank and battery drain on mobile.│
└────────────────────────────────────────────────────────┘
                           │
                           ▼
ERA 2: Manual Batching Libraries (FastDOM) (2012 - 2017)
┌────────────────────────────────────────────────────────┐
│ fastdom.measure() and fastdom.mutate() queues.         │
│ - Introduced micro-queuing to separate reads & writes. │
│ - Required disciplined, manual library wrapping.       │
│ - Dramatically improved scroll & drag-and-drop frames. │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
ERA 3: Declarative Framework Virtual DOMs (2017 - 2022)
┌────────────────────────────────────────────────────────┐
│ React Virtual DOM & Angular Batched Zone Updates.      │
│ - Frameworks batch state changes before writing to DOM.│
│ - However, reading real DOM geometry (tooltips, drag)  │
│   still caused accidental layout thrashing.            │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
ERA 4: Native Modern Platform APIs (2022 - Present)
┌────────────────────────────────────────────────────────┐
│ ResizeObserver, IntersectionObserver, CSS contain.     │
│ - Asynchronous browser observers replace polling.      │
│ - CSS layout containment boundaries isolate reflows.   │
│ - Browser engines optimize layout dirty subtrees.      │
└────────────────────────────────────────────────────────┘
```

---

## 4. First Principles & Intuitive Physical Analogies (Layer 1)

### Analogy 1: The Commercial Kitchen and the Impatient Restaurant Manager

Imagine a bustling restaurant kitchen preparing 50 dinner plates:
- **Batched Execution (The Efficient Kitchen):**  
  The head chef (JavaScript) puts steak on all 50 plates (Writes). Then, the expediter measures the temperature of all 50 plates (Reads). Everything happens smoothly in two distinct passes.
- **Layout Thrashing (The Impatient Manager):**  
  The chef puts a steak on Plate 1 (Write).  
  Immediately, the manager yells: *"Wait! Stop cooking! What is the exact weight of Plate 1 right now?"*  
  The entire kitchen halts. The chef pulls out a precision laboratory scale, calibrates it, weighs Plate 1 (Forced Synchronous Reflow), and tells the manager.  
  Then the chef puts a steak on Plate 2 (Write).  
  The manager yells again: *"Wait! Stop cooking! What is the exact weight of Plate 2 right now?"*  
  The entire kitchen halts again, recalibrates, and weighs Plate 2.  
  By Plate 10, dinner is 45 minutes late, the food is freezing cold, and the kitchen has collapsed in exhaustion!

---

## 5. Internal Working & Engine Architecture (Layer 2)

### 1. The Blink Dirty-Bit Layout Architecture

Inside Chromium's Blink rendering engine:
- Every `blink::LayoutObject` maintains internal boolean dirty bits: `m_needsLayout` and `m_needsStyleRecalc`.
- When JavaScript mutates a style (`el.style.width = '100px'`), Blink sets `m_needsLayout = true` on the element and marks all of its ancestor containers up to the document root as `m_childNeedsLayout = true`.
- **The Lazy Default:** Blink does **not** recalculate layout immediately. It schedules an asynchronous lifecycle update on the browser event loop's **Render Pipeline** (before the next frame V-Sync).

```text
Normal (Batched) Flow:
JavaScript Write 1 ──► [m_needsLayout = true]
JavaScript Write 2 ──► [m_needsLayout = true]  (Zero CPU compute!)
JavaScript Write 3 ──► [m_needsLayout = true]
JavaScript Finishes ──► Event Loop advances to Render Phase
                       └── Blink executes 1 Single Global Layout Pass!
```

### 2. What Triggers Forced Synchronous Reflow?
When JavaScript queries any geometric property that depends on rendered box dimensions, Blink **cannot return stale cached data**. It is forced to immediately synchronize the dirty layout tree:

```text
JavaScript Write ──► [m_needsLayout = true]
      │
      ▼
JavaScript queries `el.offsetWidth`
      │
      ▼
Is `m_needsLayout` or `m_needsStyleRecalc` set on document?
     / \
YES /   \ NO
   /     \
  ▼       ▼
FORCED   Return cached
REFLOW!  geometry (0ms)
(Freeze JS, calculate
 full layout NOW!)
```

### 3. The Complete List of Layout-Triggering Properties

Reading **any** of the following properties while styles are dirty forces synchronous reflow:

```text
Box Metrics:
- offsetTop, offsetLeft, offsetWidth, offsetHeight
- clientTop, clientLeft, clientWidth, clientHeight
- scrollWidth, scrollHeight, scrollLeft, scrollTop

Methods:
- getBoundingClientRect(), getClientRects()
- window.getComputedStyle() (when reading geometric properties)
- scrollIntoView(), scrollBy(), scrollTo()
- focus() (in certain focus-scrolling situations)
```

---

## 6. Runtime Flow & Execution Traces

### Comparative Execution Trace: 100 Elements

#### Trace A: Layout Thrashing (Interleaved Read/Write)
```text
Loop iteration 0: Write style.width  -> Dirty bit set.
                  Read offsetHeight  -> FORCED REFLOW 1 (Duration: 3.2ms)
Loop iteration 1: Write style.width  -> Dirty bit set.
                  Read offsetHeight  -> FORCED REFLOW 2 (Duration: 3.1ms)
...
Loop iteration 99: Write style.width -> Dirty bit set.
                   Read offsetHeight -> FORCED REFLOW 100 (Duration: 3.4ms)

TOTAL SCRIPT EXECUTION TIME: ~320 ms
Result: 19 dropped frames. Complete UI freeze on mobile.
```

#### Trace B: Batched Execution (Read-All, Then Write-All)
```text
Pass 1 (All Reads):
Read el[0].offsetHeight  -> Return cached layout (0ms)
Read el[1].offsetHeight  -> Return cached layout (0ms)
...
Read el[99].offsetHeight -> Return cached layout (0ms)
(Duration of Pass 1: 0.2ms)

Pass 2 (All Writes):
Write el[0].style.width  -> Dirty bit set (0ms)
Write el[1].style.width  -> Dirty bit set (0ms)
...
Write el[99].style.width -> Dirty bit set (0ms)
(Duration of Pass 2: 0.4ms)

End of Frame:
Browser executes 1 Single Layout Pass for all 100 updates (Duration: 3.8ms).

TOTAL EXECUTION TIME: 4.4 ms (vs 320 ms!)
Result: 120 FPS. Perfectly fluid animation.
```

---

## 7. Memory Model & Layout Containment

### Isolating Reflows with CSS `contain`

By default, an element's layout changes can affect its parent, siblings, and children (global reflow). Modern browsers provide **CSS Containment** to physically isolate the blast radius:

```css
.card-widget {
  /* Enforces that child layout changes CANNOT affect outside elements */
  contain: layout;
}
```

When Blink encounters a forced reflow inside an element with `contain: layout`:
1. Blink isolates the layout calculation exclusively to the subtree rooted at `.card-widget`.
2. It **does not traverse up the ancestor tree** to recalculate the entire document layout.
3. This reduces reflow CPU time from 30ms to 0.8ms!

---

## 8. Visual Diagrams (ASCII / Text)

### Chrome DevTools Performance Flamechart: Identifying Layout Thrashing

```text
TIMELINE FLAMECHART WITH LAYOUT THRASHING:
┌────────────────────────────────────────────────────────────────────────┐
│ [ Task: 340ms ] (Long Task Warning Red Corner)                         │
│   ├── [ Function: updateCards (JavaScript) ]                           │
│   │     ├── [ Layout (Forced) ⚠️ ] (3.2ms)                             │
│   │     ├── [ Layout (Forced) ⚠️ ] (3.1ms)                             │
│   │     ├── [ Layout (Forced) ⚠️ ] (3.4ms)                             │
│   │     ├── [ Layout (Forced) ⚠️ ] (3.2ms)                             │
│   │     └── ... 50 more Forced Layouts!                                │
└────────────────────────────────────────────────────────────────────────┘

TIMELINE FLAMECHART WITH BATCHED EXECUTION:
┌────────────────────────────────────────────────────────────────────────┐
│ [ Task: 4.8ms ] (Healthy Frame - 120 FPS)                              │
│   ├── [ Function: updateCards (JavaScript) ] (0.6ms)                   │
│   ├── [ Recalculate Style ] (1.2ms)                                    │
│   └── [ Layout ] (Single consolidated layout) (3.0ms)                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Real World Usage & Production Patterns

### Pattern 1: Pure TypeScript FastDOM Queue Implementation

```typescript
// utils/domBatcher.ts
type Task = () => void;

class DOMBatcher {
  private reads: Task[] = [];
  private writes: Task[] = [];
  private scheduled = false;

  // Schedule a DOM read (measurement)
  read(task: Task) {
    this.reads.push(task);
    this.scheduleFlush();
  }

  // Schedule a DOM write (mutation)
  write(task: Task) {
    this.writes.push(task);
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.scheduled) return;
    this.scheduled = true;

    requestAnimationFrame(() => {
      this.flush();
    });
  }

  private flush() {
    // 1. Execute ALL reads first while layout is clean
    const currentReads = this.reads.splice(0, this.reads.length);
    for (const read of currentReads) {
      read();
    }

    // 2. Execute ALL writes second (invalidates layout once)
    const currentWrites = this.writes.splice(0, this.writes.length);
    for (const write of currentWrites) {
      write();
    }

    this.scheduled = false;
  }
}

export const batcher = new DOMBatcher();
```

*Usage:*
```typescript
elements.forEach((el) => {
  // Reads run first
  batcher.read(() => {
    const width = el.offsetWidth;
    
    // Writes queued to run after all reads finish
    batcher.write(() => {
      el.style.height = `${width * 0.75}px`;
    });
  });
});
```

### Pattern 2: Replacing Window Resize Polling with `ResizeObserver`

```typescript
// components/ResponsiveCard.tsx
import { useEffect, useRef } from 'react';

export function ResponsiveCard() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // ResizeObserver fires asynchronously on layout changes WITHOUT polling or thrashing
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Reads geometry directly from observer entry buffer (0ms reflow cost!)
        const { width } = entry.contentRect;
        
        if (width < 400) {
          entry.target.classList.add('compact-mode');
        } else {
          entry.target.classList.remove('compact-mode');
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={containerRef} className="card-container">Responsive Content</div>;
}
```

---

## 10. Angular Comparison

| Dimension | Browser Layout Thrashing | Angular (v17+) |
| :--- | :--- | :--- |
| **Batching Mechanism** | Browser buffers mutations until next render tick. | Angular batches DOM bindings inside `ApplicationRef.tick()`, applying all changes at the end of Change Detection. |
| **Direct DOM Access Risk** | Querying native elements directly (`el.nativeElement.offsetWidth`) during lifecycle hooks triggers Forced Reflow. | Safe practice: query dimensions inside `ngAfterViewInit` and perform DOM writes via Angular `Renderer2`. |
| **Animation Timing** | Manual `requestAnimationFrame` coordination. | Angular `@angular/animations` coordinates frames using Web Animations API outside zone ticks. |
| **Layout Thrashing Trap** | Calling `element.style.width` then reading `element.clientHeight` in an Angular directive. | Move geometry calculations outside Angular zone: `ngZone.runOutsideAngular(() => ...)`. |

---

## 11. .NET Comparison

| Dimension | Browser Layout Thrashing | WPF & WinUI (.NET 9/10) |
| :--- | :--- | :--- |
| **Forced Synchronous Flush**| Reading geometric properties (`offsetWidth`) forces Blink layout. | Calling `UIElement.UpdateLayout()` explicitly forces immediate Measure and Arrange passes. |
| **Layout Invalidation** | Setting style properties sets Blink `m_needsLayout`. | Modifying properties calls `InvalidateMeasure()` and `InvalidateArrange()`. |
| **Batching Mechanism** | FastDOM or `requestAnimationFrame` queues. | WPF `Dispatcher.BeginInvoke(DispatcherPriority.Render, ...)` queuing work for next render frame. |
| **Subtree Containment** | CSS `contain: layout size`. | Setting fixed `Width` and `Height` on parent panel prevents layout invalidation bubbling up the tree. |

---

## 12. Enterprise Perspective & Production Risks (Layer 4)

### 1. The "ResizeObserver Loop Limit Exceeded" Error
- **The Failure Mode:** Inside a `ResizeObserver` callback, an engineer mutates an element's style which directly alters the element's observed dimensions:
  ```typescript
  const ro = new ResizeObserver(entries => {
    entries[0].target.style.width = '300px'; // Triggers resize again!
  });
  ```
- **The Engine Defense:** The browser detects an infinite circular layout loop and aborts with:  
  `ResizeObserver loop completed with undelivered notifications`.
- **The Fix:** Never synchronously mutate the observed element's dimensions inside its own `ResizeObserver` callback. Use container queries (`@container`) in CSS instead of JavaScript observers where possible.

### 2. Scroll-Linked Layout Thrashing on Mobile
- **The Failure Mode:** Attaching an un-throttled scroll listener that reads `window.scrollY` and calculates `card.getBoundingClientRect()` to produce parallax effects.
- **The Consequence:** Because scrolling emits 60 events per second, every scroll tick triggers synchronous reflow. Mobile devices drop from 60 FPS down to 10 FPS, causing severe gesture stutter and high battery drain.
- **The Architectural Fix:** Use **`IntersectionObserver`** or CSS **`animation-timeline: scroll()`** (Scroll-Driven Animations) which run 100% on the Compositor thread with zero main-thread layout thrashing!

---

## 13. Performance Considerations

```text
Performance Audit: 100 DOM Elements (Chrome DevTools Performance Benchmark)
┌───────────────────────────────────────┬──────────────┬──────────────┬─────────────┐
│ Strategy                              │ Script Time  │ Layout Time  │ Total Frame │
├───────────────────────────────────────┼──────────────┼──────────────┼─────────────┤
│ Interleaved (Thrashing)               │ 280 ms       │ 45 ms        │ 325 ms (FAIL│
│ Batched (Read-First, Write-Second)    │ 1.2 ms       │ 3.4 ms       │ 4.6 ms (PASS│
│ CSS Containment (contain: layout)     │ 0.8 ms       │ 1.1 ms       │ 1.9 ms (120F│
└───────────────────────────────────────┴──────────────┴──────────────┴─────────────┘
```

---

## 14. Tradeoffs

| Technique | Pros | Cons |
| :--- | :--- | :--- |
| **Manual FastDOM Batching** | Guarantees 0ms layout thrashing; perfect control over read/write phases. | Verbose callback boilerplate; requires strict adherence across the entire engineering team. |
| **`ResizeObserver`** | High performance; asynchronous; does not block the rendering pipeline. | Can trigger circular loop errors if misconfigured; requires fallback on very old browsers. |
| **CSS Containment (`contain`)** | Massive performance boost ($O(1)$ subtree reflow); 100% declarative in CSS. | Changes stacking and positioning contexts; child elements cannot overflow container. |

---

## 15. Common Mistakes & Interview Traps

### Trap 1: Assuming `getComputedStyle()` is Always Cheap
- **Scenario:** An engineer says: *"I only read computed styles, I didn't change anything, so it doesn't cause a layout."*
- **The Reality:** If any DOM mutation occurred *anywhere* in the document prior to calling `window.getComputedStyle()`, querying a geometric property (like `width` or `transform`) **forces an immediate synchronous layout calculation** across the entire document!

### Trap 2: Replacing `requestAnimationFrame` with `setTimeout(fn, 0)`
- **Scenario:** A developer uses `setTimeout(fn, 0)` to batch DOM writes.
- **The Reality:** **Anti-pattern.** `setTimeout` is a Macrotask executed arbitrarily between frames; it has zero synchronization with the browser's 16.6ms V-Sync render cycle. `requestAnimationFrame` is executed **immediately before the style and layout phases of the render pipeline**, ensuring writes are cleanly processed in the current frame.

---

## 16. Interview Questions & Architectural Answers (Senior, Lead, Architect - Layer 5)

### Question 1 (Senior): "What is Layout Thrashing, and how do you programmatically detect it in production?"
**Architectural Answer:**  
Layout Thrashing occurs when JavaScript repeatedly interleaves DOM writes with geometric DOM reads, forcing the browser to flush dirty layout bits into expensive synchronous layout calculations mid-frame.  
**Programmatic Detection:**
1. **Chrome DevTools:** In the Performance Panel, look for red warning triangles labeled *"Forced reflow is a likely performance bottleneck"*.
2. **Production RUM (Real User Monitoring):** Use the `PerformanceObserver` API observing the `longtask` entry type. Measure whether long tasks correlate with DOM mutation events.
3. **Automated CI Tests:** Instrument Playwright tests with Chrome DevTools Protocol (`CDP`) tracing to assert that zero `Layout` trace events occur during interactive animation flows.

### Question 2 (Lead): "How would you architect a Drag-and-Drop Kanban Board with 500 cards to guarantee 120 FPS on high-refresh mobile screens?"
**Architectural Answer:**  
1. **Compositor-Only Motion:** During drag, never modify `top`, `left`, or `margin`. Apply motion strictly via `transform: translate3d(x, y, 0)`.
2. **CSS Containment:** Apply `contain: layout style paint;` to every column and card container, preventing card drops from invalidating adjacent column layouts.
3. **Decoupled Pointer Tracking:** Capture pointer coordinates in pointer event listeners, store them in local variables, and apply the `transform` exclusively inside a `requestAnimationFrame` loop.
4. **Virtualization:** Only render cards visible within the current viewport using a virtual list window.

### Question 3 (Architect): "How do Modern React 19 and the React Compiler eliminate Layout Thrashing by default, and where does user code still break this contract?"
**Architectural Answer:**  
- **Framework Protection:** React’s **Render Phase** is purely functional and operates exclusively on Virtual DOM objects in the V8 heap. React does not touch the physical DOM until the **Commit Phase**, where all mutations are batched and applied synchronously in a single consolidated pass.
- **Where User Code Breaks It:**
  When engineers use `useLayoutEffect` to read DOM measurements and synchronously update state:
  ```typescript
  useLayoutEffect(() => {
    const width = ref.current.offsetWidth; // READ
    setWidth(width);                       // Triggers synchronous re-render and WRITE!
  }, []);
  ```
  If child components repeat this pattern, it re-introduces Forced Synchronous Reflow across React render cascades.  
  **Fix:** Replace measurement hooks with CSS Container Queries (`@container`) or asynchronous `ResizeObserver` subscriptions.

---

## 17. Senior-Level Mental Model & "How to Remember This Forever" (Memory Anchors - Layer 3)

### The Memory Peg: "The Accountant's Ledger Rule"
- **Never Audit while Depositing:**
  - If you deposit cash (Write), and immediately demand an official printed bank audit (Read), the teller must close the window, count the safe, and print the report.
  - **The Golden Rule:** *Collect all deposits first; print the audit once at the end of the day.*

---

## 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)

- **Forced Synchronous Reflow (FSR):** The immediate calculation of document layout triggered when JavaScript reads geometric properties while layout styles are dirty.
- **Layout Thrashing:** Repeated, rapid cycles of FSR within a single JavaScript execution frame.
- **`requestAnimationFrame` (rAF):** The browser scheduling API that executes callbacks immediately prior to the next style, layout, and paint passes.
- **CSS `contain: layout`:** An isolation declaration guaranteeing that an element’s internal layout changes cannot escape to affect exterior ancestors.
- **The "Aha!" Insight:** The browser *wants* to be fast! It only recalculates layout when **you force it** by reading a metric property mid-script!

---

## 19. Key Takeaways

1. **Layout Thrashing occurs when DOM writes and geometric reads are interleaved in a loop.**
2. **Reading `offsetWidth`, `clientHeight`, or `getBoundingClientRect` forces a synchronous layout flush** if any preceding DOM mutation occurred.
3. **Always follow the Read-First, Write-Second pattern** to allow the browser to perform a single consolidated layout.
4. **Use `requestAnimationFrame` for animation and write batching**, never `setTimeout(fn, 0)`.
5. **Apply `contain: layout` on complex widgets** to constrain the reflow calculation to that specific subtree.
6. **Replace window resize polling with `ResizeObserver`** for asynchronous, high-performance geometry tracking.

---

## 20. Revision Sheet

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        LAYOUT THRASHING QUICK REFERENCE                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Deadly Anti-Pattern (Layout Thrashing):                                                │
│   elements.forEach(el => {                                                             │
│     el.style.width = '100px';       // WRITE (Invalidates)                             │
│     const h = el.offsetHeight;      // READ  (Forces Synchronous Layout!)              │
│   });                                                                                  │
│                                                                                        │
│ Architectural Solution (Batched):                                                      │
│   // Phase 1: All Reads (0ms)                                                          │
│   const heights = elements.map(el => el.offsetHeight);                                 │
│   // Phase 2: All Writes (Single Reflow at end of frame)                               │
│   elements.forEach((el, i) => { el.style.width = heights[i] + 'px'; });               │
│                                                                                        │
│ Layout-Triggering Properties:                                                          │
│   offsetWidth, offsetHeight, offsetTop, offsetLeft                                     │
│   clientWidth, clientHeight, scrollWidth, scrollHeight                                 │
│   getBoundingClientRect(), getComputedStyle()                                          │
│                                                                                        │
│ Golden Architectural Rule:                                                             │
│   "Batch all reads first; batch all writes second; animate with transform."            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
