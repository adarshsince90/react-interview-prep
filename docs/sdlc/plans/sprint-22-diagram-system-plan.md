# Sprint 22 Architectural Plan: TopicReader Fluid Diagram Canvas & Ahead-of-Time (AOT) Vector Diagram Compiler

> **Sprint:** 22 (Epic 22 - v0.21.0)  
> **Status:** Active Execution  
> **Scope:**  
> - **Part A (Immediate Quick Fix):** Widen the desktop center reading section and optimize code typography so ASCII boxes fit completely without horizontal scrollbars.  
> - **Part B (Next Phase Architectural Feature):** Build an Ahead-of-Time (AOT) diagram interception and compilation system that converts ASCII diagrams into web-focused, colorful vector/Mermaid diagrams once at build time, saving and reusing them with zero runtime performance overhead.  
> **Authoritative SSOT:** Single Source of Truth for Diagram Rendering Architecture.

---

## 1. Problem Statement & User Evidence

### 1.1 Observed Issue (User Screenshot)
In desktop viewports (1440px / 1920px), code blocks containing ASCII architecture diagrams or timeline callouts (e.g., Section 3 Historical Evolution, Section 8 Visual Diagrams) exhibit a slight horizontal scrollbar (~20px–40px).

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CHRONOLOGICAL EVOLUTION                         │
├────────────────────────────────────────────────────────────────────────┤
│ 2000 - Active Directory Domain Services (AD DS): On-premises Kerberos...
│ 2014 - Azure Active Directory (Azure AD v1.0): Cloud-native identity... │
│ 2018 - Microsoft Identity Platform (v2.0) & MSAL.js: Unified Microsoft...│
│ 2021 - MSAL.js v2 & `@azure/msal-react`: Switched to PKCE Auth Code... │
│ 2023+ - Microsoft Rebrands Azure AD to Microsoft Entra ID: Zero-Trust... │
└────────────────────────────────────────────────────────────────────────┘
 [======== Scrollbar indicator on ~840px box in an 800px column ========]
```

### 1.2 Mathematical Root Cause
- Current `.prose-reading-container` has `max-width: 800px;` (derived from classical typographic 65–75 CPL guidelines).
- Current `.topic-reader-main-grid` has `grid-template-columns: minmax(0, 820px) 290px;` and container `max-width: 1220px;`.
- Monospace font is rendered at `0.88rem` (~14px, ~8.4px character width).
- An 88-character ASCII box with 40px container padding requires:
  $$\text{Content Width} = (88 \times 8.4\text{px}) + 40\text{px} = 779.2\text{px}$$
- A 95-character box requires:
  $$\text{Content Width} = (95 \times 8.4\text{px}) + 40\text{px} = 838\text{px}$$
- Since $838\text{px} > 800\text{px}$, the browser's `overflow-x: auto` is triggered, generating a horizontal scrollbar.

---

## 2. Part A: Immediate Quick Fix (Fluid Desktop Width & Monospace Density)

### 2.1 Implementation Strategy
Instead of artificially squeezing wide architecture boxes, we give the reading canvas breathing room on desktop viewports while preserving strict typographic readability:

1. **Widen `.topic-reader-main-grid`**:
   - Update from `minmax(0, 820px) 290px` to `minmax(0, 920px) 290px`.
   - On wide desktop displays (`@media (min-width: 1440px)`), allow `minmax(0, 960px) 290px; max-width: 1360px;`.
2. **Widen `.prose-reading-container`**:
   - Increase `max-width` from `800px` to `900px` (or `940px` on screens $\ge 1440\text{px}$).
3. **Monospace Code Block Density Optimization**:
   - Refine `pre` styling in `apps/portal/src/index.css`:
     - `font-size: 0.84rem;` (down slightly from `0.88rem`, reducing character width to ~7.8px).
     - `line-height: 1.48;`.
     - `padding: 1.1rem 1.25rem;`.
   - At $7.8\text{px}$ per character, an 88-character ASCII box consumes only:
     $$(88 \times 7.8\text{px}) + 40\text{px} = 726.4\text{px}$$
   - This fits effortlessly into the 900px canvas with **over 170px of margin to spare**, completely eliminating horizontal scrollbars across all desktop viewports.

---

## 3. Part B: Ahead-of-Time (AOT) Vector Diagram Compiler Architecture

### 3.1 Architectural Principles: Why Ahead-of-Time (AOT)?

| Metric | Ahead-of-Time (AOT) Build Compiler ⭐ | Just-in-Time (JIT) Client-Side Interceptor ❌ |
| :--- | :--- | :--- |
| **Execution Point** | Build pipeline / Node.js script (`scripts/generate-diagrams.mjs`). | Browser runtime inside `TopicReader.tsx` during markdown parsing. |
| **Client CPU Cost** | **0 ms** (Zero runtime computation). | High (Regex parsing, AST parsing, DOM element construction on main thread). |
| **Web Vitals Impact** | INP: 0ms, CLS: 0, LCP: Unchanged (Fast static asset). | Severe INP degradation and Cumulative Layout Shifts (CLS) as text flips to diagrams. |
| **Storage & Caching** | Saved once to `apps/portal/public/diagrams/` or committed in notes. Fully CDN/HTTP cacheable. | Ephemeral; recalculated on every page visit or topic change. |
| **Deterministic Review** | Reviewable in Git diffs; zero surprise syntax parse failures in production. | Brittle; edge cases in ASCII formatting cause broken UI in front of users. |

### 3.2 System Architecture & Flow

```text
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                    AOT DIAGRAM COMPILATION PIPELINE (Sprint 22)                       │
└───────────────────────────────────────────────────────────────────────────────────────┘

1. DISCOVERY & PARSING
   notes/phase-XX/*.md
   └── Regex / AST Parser extracts:
       ├── Section 3: Evolution Timelines & Chronologies
       └── Section 8: Visual Architecture ASCII Art (Memory topologies, Event loops, etc.)

2. GENERATION ENGINE (Run Once)
   scripts/generate-diagrams.mjs
   ├── Target Option 1: Native Mermaid Vectors (flowchart, timeline, sequenceDiagram)
   │   └── Replaces raw ```text ASCII in markdown with ```mermaid syntax.
   │   └── Rendered natively by Portal's existing SVG vector engine with CSS tokens.
   │
   └── Target Option 2: Pre-Compiled Web SVGs
       └── Generates apps/portal/public/diagrams/[topic-id]-[section-id].svg
       └── Emits SVG <rect>, <path>, <text> with modern rounded cards and theme CSS tokens.

3. CONSUMPTION (TopicReader.tsx)
   └── Seamless rendering via cached SVGs or Mermaid.js vector engine.
   └── Full Dark/Light theme reactivity (var(--react-cyan), var(--bg-card)).
   └── High-DPI crisp vector scaling on Retina/4K displays.
```

### 3.3 Storage & File Reusability
- **Storage Location:** `apps/portal/public/diagrams/[topic-id]/[section-name].svg`
- **Metadata Index:** Manifest entry in `apps/portal/src/assets/manifest.json`:
  ```json
  {
    "id": "03-microsoft-entra-id-azure-ad",
    "diagrams": [
      {
        "section": "03-historical-evolution",
        "type": "timeline",
        "svgPath": "/diagrams/03-microsoft-entra-id-azure-ad/03-historical-evolution.svg"
      }
    ]
  }
  ```
- **Reusability Contract:** If the SVG exists and the note hash has not changed, the build step skips re-generation. Zero duplicate builds.

---

## 4. Work Breakdown & Phased Execution

- [ ] **TASK-22-01 (Part A - Immediate Quick Fix):** Update `apps/portal/src/index.css`:
  - Widen `.topic-reader-main-grid` to `minmax(0, 920px) 290px` with `max-width: 1320px`.
  - Widen `.prose-reading-container` to `max-width: 900px`.
  - Tune `pre` typography (`font-size: 0.84rem`, `line-height: 1.48`).
  - Verify removal of horizontal scrollbar in browser.
- [ ] **TASK-22-02 (Part B Specification & Pilot):** Create pilot script `scripts/generate-diagrams.mjs` targeting Section 3 timelines across Phase 07 and Phase 06.
- [ ] **TASK-22-03 (Part B Mermaid & SVG Compiler):** Build automated translator from ASCII box graphs to Mermaid `timeline` / `flowchart TD` blocks.
- [ ] **TASK-22-04 (Quality Gates & Multi-Device Check):** Run `npm test`, verify 0 regressions across all 110 topics, and inspect desktop & mobile rendering.
