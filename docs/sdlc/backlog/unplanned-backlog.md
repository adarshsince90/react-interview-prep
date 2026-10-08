# Unplanned Backlog

> 📥 **Intake Queue:** Log raw defects, ad-hoc UX requests, or unplanned architectural improvements here as they arise during walkthroughs, live usage, or testing. Once triaged and resolved, items are promoted to [`backlog.md`](./backlog.md) with detailed root-cause analyses, code resolutions, and acceptance criteria.

---

### Active Intake Queue

### [UNPLANNED-DIAGRAM-WIDTH-AND-AOT]: TopicReader Desktop Diagram Width & Next-Gen AOT Diagram Conversion
- **Date Reported:** 2026-10-08
- **Affected Area / Route:** TopicReader (`TopicReader.tsx`, `.topic-reader-main-grid`, `.prose-reading-container`, Section 3 Historical Evolution, Section 8 Visual Diagrams across all 110 chapters).
- **Observed Behavior:**
  - On desktop viewports (1440px/1920px), ASCII diagrams and wide code boxes (e.g. Section 3 timeline boxes) exhibit slight horizontal scrollbars (~20–40px) due to a constrained `800px` `.prose-reading-container`.
  - User requested:
    1. **Part A (Immediate Quick Fix):** Widen the desktop center reading section and optimize code typography so ASCII boxes fit completely without horizontal scrollbars.
    2. **Part B (Next Phase Architectural Feature):** Design and build an Ahead-Of-Time (AOT) diagram interception and compilation system that converts ASCII diagrams into web-focused, colorful vector/Mermaid diagrams once at build time, saving and reusing them with zero runtime performance overhead.
- **Proposed Resolution / Notes:**
  - Part A: Update `apps/portal/src/index.css` to expand `.topic-reader-main-grid` (`minmax(0, 920px) 290px`), `.prose-reading-container` (`max-width: 900px`), and fine-tune monospace pre-block typography (`font-size: 0.84rem`, `line-height: 1.48`).
  - Part B: Author detailed architectural specification in `docs/sdlc/plans/sprint-22-diagram-system-plan.md` defining AOT pipeline, file storage in `apps/portal/public/diagrams/`, and zero-client-overhead rendering.

---

### Intake Template

When capturing a new unplanned issue or bug, copy and fill out the template below:

```markdown
### [UNPLANNED-ID]: <Descriptive Issue Title>
- **Date Reported:** YYYY-MM-DD
- **Affected Area / Route:** (e.g., Dashboard, TopicReader, Lab 04, Search Modal, War Room)
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

*(All historical screenshot and feedback items have been triaged and resolved in [`backlog.md`](./backlog.md):)*
- **`image-1.png`:** Resolved via `BUG-LATEX-ARROWS` (Chapter 01 Learning Objectives & 19 markdown notes).
- **`image-2.png`:** Resolved via `UI-LABS-VERTICAL` (VisualizerHub master-detail vertical navigation).
- **`image-3.png`:** Resolved via `BUG-THEME-CONTRAST` (Simulation labs light-theme text contrast).
- **`media_1791444605591.png`:** Resolved via `UX-CHALLENGES-SEPARATION` (Dedicated Challenges Arena & Clean Labs Taxonomy).
- **User Feedback 2026-10-08 (Route Flash):** Resolved via `BUG-ROUTE-REFRESH-FLASH`.
- **User Feedback 2026-10-08 (Theory Deep Dive):** Resolved via `FEAT-CHALLENGE-THEORY-DEEPDIVE`.
- **User Feedback 2026-10-08 (Repo License):** Resolved via `FEAT-REPO-LICENSE` (MIT License added to root).
- **User Feedback 2026-10-08 (110-Page Term Links Audit):** Verified universal coverage via `FEAT-08` across all 110 handbook chapters in `TopicReader.tsx`.
- **`image.png` (Hotfix Light Theme Contrast):** Resolved via `BUG-HOTFIX-LIGHT-THEME-CONTRAST` (`var(--code-text, #f8fafc)` applied across diff and console views).
- **User Feedback 2026-10-08 (GitHub Pages Live Link):** Resolved via `DOCS-GH-PAGES-LINK` (Live URL `https://adarshsince90.github.io/react-interview-prep/` integrated with badges across `README.md`, `PROGRESS.md`, `apps/portal/README.md`, and `docs/sdlc/README.md`).
- **`media_1791456986108.png` (Responsive Alignment & Hero Fix):** Resolved via Epic 21 / Sprint 21 (`UI-HERO-ALIGNMENT`, `FEAT-RESPONSIVE-SHELL`, `UI-READER-FLUID`, `UI-ARENA-STACK`, `UI-LAB-TOUCH-SCROLL`).