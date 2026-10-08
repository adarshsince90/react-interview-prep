# React 19 Learning & Interactive Simulation Portal (`apps/portal`)

The companion living revision and simulation application for the **React & JavaScript Runtime Engineering Handbook**.

> 🌐 **Live Hosted Portal (GitHub Pages):** **[https://adarshsince90.github.io/react-interview-prep/](https://adarshsince90.github.io/react-interview-prep/)**  
> 📖 **SDLC & Feature Specification:** See [`PORTAL_SDLC.md`](./PORTAL_SDLC.md) for full feature inventory, automated verification gates, and release changelogs.

---

## 1. Quick Start

```bash
# Navigate to portal
cd apps/portal

# Install dependencies
npm install

# Run automated manifest indexing & start Vite dev server
npm run dev
```

* Local URL: `http://localhost:5174/`

---

## 2. Quality Gateways & Testing Commands

To maintain strict SDLC discipline and prevent regressions:

| Command | Purpose |
| :--- | :--- |
| `npm run manifest` | Auto-indexes `notes/` into `src/assets/manifest.json` and syncs to `public/notes`. |
| `npm test` | Runs the automated manifest and lab component integrity test suite (`scripts/test-manifest-integrity.mjs`). |
| `npx tsc --noEmit` | Strict TypeScript compiler validation. |
| `npm run lint` | Fast static analysis via `oxlint`. |
| `npm run build` | Full production bundle compilation. |
| `npm run build:pages` | Builds production bundle configured for GitHub Pages base path. |

---

## 3. Architecture Overview

```text
apps/portal/
├── scripts/
│   ├── generate-manifest.mjs        # Scans notes/ -> outputs manifest.json
│   └── test-manifest-integrity.mjs  # Automated integrity test suite (npm test)
│
├── src/
│   ├── core/                        # Infrastructure, layouts, progressStorage
│   └── features/
│       ├── dashboard/               # Phase roadmap & completion progress
│       ├── topic-reader/            # Markdown reader with Mermaid SVG & scratchpad
│       └── visualizers/             # Interactive simulation labs (Living Arena)
│           ├── topic-03-jsx/        # Lab 10: JSX Compiler & $$typeof Security Inspector
│           ├── topic-04-purity/     # Lab 11: Component Purity & StrictMode Stress-Tester
│           └── topic-05-render/     # Lab 12: The 3-Phase Render Cycle Stepper
│
├── PORTAL_SDLC.md                   # Feature tracking, PRD requirements & changelog
└── package.json
```
