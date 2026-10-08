export interface TermDefinition {
  term: string;
  definition: string;
  topicId: string;
  topicTitle: string;
  phaseTitle: string;
  phaseBadge?: string;
  anchor?: string;
}

// Built-in high-leverage architectural glossary terms
export const CORE_ARCH_TERMS: Record<string, TermDefinition> = {
  'v8': {
    term: 'V8 Engine',
    definition: "Google's high-performance C++ execution engine that parses, compiles to Ignition bytecode, and optimizes via TurboFan JIT.",
    topicId: '01-javascript-execution-model',
    topicTitle: 'The JavaScript Execution Model',
    phaseTitle: 'Phase 01: JavaScript Runtime Foundations',
    phaseBadge: 'Core Engine',
    anchor: '5-internal-working-the-v8-engine-pipeline'
  },
  'fiber': {
    term: 'React Fiber',
    definition: "React's virtual stack frame data structure enabling interruptible, priority-scheduled reconciliation and time-slicing.",
    topicId: '14-fiber-reconciliation',
    topicTitle: 'Fiber Work Loop & Key Diffing Mechanics',
    phaseTitle: 'Phase 04: React Deep Internals',
    phaseBadge: 'Fiber Architecture',
    anchor: '5-internal-working-engine-architecture-layer-2'
  },
  'event loop': {
    term: 'The Event Loop',
    definition: 'The single-threaded cooperative reactor that continuously drains the Call Stack, Microtask Queue, and Host Task Queues.',
    topicId: '04-event-loop',
    topicTitle: 'The Event Loop & Asynchronous Architecture',
    phaseTitle: 'Phase 01: JavaScript Runtime Foundations',
    phaseBadge: 'Core Engine',
    anchor: '4-first-principles-the-cooperative-reactor-model'
  },
  'microtask': {
    term: 'Microtask Queue',
    definition: 'High-priority asynchronous queue (Promises, queueMicrotask) drained completely before any host macrotask or browser render frame.',
    topicId: '04-event-loop',
    topicTitle: 'The Event Loop & Asynchronous Architecture',
    phaseTitle: 'Phase 01: JavaScript Runtime Foundations',
    phaseBadge: 'Core Engine',
    anchor: '6-runtime-flow-step-by-step-tick-lifecycle'
  },
  'rsc': {
    term: 'React Server Components (RSC)',
    definition: 'Components executed exclusively on the server, streaming wire-format Flight payloads ($RC chunks) with zero client JS bundle.',
    topicId: '02-rsc-wire-format-streaming',
    topicTitle: 'RSC Wire Format & Stream Parsing',
    phaseTitle: 'Phase 06: Next.js & Full-Stack React',
    phaseBadge: 'Next.js & RSC',
    anchor: '4-first-principles-intuitive-physical-analogies-layer-1'
  },
  'hydration': {
    term: 'Client Hydration',
    definition: 'The phase where client-side React attaches event listeners and state memory to pre-rendered server HTML markup.',
    topicId: '01-why-react-exists',
    topicTitle: 'Why React Exists & The Virtual DOM Problem',
    phaseTitle: 'Phase 03: React Foundations & Core Mechanics',
    phaseBadge: 'React Core',
    anchor: '5-internal-working-engine-architecture-layer-2'
  },
  'reconciliation': {
    term: 'Fiber Reconciliation',
    definition: "React's diffing algorithm that compares previous and alternate Fiber nodes to compute minimal, atomic DOM mutations.",
    topicId: '14-fiber-reconciliation',
    topicTitle: 'Fiber Work Loop & Key Diffing Mechanics',
    phaseTitle: 'Phase 04: React Deep Internals',
    phaseBadge: 'Fiber Architecture',
    anchor: '6-runtime-flow-execution-traces'
  },
  'tdz': {
    term: 'Temporal Dead Zone (TDZ)',
    definition: 'The temporal span between scope entry and declaration line evaluation where identifier access throws a fatal ReferenceError.',
    topicId: '02-scope-hoisting-tdz',
    topicTitle: 'Scope, Hoisting, and the Temporal Dead Zone',
    phaseTitle: 'Phase 01: JavaScript Runtime Foundations',
    phaseBadge: 'Core Engine',
    anchor: '7-memory-model-bytecode-the-temporal-dead-zone'
  },
  'crdt': {
    term: 'CRDT (Conflict-Free Replicated Data Type)',
    definition: 'Mathematical data structures enabling decentralized real-time collaboration that converge concurrently without central lock coordination.',
    topicId: '02-realtime-collaborative-canvas-crdts',
    topicTitle: 'System Design: Real-Time Collaborative Canvas',
    phaseTitle: 'Phase 11: Frontend System Design at Scale',
    phaseBadge: 'System Design',
    anchor: '5-internal-working-engine-architecture-layer-2'
  },
  'zone.js': {
    term: 'Zone.js',
    definition: "Angular's execution context library that monkey-patches browser asynchronous primitives to trigger automatic top-down change detection.",
    topicId: '02-angular-change-detection-vs-react-reconciliation',
    topicTitle: 'Change Detection (Zone.js/Signals) vs React Fiber',
    phaseTitle: 'Phase 12: Angular to React Enterprise Synthesis',
    phaseBadge: 'Staff Capstone',
    anchor: '4-first-principles-intuitive-physical-analogies-layer-1'
  },
  'signals': {
    term: 'Fine-Grained Signals',
    definition: 'Reactive state primitives (getter/setter closures) establishing automatic dependency graphs that update specific DOM nodes without VDOM diffing.',
    topicId: '07-angular-signals-vs-react-state-compiler',
    topicTitle: 'Angular Signals vs React State & React Compiler',
    phaseTitle: 'Phase 12: Angular to React Enterprise Synthesis',
    phaseBadge: 'Staff Capstone',
    anchor: '5-internal-working-engine-architecture-layer-2'
  },
  'closure': {
    term: 'Lexical Closure',
    definition: 'A function bundled with persistent references to its surrounding lexical environment recorded in its hidden [[Scopes]] pointer.',
    topicId: '03-closures',
    topicTitle: 'Closures & Lexical Memory Retention',
    phaseTitle: 'Phase 01: JavaScript Runtime Foundations',
    phaseBadge: 'Core Engine',
    anchor: '4-first-principles-what-is-a-closure'
  }
};
