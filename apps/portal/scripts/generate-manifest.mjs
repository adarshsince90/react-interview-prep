import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORTAL_ROOT = path.resolve(__dirname, '..');
const NOTES_DIR = path.resolve(PORTAL_ROOT, '../../notes');
const PUBLIC_NOTES_DIR = path.resolve(PORTAL_ROOT, 'public/notes');
const SRC_ASSETS_DIR = path.resolve(PORTAL_ROOT, 'src/assets');
const MANIFEST_OUTPUT = path.resolve(SRC_ASSETS_DIR, 'manifest.json');

// Ensure destination directories exist
if (!fs.existsSync(SRC_ASSETS_DIR)) {
  fs.mkdirSync(SRC_ASSETS_DIR, { recursive: true });
}
if (!fs.existsSync(PUBLIC_NOTES_DIR)) {
  fs.mkdirSync(PUBLIC_NOTES_DIR, { recursive: true });
}

console.log('🔍 Scanning notes directory at:', NOTES_DIR);

// Lab associations mapping
const LAB_MAPPINGS = {
  '03-jsx-compilation': {
    labId: 'lab-10-jsx-compiler',
    title: 'JSX Compiler & $$typeof Security Inspector',
    description: 'Inspect AST desugaring from JSX to _jsx calls, evaluate $$typeof Symbol security, and debug the 0 rendering bug live.'
  },
  '04-component-model-pure-functions': {
    labId: 'lab-11-component-purity',
    title: 'Component Purity & StrictMode Stress-Tester',
    description: 'Test in-place array mutations (.sort) vs immutable ES2023 (.toSorted) and observe StrictMode double-rendering live.'
  },
  '05-render-cycle': {
    labId: 'lab-12-render-cycle-stepper',
    title: 'Render Cycle Stepper (Trigger -> Render -> Commit)',
    description: 'Step-by-step visualizer tracing state update scheduling, Fiber work loops, and DOM commit timestamps.'
  },
  '04-event-loop': {
    labId: 'lab-04-event-loop',
    title: '4-Lane Event Loop & INP Budget Simulator',
    description: 'Simulate Microtasks, Macrotasks, requestAnimationFrame, and main-thread blocking affecting Core Web Vitals.'
  },
  '02-reconciliation-diffing-algorithm': {
    labId: 'lab-14-fiber-reconciliation',
    title: 'Fiber Work Loop & Key Diffing Visualizer',
    description: 'Inspect list reconciliation, lastPlacedIndex watermark movements, and the state-bleed bug with index as keys.'
  },
  '03-fiber-architecture': {
    labId: 'lab-14-fiber-reconciliation',
    title: 'Fiber Work Loop & Key Diffing Visualizer',
    description: 'Inspect list reconciliation, lastPlacedIndex watermark movements, and the state-bleed bug with index as keys.'
  },
  '09-rsc-internals': {
    labId: 'lab-19-rsc-flight',
    title: 'RSC Flight Wire Format Stream Parser',
    description: 'Inspect streaming M:, J:, and S: Flight chunks and observe progressive client rehydration live.'
  },
  '01-frontend-system-design-interview-framework': {
    labId: 'topic-11-system-design',
    title: 'Collaborative Canvas & HFT Telemetry Simulator',
    description: 'Interactive simulation of CRDT concurrent edits, QuadTree frustum culling, and HFT Ring Buffer batching.'
  },
  '02-realtime-collaborative-canvas-crdts': {
    labId: 'topic-11-system-design',
    title: 'Collaborative Canvas & HFT Telemetry Simulator',
    description: 'Interactive simulation of CRDT concurrent edits, QuadTree frustum culling, and HFT Ring Buffer batching.'
  }
};

const phaseMetadata = {
  'phase-01-javascript-runtime-foundations': {
    id: 'phase-01',
    title: 'Phase 01: JavaScript Runtime Foundations',
    badge: 'Core Engine (100%)',
    description: 'V8 internals, memory models, event loop, closures, and garbage collection mechanics.'
  },
  'phase-02-browser-platform-web-apis': {
    id: 'phase-02',
    title: 'Phase 02: Browser Platform & Web APIs',
    badge: 'Browser Core (100%)',
    description: 'DOM/CSSOM trees, rendering pipeline, hardware compositing, event bubbling/delegation, and storage.'
  },
  'phase-03-react-foundations': {
    id: 'phase-03',
    title: 'Phase 03: React Foundations & Core Mechanics',
    badge: 'React Core (100%)',
    description: 'Component purity, JSX compilation, Virtual DOM, Render cycle, and State architecture.'
  },
  'phase-04-react-rendering-internals': {
    id: 'phase-04',
    title: 'Phase 04: React Rendering Internals & Fiber Architecture',
    badge: 'Fiber Engine (100%)',
    description: 'Fiber linked list trees, cooperative time slicing, Lanes priority, and concurrent features.'
  },
  'phase-05-advanced-state-architecture': {
    id: 'phase-05',
    title: 'Phase 05: Advanced State Architecture & Data Patterns',
    badge: 'State & Cache (100%)',
    description: 'Zustand, Redux Toolkit, TanStack Query, optimistic UI, selector memoization, and offline storage.'
  },
  'phase-06-nextjs-fullstack-react': {
    id: 'phase-06',
    title: 'Phase 06: Next.js & Full-Stack React Architecture',
    badge: 'Next.js & RSC (100%)',
    description: 'React Server Components (RSC), App Router, streaming SSR hydration, and edge infrastructure.'
  },
  'phase-07-enterprise-security-auth-identity': {
    id: 'phase-07',
    title: 'Phase 07: Enterprise Security, Authentication & Identity',
    badge: 'Security & Auth',
    description: 'OAuth 2.0, OIDC PKCE flow, Entra ID (Azure AD), JWT storage, XSS/CSRF, and CSP.'
  },
  'phase-07-enterprise-security-and-auth': {
    id: 'phase-07',
    title: 'Phase 07: Enterprise Security, Authentication & Identity',
    badge: 'Security & Auth',
    description: 'OAuth 2.0, OIDC PKCE flow, Entra ID (Azure AD), JWT storage, XSS/CSRF, and CSP.'
  },
  'phase-08-performance-engineering-web-vitals': {
    id: 'phase-08',
    title: 'Phase 08: Performance Engineering, Web Vitals & Production Profiling',
    badge: 'Performance & Profiling',
    description: 'Core Web Vitals (INP, LCP, CLS), Chrome DevTools flamecharts, V8 heap snapshots, and bundle optimization.'
  },
  'phase-09-enterprise-architecture-monorepos': {
    id: 'phase-09',
    title: 'Phase 09: Enterprise Clean Architecture, Monorepos & Micro-Frontends',
    badge: 'Architecture & Scale',
    description: 'Nx vs Turborepo, Domain-Driven Design in frontend, Module Federation, and design systems.'
  },
  'phase-10-testing-strategy': {
    id: 'phase-10',
    title: 'Phase 10: Modern Testing Strategy & Quality Assurance',
    badge: 'Testing & QA',
    description: 'Testing pyramid, Vitest, React Testing Library, Mock Service Worker (MSW), and Playwright E2E.'
  },
  'phase-11-frontend-system-design': {
    id: 'phase-11',
    title: 'Phase 11: Frontend System Design at Scale',
    badge: 'System Design',
    description: 'BFF pattern, real-time collaborative canvas, trading terminals, multi-tenant SaaS, and global CDN edge routing.'
  },
  'phase-12-angular-to-react-enterprise-synthesis': {
    id: 'phase-12',
    title: 'Phase 12: Angular to React Enterprise Synthesis',
    badge: 'Staff Capstone',
    description: '1-to-1 migration playbooks, Change Detection vs Fiber, RxJS vs Hooks, Signals vs State, and DI vs Composition.'
  }
};

function slugify(text) {
  return text
    .replace(/&amp;/gi, 'and')
    .replace(/&quot;/gi, '')
    .replace(/&#39;/gi, '')
    .replace(/&lt;/gi, '')
    .replace(/&gt;/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[`*]/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseMarkdownFile(filePath, relativePath, phaseId) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let title = 'Untitled Chapter';
  const headings = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ') && title === 'Untitled Chapter') {
      const raw = trimmed.replace(/^#\s+/, '').trim();
      title = raw
        .replace(/^Phase\s+\d+\s*[-—:]\s*/i, '') // Remove redundant Phase prefix if present
        .replace(/[`*]/g, '')                    // Strip backticks or markdown stars
        .trim();
    } else if (trimmed.startsWith('## ')) {
      const headingText = trimmed.replace(/^##\s+/, '').trim();
      headings.push({
        title: headingText.replace(/[`*]/g, ''),
        anchor: slugify(headingText)
      });
    }
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 220));
  const filename = path.basename(filePath, '.md');

  // Check if there is an interactive lab mapping
  const lab = LAB_MAPPINGS[filename] || null;

  return {
    id: filename,
    filename: path.basename(filePath),
    phaseId,
    title,
    relativePath,
    wordCount,
    readingTimeMin,
    headings,
    lab
  };
}

function generateManifest() {
  if (!fs.existsSync(NOTES_DIR)) {
    console.error('❌ Notes directory not found at:', NOTES_DIR);
    process.exit(1);
  }

  // 1. Copy notes directory to public/notes for client fetch
  console.log('📂 Syncing notes to public/notes...');
  fs.cpSync(NOTES_DIR, PUBLIC_NOTES_DIR, { recursive: true });

  const phaseDirs = fs.readdirSync(NOTES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('phase-'))
    .map(dirent => dirent.name)
    .sort();

  const manifest = {
    generatedAt: new Date().toISOString(),
    totalPhases: phaseDirs.length,
    totalTopics: 0,
    phases: []
  };

  for (const phaseDir of phaseDirs) {
    const phasePath = path.join(NOTES_DIR, phaseDir);
    const meta = phaseMetadata[phaseDir] || {
      id: phaseDir,
      title: phaseDir.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      badge: 'Active Phase',
      description: 'Engineering notes and deep dives.'
    };

    const files = fs.readdirSync(phasePath)
      .filter(file => file.endsWith('.md'))
      .sort();

    const topics = [];

    for (const file of files) {
      const filePath = path.join(phasePath, file);
      const relativePath = `notes/${phaseDir}/${file}`;
      const topic = parseMarkdownFile(filePath, relativePath, meta.id);
      topics.push(topic);
      manifest.totalTopics++;
    }

    manifest.phases.push({
      ...meta,
      dirName: phaseDir,
      topicCount: topics.length,
      topics
    });
  }

  fs.writeFileSync(MANIFEST_OUTPUT, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`✅ Manifest generated successfully! Indexed ${manifest.totalTopics} topics across ${manifest.phases.length} phases.`);
  console.log(`📄 Saved to: ${MANIFEST_OUTPUT}`);
}

generateManifest();
