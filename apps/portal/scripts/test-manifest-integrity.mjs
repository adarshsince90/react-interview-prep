import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORTAL_ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.resolve(PORTAL_ROOT, 'src/assets/manifest.json');
const VISUALIZERS_DIR = path.resolve(PORTAL_ROOT, 'src/features/visualizers');

console.log('🧪 Running Manifest & Portal Integrity Test Suite...');

let failures = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failures++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// 1. Verify Manifest File Exists and is Valid JSON
assert(fs.existsSync(MANIFEST_PATH), `Manifest file exists at ${MANIFEST_PATH}`);

let manifestData = null;
try {
  const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  manifestData = JSON.parse(content);
  assert(manifestData && Array.isArray(manifestData.phases), 'Manifest contains valid phases array');
  assert(manifestData.totalTopics > 0, `Manifest totalTopics is positive (${manifestData.totalTopics})`);
} catch (err) {
  assert(false, `Failed to parse manifest JSON: ${err.message}`);
}

if (manifestData) {
  // 2. Verify Every Topic File Exists on Disk in public/notes
  let missingFiles = 0;
  for (const phase of manifestData.phases) {
    for (const topic of phase.topics) {
      const publicFilePath = path.resolve(PORTAL_ROOT, 'public', topic.relativePath);
      if (!fs.existsSync(publicFilePath)) {
        console.error(`  - Missing public markdown file for topic: ${topic.title} (${publicFilePath})`);
        missingFiles++;
      }
    }
  }
  assert(missingFiles === 0, `All ${manifestData.totalTopics} topic markdown files exist in public/notes`);

  // 3. Verify Registered Labs Have Component Files
    const LAB_COMPONENT_MAP = {
    'lab-10-jsx-compiler': 'topic-03-jsx/JsxCompilerLab.tsx',
    'lab-11-component-purity': 'topic-04-purity/ComponentPurityLab.tsx',
    'lab-12-render-cycle-stepper': 'topic-05-render/RenderCycleLab.tsx',
    'lab-04-event-loop': 'topic-04-event-loop/EventLoopLab.tsx',
    'lab-14-fiber-reconciliation': 'topic-14-fiber/FiberReconciliationLab.tsx',
    'lab-19-rsc-flight': 'topic-19-rsc/RscFlightLab.tsx',
    'topic-11-system-design': 'topic-11-system-design/CanvasDesignLab.tsx',
    'lab-20-memory-retainer': 'topic-09-memory/MemoryRetainerLab.tsx',
    'lab-21-query-cache': 'topic-04-state/QueryCacheLab.tsx',
    'lab-22-virtualization': 'topic-08-performance/VirtualizationLab.tsx'
  };

  const CHALLENGE_COMPONENT_MAP = {
    'ch-01-virtualizer': '../challenges/virtualizer/VirtualizerChallengeArena.tsx',
    'ch-02-concurrent-store': '../challenges/store/ConcurrentStoreChallengeArena.tsx',
    'ch-03-offline-outbox': '../challenges/outbox/OfflineOutboxChallengeArena.tsx'
  };

  for (const [labId, relativePath] of Object.entries(LAB_COMPONENT_MAP)) {
    const componentPath = path.resolve(VISUALIZERS_DIR, relativePath);
    assert(
      fs.existsSync(componentPath),
      `Lab component for '${labId}' exists at ${relativePath}`
    );
  }

  for (const [challengeId, relativePath] of Object.entries(CHALLENGE_COMPONENT_MAP)) {
    const componentPath = path.resolve(VISUALIZERS_DIR, relativePath);
    assert(
      fs.existsSync(componentPath),
      `Challenge component for '${challengeId}' exists at ${relativePath}`
    );
  }

  const INTERVIEWS_DIR = path.resolve(PORTAL_ROOT, 'src/features/interviews');
  assert(fs.existsSync(path.resolve(INTERVIEWS_DIR, 'InterviewsArena.tsx')), 'InterviewsArena.tsx component exists');
  assert(fs.existsSync(path.resolve(INTERVIEWS_DIR, 'interviewsData.ts')), 'interviewsData.ts dataset exists');
  assert(fs.existsSync(path.resolve(INTERVIEWS_DIR, 'types.ts')), 'interviews types.ts exists');

  // 4. Verify No Raw LaTeX Math (\frac, \text{, \approx, \rightarrow, \to) Exists in Indexed Notes
  let latexViolations = 0;
  for (const phase of manifestData.phases) {
    for (const topic of phase.topics) {
      const publicFilePath = path.resolve(PORTAL_ROOT, 'public', topic.relativePath);
      if (fs.existsSync(publicFilePath)) {
        const text = fs.readFileSync(publicFilePath, 'utf-8');
        if (
          text.includes('\\frac') ||
          text.includes('\\text{') ||
          text.includes('\\approx') ||
          text.includes('\\rightarrow') ||
          text.includes('\\to ') ||
          text.includes('$\\to$')
        ) {
          console.error(`  - Unescaped LaTeX detected in ${topic.relativePath}`);
          latexViolations++;
        }
      }
    }
  }
  assert(latexViolations === 0, `Zero raw LaTeX math syntax violations across all ${manifestData.totalTopics} notes`);
}

console.log('\n--- Test Summary ---');
if (failures === 0) {
  console.log('🎉 All portal integrity tests passed cleanly!\n');
  process.exit(0);
} else {
  console.error(`💥 ${failures} integrity assertion(s) failed. Please review output above.\n`);
  process.exit(1);
}
