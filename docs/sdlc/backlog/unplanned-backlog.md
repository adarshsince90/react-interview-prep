# Unplanned Backlog

> 📥 **Intake Queue:** Log raw defects, ad-hoc UX requests, or unplanned architectural improvements here as they arise during walkthroughs, live usage, or testing. Once triaged and resolved, items are promoted to [`backlog.md`](./backlog.md) with detailed root-cause analyses, code resolutions, and acceptance criteria.

---

### Active Intake Queue

*(No active unplanned issues currently. All previous items have been resolved and promoted to [`backlog.md`](./backlog.md).)*

---

### Recently Resolved & Promoted Items

#### ✅ [RESOLVED] BUG-ROUTE-REFRESH-FLASH: SPA Route Initial Render Flash on Reload
- **Date Reported:** 2026-10-08
- **Evidence / User Observation:** Reported in unplanned backlog: *"?view=challenges url when refreshed, initially loads the dashboard screen for a moment and then display challenges page, is it intended behavior?"*
- **Affected Area:** `apps/portal/src/App.tsx` (State initialization & URL synchronization).
- **Observed Behavior:**
  - Refreshing or directly loading `?view=challenges`, `?view=labs`, or `?topic=...` caused a momentary visible flash of the root Dashboard before switching to the requested view.
- **Root Cause:**
  - `activeView` in `App.tsx` was statically initialized to `'dashboard'` (`useState('dashboard')`).
  - URL parameter synchronization only executed asynchronously inside `useEffect` after the initial DOM paint, forcing an unnecessary secondary render and visible layout flash.
- **Resolution:**
  - Added synchronous `resolveInitialRoute(defaultTopic)` helper in `App.tsx` that inspects `window.location.search` on initial component instantiation.
  - Initialized `activeView`, `selectedTopic`, and `selectedLabId` with synchronous URL parameters on frame 0.
  - Retained `popstate` listener for smooth back/forward browser history navigation with zero flicker.

#### ✅ [RESOLVED] FEAT-CHALLENGE-THEORY-DEEPDIVE: Publication-Grade Architectural Deep Dive, Code Walkthroughs & Path Leak Removal
- **Date Reported:** 2026-10-08
- **Evidence / User Observation:** User feedback: *"in all these challenges, in '3. Architectural Deep Dive & Theory' section, there is very little details, but there is link to tsx file of the the repo for implementation detail, but we will not be able to access that file from web app right, also it can be security concern to show the raw path in there? should we add more theory and important code snippet, explanations with our standard way of explanation..."*
- **Affected Area:** `apps/portal/src/features/challenges/ChallengesArena.tsx`.
- **Observed Behavior:**
  - Tab 3 displayed brief bullet points and a terminal box linking to raw local filesystem paths (e.g. `apps/portal/src/features/challenges/virtualizer/useDynamicVirtualizer.ts`).
  - Raw filesystem paths are inaccessible in deployed static web applications (GitHub Pages) and expose repository internal directory structures.
- **Root Cause:**
  - Experimental challenge view used minimal placeholder theory and referenced local filesystem source paths instead of self-contained in-situ explanations.
- **Resolution:**
  - **Removed Raw Filesystem Paths:** Eliminated all local file path disclosures from UI.
  - **Embedded Syntax-Highlighted Core Implementations:** Added self-contained production code snippets with copy button and line-by-line annotations for all 3 challenges:
    1. *Dynamic Virtualizer:* Binary search `findStartIndex` ($O(\\log N)$) + cumulative prefix-sum recalculation + non-blocking `ResizeObserver` measurement.
    2. *Concurrent Store:* `createStore` engine with `queueMicrotask` coalescing + `useStore` hook using `useSyncExternalStore` with referential equality memoization.
    3. *Offline Outbox:* FIFO queue worker + Amazon/Google Full-Jitter Exponential Backoff formula ($t = \\text{random}(0, \\min(C, b \\cdot 2^i))$) + optimistic atomic snapshot rollback.
  - **Architectural Pillars & Trade-off Matrix:** Added comparative tables evaluating alternative approaches against our architecture.
  - **Staff Interview Defense Guide:** Added Socratic interview probing traps with authoritative Staff/Principal defense rebuttals.

#### ✅ [RESOLVED] UX-CHALLENGES-SEPARATION: Dedicated Staff Machine Coding Arena & Clean Phase Labs Taxonomy
- **Date Reported:** 2026-10-08
- **Evidence / User Observation:** Screenshot `media_1791444605591.png` showing out-of-sync Sprint 17 challenge in Labs sidebar and query regarding Playground route navigation.
- **Affected Area:** `App.tsx`, `VisualizerHub.tsx`, `features/challenges/*`.
- **Observed Behavior:**
  - "Playground" tab routed back to homepage without distinct value or interactive workspace.
  - In Labs, the experimental machine coding challenge was titled "Sprint 17: Machine Coding" while all other 12 items were phase-prefixed (Phase 01 through Phase 11), creating taxonomic inconsistency.
  - Challenge item lacked problem specifications, constraints, Staff-level evaluation rubrics, and algorithmic architectural theory.
- **Root Cause:**
  - Machine coding challenge was prematurely attached to `VisualizerHub.tsx` which is reserved for theoretical runtime simulations.
  - Lack of dedicated master-detail view for hands-on Staff engineering challenges.
- **Resolution:**
  - **Phantom Playground Retired:** Replaced generic empty Playground link in navbar with dedicated **Challenges** (`<Code2 size={15} /> Challenges`) route mapped to `?view=challenges`.
  - **Visualizer Hub Restored:** Removed experimental sprint challenge from `VisualizerHub.tsx`, strictly restoring the 12 phase-mapped simulations (Phases 01–11).
  - **Dedicated Challenges Hub Created:** Built `apps/portal/src/features/challenges/ChallengesArena.tsx` with 3 Staff Machine Coding Challenges:
    1. **CH-01: Dynamic-Height Virtual Windowing Engine** (Prefix-sum offset cache, O(log N) binary search, ResizeObserver measurement).
    2. **CH-02: Zero-Dependency Concurrent State Store** (Microtask batching, `useSyncExternalStore` zero-tearing guarantee, referential selector memoization).
    3. **CH-03: Resilient Offline Mutation Outbox** (IndexedDB FIFO queue, full-jitter exponential backoff, optimistic cache snapshotting).
  - **3-Pillar Challenge Architecture:** Every challenge contains:
    - *🎮 1. Interactive Solution Arena:* Live dynamic controls, telemetry metrics, and real-time execution.
    - *📋 2. Problem Spec & Staff Rubric:* Target level, problem statement, technical requirements, evaluation rubric, and edge cases.
    - *📐 3. Architectural Deep Dive & Theory:* Algorithmic foundations, architectural trade-offs, and annotated source code references.
  - Verified with `npm test` (100% pass), `npm run build` (0 errors), and browser subagent end-to-end verification.

#### ✅ [RESOLVED] BUG-LATEX-ARROWS: Raw LaTeX Arrow Syntax (`\to` / `\rightarrow`) in Notes and Labs
- **Date Reported:** 2026-10-07
- **Evidence / User Screenshot:** `image-1.png`
- **Affected Area:** `01-javascript-execution-model.md` (Section 2 Learning Objectives), 19 handbook notes, and 3 simulation labs (`EventLoopLab.tsx`, `RenderCycleLab.tsx`, `FiberReconciliationLab.tsx`).
- **Root Cause:**
  1. Hand-authored notes and simulation components used LaTeX math tokens `$\to$` and `$\rightarrow$` instead of native Unicode `→`.
  2. `cleanMarkdownFormatting` regex in `TopicReader.tsx` did not handle `\to`, leaving raw escaped backslashes visible in prose.
- **Resolution:**
  - Converted all 124 instances of `$\to$`, `$\rightarrow$`, `\to`, and `\rightarrow` to clean Unicode `→` across 19 markdown files in `notes/` and `apps/portal/public/notes/`.
  - Added backtick styling for V8 internal primitives: `Primitives (Small Integers / \`Smi\`s via pointer tagging)`.
  - Replaced hardcoded `$\rightarrow$` in `EventLoopLab.tsx`, `RenderCycleLab.tsx`, and `FiberReconciliationLab.tsx` with `→`.
  - Added defensive regex replacements in `TopicReader.tsx` (`cleanMarkdownFormatting`).
  - Added automated CI check in `apps/portal/scripts/test-manifest-integrity.mjs` verifying zero raw `\to` or `\rightarrow` across all 110 handbook chapters.

#### ✅ [RESOLVED] UI-LABS-VERTICAL: VisualizerHub Horizontal Scroll Replaced by Master-Detail Sidebar
- **Date Reported:** 2026-10-07
- **Evidence / User Screenshot:** `image-2.png`
- **Affected Area:** `apps/portal/src/features/visualizers/VisualizerHub.tsx`
- **Observed Behavior:** As the number of interactive simulation laboratories grew to 9, the top tab row required horizontal scrolling, hiding labs off-screen and creating an unintuitive navigation experience.
- **Resolution:**
  - Redesigned `VisualizerHub.tsx` into a responsive master-detail layout.
  - Implemented a sticky vertical left navigation panel (`width: 320px`, scrollable) displaying all 9 simulations vertically.
  - Each simulation card includes its distinct phase badge, colored icon box, full title, 2-line educational subtitle, and active state indicator (solid left border and accent background).
  - Main simulation canvas occupies the full right area with zero horizontal scroll clipping.
  - Verified with automated tests and production build.

#### ✅ [RESOLVED] FEAT-HOVER-01: Smart Architectural Term Hover Cards & In-Situ Definitions
- **Date Reported:** 2026-10-07
- **Affected Area:** `apps/portal/src/features/topic-reader/` (`TopicReader.tsx`, `TermHoverCard.tsx`, `termDictionary.ts`, `index.css`)
- **Resolution:** Implemented non-destructive DOM text-node scanner and floating popovers with "Peek Summary" and "Read Chapter" actions.

#### ✅ [RESOLVED] BUG-CH06-FENCE: Markdown Code Block Closure Swallowing Comparison Tables
- **Date Reported:** 2026-10-07
- **Affected Area:** `06-authentication-session-management.md` & `07-route-handlers-api-design.md`
- **Resolution:** Fixed unclosed code fence in Pattern 3 and resynced notes.

#### ✅ [RESOLVED] BUG-THEME-CONTRAST: White Text Rendering Against Light Backgrounds in Simulation Labs
- **Date Reported:** 2026-10-07
- **Evidence / User Screenshot:** `image-3.png`
- **Affected Area:**
  - `apps/portal/src/features/visualizers/topic-04-purity/ComponentPurityLab.tsx`
  - `apps/portal/src/features/visualizers/topic-03-jsx/JsxCompilerLab.tsx`
  - `apps/portal/src/features/visualizers/topic-05-render/RenderCycleLab.tsx`
- **Observed Behavior:**
  - In light theme, text under "RENDERED COMPONENT TREE" (`Cloud Infrastructure (Azure)`, `Kubernetes Cluster`, `CDN & DNS Gateway`) in `ComponentPurityLab` was invisible due to hardcoded white text (`color: '#fff'`) inside light gray cards (`var(--bg-tertiary)`).
  - Main lab headings and card sub-headers had hardcoded `#fff` styling, rendering invisibly or poorly against white/light backgrounds.
  - V8 heap inspect containers and telemetry logs had hardcoded dark background (`#090d16`) inconsistent with light theme.
- **Root Cause:**
  - Simulation lab components used hardcoded `#fff` text colors instead of design tokens (`var(--text-primary)`, `var(--text-secondary)`).
  - Inner card rows used `var(--bg-tertiary)` inside hardcoded `#090d16` boxes, resulting in white text on light surfaces.
- **Resolution:**
  - **`ComponentPurityLab.tsx`:**
    - Switched lab title from `#fff` to `var(--text-primary)`.
    - Converted container backgrounds from hardcoded `#090d16` to `var(--bg-tertiary)` with `var(--border-subtle)`.
    - Styled rendered component rows with `background: 'var(--bg-secondary)'` and high-contrast `color: 'var(--text-primary)'`.
    - Styled V8 heap inspector with `var(--bg-secondary)` and explicit `color: 'var(--text-primary)'`.
    - Styled telemetry log with standard `var(--code-bg)` and cyan prompt text.
  - **`JsxCompilerLab.tsx`:**
    - Converted title and V8 heap label from `#fff` to `var(--text-primary)`.
    - Replaced hardcoded unselected expression button text (`#fff`) with `var(--text-primary)`.
    - Replaced hardcoded `#090d16` with `var(--code-bg)` and `var(--code-text)`.
  - **`RenderCycleLab.tsx`:**
    - Converted titles and pipeline headings (`h3`, `h4`) from `#fff` to `var(--text-primary)`.
    - Replaced Chromium display screen container with `var(--code-bg)` and `var(--react-cyan)` value text.
  - Verified with `npm test`, `npm run build`, and live headless browser screenshots in light mode.

---

### Intake Template

When capturing a new unplanned issue or bug, copy and fill out the template below:

```markdown
### [UNPLANNED-ID]: <Descriptive Issue Title>
- **Date Reported:** YYYY-MM-DD
- **Affected Area / Route:** (e.g., Dashboard, TopicReader, Lab 04, Search Modal)
- **Observed Behavior:**
  - <What is happening vs what should happen>
- **Reproduction Steps:**
  1. <Step 1>
  2. <Step 2>
- **Proposed Resolution / Notes:**
  - <Initial thoughts, files or components involved>
```

---

### Raw Intake Log Archive

*(All historical screenshot and feedback items have been triaged and resolved:)*
- **`image-1.png`:** Resolved via `BUG-LATEX-ARROWS` (Chapter 01 Learning Objectives & 19 markdown notes).
- **`image-2.png`:** Resolved via `UI-LABS-VERTICAL` (VisualizerHub master-detail vertical navigation).
- **`image-3.png`:** Resolved via `BUG-THEME-CONTRAST` (Simulation labs light-theme text contrast).
- **`media_1791444605591.png`:** Resolved via `UX-CHALLENGES-SEPARATION` (Dedicated Challenges Arena & Clean Labs Taxonomy).
- **User Feedback 2026-10-08:** Resolved via `BUG-ROUTE-REFRESH-FLASH` and `FEAT-CHALLENGE-THEORY-DEEPDIVE`.
