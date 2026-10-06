# ADR-004: Consolidated Docs & SDLC Architecture Hierarchy

## Context
As the repository grew to encompass curriculum authoring (`notes/`), an interactive Vite/React application (`apps/portal`), agile sprint plans (`SPRINT_PLAN.md`), and groomed backlogs with visual defect screenshots (`.product-backlog/`), root-level clutter became a concern.

An initial proposal was made to create a hidden `.sdlc/` directory at root. An architectural review identified key risks with hidden dot-folders:
1. **Tooling Invisibility:** IDEs (VS Code, JetBrains) often dim or hide dot-folders by default (`files.exclude`), leading to developer and reviewer blindspots.
2. **Multi-Agent Search Exclusion:** AI agents and automated scripts often treat dot-folders as machine configurations or caches, skipping them during repository discovery.
3. **The Executive Landing Page Dilemma:** Hiding `PROGRESS.md` or delivery status would obscure the curriculum syllabus from visitors and recruiters on GitHub.

## Decision
Adopt **Option C: Enterprise Consolidated `docs/` System**:
1. All project governance, SDLC tracking, backlogs, and architecture decisions are consolidated under a visible, top-level `docs/` directory:
   - `docs/adr/`: Architecture Decision Records (ADRs).
   - `docs/sdlc/`: All sprint execution boards (`sprint-plan.md`), product backlogs (`backlog/backlog.md` with screenshot assets), and web app quality gates (`portal-sdlc.md`).
2. **Root Cleanliness & Executive Showcase:**
   - Keep `PROGRESS.md` at root as the visible curriculum syllabus and learning metrics dashboard.
   - Keep `README.md` and `AGENTS.md` at root.
   - The root remains pristine with only 4 top-level directories: `apps/`, `notes/`, `docs/`, and `.agent/` (system prompt configs).
3. **Link Synchronization:**
   - All internal markdown references and CI test suites are synchronized to point to `docs/sdlc/` paths.

## Consequences
- **Positive:**
  - Clear Clean Architecture separation of concerns: code (`apps/`), curriculum (`notes/`), and governance (`docs/`).
  - No hidden dot-folder traps; all planning is transparent and searchable across all operating systems and IDEs.
  - Aligns with large-scale enterprise standards (Kubernetes, .NET, React, CNCF).
- **Negative / Trade-offs:**
  - Requires maintaining link consistency across `docs/sdlc/` and `PROGRESS.md`.
