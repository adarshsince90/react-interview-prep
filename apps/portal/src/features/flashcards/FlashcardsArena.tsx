import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

export interface Flashcard {
  id: string;
  phaseId: string;
  phaseName: string;
  topicRef: string;
  concept: string;
  question: string;
  answer: string;
  memoryPeg: string;
  category: 'runtime' | 'react' | 'state' | 'architecture' | 'security' | 'synthesis';
}

const FLASHCARD_DECK: Flashcard[] = [
  {
    id: 'fc-01',
    phaseId: 'phase-01',
    phaseName: 'JS Runtime Foundations',
    topicRef: '06-objects-prototypes-this.md',
    concept: 'Call-Site `this` Binding',
    question: 'How is JavaScript `this` resolved at runtime, and why did React migrate from classes to hooks?',
    answer: 'In JS, `this` is never bound to where a function was authored, but strictly to the call-site execution context. React abandoned classes because `this.setState` and unbound method callbacks (`onClick={this.handleClick}`) caused rampant stale closure and prototype binding bugs.',
    memoryPeg: '🎤 The Microphone Stage: `this` is not who wrote the song, but whoever holds the microphone at the active call-site!',
    category: 'runtime'
  },
  {
    id: 'fc-02',
    phaseId: 'phase-01',
    phaseName: 'JS Runtime Foundations',
    topicRef: '04-event-loop.md',
    concept: 'Microtask Queue Drain vs Render Gate',
    question: 'Why does recursive `queueMicrotask()` freeze the browser UI, whereas recursive `setTimeout()` does not?',
    answer: 'The V8 Event Loop drains the Microtask queue exhaustively to zero before yielding to the 16.6ms Render Gate (rAF, Style, Layout, Paint). Recursive microtasks starve the main thread, causing 0 FPS. In contrast, macrotasks execute exactly ONE task per turn before yielding back to rendering.',
    memoryPeg: '🚂 Dual Conveyor Belts: Microtasks are an emergency express belt that must be 100% emptied before the display gate opens.',
    category: 'runtime'
  },
  {
    id: 'fc-03',
    phaseId: 'phase-03',
    phaseName: 'React Foundations',
    topicRef: '04-component-model-pure-functions.md',
    concept: 'The Component Purity Contract',
    question: 'Why must React components and custom hooks behave as pure functions with zero mutation?',
    answer: 'React reconciliation relies on referential stability (`Object.is`). In-place mutations (`array.push`, `obj.prop = val`) do not change object heap pointers, causing React to bail out of rendering. Purity also enables Concurrent React to pause, discard, and re-render work loops safely.',
    memoryPeg: '🏛️ The Museum Rule: Treat React props and state like priceless museum relics behind glass. Display and view them, but never scratch or mutate them!',
    category: 'react'
  },
  {
    id: 'fc-04',
    phaseId: 'phase-04',
    phaseName: 'React Rendering Internals',
    topicRef: '03-fiber-architecture.md',
    concept: 'Fiber Double Buffering',
    question: 'What is Double Buffering in React Fiber and how does it prevent tearing in concurrent mode?',
    answer: 'React maintains two trees in memory: `current` (the mounted tree visible on screen) and `workInProgress` (the scratchpad tree built during concurrent render). All speculative work is performed in the dark. At the Commit phase, React executes a single O(1) pointer swap (`root.current = workInProgress`), guaranteeing zero half-rendered UI tearing.',
    memoryPeg: '📽️ The Slide Projector: The audience watches the current slide on screen while the projectionist cues the next slide in the dark chamber.',
    category: 'react'
  },
  {
    id: 'fc-05',
    phaseId: 'phase-04',
    phaseName: 'React Rendering Internals',
    topicRef: '05-lanes-priority-mechanics.md',
    concept: '31-Bit Priority Lanes',
    question: 'How do React 19 Priority Lanes schedule urgent user input over background transitions?',
    answer: 'React models work using a 31-bit integer bitmask. Urgent actions (clicks, keystrokes) receive `SyncLane` (1) or `InputContinuousLane`. Deferred actions (`useTransition`) receive `DefaultTransitionLane`. React uses bitwise math (`lanes & -lanes`) to instantly compute the highest priority work without sorting arrays.',
    memoryPeg: '🚑 The Priority Highway: Urgent user typing is an ambulance with sirens blaring, preempting and pushing background freight trucks to the side lane.',
    category: 'react'
  },
  {
    id: 'fc-06',
    phaseId: 'phase-05',
    phaseName: 'Advanced State Architecture',
    topicRef: '05-cache-invalidation-optimistic-ui.md',
    concept: 'The Ghost Rollback Defect',
    question: 'What is the "Ghost Rollback" bug in optimistic mutations, and how is it prevented in TanStack Query?',
    answer: 'If an in-flight GET query is pending when an optimistic mutation triggers, the slow GET network response can arrive AFTER the optimistic update, overwriting the new optimistic state with stale historical data. Prevention requires calling `await queryClient.cancelQueries({ queryKey })` before applying the optimistic snapshot.',
    memoryPeg: '👻 The Ghost Rollback: A stale ghost from the past arriving late to override your fresh optimistic reality.',
    category: 'state'
  },
  {
    id: 'fc-07',
    phaseId: 'phase-06',
    phaseName: 'Next.js & Full-Stack React',
    topicRef: '09-dynamic-imports-bundling-optimization.md',
    concept: 'RSC Flight Wire Format',
    question: 'How does React Server Components Flight protocol eliminate client bundle weight while maintaining interactivity?',
    answer: 'Server Components execute exclusively on the server and stream serialized virtual DOM nodes (Flight chunks `M:`, `J:`, `S:`) over HTTP/2. Their imported libraries (e.g. date-fns, markdown parsers, heavy SQL drivers) are never included in the browser JavaScript bundle. Only interactive Client References (`"use client"`) emit client bundles.',
    memoryPeg: '📦 The Flight Courier: Server ships the finished furniture; the client only downloads tools for the interactive drawers.',
    category: 'architecture'
  },
  {
    id: 'fc-08',
    phaseId: 'phase-07',
    phaseName: 'Enterprise Security & Identity',
    topicRef: '06-bff-pattern-vs-api-gateway.md',
    concept: 'The Token-Mediating BFF',
    question: 'Why should browser SPAs never store JWT access or refresh tokens in `localStorage`?',
    answer: '`localStorage` is completely accessible to any JavaScript running in the origin, making tokens vulnerable to Cross-Site Scripting (XSS). The Token-Mediating BFF stores tokens in an encrypted, `HttpOnly`, `SameSite=Strict`, `Secure` cookie, proxying requests and injecting Bearer tokens securely behind the DMZ firewall.',
    memoryPeg: '🛡️ The Diplomatic Courier: The browser carries a sealed diplomat passport (cookie); the edge gateway opens the vault and issues the internal pass.',
    category: 'security'
  },
  {
    id: 'fc-09',
    phaseId: 'phase-09',
    phaseName: 'Clean Architecture & MFEs',
    topicRef: '08-strangler-fig-monolith-refactoring.md',
    concept: 'Strangler Fig Migration',
    question: 'How do you safely migrate a legacy enterprise Angular/.NET monolith to modern React/Next.js without high-risk rewrites?',
    answer: 'Use the Strangler Fig pattern: deploy an edge proxy (Cloudflare Worker or Next.js middleware) in front of both systems. Route newly built features to the new React app while proxying unmigrated paths back to the legacy system. The new architecture gradually strangles and replaces the old system route by route.',
    memoryPeg: '🌿 The Strangler Fig Vine: Plant the seed in the old tree canopy; the vine grows around the trunk until the dead core can be removed with zero downtime.',
    category: 'architecture'
  },
  {
    id: 'fc-10',
    phaseId: 'phase-12',
    phaseName: 'Angular to React Enterprise Synthesis',
    topicRef: '02-angular-change-detection-vs-react-reconciliation.md',
    concept: 'Zone.js vs React Fiber Work Loop',
    question: 'How does Angular change detection fundamentally contrast with React reconciliation at runtime?',
    answer: 'Angular with Zone.js monkey-patches all async browser APIs (`addEventListener`, `setTimeout`, `fetch`) and triggers a synchronous top-down dirty check of the component tree. In contrast, React uses explicit dispatchers (`setState`, hooks) and a cooperative Fiber work loop scheduled across micro-time slices.',
    memoryPeg: '⚡ The Town Crier vs The Delivery Route: Zone.js sounds the town alarm on any noise; React Fiber checks specific delivery addresses along an optimized route.',
    category: 'synthesis'
  }
];

export const FlashcardsArena: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mastered_flashcards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const filteredCards = useMemo(() => {
    if (selectedPhase === 'all') return FLASHCARD_DECK;
    return FLASHCARD_DECK.filter(c => c.phaseId === selectedPhase);
  }, [selectedPhase]);

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handlePhaseChange = (phase: string) => {
    setSelectedPhase(phase);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const toggleMastered = (id: string) => {
    setMasteredIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('mastered_flashcards', JSON.stringify(next));
      return next;
    });
  };

  const isCurrentMastered = currentCard ? masteredIds.includes(currentCard.id) : false;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          <Sparkles size={15} /> Memory Peg & Mental Model Drills
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Flashcards Arena: Architectural Memory Pegs
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '800px', margin: 0 }}>
          Master sticky memory anchors (The Museum Rule, Slide Projector, Token-Mediating BFF, Strangler Fig) to answer Senior & Staff Architect interview questions effortlessly.
        </p>
      </div>

      {/* Filter Bar & Progress */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
        background: 'var(--bg-secondary)',
        padding: '1rem 1.25rem',
        borderRadius: '10px',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Phase Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Deck Filter:</span>
          <select
            value={selectedPhase}
            onChange={(e) => handlePhaseChange(e.target.value)}
            style={{
              padding: '0.45rem 0.8rem',
              borderRadius: '6px',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-medium)',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Phases ({FLASHCARD_DECK.length} Cards)</option>
            <option value="phase-01">Phase 01: JS Runtime Foundations</option>
            <option value="phase-03">Phase 03: React Foundations</option>
            <option value="phase-04">Phase 04: React Fiber & Rendering</option>
            <option value="phase-05">Phase 05: State Architecture</option>
            <option value="phase-06">Phase 06: Next.js & Full-Stack</option>
            <option value="phase-07">Phase 07: Enterprise Security</option>
            <option value="phase-09">Phase 09: Clean Architecture & MFEs</option>
            <option value="phase-12">Phase 12: Angular to React Synthesis</option>
          </select>
        </div>

        {/* Mastery Metric */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Card <strong>{currentIndex + 1}</strong> of <strong>{filteredCards.length}</strong>
          </div>
          <div style={{
            fontSize: '0.82rem',
            padding: '0.3rem 0.7rem',
            borderRadius: '20px',
            background: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--emerald-success, #10b981)',
            fontWeight: 600
          }}>
            Mastered: {masteredIds.length}/{FLASHCARD_DECK.length}
          </div>
        </div>
      </div>

      {/* The Interactive Flip Card */}
      {currentCard && (
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            minHeight: '340px',
            background: 'var(--bg-secondary)',
            border: isCurrentMastered ? '2px solid var(--emerald-success, #10b981)' : '2px solid var(--border-medium)',
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            userSelect: 'none'
          }}
        >
          {/* Card Top Meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--react-cyan)',
              background: 'rgba(0, 216, 255, 0.1)',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px'
            }}>
              {currentCard.phaseName}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMastered(currentCard.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                background: isCurrentMastered ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)',
                color: isCurrentMastered ? 'var(--emerald-success, #10b981)' : 'var(--text-muted)',
                border: isCurrentMastered ? '1px solid var(--emerald-success, #10b981)' : '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Bookmark size={14} /> {isCurrentMastered ? 'Mastered' : 'Mark as Mastered'}
            </button>
          </div>

          {/* Card Body (Front vs Back) */}
          <div style={{ margin: '2rem 0' }}>
            {!isFlipped ? (
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>
                  QUESTION / ARCHITECTURAL SCENARIO
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                  {currentCard.question}
                </h2>
                <div style={{ marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <RotateCw size={14} /> Click card to reveal memory peg and architect answer
                </div>
              </div>
            ) : (
              <div>
                {/* Memory Peg Callout */}
                <div style={{
                  background: 'rgba(168, 85, 247, 0.1)',
                  borderLeft: '4px solid #c084fc',
                  padding: '0.85rem 1rem',
                  borderRadius: '4px',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Memory Peg & Mental Model (Layer 3)
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {currentCard.memoryPeg}
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>
                  ARCHITECTURAL EXPLANATION
                </div>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {currentCard.answer}
                </p>
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Chapter: <code>{currentCard.topicRef}</code>
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {isFlipped ? 'Click to flip back' : 'Click to flip'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
        <button
          onClick={handlePrev}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-medium)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={18} /> Previous Card
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.5rem',
            borderRadius: '8px',
            background: 'var(--react-cyan)',
            color: '#000',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <RotateCw size={18} /> {isFlipped ? 'Show Question' : 'Flip to Answer'}
        </button>

        <button
          onClick={handleNext}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-medium)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Next Card <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
