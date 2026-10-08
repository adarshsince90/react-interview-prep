# Unplanned Backlog

> 📥 **Intake Queue:** Log raw defects, ad-hoc UX requests, or unplanned architectural improvements here as they arise during walkthroughs, live usage, or testing. Once triaged and resolved, items are promoted to [`backlog.md`](./backlog.md) with detailed root-cause analyses, code resolutions, and acceptance criteria.

---

### Active Intake Queue

*(No active unplanned issues currently. All previous items have been resolved and promoted to [`backlog.md`](./backlog.md).)*

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
