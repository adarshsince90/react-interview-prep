# ADR-002: Portal UI/UX Modernization, Typographic Reading Constraints & Diagram Bounding

## Context
User feedback and bug audits identified several friction points in [`apps/portal`](../../apps/portal):
1. **Right Panel TOC Broken & Scroll Friction:** Section link clicks do not reliably scroll to target headings due to mismatched slugification algorithms between build-time node scripts and runtime markdown renderers. The TOC sidebar does not stick reliably across different viewports.
2. **Diagram Aspect-Ratio Distortion:** Mermaid flowcharts and runtime ASCII diagrams stretch vertically on large monitors, breaking visual layout.
3. **Typographic Eye Fatigue:** Markdown prose was rendered in an unconstrained container (>100 characters per line), creating visual fatigue during intensive architectural reading.
4. **Inconsistent Sidebar Hierarchies:** Left navigation titles displayed inconsistent numbering pills (`Chapter 01` vs `01` vs `Phase-XX`).

## Decision
1. **Typographic Reading Container (65–75 Characters Per Line):**
   - Constrain the markdown reading body to a maximum width of `780px` (`max-width: 780px; margin: 0 auto;`).
   - Standardize line-height to `1.7`, enhance paragraph spacing, and integrate modern programming typography (`Plus Jakarta Sans` for UI, `JetBrains Mono` for code).
2. **Unified Heading Slugification & Sticky ScrollSpy:**
   - Standardize slugification logic in both `generate-manifest.mjs` and `TopicReader.tsx` using a shared algorithm that cleans HTML entities and punctuation identically.
   - Fix right panel positioning with `position: sticky; top: 80px; max-height: calc(100vh - 100px); overflow-y: auto;` so it remains pinned during scrolling while accommodating long TOC lists.
   - Offset smooth-scroll jumps by `80px` to clear the fixed top navigation bar.
3. **Diagram Sizing & Bounding Wrappers:**
   - Wrap Mermaid diagrams in a `.mermaid-wrapper` with responsive SVG constraints (`max-height: 520px; width: 100%; object-fit: contain`) to preserve aspect ratio and prevent vertical stretching.
   - Set fixed line-height and monospace scaling (`0.85rem`) on ASCII architecture diagram code blocks.
4. **Standardized Sidebar Navigation Pills:**
   - Normalize chapter numbers across all phases into clean uniform badges: `[01]`, `[02]`, `[AC]` (Architectural Companion).

## Consequences
- **Positive:**
  - Reading experience feels like a premier, distraction-free technical publication (comparable to Stripe Press or Rust Book).
  - Navigation between sections is instantaneous, sticky, and accurate.
  - Diagrams render in complete, single-screen view without requiring excessive vertical scrolling.
- **Negative / Trade-offs:**
  - On ultra-wide monitors, whitespace increases symmetrically around the centered prose container (a deliberate typographic best practice for eye tracking).
