# ADR-001: Dual-Track Architecture, Markdown SSOT & Quarantined Comparative Pedagogy

## Context
The repository prepares an experienced Senior Software Engineer (11+ years in Angular, .NET/ASP.NET Core, Azure, Distributed Systems) for transition to Senior/Staff React and Next.js roles.

Two failure modes frequently occur in engineering education repositories:
1. **Content Fragmentation:** Documentation and UI components drift out of sync when topics are hardcoded into web application UI templates or disparate wikis.
2. **Comparison Bleed:** Scattering Angular and .NET comparisons into every section disrupts the natural mental models, runtime mechanics, and "aha!" intuition of the native JavaScript/React platform.

## Decision
1. **Dual-Track Repository Structure:**
   - **Track 1 (SSOT):** `notes/` directory holds publication-grade Markdown chapters. All theory, code snippets, memory anchors, and interview drills reside here as the sole authoritative source of truth.
   - **Track 2 (Living Application):** `apps/portal` is a companion Vite + React 19 + TypeScript SPA that dynamically ingests `notes/` via a prebuild script (`scripts/generate-manifest.mjs`). The portal never hardcodes curriculum content.
2. **Quarantined Comparative Pedagogy:**
   - Sections 1 through 9 strictly explore pure native JavaScript and React runtime mechanics (V8 heap structures, microtasks, Fiber trees, Lanes bitmasks).
   - All comparisons to Angular (Zone.js, Signals, RxJS, DI) and .NET (CLR GC, async state machines, MediatR, LINQ) are quarantined strictly into **Section 10 (Angular Comparison)** and **Section 11 (.NET Comparison)**.
3. **No LaTeX Math Syntax Rule:**
   - Math expressions must never use raw LaTeX (`$$...$$`, `\frac{}`, `\text{}`) because standard markdown readers render raw escape codes. All formulas must be standard GitHub Markdown, Unicode, or monospace code blocks (e.g., `**UI = f(State)**`, `O(n)`).

## Consequences
- **Positive:**
  - Content can be read in GitHub, IDEs, or the web portal with zero formatting discrepancies.
  - Native React concepts are learned deeply on their own terms without cognitive distortion, while high-leverage architectural bridges are cleanly accessible in dedicated comparison sections.
  - Automated CI tests (`scripts/test-manifest-integrity.mjs`) validate 100% of links and notes integrity at build time.
- **Negative / Trade-offs:**
  - Requires maintaining build scripts (`generate-manifest.mjs`) to keep the portal manifest updated whenever new notes are generated.
