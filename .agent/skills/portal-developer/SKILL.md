---
name: portal-developer
description: Guides the architecture, development, manifest generation, and interactive simulation lab implementations for apps/portal.
---

# Portal Developer Skill: React Living Architecture & Simulation Portal

Use this skill when developing, expanding, or troubleshooting `apps/portal`—the interactive companion application for the React & JavaScript Runtime Engineering Handbook.

---

## 1. Architectural Philosophy & Mission

`apps/portal` is modeled directly after the proven architectural foundations of [`angular-interview-prep/apps/portal`](https://github.com/adarshsince90/angular-interview-prep), elevated specifically for **React 18/19 internals and JavaScript runtime mechanics**.

### Core Pillars:
1. **Single Source of Truth (SSOT):**  
   The handbook markdown files in `notes/` are the authoritative content source. The portal never duplicates or hardcodes topic data. It ingests notes dynamically via an automated manifest generation pipeline (`scripts/generate-manifest.mjs`).
2. **Dual-Track Learning:**  
   Every major theoretical concept in `notes/` connects to an interactive visual simulator in the portal.
3. **Senior / Staff Benchmark:**  
   The application itself is an architectural showcase: pure functional React components, custom Vanilla CSS design tokens (no bloated CSS utility lock-in), type-safe TypeScript models, sub-second HMR with Vite, and zero-runtime layout thrashing.

---

## 2. Directory Structure

```text
apps/portal/
├── scripts/
│   ├── generate-manifest.mjs        # Node build script: scans notes/ -> outputs manifest.json
│   └── test-manifest-integrity.mjs  # CI test verifying all notes are valid and mapped
│
├── public/
│   └── favicon.ico
│
├── src/
│   ├── core/                        # Global foundational infrastructure
│   │   ├── components/              # Shell, Navbar, Sidebar, Footer, Breadcrumbs
│   │   ├── context/                 # ThemeContext (dark/light), ReaderSettingsContext
│   │   ├── services/                # Manifest loader, search indexer, storage service
│   │   ├── types/                   # Manifest, Phase, Topic, Lab type definitions
│   │   └── styles/                  # Design tokens, variables, typography, reset
│   │
│   ├── features/                    # Modular feature verticals
│   │   ├── dashboard/               # Roadmap progress, phase completion, metrics
│   │   ├── topic-reader/            # Markdown reader, TOC, Shiki/Prism syntax highlighting
│   │   ├── visualizers/             # Interactive Simulation Labs (Topic-by-topic)
│   │   │   ├── topic-03-jsx/        # AST compiler & $$typeof security inspector
│   │   │   ├── topic-04-purity/     # StrictMode & mutation stress-tester
│   │   │   ├── topic-05-render/     # Trigger -> Render -> Commit stepper
│   │   │   └── common/              # Shared lab widgets, memory heap displays, timers
│   │   └── flashcards/              # Memory anchors ("Museum Rule"), Interview drills
│   │
│   ├── App.tsx                      # Root layout, routing state, keyboard navigation
│   ├── main.tsx                     # Entry point (StrictMode root)
│   └── index.css                    # Design system tokens and baseline styling
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 3. The Automated Manifest Pipeline

### Script: `scripts/generate-manifest.mjs`
Runs automatically during `npm run prebuild` or `npm run dev`:
1. Recursively reads `notes/` directory across all phases (`phase-00-*`, `phase-01-*`, `phase-03-*`, etc.).
2. Extracts:
   - File path and slug (e.g., `phase-03-react-foundations/03-jsx-compilation`).
   - Title from the first `# ` header.
   - Estimated reading time (word count / 200).
   - High-level sections (H2 `## ` headers) for sidebar table of contents.
   - Associated interactive lab ID (if a simulator exists for this topic).
3. Writes output to `src/assets/manifest.json` or `public/manifest.json`.

---

## 4. Feature Implementation Guidelines

### Feature 1: The Topic Reader
- Uses `marked` with `dompurify` for sanitization.
- Syntax highlighting via `prismjs` or `shiki` with copyable code blocks.
- **Architect Bridge Mode Switch:** A global toggle that immediately highlights and expands **Section 10 (Angular Comparison)** and **Section 11 (.NET Comparison)**.
- Reading progress bar and sticky Table of Contents.

### Feature 2: Visualizer / Simulation Labs
Each lab must be a self-contained, interactive React component adhering to these standards:
- **Zero Black Box:** The UI must display the internal V8 heap state, Fiber pointers, or AST desugaring explicitly.
- **Interactive Controls:** Provide clear interactive triggers (buttons, sliders, toggles) to demonstrate failure modes vs. correct architectural patterns.
- **StrictMode Stress-Tester:** Demonstrate why React StrictMode double-invokes components and how in-place mutations break rendering.

---

## 5. Development Workflow & Commands

```bash
# Navigate to portal
cd apps/portal

# Install dependencies
npm install

# Run dev server with auto-manifest generation
npm run dev

# Run manifest integrity tests
npm run test:integrity

# Build for GitHub Pages deployment
npm run build:pages
```

---

## 6. How Future Agents Should Resume Work

When the user asks to work on `apps/portal`:
1. Check `PROGRESS.md` Section 4 to identify the next lab or feature to implement.
2. Ensure `scripts/generate-manifest.mjs` is run so new markdown chapters in `notes/` are indexed.
3. Keep the visual aesthetic clean, dark-mode first, with high-contrast code typography (`JetBrains Mono` / `Fira Code`) and smooth micro-interactions.
4. Never break the separation: Study materials belong in `notes/`, interactive code belongs in `apps/portal/`.
