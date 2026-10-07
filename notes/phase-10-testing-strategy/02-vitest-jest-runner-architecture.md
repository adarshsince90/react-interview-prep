# Phase 10 — Topic 02: Vitest & Jest Runner Architecture

## 1. Why This Topic Exists
For over a decade, Jest was the undisputed industry standard for JavaScript testing. However, as frontend development transitioned to modern ES Modules (ESM), TypeScript, and lightning-fast bundlers like Vite, Jest became an architectural bottleneck.

In enterprise projects, running Jest with `ts-jest` or Babel introduces crippling friction:
- Every test run re-compiles TypeScript and CJS modules through separate pipelines, resulting in 30-to-60-second test startup times.
- Dual-configuration hell: developers maintain one configuration for their production bundler (Vite / Rollup) and a redundant, conflicting configuration for Jest (`jest.config.js`, module name mappers, babel presets).
- Node.js ESM compatibility issues: importing modern ESM-only packages (like `nanoid` or `d3`) routinely triggers `SyntaxError: Cannot use import statement outside a module`.

**Vitest** revolutionized frontend testing by sharing Vite’s native transformation pipeline, plugin ecosystem, and dev server cache. With Vitest, test suites execute natively in ESM with near-instant startup, thread pool isolation, and multi-threaded worker concurrency.

Architects must understand the internal architecture of modern test runners, compare simulated DOM environments (**JSDOM** vs. **Happy-DOM**), and configure worker thread pools to maintain sub-second feedback loops across thousands of tests.

---

## 2. Learning Objectives
By completing this chapter, you will be able to:
- Contrast the architectural compilation pipelines of **Jest** (Babel / `ts-jest`) and **Vitest** (Vite / esbuild / Rollup).
- Configure Vitest to share Vite's dev server plugins, aliases, and CSS processors with zero configuration drift.
- Evaluate the trade-offs between **JSDOM** (strict W3C spec compliance, high memory consumption) and **Happy-DOM** (lightweight, 3-5x faster execution).
- Manage test worker concurrency and thread isolation (`threads` vs `forks`, `isolate: true` vs `isolate: false`).
- Master Vitest mocking mechanics (`vi.fn()`, `vi.spyOn()`, `vi.mock()`, and top-level module hoisting).
- Identify and eliminate **Snapshot Testing Traps** (snapshot decay, mega-DOM snapshots, and review blindness).

---

## 3. Historical Evolution
```
+---------------------------------------------------------------------------------------------------+
| 2011 - 2014: Mocha, Chai & Karma                                                                  |
| Tests ran inside real browser instances launched via Karma. While authentic, startup was slow,   |
| CI configuration was brittle, and debugging required attached browser tabs.                      |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| 2015 - 2020: The Jest Dominance Era (Facebook / Meta)                                             |
| Built-in runner, assertions, mocking, and JSDOM environment out-of-the-box. Fast parallelization. |
| Limitation: Built for CommonJS; required Babel transforms; struggled with TypeScript and ESM.     |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| 2021 - 2023: The Vite Revolution & Emergence of Vitest                                            |
| Vitest created to leverage Vite's transformation pipeline. Eliminates duplicate configs.          |
| Native ESM support, instant HMR for tests in watch mode, and Rust-accelerated esbuild transforms.  |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| 2024 - Present: Multi-Threaded Workers & Lightweight DOMs (Vitest 1.x/2.x + Happy-DOM)           |
| Full ESM native worker threads, TINY memory footprint, Happy-DOM delivering 4x throughput over   |
| JSDOM, and native browser mode (running tests directly in headless Chromium without JSDOM).       |
+---------------------------------------------------------------------------------------------------+
```

---

## 4. First Principles & Intuitive Physical Analogies (Layer 1)
Think of test runner architecture through physical engineering analogs:

### Analogy 1: The Customs Translation Bureau vs. The Native Diplomat (Jest vs. Vitest)
Imagine an international conference where everyone speaks French (ES Modules):
- **Jest** is an old-fashioned bureau that only reads Latin (CommonJS). Every time a French letter arrives, a team of translators (Babel / `ts-jest`) must translate French into Latin, process it, and translate Latin back into French. If someone uses modern slang (top-level `import`), the old bureau crashes with a translation error.
- **Vitest** is a native modern diplomat who speaks fluent French (native ESM). It reads the documents instantly using the exact same translation handbook (Vite plugins) already used by the conference hall. There is zero translation delay and zero duplicate configuration.

### Analogy 2: The Replica Castle vs. The Movie Set Façade (JSDOM vs. Happy-DOM)
- **JSDOM** is a painstakingly accurate stone-by-stone miniature replica of a medieval castle. It models every turret, sewage channel, and moat gate according to strict historical architecture books (W3C DOM specifications). It is heavy to move, requires massive table space (V8 memory), and takes time to build.
- **Happy-DOM** is a Hollywood movie studio set. The front façade looks and behaves like stone, doors open when pulled, and windows catch light, but behind the wall is plywood and scaffolding. It is 80% lighter and assembles 4 times faster. For 99% of film scenes (React tests), you cannot tell the difference.

---

## 5. Internal Working & Engine Architecture (Layer 2)

### Vitest Compilation & Execution Pipeline
```
               [ Vitest CLI: vitest run ]
                           |
                           v
          [ Read vite.config.ts / vitest.config.ts ]
          - Shares aliases (@/components -> src/components)
          - Shares plugins (React SWC, Tailwind, SVG loaders)
                           |
                           v
                 [ Worker Pool Spawner ]
         +-----------------+-----------------+
         |                                   |
   Worker Thread 1                     Worker Thread 2
   (Node.js worker_threads)            (Node.js worker_threads)
         |                                   |
         v                                   v
   [ Happy-DOM / JSDOM ]               [ Happy-DOM / JSDOM ]
   Isolated Global Context             Isolated Global Context
   (window, document)                  (window, document)
         |                                   |
         v                                   v
   [ Vite Transform Pipeline ]         [ Vite Transform Pipeline ]
   Transforms TS/JSX via esbuild       Transforms TS/JSX via esbuild
   (cached in memory, sub-millisecond) (cached in memory, sub-millisecond)
         |                                   |
         v                                   v
   Execute Test Suite                  Execute Test Suite
   (expect, vi.mock, RTL)              (expect, vi.mock, RTL)
```

### Module Hoisting Mechanics (`vi.mock()`)
In Vitest and Jest, mock calls are hoisted above all imports at the AST transformation level:

```typescript
// What you write in your test file:
import { fetchUser } from './api';
import { UserProfile } from './UserProfile';

vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ name: 'Alice' })
}));

// What Vitest's AST compiler actually generates before execution:
const __vi_mock__ = vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ name: 'Alice' })
}));
import { fetchUser } from './api';
import { UserProfile } from './UserProfile';
```
Because of this AST hoisting, mocks are registered before the module graph evaluates, ensuring that when `UserProfile` imports `./api`, it receives the mocked instance.

---

## 6. Runtime Flow & Execution Traces

### Trace: Happy-DOM Execution vs. JSDOM Execution in a Test
```
Step 1: Test file begins: 'test("renders user modal", () => { ... })'.
Step 2: Environment initialization:
        - JSDOM: Allocates complete W3C DOM spec structures, full HTMLParser,
          canvas context stubs, and full CSSStyleDeclaration engine.
          Memory footprint: ~25 MB per worker thread. Startup time: 45ms.
        - Happy-DOM: Allocates lightweight virtual tree structures with fast
          regex/tree-based HTML parsing.
          Memory footprint: ~5 MB per worker thread. Startup time: 8ms.

Step 3: Component render: RTL calls 'createRoot(container).render(<Modal />)'.
Step 4: React Fiber reconciliation attaches 12 DOM elements:
        - Happy-DOM appends elements using direct object nodes.
        - JSDOM validates element spec conformity and parses inline styles.
Step 5: Assertion execution:
        expect(screen.getByRole('dialog')).toBeInTheDocument();
Step 6: Teardown:
        Worker process resets DOM root for the next test.
```

---

## 7. Memory Model & Worker Process Concurrency

```
VITEST PROCESS CONCURRENCY TOPOLOGY

+--------------------------------------------------------------------------+
| MAIN CONTROLLER PROCESS (Node.js PID: 18240)                             |
| - Watches file changes via chokidar                                      |
| - Manages worker thread scheduler & test distribution                    |
| - Aggregates test reports and coverage metrics                           |
+--------------------------------------------------------------------------+
                 /                       |                       \
                /                        |                        \
               v                         v                         v
+--------------------------+ +--------------------------+ +--------------------------+
| Worker Thread 1 (TID: 1) | | Worker Thread 2 (TID: 2) | | Worker Thread 3 (TID: 3) |
| - V8 Isolate Heap        | | - V8 Isolate Heap        | | - V8 Isolate Heap        |
| - Happy-DOM (window)     | | - Happy-DOM (window)     | | - Happy-DOM (window)     |
| - Test File A (5 tests)  | | - Test File B (8 tests)  | | - Test File C (4 tests)  |
| - Memory: 42 MB          | | - Memory: 39 MB          | | - Memory: 45 MB          |
+--------------------------+ +--------------------------+ +--------------------------+
```

---

## 8. Visual Diagrams (ASCII / Text)

### Comparison: Jest Compilation Bottleneck vs. Vitest Streamlined Pipeline
```
JEST COMPILATION PIPELINE:
[ TypeScript Code ] 
       |
       v (Babel / ts-jest transform: Slow Node CJS transpilation)
[ CommonJS JavaScript ]
       |
       v (Jest Module Resolver: Custom regex moduleNameMapper)
[ Jest VM Context ]
       |
       v (JSDOM Environment)
[ Execution ]

VITEST PIPELINE:
[ TypeScript Code ]
       |
       v (Vite / esbuild native transform: 10-20x faster)
[ Native ES Module (ESM) ]
       |
       v (Vite Plugin Resolver: Exact same resolution as dev server)
[ Node.js Worker Thread ]
       |
       v (Happy-DOM / JSDOM)
[ Execution ]
```

---

## 9. Real World Usage & Production Patterns

> 🧪 **Companion Interactive Lab:** [TestingLab.tsx](../../apps/portal/src/features/visualizers/topic-10-testing/TestingLab.tsx) | Live in Portal: topic-10-testing

### Pattern 1: Production `vitest.config.ts` Configuration
```typescript
// vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      // Use Happy-DOM for 3-4x faster execution; switch to jsdom if layout quirks arise
      environment: 'happy-dom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      pool: 'threads',
      poolOptions: {
        threads: {
          singleThread: false,
          isolate: true // Guarantees clean memory between test files
        }
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['src/**/*.d.ts', 'src/test/**', 'src/**/*.stories.tsx']
      }
    }
  })
);
```

### Pattern 2: Global Setup File (`src/test/setup.ts`)
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Automatically clean up DOM trees after each test to prevent memory leaks
afterEach(() => {
  cleanup();
});

// Mock browser APIs not implemented in simulated DOM environments
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));
```

### Pattern 3: Proper Spying & Mock Restorations
```typescript
import { vi, test, expect, afterEach } from 'vitest';
import * as analytics from './analytics';

afterEach(() => {
  // Restore all spies to prevent test bleed into subsequent files
  vi.restoreAllMocks();
});

test('tracks telemetry event on action', () => {
  const trackSpy = vi.spyOn(analytics, 'trackEvent').mockImplementation(() => {});

  // Trigger code under test
  analytics.trackEvent('button_clicked', { id: 'submit' });

  expect(trackSpy).toHaveBeenCalledTimes(1);
  expect(trackSpy).toHaveBeenCalledWith('button_clicked', { id: 'submit' });
});
```

---

## 10. Angular Comparison
For an engineer transitioning from enterprise Angular:

| Architectural Concept | Enterprise Angular Ecosystem | Modern React / Vitest Ecosystem |
| :--- | :--- | :--- |
| **Test Engine** | Karma with headless Chrome or Jest with `ts-jest` / `jest-preset-angular`. | **Vitest** native ESM with shared Vite build pipeline. |
| **Simulated DOM** | Browser DOM via Karma, or JSDOM via Jest. | **Happy-DOM** (ultra-fast) or **JSDOM** in worker threads. |
| **Mocking Mechanics** | Jasmine spies (`spyOn()`) or Jest mocks (`jest.spyOn()`). | Vitest spies (`vi.spyOn()`) and mocks (`vi.fn()`, `vi.mock()`). |
| **Configuration** | Separate `karma.conf.js` or `jest.config.js` with Angular compiler overrides. | Unified `vitest.config.ts` merging seamlessly with `vite.config.ts`. |

---

## 11. .NET Comparison
For a Senior .NET / ASP.NET Core Architect:

| Architectural Concept | .NET / C# Testing | React / Vitest Testing |
| :--- | :--- | :--- |
| **Test Runner** | VSTest / dotnet test / xUnit runner. | Vitest runner with multi-threaded worker pools. |
| **Thread Isolation** | Separate `AppDomain` / `AssemblyLoadContext` or isolated processes. | Node.js `worker_threads` with `isolate: true` per test file. |
| **Mocking Engine** | Dynamic proxy generation at runtime via Castle Core (Moq). | AST module rewrite and prototype hijacking via `vi.mock()` / `vi.spyOn()`. |
| **Snapshot Testing** | Verify.Xunit / Snapper serializing C# objects to `.verified.txt`. | Vitest snapshot testing (`toMatchSnapshot()`, `toMatchInlineSnapshot()`). |

---

## 12. Enterprise Perspective & Production Risks (Layer 4)

### The Mega-DOM Snapshot Catastrophe
- A developer runs: `expect(render(<Dashboard />)).toMatchSnapshot()`.
- Vitest generates a 4,000-line `.snap` file containing the raw rendered HTML of the entire application.
- Over time, whenever any text, class, or icon changes, the snapshot fails.
- Developers stop reviewing the diff: they simply run `vitest -u` (update snapshot) on every commit.
- **Enterprise Mitigation**: Ban large component snapshots in ESLint. Restrict `toMatchSnapshot()` exclusively to:
  1. Small pure utility outputs (e.g. generated SQL strings or AST trees).
  2. Inline snapshots for error messages (`toMatchInlineSnapshot()`).

### Test State Bleed in Shared Worker Threads
- If a test file sets `process.env.FEATURE_FLAG = 'true'` or mutates `window.localStorage` without resetting it in `afterEach`, and Vitest is configured with `isolate: false`, subsequent test files inherit this mutated state.
- Tests pass in isolation but fail intermittently when run in the full suite depending on file execution order.
- Always retain `isolate: true` unless running pure stateless unit tests.

---

## 13. Performance Considerations
- **Happy-DOM vs. JSDOM**: In benchmarks across 1,000 React components, Happy-DOM executes in **~4.2 seconds**, whereas JSDOM requires **~14.8 seconds** (a 3.5x speedup) with 60% less peak RAM. Switch to Happy-DOM as default, falling back to JSDOM only if specialized HTML5 forms or Canvas APIs are needed.
- **V8 Coverage Engine**: Use Vitest's built-in `provider: 'v8'` instead of `istanbul`. V8 uses the native Chrome code coverage counter embedded in the V8 engine, executing 5x faster than AST-instrumenting Istanbul.

---

## 14. Tradeoffs

| Choice | Primary Benefit | Operational Cost / Drawback |
| :--- | :--- | :--- |
| **Vitest** | Instant startup; shared Vite config; native ESM; watch mode HMR. | Requires Vite tooling ecosystem (less suitable for legacy Webpack codebases). |
| **Jest** | Proven maturity; massive legacy enterprise documentation. | Slow startup; brittle ESM support; dual-config maintenance overhead. |
| **Happy-DOM** | 3x to 5x faster than JSDOM; extremely low memory footprint. | Minor edge-case omissions in obscure W3C DOM spec features. |
| **JSDOM** | Strict W3C DOM spec compliance; standard for many years. | Heavy memory usage; slower startup and execution times. |

---

## 15. Common Mistakes & Interview Traps
- **Trap 1: Forgetting that `vi.mock()` is hoisted.**
  - *Symptom*: Defining a variable `const mockData = {...}` above `vi.mock()` causes `ReferenceError: Cannot access 'mockData' before initialization`.
  - *Fix*: Define mock data inside the factory function or prefix the variable with `vi.hoisted(() => ...)`.
- **Trap 2: Not cleaning up after `vi.spyOn()`.**
  - *Symptom*: Spy persists into other test files, causing unexpected invocation counts.
  - *Fix*: Call `vi.restoreAllMocks()` in `afterEach()`.
- **Trap 3: Testing with `isolate: false` on stateful code.**
  - *Symptom*: Tests pass individually but fail in random orders in CI.
  - *Fix*: Keep `isolate: true` in `vitest.config.ts`.

---

## 16. Interview Questions & Architectural Answers (Senior, Lead, Architect - Layer 5)

### Question 1 (Senior Level): Why does `const mockValue = 'test'; vi.mock('./api', () => ({ value: mockValue }));` throw a ReferenceError in Vitest/Jest, and how do you fix it?
**Answer**:
`vi.mock()` calls are hoisted to the top of the file by Vitest's AST compiler before any variable declarations or imports execute.
When the hoisted `vi.mock()` factory function evaluates at file initialization, the variable `const mockValue` has not yet been declared in the lexical environment, placing it in the Temporal Dead Zone (TDZ) and throwing a `ReferenceError`.
To fix this:
1. Define the mock data directly inside the factory callback:
   ```typescript
   vi.mock('./api', () => ({ value: 'test' }));
   ```
2. Or use `vi.hoisted()` to explicitly hoist the variable alongside the mock:
   ```typescript
   const { mockValue } = vi.hoisted(() => ({ mockValue: 'test' }));
   vi.mock('./api', () => ({ value: mockValue }));
   ```

### Question 2 (Lead Level): How do you decide between JSDOM and Happy-DOM in an enterprise frontend test suite of 4,000 tests?
**Answer**:
I recommend **Happy-DOM as the default environment**, with selective per-file overrides:
1. **Performance**: Happy-DOM delivers a 3x to 5x execution speedup and consumes 70% less memory because it avoids the full W3C parsing and CSS layout calculations of JSDOM. In a suite of 4,000 tests, this cuts CI execution from 10 minutes to under 2.5 minutes.
2. **Compatibility**: Happy-DOM supports 98% of modern DOM operations needed by React 19, React Testing Library, and `@testing-library/user-event`.
3. **Selective Overrides**: If a specific test suite tests complex Canvas 2D operations, complex iframe messaging, or niche HTML5 form validation that Happy-DOM does not fully implement, Vitest allows per-file environment overrides using a docblock comment:
   ```typescript
   // @vitest-environment jsdom
   ```
This provides the best of both worlds: maximum performance across 98% of the codebase, with heavy JSDOM reserved only where strictly required.

### Question 3 (Architect Level): How do you migrate an enterprise monorepo from Jest to Vitest with zero downtime and minimal developer disruption?
**Answer**:
We execute a phased, parallel migration strategy:
1. **Compatibility Layer**: Vitest provides full API compatibility with Jest (`describe`, `it`, `expect`, `vi` mirroring `jest`). We enable `globals: true` in `vitest.config.ts` so test files do not require rewriting `test` or `expect` imports immediately.
2. **Setup File Harmonization**: Create a unified setup file that maps Jest matchers (`@testing-library/jest-dom`) to Vitest.
3. **Package-by-Package Migration**: In a monorepo (Turborepo/Nx), we migrate one package at a time. A package's `package.json` `"test"` script is switched from `jest` to `vitest run`.
4. **Codemod for Mock Transformations**: Run a `jscodeshift` codemod to replace `jest.fn()` with `vi.fn()`, `jest.spyOn()` with `vi.spyOn()`, and `jest.mock()` with `vi.mock()`.
5. **CI Caching & Metrics**: Connect Vitest to the Turborepo remote cache. With Vitest and Vite-native transforms, developer PR verification times drop by up to 70%, immediately demonstrable on engineering velocity dashboards.

---

## 17. Senior-Level Mental Model & "How to Remember This Forever" (Memory Anchors - Layer 3)

### The "Native Diplomat & Movie Façade" Rule
- **Vitest** is the **Native Diplomat**: speaks native ESM and shares the exact same passport (Vite config) as your production app.
- **Happy-DOM** is the **Movie Façade**: light, fast to build, and looks identical to the real thing for 98% of scenes.
- Never spend 45 minutes translating Latin (Jest Babel transform) when you can converse natively in ESM.

---

## 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)
- **Vitest**: Vite-native test runner leveraging Vite's transformation pipeline and worker threads.
- **Happy-DOM**: A high-performance, lightweight simulated DOM environment designed for fast testing.
- **JSDOM**: A comprehensive, spec-compliant JavaScript implementation of W3C DOM and HTML standards.
- **AST Hoisting**: Compiler optimization where specific function calls (`vi.mock`) are moved to the top of the file before imports evaluate.
- **vi.hoisted()**: Vitest utility allowing variable declarations to be hoisted alongside `vi.mock()` calls.

---

## 19. Key Takeaways
- Vitest eliminates the dual-config and slow compilation overhead of Jest by sharing Vite's build pipeline.
- Happy-DOM runs 3x-5x faster than JSDOM with significantly lower memory usage.
- `vi.mock()` is hoisted by the compiler; use `vi.hoisted()` if mock factories require external variables.
- Always call `vi.restoreAllMocks()` in `afterEach()` to prevent spy leakage across tests.
- Ban mega-DOM snapshots in PR reviews; restrict snapshot assertions to small inline outputs and error messages.

---

## 20. Revision Sheet
- **Q: Why is Vitest faster than Jest in modern TypeScript/ESM projects?**
  *A:* Vitest shares Vite's esbuild transform pipeline and dev server cache, running natively in ESM without separate Babel or `ts-jest` compilation passes.
- **Q: What is the main advantage of Happy-DOM over JSDOM?**
  *A:* It is 3x to 5x faster and uses up to 70% less memory, significantly speeding up large test suites.
- **Q: Why can't you reference normal variables inside `vi.mock()`?**
  *A:* Because `vi.mock()` is hoisted above variable declarations at the AST level, placing the variable in the Temporal Dead Zone (TDZ).
- **Q: How do you fix variable access in hoisted mocks in Vitest?**
  *A:* Wrap the variable declaration in `vi.hoisted(() => ({ ... }))`.
- **Q: What command resets all spies created via `vi.spyOn()`?**
  *A:* `vi.restoreAllMocks()`.
