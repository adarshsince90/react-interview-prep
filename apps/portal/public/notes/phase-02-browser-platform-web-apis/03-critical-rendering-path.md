# Chapter 03: The Critical Rendering Path (Style Recalculation, Layout / Reflow, Paint, Compositing & GPU Layers)

> "The difference between an amateur frontend and a 120 FPS enterprise UI is understanding the browser's physical rendering pipeline. When an engineer animates `left` or `margin`, they force the CPU to recompute the geometry of the entire document. When an architect animates `transform`, the work bypasses the main thread entirely, executing directly on the GPU compositor."  
> — **Browser Performance & Animation Engineering**

---

## 1. Why This Topic Exists

A browser display updates at 60 Hz (every **16.6 milliseconds**) or 120 Hz (every **8.33 milliseconds**). Within that razor-thin frame budget, the browser must execute JavaScript, resolve styles, calculate geometry, paint textures, and composite pixels onto the display monitor.

When an engineer does not understand the **Critical Rendering Path (CRP)**:
1. **The Animation Stutter Disaster:** Animating layout properties (`width`, `height`, `top`, `margin`) triggers **Layout (Reflow)** across the entire document. On mobile devices, layout calculations take 30ms to 80ms, causing massive frame drops (**jank**) and reducing frame rates to 15 FPS.
2. **The Core Web Vitals CLS Penalty:** When asynchronous images or dynamic fonts push existing content down the screen without reserved space, the browser recalculates layouts mid-session, resulting in a high **Cumulative Layout Shift (CLS > 0.1)** that damages SEO and user experience.
3. **The Render Tree Misconception:** Many developers confuse the DOM with the Render Tree, failing to recognize that elements with `display: none` consume zero layout space, while elements with `visibility: hidden` consume full layout space.

Mastering the 5 sequential phases of the rendering pipeline—**Style → Layout → Paint → Composite**—is the prerequisite for achieving flawless, hardware-accelerated 60/120 FPS performance.

---

## 2. Learning Objectives

- Dissect the 5 sequential phases of the Critical Rendering Path: **Parse → Style Recalculation → Layout (Reflow) → Paint → Compositing**.
- Understand the construction of the **Render Tree**: why `display: none` is excluded while `visibility: hidden` and `opacity: 0` are retained.
- Master the difference between **Layout (Geometry)**, **Paint (Raster Records)**, and **Compositing (GPU Texture Stacking)**.
- Analyze the CSS Property Trigger Matrix: know which properties trigger Layout, which trigger Paint only, and which trigger Compositing only.
- Inspect **GPU Layer Promotion** (`will-change: transform`, 3D transforms) and manage GPU Video RAM (VRAM) consumption.
- Profile rendering bottlenecks using the Chrome DevTools **Performance Panel**, **Rendering Drawer**, and **Layers Panel**.
- Bridge architectural mental models directly to **Angular** (Zone.js tick timing before browser paint) and **.NET** (WPF / WinUI 3 Visual Tree, DirectX composition pipeline, and Dispatcher frames).

---

## 3. Historical Evolution

```text
ERA 1: Software Rendering & Full-Window Repaints (1995 - 2010)
┌────────────────────────────────────────────────────────┐
│ Single CPU-based framebuffer.                          │
│ - Any DOM mutation repaints the entire browser window. │
│ - Software rasterization; CPU saturates at 100%.       │
│ - Complex animations run at < 20 FPS.                  │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
ERA 2: Accelerated Compositing & GPU Layers (2010 - 2018)
┌────────────────────────────────────────────────────────┐
│ WebKit & Chromium introduce GPU Compositing.           │
│ - Page elements partitioned into discrete GPU textures.│
│ - CSS 3D transforms (translateZ(0)) promote to layers. │
│ - GPU handles layer scaling, opacity, and rotation.    │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
ERA 3: Multi-Threaded Raster & Off-Main-Thread Compositing (2018 - Present)
┌────────────────────────────────────────────────────────┐
│ Modern Chromium Architecture.                          │
│ - Compositor Thread runs independently of Main Thread. │
│ - Skia raster threads convert display lists in parallel│
│ - CSS transform/opacity animations run at 120 FPS      │
│   even when the JavaScript main thread is blocked!     │
└────────────────────────────────────────────────────────┘
```

---

## 4. First Principles & Intuitive Physical Analogies (Layer 1)

### The Four Craftsmen of the Theater Production

Imagine staging a live theatrical play in a grand auditorium:

```text
1. THE STYLIST (Style Recalculation)    == Decides the costume & wig for each actor
2. THE ARCHITECT (Layout / Reflow)      == Measures the stage with a tape measure
3. THE PAINTER (Paint)                  == Paints the backdrop canvas with brushes
4. THE PROJECTIONIST (Composite & GPU)  == Operates the overhead optical projector
```

1. **The Stylist (Style Recalculation):** Reads the script (DOM) and the wardrobe catalog (CSSOM). For every character on stage, the stylist determines: *"You will wear a velvet green coat."*
2. **The Architect (Layout / Reflow):** Pulls out a tape measure and marks chalk outlines on the stage floor. The architect determines exact physical dimensions: *"Actor A stands 42 centimeters from the left wing and occupies 120 square centimeters of floor space."*
   - *The Danger:* If Actor A changes their size (`width` or `margin`), the architect must remeasure **every other actor on stage**!
3. **The Painter (Paint):** Takes out oil paints and brushes. Fills in the chalk boxes with physical visual details: borders, drop shadows, gradients, and text glyphs. Produces a set of painted glass transparencies.
4. **The Projectionist (Composite / GPU):** Takes the finished, pre-painted glass transparencies, stacks them on top of each other, and shines the bright spotlight (GPU hardware) onto the screen.
   - If Actor A needs to slide to the right (CSS `transform: translateX`), the architect doesn't remeasure and the painter doesn't repaint. The projectionist simply **slides the glass transparency 5 centimeters to the right** with their thumb. It takes 0.1 milliseconds!

---

## 5. Internal Working & Engine Architecture (Layer 2)

### 1. The Complete 5-Stage Rendering Pipeline

```text
DOM Tree + CSSOM Tree
         │
         ▼
[STAGE 1: RENDER TREE CONSTRUCTION]
Combines DOM + CSSOM. Traverses visible nodes.
(Excludes <head>, <script>, and display: none elements)
         │
         ▼
[STAGE 2: LAYOUT (REFLOW)]
Calculates exact geometric coordinates (x, y, width, height).
Generates Blink LayoutBox hierarchy.
         │
         ▼
[STAGE 3: PAINT (DISPLAY LIST RECORDING)]
Traverses stacking contexts. Records Skia drawing commands
(drawRect, drawTextBlob, drawPath).
         │
         ▼
[STAGE 4: TILING & RASTERIZATION]
Compositor Thread divides layers into 256x256 pixel tiles.
Raster Worker Threads convert Skia commands to GPU bitmaps.
         │
         ▼
[STAGE 5: COMPOSITING & GPU DISPLAY]
GPU Process draws composite quads onto display framebuffer surface.
Pixels appear on monitor!
```

---

### 2. Render Tree vs. DOM Tree: The Invisibility Matrix

A common interview trap is misunderstanding which elements enter the Render Tree:

| CSS Declaration | In DOM Tree? | In Render Tree? | Triggers Layout Space? | Triggers Paint? |
| :--- | :---: | :---: | :---: | :---: |
| Normal Element | ✅ YES | ✅ YES | ✅ YES (Takes up space) | ✅ YES |
| `display: none` | ✅ YES | ❌ **NO** | ❌ **NO** (0 x 0 geometry) | ❌ **NO** |
| `visibility: hidden` | ✅ YES | ✅ **YES** | ✅ **YES** (Preserves space)| ❌ **NO** (Invisible) |
| `opacity: 0` | ✅ YES | ✅ **YES** | ✅ **YES** (Preserves space)| ✅ **YES** (Drawn clear) |

- **`display: none`:** The node and all its descendants are **completely omitted from the Render Tree**. They consume zero layout time.
- **`visibility: hidden`:** The node **is included in the Render Tree**. Its geometric width and height are calculated during Layout, preserving empty space on the page, but its Paint commands are skipped.
- **`opacity: 0`:** Fully included in the Render Tree, Layout, and Paint. It is promoted to a transparent GPU layer during Compositing.

---

### 3. The CSS Property Trigger Matrix

Understanding which pipeline stages are triggered by CSS mutations is the foundation of 60/120 FPS engineering:

```text
┌───────────────────────────┬──────────────┬──────────────┬──────────────────┐
│ CSS Property Mutated      │ Triggers     │ Triggers     │ Triggers         │
│                           │ LAYOUT?      │ PAINT?       │ COMPOSITING?     │
├───────────────────────────┼──────────────┼──────────────┼──────────────────┤
│ width, height, margin     │ ✅ YES       │ ✅ YES       │ ✅ YES           │
│ top, left, right, bottom  │ ✅ YES       │ ✅ YES       │ ✅ YES           │
│ font-size, line-height    │ ✅ YES       │ ✅ YES       │ ✅ YES           │
│ color, background-color   │ ❌ NO        │ ✅ YES       │ ✅ YES           │
│ box-shadow, border-radius │ ❌ NO        │ ✅ YES       │ ✅ YES           │
│ transform: translate3d()  │ ❌ NO        │ ❌ NO        │ ✅ **ONLY THIS!**│
│ opacity: 0.5              │ ❌ NO        │ ❌ NO        │ ✅ **ONLY THIS!**│
│ filter: blur(5px)         │ ❌ NO        │ ❌ NO        │ ✅ **ONLY THIS!**│
└───────────────────────────┴──────────────┴──────────────┴──────────────────┘
```

**The Golden Rule of Web Animation:**  
Never animate properties that trigger Layout or Paint in production UI loops. **Animate exclusively with `transform` and `opacity`**!

---

## 6. Runtime Flow & Execution Traces

### Execution Trace: Mutating `margin-left` vs. Mutating `transform`

#### Trace A: The Impure Animation (`element.style.marginLeft = '100px'`)
```text
1. JavaScript Main Thread: Modifies style.marginLeft.
2. Style Recalculation: Marks element as dirty. Recalculates computed CSS.
3. Layout (Reflow):
   -> Element shifted right.
   -> Adjacent sibling elements pushed down.
   -> Parent container height recalculated.
   -> Entire subtree layout recomputed! (Duration: 28ms - Frame Drop!).
4. Paint:
   -> Background, text glyphs, and box shadows repainted onto bitmap.
5. Compositor Thread:
   -> Updates GPU texture. Draws frame.
Result: 18 FPS. Choppy, janky animation on mobile.
```

#### Trace B: The Hardware-Accelerated Animation (`element.style.transform = 'translateX(100px)'`)
```text
1. JavaScript Main Thread: Modifies style.transform.
2. Style Recalculation: Updates transform matrix.
3. Layout (Reflow): SKIPPED! (0ms)
4. Paint: SKIPPED! (0ms)
5. Compositor Thread:
   -> Takes pre-rasterized GPU texture layer.
   -> Multiplies 4x4 coordinate transformation matrix on GPU hardware.
   -> GPU draws composite quad directly to display monitor.
Result: 120 FPS. Perfectly fluid animation with 0ms Main Thread CPU utilization!
```

---

## 7. Memory Model & GPU VRAM Allocation

When an element is promoted to its own **Compositor Layer** (via `will-change: transform` or 3D transforms):
1. Blink allocates a dedicated **`cc::Layer`** object.
2. The GPU Process allocates video memory (**VRAM**) to store the rasterized bitmap texture of that element.
3. **The Over-Promotion Disaster:**
   - A single 800x600 element layer consumes:  
     `800 * 600 * 4 bytes (RGBA) = 1.92 MB of VRAM`.
   - If an engineer recklessly adds `* { will-change: transform; }` across 500 cards, the application attempts to allocate **~1 GB of GPU VRAM**!
   - On mobile devices, this triggers a **GPU Context Loss (`webglcontextlost`)**, crashing the browser tab instantly.

---

## 8. Visual Diagrams (ASCII / Text)

### Stacking Contexts & Layer Compositing Topology

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FINAL DISPLAY COMPOSITION                       │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Layer 3: Floating Modal (transform: translateZ(0))             │   │
│   │ [Stored as independent GPU texture in VRAM]                    │   │
│   └───────────────────────────────▲────────────────────────────────┘   │
│                                   │                                    │
│   ┌───────────────────────────────┴────────────────────────────────┐   │
│   │ Layer 2: Fixed Sticky Navigation Bar (position: sticky)        │   │
│   │ [Stored as independent GPU texture in VRAM]                    │   │
│   └───────────────────────────────▲────────────────────────────────┘   │
│                                   │                                    │
│   ┌───────────────────────────────┴────────────────────────────────┐   │
│   │ Layer 1: Root Document & Body Background                       │   │
│   │ [Default root compositor tile layer]                           │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Real World Usage & Production Patterns

### Pattern 1: High-Performance 60/120 FPS Modal Animation

```css
/* Bad: Triggers Layout & Paint on every frame */
.modal-bad {
  position: fixed;
  top: 100px; /* Animate this -> 15 FPS JANK! */
  width: 500px;
  transition: top 0.3s ease;
}

/* Good: Compositor-Only Hardware Accelerated -> 120 FPS FLUID */
.modal-optimized {
  position: fixed;
  top: 0;
  left: 0;
  width: 500px;
  /* Promote to dedicated GPU compositor layer */
  will-change: transform, opacity;
  transform: translate3d(0, 100px, 0);
  opacity: 1;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

/* Closed state */
.modal-optimized.is-hidden {
  transform: translate3d(0, 120px, 0) scale(0.96);
  opacity: 0;
  pointer-events: none;
}
```

### Pattern 2: Eliminating Cumulative Layout Shift (CLS) for Dynamic Media

```html
<!-- Bad: 0px height before download -> Triggers massive layout shift when image loads -->
<img src="/hero.jpg" alt="Hero">

<!-- Good: Aspect ratio reserved in Layout phase -> Zero CLS! -->
<div class="aspect-ratio-box">
  <img 
    src="/hero.jpg" 
    alt="Hero" 
    width="1200" 
    height="675"
    style="aspect-ratio: 16 / 9; width: 100%; height: auto;"
    loading="eager"
  >
</div>
```

---

## 10. Angular Comparison

| Dimension | Browser Rendering Path | Angular (v17+) |
| :--- | :--- | :--- |
| **Change Detection Timing** | Browser executes Style → Layout → Paint sequentially. | Angular Zone.js detects asynchronous microtasks, running change detection **before** the browser's render frame. |
| **Animation Optimization** | CSS `transform` and Web Animations API run on the Compositor thread. | `@angular/animations` uses Web Animations API under the hood, but triggers CD cycles unless run outside NgZone. |
| **DOM Tree Mutations** | Direct Blink mutations trigger style dirtiness. | Angular Signals update fine-grained text nodes directly, reducing the number of affected layout subtrees. |
| **Animation Best Practice** | Animate `transform` and `opacity` only. | Inject `NgZone` and execute performance-critical animations via `ngZone.runOutsideAngular(() => ...)`. |

---

## 11. .NET Comparison

| Dimension | Browser Critical Rendering Path | WPF / WinUI 3 / MAUI (.NET 9/10) |
| :--- | :--- | :--- |
| **Tree Construction** | DOM + CSSOM combined into Render Tree. | Logical Tree compiled into **Visual Tree** of `UIElement` instances. |
| **Layout Phase** | Layout (Reflow) calculates CSS box geometry. | Two-pass layout pipeline: `Measure()` pass followed by `Arrange()` pass. |
| **Paint Phase** | Blink generates Skia display list draw calls. | `OnRender(DrawingContext dc)` emitting DirectX drawing instructions. |
| **Composition Engine** | Compositor Thread stacks tiles; GPU draws. | Windows Composition Engine (`Microsoft.UI.Composition`) compositing DirectX visual surfaces. |

---

## 12. Enterprise Perspective & Production Risks (Layer 4)

### 1. The Cumulative Layout Shift (CLS) Core Web Vitals Failure
- **The Failure Mode:** An enterprise publication loads programmatic advertising banners above the fold without fixed CSS dimensions.
- **The Impact:** When ads load 800ms after initial paint, the entire article jumps down 250px. The user's tap accidentally clicks the wrong button.
- **The Consequence:** The page scores a **CLS > 0.35** (Google penalty threshold is 0.1). Google Search algorithm demotes the company's search rankings by 20%, resulting in millions of dollars in lost organic traffic!
- **The Fix:** Always enforce CSS `min-height` or explicit `aspect-ratio` containers for all asynchronous content (ads, widgets, images).

### 2. The `will-change` Memory Leak / VRAM Exhaustion
- **The Failure Mode:** A developer applies `will-change: transform` globally to thousands of items in an infinite-scroll product grid.
- **The Impact:** The browser promotes every item into a distinct GPU layer, exhausting all mobile VRAM. Low-end Android devices freeze, drop to 5 FPS, or crash the browser process completely.
- **The Fix:** Apply `will-change` only on active hover or during active interaction, and **remove the property when the animation completes**!

---

## 13. Performance Considerations

```text
Rendering Budget per Frame (Target: 60 FPS = 16.6ms | 120 FPS = 8.33ms)
┌───────────────────────────────────────────────┬───────────────────────────┐
│ Frame Stage                                   │ Time Budget (Target)      │
├───────────────────────────────────────────────┼───────────────────────────┤
│ JavaScript Execution (Event Loop, React, V8)  │ < 4.0 ms                  │
│ Style Recalculation                           │ < 1.5 ms                  │
│ Layout / Reflow                               │ < 2.5 ms                  │
│ Paint (Record draw commands)                  │ < 1.5 ms                  │
│ Compositor Commit & Rasterization (GPU)       │ < 3.0 ms                  │
├───────────────────────────────────────────────┼───────────────────────────┤
│ TOTAL FRAME TIME BUDGET                       │ < 12.5 ms (Safety buffer) │
└───────────────────────────────────────────────┴───────────────────────────┘
```

---

## 14. Tradeoffs

| Approach | Advantages | Disadvantages |
| :--- | :--- | :--- |
| **GPU Layer Promotion (`transform`)** | 60/120 FPS fluid animation; zero main-thread layout or paint overhead. | Consumes GPU VRAM; potential font blurring or subpixel rendering anomalies. |
| **Standard Layout Animation (`height`)** | Content flows naturally; no extra GPU memory allocated. | Extremely expensive ($O(n)$ reflow); causes severe frame drops and jank. |
| **`display: none` Toggle** | 0ms layout memory overhead when hidden; completely removed from Render Tree. | Cannot animate smoothly; unmounting resets scroll and form focus states. |
| **`visibility: hidden` Toggle** | Preserves layout space; prevents layout shift when toggling visibility. | Consumes layout memory; cannot reclaim screen real estate. |

---

## 15. Common Mistakes & Interview Traps

### Trap 1: Believing `display: none` and `visibility: hidden` are Equivalent
- **Scenario:** The interviewer asks: *"Does an element with `display: none` take up memory in the Layout phase?"*
- **Candidate Answer:** *"Yes, it's just hidden from view."*
- **Correction:** **WRONG.** `display: none` is completely **excluded from the Render Tree** and has zero representation in the Layout Tree. `visibility: hidden` **is included in the Render Tree**, fully calculated during Layout (takes up physical width and height), and only skipped during Paint!

### Trap 2: Animating `left` Instead of `transform: translateX`
- **Scenario:** A developer writes CSS: `@keyframes slide { from { left: 0px; } to { left: 200px; } }`.
- **The Reality:** Modifying `left` triggers the **entire rendering pipeline**: Layout → Paint → Composite on every single frame. Changing it to `transform: translateX(200px)` skips Layout and Paint completely, running exclusively on the GPU Compositor thread.

---

## 16. Interview Questions & Architectural Answers (Senior, Lead, Architect - Layer 5)

### Question 1 (Senior): "Explain the exact lifecycle of how an element's styles go from CSS text to pixels on the screen."
**Architectural Answer:**  
1. **Style Recalculation:** The browser matches CSS selectors against DOM nodes, computing final cascaded values for each element (`computedStyle`).
2. **Render Tree Construction:** Builds the hierarchy of visible elements, omitting `<head>`, `<script>`, and `display: none` subtrees.
3. **Layout (Reflow):** Walks the Render Tree, calculating the exact box model geometry (coordinates and dimensions) of each box.
4. **Paint:** Generates display lists—ordered sequences of Skia drawing commands (backgrounds, borders, text, shadows).
5. **Rasterization & Compositing:** The Compositor Thread tiles the layers, Raster threads turn draw calls into pixel bitmaps in GPU memory, and the GPU composites the quads onto the screen surface.

### Question 2 (Lead): "What causes Cumulative Layout Shift (CLS), and what architectural patterns prevent it in enterprise web applications?"
**Architectural Answer:**  
**CLS Causes:** Un-sized images, dynamically injected advertising containers, late-loading web fonts causing FOIT/FOUT, and asynchronous content injected above existing DOM nodes.  
**Architectural Mitigations:**
1. **Explicit Dimensions:** Always define `width`, `height`, or CSS `aspect-ratio` on all `<img>` and `<video>` tags so the browser allocates layout space before the asset downloads.
2. **Reserved Ad Containers:** Enforce `min-height` on dynamic widget/ad slots.
3. **Font Fallback Matching:** Use CSS `@font-face { size-adjust: ...; ascent-override: ... }` to ensure system fallback fonts match the exact bounding box of custom web fonts.
4. **Transform-Only UI:** Animate toasts, sidebars, and drawers using CSS `transform` so they render off-canvas without displacing existing DOM flow.

### Question 3 (Architect): "How do Stacking Contexts relate to GPU Compositor Layers, and what causes the 'Accidental Layer Promotion' bug?"
**Architectural Answer:**  
- **Stacking Contexts** are paint-order concepts (Z-index, opacity, transform) that dictate which elements paint in front of others.
- **Compositor Layers** are memory textures allocated on the GPU.
- **The Accidental Layer Promotion Bug:** If Element A is promoted to a GPU layer (e.g., via `transform: translateZ(0)`), and Element B sits visually on top of Element A in the stacking context without its own layer promotion, the browser is forced to promote Element B to a GPU layer as well to preserve correct visual overlap! In complex UIs, this creates an exponential cascading layer promotion that exhausts device VRAM.  
**Fix:** Keep animated layers isolated in their own high z-index stacking contexts with minimal visual overlap over static content.

---

## 17. Senior-Level Mental Model & "How to Remember This Forever" (Memory Anchors - Layer 3)

### The Memory Peg: "The Four Craftsmen"
- **The Stylist (Style):** Dresses the actors.
- **The Architect (Layout):** Measures the stage floor with a tape measure. *Touch this and you remeasure the whole theater!*
- **The Painter (Paint):** Covers the wood with paint.
- **The Projectionist (Composite):** Slides the clear glass slides on the overhead projector. *Fast, effortless, and runs on pure light (GPU)!*

---

## 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)

- **Layout (Reflow):** The expensive calculation of element dimensions and physical screen positions.
- **Paint:** The recording of visual drawing commands (text, colors, borders) into display lists.
- **Compositing:** The assembly of individual GPU layer textures onto the final screen display.
- **`will-change`:** A CSS hint signaling the browser to pre-allocate an independent GPU layer for an element.
- **The "Aha!" Insight:** Fast animations are not about writing faster JavaScript; they are about **avoiding Layout and Paint completely** by staying entirely on the Compositor thread!

---

## 19. Key Takeaways

1. **The Critical Rendering Path has 5 stages:** Parse → Style → Layout → Paint → Composite.
2. **`display: none` is excluded from the Render Tree;** `visibility: hidden` is included in Layout and preserves physical space.
3. **Always animate with `transform` and `opacity`** to achieve 60/120 FPS by skipping Layout and Paint.
4. **Reserve space for images and ads with `aspect-ratio`** to eliminate Cumulative Layout Shift (CLS).
5. **Use `will-change` judiciously;** over-promoting elements to GPU layers exhausts mobile VRAM and causes crashes.
6. **Layout calculations are global and expensive ($O(n)$):** Changing the width of one element can trigger reflow across the entire document.

---

## 20. Revision Sheet

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CRITICAL RENDERING PATH CHEAT SHEET                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Pipeline Stages:                                                                       │
│   Style Recalculation -> Layout (Geometry) -> Paint (Draw Calls) -> Composite (GPU)    │
│                                                                                        │
│ CSS Mutation Trigger Matrix:                                                           │
│   width, height, top, left, margin   --> Triggers LAYOUT + PAINT + COMPOSITE (Heavy)   │
│   color, background-color, shadow    --> Triggers PAINT + COMPOSITE (Medium)           │
│   transform, opacity                 --> Triggers COMPOSITE ONLY (Ultra-Fast 120 FPS)  │
│                                                                                        │
│ Performance Rules of Thumb:                                                            │
│   - Target frame budget: 16.6ms (60 Hz) or 8.33ms (120 Hz ProMotion)                   │
│   - Prevent CLS: Always set width & height or aspect-ratio on media                    │
│   - Promote layers: will-change: transform (remove when animation ends)               │
│                                                                                        │
│ Golden Architectural Rule:                                                             │
│   "Never animate geometry; animate compositor textures."                               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
