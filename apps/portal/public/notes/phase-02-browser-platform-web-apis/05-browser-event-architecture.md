# Chapter 05: Browser Event Architecture & Event Propagation (Capturing, Bubbling, `composedPath`, Passive Event Listeners & Synthetic Events)

> "In web applications, user interaction is not a direct callback invocation on a single element. It is a hierarchical journey: an event parachutes down from the `Window` through the entire DOM tree, detonates at the target, and bubbles back up to the stratosphere. Mastering this lifecycle separates engineers who fight event bugs from architects who orchestrate enterprise interaction meshes."  
> — **Browser Event Systems Architecture**

---

## 1. Why This Topic Exists

Every user interaction—clicking a button, scrolling a feed, pressing a key, dragging a card—triggers the browser’s **Event Dispatch System**. Yet, event propagation remains one of the most frequently misunderstood areas of frontend engineering:
1. **The Historical Schism (Capturing vs. Bubbling):** In the browser wars of the late 1990s, Netscape invented **Event Capturing** (events travel downward from the root), while Microsoft invented **Event Bubbling** (events travel upward from the child). The W3C merged both into the standardized **3-Phase Event Pipeline**.
2. **The 60 FPS Scrolling Freeze (Passive Event Listeners):** When touchscreens exploded in popularity, mobile web scrolling was notoriously janky. Why? Every time a user touched the screen, the browser’s **Compositor Thread** was forced to halt scrolling and wait for the **Main Thread** to execute `touchstart` listeners just in case JavaScript called `e.preventDefault()`. To solve this, browsers introduced **Passive Event Listeners (`{ passive: true }`)**, decoupling scrolling from JavaScript execution.
3. **The `stopPropagation()` Architectural Trap:** Junior and mid-level engineers frequently scatter `e.stopPropagation()` across components to silence unwanted clicks. This breaks higher-level analytics tracking beacons, top-level dropdown dismissers, and accessibility tools.

Understanding the deep mechanics of capturing, bubbling, `composedPath`, and passive options is essential for building predictable, high-performance web applications.

---

## 2. Learning Objectives

- Master the 3 phases of the W3C Event Flow: **1. Capturing Phase → 2. Target Phase → 3. Bubbling Phase**.
- Differentiate between **`event.target`** (the innermost element that triggered the event) and **`event.currentTarget`** (the element currently executing the event listener).
- Inspect the complete propagation array using **`event.composedPath()`** across normal DOM trees and Shadow DOM boundaries.
- Understand the exact behavioral differences between **`event.preventDefault()`**, **`event.stopPropagation()`**, and **`event.stopImmediatePropagation()`**.
- Leverage **Passive Event Listeners (`{ passive: true }`)** to enable unblocked 120 FPS scrolling on the Compositor Thread.
- Understand Shadow DOM **Event Retargeting** in Web Components and Micro-Frontends.
- Bridge architectural mental models directly to **Angular** (`@HostListener`, Zone.js event monkey-patching) and **.NET** (WPF Routed Events: Tunneling vs. Bubbling).

---

## 3. Historical Evolution

```text
ERA 1: The Browser Wars Fragmentation (1996 - 2000)
┌────────────────────────────────────────────────────────┐
│ Netscape Navigator 4: Event Capturing (Top-down).      │
│ Microsoft IE 4:       Event Bubbling (Bottom-up).      │
│ - Incompatible APIs: attachEvent vs addEventListener.  │
│ - Libraries (jQuery) forced to normalize event objects.│
└────────────────────────────────────────────────────────┘
                           │
                           ▼
ERA 2: W3C DOM Level 2 Event Standard (2000 - 2016)
┌────────────────────────────────────────────────────────┐
│ Standardized 3-Phase Pipeline:                         │
│ 1. Capture Phase -> 2. Target Phase -> 3. Bubble Phase │
│ - addEventListener(type, listener, useCapture).        │
│ - Normalized event propagation and default prevention. │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
ERA 3: Mobile Touch Lag & Passive Listeners (2016 - Present)
┌────────────────────────────────────────────────────────┐
│ Mobile touch/wheel scrolling suffered severe jank.     │
│ - Introduction of `{ passive: true }` option.          │
│ - Chromium makes touch/wheel passive by default.       │
│ - Enables Compositor Thread to scroll immediately.     │
└────────────────────────────────────────────────────────┘
```

---

## 4. First Principles & Intuitive Physical Analogies (Layer 1)

### Analogy 1: The Deep-Sea Submarine Expedition

Imagine sending a deep-sea research submarine to inspect a treasure chest at the bottom of the Mariana Trench:
- **Phase 1: The Descent (Capturing Phase):**  
  The expedition begins at the surface of the ocean (`Window`). The submarine descends through the sunlight zone (`Document`), the twilight zone (`Body`), and the midnight zone (`Main Container`), until it reaches the trench floor. Every level of the ocean knows the submarine is passing down.
- **Phase 2: The Contact (Target Phase):**  
  The submarine reaches the ocean floor and directly touches the treasure chest (`<button id="treasure">`). The mission objective occurs here.
- **Phase 3: The Ascent (Bubbling Phase):**  
  The submarine releases ballast and floats back up toward the surface. As it rises, it releases a stream of bubbles through the midnight zone, twilight zone, sunlight zone, and back up to the ocean surface (`Window`).
- **Where Listeners Sit:**  
  You can station an observer at the twilight zone to listen during the descent (`{ capture: true }`) or during the ascent (the default bubbling behavior).

### Analogy 2: The Contract Sign-Off (`{ passive: true }`)

- **Without Passive:** You enter a bank. Before you can step through the revolving door (scroll the page), a security guard stops you: *"Wait! The lawyer (JavaScript) must review your documents first just in case they decide to forbid you from entering (`e.preventDefault()`)."* The door locks for 100ms while the lawyer reads.
- **With `{ passive: true }`:** You sign an upfront contract: *"I promise I will never call `e.preventDefault()`."* The revolving door spins freely at 120 FPS! The lawyer still gets a copy of your documents to review in the background, but the door never freezes.

---

## 5. Internal Working & Engine Architecture (Layer 2)

### 1. The 3-Phase Event Pipeline

When a user clicks an element, Chromium's Blink engine executes **`blink::EventDispatcher::DispatchEvent`**:

```text
               WINDOW
               │    ▲
      (Capture)│    │(Bubble)
               ▼    │
              DOCUMENT
               │    ▲
      (Capture)│    │(Bubble)
               ▼    │
            <HTML>
               │    ▲
      (Capture)│    │(Bubble)
               ▼    │
            <BODY>
               │    ▲
      (Capture)│    │(Bubble)
               ▼    │
          <DIV class="card">
               │    ▲
      (Capture)│    │(Bubble)
               ▼    │
          <BUTTON id="btn">  <── [TARGET PHASE]
```

1. **Phase 1: Capturing Phase (`Event.CAPTURING_PHASE = 1`):**  
   The event travels down from `Window` through ancestor nodes to the target's immediate parent. Only listeners registered with `{ capture: true }` (or `true` as the 3rd argument) execute during this phase.
2. **Phase 2: Target Phase (`Event.AT_TARGET = 2`):**  
   The event arrives at the innermost element that was clicked. Listeners registered on the target execute in the order they were added.
3. **Phase 3: Bubbling Phase (`Event.BUBBLING_PHASE = 3`):**  
   The event travels back up the ancestor chain to `Window`. Standard listeners (the default `{ capture: false }`) execute during this phase.
   *(Note: Certain events do not bubble, such as `focus`, `blur`, `mouseenter`, `mouseleave`, and `scroll` on elements).*

---

### 2. `target` vs. `currentTarget` vs. `composedPath()`

Understanding these three properties is essential:
- **`event.target`:** The **innermost physical element** that initiated the event (e.g., the `<i>` icon inside a `<button>`). Remains constant throughout the entire propagation lifecycle.
- **`event.currentTarget`:** The element **currently handling the event** (the element to which the `addEventListener` was physically attached). Changes at each step of the pipeline.
- **`event.composedPath()`:** Returns an ordered array of every DOM node the event will traverse from the target up to `Window`.

---

### 3. The Cancellation Arsenal: A Precise Matrix

| Method | Stops Default Action? | Stops Bubbling to Ancestors? | Stops Other Listeners on Same Element? |
| :--- | :---: | :---: | :---: |
| **`event.preventDefault()`** | ✅ **YES** (Cancels submit, link jump, checkbox toggle) | ❌ NO | ❌ NO |
| **`event.stopPropagation()`** | ❌ NO | ✅ **YES** (Halts ascent up tree) | ❌ NO (Siblings on same node still run) |
| **`event.stopImmediatePropagation()`**| ❌ NO | ✅ **YES** (Halts ascent up tree) | ✅ **YES** (Freezes subsequent listeners on current node) |

---

### 4. Passive Event Listeners & The Compositor Thread

In modern browsers:
- Scrolling gestures (`wheel`, `touchmove`) are handled by the **Compositor Thread** running on GPU hardware.
- If an un-passive listener is registered (`window.addEventListener('touchstart', onTouch)`):
  - The Compositor Thread **cannot scroll the screen immediately**.
  - It must send an IPC message to the Main Thread, run `onTouch()`, and wait to see if `event.preventDefault()` was called.
  - If the Main Thread is busy running JavaScript, the scroll gesture freezes (jank).
- When configured with `{ passive: true }`:
  - You guarantee that `event.preventDefault()` will never be called (if called, the browser logs a warning and ignores it).
  - The Compositor Thread **scrolls the page immediately at 120 FPS**, completely decoupled from Main Thread JavaScript execution!

---

## 6. Runtime Flow & Execution Traces

### Execution Trace: Full 3-Phase Event Walkthrough

```text
HTML Structure:
<div id="parent">
  <button id="child">Click Me</button>
</div>

JavaScript Listeners:
parent.addEventListener('click', () => log('Parent Capture'), { capture: true });
parent.addEventListener('click', () => log('Parent Bubble'),  { capture: false });
child.addEventListener('click',  () => log('Child Capture'),  { capture: true });
child.addEventListener('click',  () => log('Child Bubble'),   { capture: false });

Execution Order when User Clicks <button id="child">:
1. Capturing Phase:
   - Window, Document, Body checked.
   - [Parent Capture] EXECUTED.
2. Target Phase:
   - Event arrives at <button id="child">.
   - [Child Capture] EXECUTED (Target Phase).
   - [Child Bubble]  EXECUTED (Target Phase).
3. Bubbling Phase:
   - Event ascends to <div id="parent">.
   - [Parent Bubble] EXECUTED.
   - Event ascends to Body, Document, Window.
```

---

## 7. Memory Model & Event Listener Cleanup

In Blink C++ engine memory:
- Every DOM node holds an `EventListenerMap` pointing to an array of C++ callback wrappers.
- **The Anonymous Function Memory Leak:**
  ```javascript
  // FATAL MEMORY LEAK
  function render() {
    window.addEventListener('resize', () => { ... }); // New closure created every time!
  }
  ```
  Every invocation allocates a new closure on the V8 heap and registers a new C++ pointer in Blink. Because the function is anonymous, `window.removeEventListener` cannot be called!
- **The Self-Cleaning Listener:** Modern browsers support the **`{ once: true }`** option, which instructs Blink to automatically unregister and garbage collect the listener after its first invocation.

---

## 8. Visual Diagrams (ASCII / Text)

### Event Retargeting Across Shadow DOM Boundaries

When using Web Components or Micro-Frontends with Shadow DOM:

```text
LIGHT DOM (Main Document)
┌────────────────────────────────────────────────────────┐
│ <user-avatar> (Custom Element)                         │
│                                                        │
│   SHADOW DOM (Encapsulated Subtree)                    │
│   ┌────────────────────────────────────────────────┐   │
│   │ #shadow-root (open)                            │   │
│   │   └── <button class="avatar-btn">              │   │
│   │         └── <img src="user.png">               │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘

When User clicks <img src="user.png">:
- Inside Shadow DOM: event.target is <img>.
- Outside in Light DOM: event.target is RETARGETED to <user-avatar>!

This preserves component encapsulation: outside code cannot see internal shadow nodes!
To inspect the true path, use event.composedPath()!
```

---

## 9. Real World Usage & Production Patterns

### Pattern 1: High-Performance Touch/Scroll Listener with Passive Option

```typescript
// utils/touchTracker.ts
export function attachSmoothScrollTracker(element: HTMLElement) {
  element.addEventListener(
    'touchstart',
    (e) => {
      console.log('Touch started at:', e.touches[0].clientX);
      // e.preventDefault(); // ❌ FORBIDDEN! Will throw a browser console warning
    },
    { 
      passive: true, // Guarantees 120 FPS compositor scrolling!
      capture: false 
    }
  );
}
```

### Pattern 2: Global Event Interceptor using Capture Phase (Analytics Shield)

How do enterprise analytics SDKs (Datadog, Mixpanel) record 100% of user clicks even if child components call `e.stopPropagation()`?  
**They attach listeners in the CAPTURING phase!**

```typescript
// analytics/clickTracker.ts
// By listening in the Capture phase, analytics runs BEFORE child components can stop propagation!
window.addEventListener(
  'click',
  (event) => {
    const target = event.target as HTMLElement;
    console.log(`[ANALYTICS] User clicked element: <${target.tagName.toLowerCase()}> id="${target.id}"`);
  },
  { capture: true } // Intercepts on the way down!
);
```

### Pattern 3: Clean Decoupled Communication via Custom Events

```typescript
// events/cartEvents.ts
export interface CartUpdatedDetail {
  cartId: string;
  itemCount: number;
  total: number;
}

// 1. Dispatch custom event with typed payload
export function dispatchCartUpdate(detail: CartUpdatedDetail) {
  const event = new CustomEvent<CartUpdatedDetail>('app:cart-updated', {
    detail,
    bubbles: true,   // Allow event to bubble up the DOM
    composed: true,  // Allow event to cross Shadow DOM boundaries!
    cancelable: true,
  });

  window.dispatchEvent(event);
}

// 2. Listen in independent UI component
window.addEventListener('app:cart-updated', ((e: CustomEvent<CartUpdatedDetail>) => {
  console.log('Cart updated to total:', e.detail.total);
}) as EventListener);
```

---

## 10. Angular Comparison

| Dimension | Browser Event Architecture | Angular (v17+) |
| :--- | :--- | :--- |
| **Listener Binding** | `element.addEventListener('click', handler)`. | Template binding: `(click)="handleClick($event)"` or `@HostListener('click')`. |
| **Zone.js Interception** | Native browser dispatches directly to JS callback. | Zone.js monkey-patches `addEventListener`, intercepting every event to trigger Change Detection (`NgZone`). |
| **Passive Events** | Configured via `{ passive: true }` options object. | Supported via Angular EventManager plugins or custom directives. |
| **Performance Optimization**| Attach listeners outside the critical path. | Run events outside Zone.js: `ngZone.runOutsideAngular(() => el.addEventListener(...))` to prevent unnecessary CD runs. |

---

## 11. .NET Comparison

| Dimension | Browser Event Architecture | WPF & WinUI (.NET 9/10) |
| :--- | :--- | :--- |
| **Propagation Model** | 3-Phase: Capture → Target → Bubble. | **WPF Routed Events**: Tunneling (Preview) → Direct → Bubbling. |
| **Capturing Equivalent** | Capture phase (`{ capture: true }`). | **Tunneling Events** (prefixed with `Preview`, e.g., `PreviewMouseDown`). |
| **Bubbling Equivalent** | Bubble phase (`{ capture: false }`). | **Bubbling Events** (e.g., `MouseDown`). |
| **Halting Propagation** | `event.stopPropagation()`. | `RoutedEventArgs.Handled = true`. |

---

## 12. Enterprise Perspective & Production Risks (Layer 4)

### 1. The "Silent Analytics Blinding" Disaster
- **The Failure Mode:** A developer builds a custom dropdown menu or modal and writes:
  ```javascript
  dropdownButton.addEventListener('click', (e) => {
    e.stopPropagation(); // Stifles all bubbling
    toggleDropdown();
  });
  ```
- **The Enterprise Fallout:** The enterprise telemetry pipeline (Google Analytics, Datadog RUM, Amplitude) relies on a root-level listener (`document.addEventListener('click')`) to track user conversion funnels. Because the developer silenced bubbling, **every click on that button is completely invisible to business analytics**!
- **The Architectural Fix:**  
  1. Never use `stopPropagation()` merely to prevent a parent click handler from firing. Restructure component handlers or check `event.target` conditionally.
  2. If analytics must be bulletproof, always attach analytics listeners with **`{ capture: true }`**.

### 2. The Non-Passive Touch Event Penalty on Mobile
- **The Failure Mode:** An un-passive `touchstart` listener on a mobile web app with a heavy JavaScript main thread.
- **The Consequence:** Users swipe to scroll, but the page freezes for 300ms before moving. Google Lighthouse penalizes the page with: **`Does not use passive listeners to improve scrolling performance`**.

---

## 13. Performance Considerations

```text
Scroll Gesture Frame Latency: Passive vs. Non-Passive Listeners
┌───────────────────────────────────────┬───────────────────────────┬──────────────┐
│ Implementation                        │ Compositor Thread State   │ Frame Rate   │
├───────────────────────────────────────┼───────────────────────────┼──────────────┤
│ Non-Passive Listener (Main Thread busy│ Blocked (Awaiting IPC)    │ 15 - 25 FPS  │
│ Passive Listener ({ passive: true })  │ Unblocked (Immediate GPU) │ 120 FPS      │
│ No Listener Attached                  │ Unblocked (Immediate GPU) │ 120 FPS      │
└───────────────────────────────────────┴───────────────────────────┴──────────────┘
```

---

## 14. Tradeoffs

| Mechanism | Strengths | Weaknesses |
| :--- | :--- | :--- |
| **Capturing Phase** | Intercepts events before child elements can cancel or stop them; ideal for global telemetry. | Less intuitive; runs counter to standard bubbling expectations; harder to debug. |
| **Bubbling Phase (Default)** | Intuitive; allows parent containers to handle delegated actions from dozens of children. | Vulnerable to child components calling `stopPropagation()`. |
| **Passive Listeners** | Guarantees silky-smooth 60/120 FPS touch and wheel scrolling on mobile devices. | Forbids calling `event.preventDefault()` (cannot cancel standard browser scrolling). |

---

## 15. Common Mistakes & Interview Traps

### Trap 1: Confusing `event.target` with `event.currentTarget`
- **Scenario:** The user clicks an `<svg>` icon nested inside a `<button id="btn">`.
- **The Code:** `document.getElementById('btn').addEventListener('click', (e) => console.log(e.target.id));`.
- **The Bug:** `e.target` is the `<svg>` or `<path>` element! It has no `id`, so it logs `undefined`.
- **The Fix:** Always use **`event.currentTarget`** to access the element that owns the event listener, or use `event.target.closest('button')`.

### Trap 2: Believing `stopPropagation()` Stops Sibling Listeners on the Same Element
- **Scenario:** Element A has two separate click listeners: Listener 1 and Listener 2. Listener 1 calls `event.stopPropagation()`. Does Listener 2 execute?
- **Candidate Answer:** *"No, propagation stopped."*
- **Correction:** **WRONG.** `stopPropagation()` only prevents the event from ascending to **ancestor elements**. Sibling listeners on the identical element will still execute! To halt sibling listeners, you must call **`event.stopImmediatePropagation()`**.

---

## 16. Interview Questions & Architectural Answers (Senior, Lead, Architect - Layer 5)

### Question 1 (Senior): "Why did Chromium make touch and wheel listeners passive by default, and how can an application cancel a touch gesture?"
**Architectural Answer:**  
Chromium made root-level `touchstart`, `touchmove`, and `wheel` listeners passive by default because over 80% of scroll jank on mobile web was caused by non-passive listeners forcing the Compositor Thread to freeze while waiting for the JavaScript main thread.  
To cancel a touch gesture (e.g., in a custom canvas signature pad or game control), you must explicitly opt out of the default by passing **`{ passive: false }`** to `addEventListener`:
```typescript
canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
```

### Question 2 (Lead): "How does Event Delegation work, and why did React 17 change its event delegation root from `document` to the root container?"
**Architectural Answer:**  
- **Event Delegation:** Attaching a single event listener to an ancestor node to handle events for all current and future children via bubbling, saving memory and eliminating per-node cleanup.
- **The React 17 Architectural Shift:**
  - Prior to React 17, React attached all synthetic event listeners at the **`document` level**.
  - If a legacy jQuery or vanilla JS widget inside the page called `e.stopPropagation()`, React’s document listener never fired! Furthermore, nesting two separate React root applications (e.g., during an incremental migration) caused severe event collision bugs.
  - In React 17/18/19, React attaches event listeners to the **root DOM container (`rootNode`, e.g., `<div id="root">`)**, completely isolating synthetic events inside that specific app instance and allowing peaceful coexistence with foreign micro-frontends.

### Question 3 (Architect): "How do you design a high-throughput, cross-boundary Event Mesh for an enterprise micro-frontend architecture with Shadow DOM encapsulation?"
**Architectural Answer:**  
1. **Composed Custom Events:** Micro-frontends emit standardized `CustomEvent` instances configured with `{ bubbles: true, composed: true }`. The `composed: true` flag allows events to cross Shadow DOM boundaries into the host document.
2. **Event Retargeting Awareness:** The host application inspects `event.composedPath()` to identify the originating component across encapsulation boundaries.
3. **Capture-Phase Gateway:** The host shell registers a capture-phase interceptor (`window.addEventListener(type, handler, { capture: true })`) to enforce enterprise auditing, authorization checks, and rate limiting before individual micro-frontends process events.

---

## 17. Senior-Level Mental Model & "How to Remember This Forever" (Memory Anchors - Layer 3)

### The Memory Peg: "The Parachutist and The Smoke Flare"
- **Capture is the Parachutist Falling from the Sky:** Jumps from the airplane (`Window`) down through the clouds to the landing target (`Target`).
- **Target is the Landing Spot:** Both parachutists and ground teams meet at the target.
- **Bubble is the Smoke Flare Rising:** Once on the ground, they light a smoke flare that rises back up into the sky (`Window`).
- **`{ passive: true }` is the Express Lane Pass:** Allows the crowd to keep moving without waiting for security inspection.

---

## 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)

- **Capturing Phase:** Downward propagation from `Window` to target.
- **Bubbling Phase:** Upward propagation from target back to `Window`.
- **`composedPath()`:** An array of all nodes in the propagation chain.
- **Passive Event Listener:** A listener that promises never to call `preventDefault()`, allowing the Compositor Thread to scroll without delay.
- **The "Aha!" Insight:** Event bubbling is not an accident—it is the architectural foundation of the web platform that makes global delegation, UI analytics, and component decoupling possible!

---

## 19. Key Takeaways

1. **The W3C Event Flow has 3 phases:** Capturing → Target → Bubbling.
2. **`event.target` is the element clicked;** `event.currentTarget` is the element holding the active listener.
3. **`preventDefault()` stops browser action;** `stopPropagation()` stops bubbling to ancestors; `stopImmediatePropagation()` stops sibling listeners on the identical element.
4. **Use `{ passive: true }` on touch and wheel listeners** to ensure buttery-smooth 120 FPS scrolling on mobile.
5. **Attach telemetry and security interceptors in the Capture phase** to guarantee execution even if child components halt bubbling.
6. **Use `{ once: true }`** for self-cleaning event listeners that automatically detach after firing.

---

## 20. Revision Sheet

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        BROWSER EVENT ARCHITECTURE CHEAT SHEET                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Pipeline Stages:                                                                       │
│   1. Window -> Target Parent   (Capturing Phase: { capture: true })                    │
│   2. Target Element            (Target Phase)                                          │
│   3. Target Parent -> Window   (Bubbling Phase: { capture: false })                    │
│                                                                                        │
│ addEventListener Configuration Options:                                                │
│   el.addEventListener('click', handler, {                                              │
│     capture: true,  // Listen during descent (Capture phase)                           │
│     passive: true,  // Forbid preventDefault(); unlocks 120 FPS compositor scroll      │
│     once: true,     // Automatically unregisters after first invocation               │
│     signal: abortController.signal // Abortable listener cleanup                       │
│   });                                                                                  │
│                                                                                        │
│ Propagation Cancellation:                                                              │
│   e.preventDefault()             // Stops browser default action (e.g. form submit)    │
│   e.stopPropagation()            // Stops propagation to ancestor nodes                │
│   e.stopImmediatePropagation()   // Stops propagation to ancestors AND sibling handlers│
│                                                                                        │
│ Golden Architectural Rule:                                                             │
│   "Use capture for global interception; use passive for smooth scrolling."             │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
