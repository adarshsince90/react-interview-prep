import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Sparkles 
} from 'lucide-react';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  critique: string;
}

interface QuizScenario {
  id: string;
  title: string;
  difficulty: 'Senior' | 'Lead' | 'Staff Architect';
  domain: string;
  scenario: string;
  question: string;
  options: QuizOption[];
  architectTakeaway: string;
}

const ARCHITECT_QUIZZES: QuizScenario[] = [
  {
    id: 'quiz-01',
    title: 'High-Frequency Real-Time Telemetry State Architecture',
    difficulty: 'Staff Architect',
    domain: 'State Management & Performance',
    scenario: 'You are architecting an enterprise telemetry terminal receiving 1,000 WebSocket updates per second across 2,000 active rows. Rendering the entire tree with standard React state drops the frame rate to 4 FPS and freezes user interaction.',
    question: 'Which architectural state pattern eliminates the bottleneck while preserving 60 FPS?',
    options: [
      {
        id: 'opt-a',
        text: 'Store updates in Redux Toolkit and wrap each table row with React.memo() and useMemo().',
        isCorrect: false,
        critique: 'Redux reducers run synchronously on the main thread and dispatching 1,000 actions/sec still triggers root store subscription broadcasts and shallow-comparison overhead for 2,000 rows.'
      },
      {
        id: 'opt-b',
        text: 'Buffer messages in an off-thread Web Worker or requestAnimationFrame ring buffer, and use Zustand with transient ref-based subscriptions or Canvas virtualization.',
        isCorrect: true,
        critique: 'Batching 1,000 msgs/sec into 16.6ms frame chunks via a ring buffer and subscribing cells individually bypasses React component tree re-evaluation, locking the app at 60 FPS.'
      },
      {
        id: 'opt-c',
        text: 'Replace React state with React Context API and split state into 10 smaller contexts.',
        isCorrect: false,
        critique: 'Context API is not a high-frequency pub/sub engine. Every context value change unconditionally schedules renders for all consuming components.'
      },
      {
        id: 'opt-d',
        text: 'Throttle incoming WebSocket packets to 1 message every 3 seconds.',
        isCorrect: false,
        critique: 'Arbitrary throttling drops 99% of business data, violating the requirements of high-frequency telemetry.'
      }
    ],
    architectTakeaway: 'At Staff scale, decouple data ingestion frequency (1,000 Hz) from screen refresh hardware frequency (60 Hz) using ring buffers and transient subscriptions.'
  },
  {
    id: 'quiz-02',
    title: 'Enterprise Single-Page App Authentication & Token Storage',
    difficulty: 'Lead',
    domain: 'Enterprise Security & Identity',
    scenario: 'A security audit identifies that your customer portal stores Azure AD JWT Access and Refresh tokens in `localStorage`. The CISO mandates immediate remediation against Cross-Site Scripting (XSS) extraction vectors.',
    question: 'What is the industry-standard enterprise remediation architecture?',
    options: [
      {
        id: 'opt-a',
        text: 'Encrypt the tokens in localStorage using an AES-256 key embedded in the frontend bundle.',
        isCorrect: false,
        critique: 'Embedding encryption keys in the client bundle provides zero security—any XSS payload can read the key and decrypt localStorage.'
      },
      {
        id: 'opt-b',
        text: 'Implement the Token-Mediating Backend-for-Frontend (BFF) pattern: hold refresh tokens in HttpOnly, SameSite=Strict, Secure encrypted cookies, and proxy authenticated API requests.',
        isCorrect: true,
        critique: 'HttpOnly cookies cannot be read or stolen by malicious JavaScript running in the browser origin, completely neutralizing token theft via XSS.'
      },
      {
        id: 'opt-c',
        text: 'Move tokens to sessionStorage instead of localStorage.',
        isCorrect: false,
        critique: 'sessionStorage is equally accessible to client JavaScript and vulnerable to origin XSS attacks.'
      },
      {
        id: 'opt-d',
        text: 'Use Basic Authentication headers over HTTPS.',
        isCorrect: false,
        critique: 'Basic Auth is an obsolete protocol that transmits base64 credentials with each request, violating modern OAuth2/OIDC standards.'
      }
    ],
    architectTakeaway: 'Never let browser JavaScript touch long-lived credentials. Delegate session tokens to edge BFF proxies backed by HttpOnly cookies.'
  },
  {
    id: 'quiz-03',
    title: 'Main Thread Yielding & Interaction to Next Paint (INP)',
    difficulty: 'Senior',
    domain: 'Performance Engineering & Web Vitals',
    scenario: 'A data processing wizard performs heavy synchronous parsing on a 5MB JSON dataset upon user click, triggering a 280ms Long Task that degrades the Core Web Vital INP score into the "Poor" category.',
    question: 'How should you refactor the execution flow to keep INP under 50ms without dropping parsing throughput?',
    options: [
      {
        id: 'opt-a',
        text: 'Wrap the synchronous parsing function inside a standard setTimeout(..., 0).',
        isCorrect: false,
        critique: 'setTimeout(..., 0) defers the entire 280ms task to a subsequent macrotask, but once it starts running, it still blocks the main thread for 280ms uninterrupted.'
      },
      {
        id: 'opt-b',
        text: 'Chunk the dataset and yield control back to the browser using scheduler.yield() or offload parsing to a dedicated Web Worker.',
        isCorrect: true,
        critique: 'scheduler.yield() allows the browser to process high-priority user clicks and paint frames between chunks, preserving an instantaneous INP < 50ms.'
      },
      {
        id: 'opt-c',
        text: 'Use React.useMemo() around the parsing function.',
        isCorrect: false,
        critique: 'useMemo() only caches the result between renders; during the initial parse, it blocks the main thread identically.'
      },
      {
        id: 'opt-d',
        text: 'Increase CSS animation duration to mask the lag.',
        isCorrect: false,
        critique: 'Visual masking does not prevent main thread starvation or INP telemetry penalties collected by Google CrUX.'
      }
    ],
    architectTakeaway: 'Break monopolistic CPU computations into micro-chunks and yield regularly to allow the Event Loop to service user interactions.'
  },
  {
    id: 'quiz-04',
    title: 'Migrating Hierarchical Angular DI to React Clean Architecture',
    difficulty: 'Staff Architect',
    domain: 'Angular to React Enterprise Synthesis',
    scenario: 'You are refactoring an enterprise Angular application where multiple nested child components inject a stateful `OrderWorkflowService` configured at a parent component injector level (`providers: [OrderWorkflowService]`).',
    question: 'What is the clean, idiomatic React architecture to preserve scoped dependency isolation without performance degradation?',
    options: [
      {
        id: 'opt-a',
        text: 'Use a global Redux store where all order state is stored at the application root.',
        isCorrect: false,
        critique: 'Global stores eliminate the sub-tree isolation guarantee of Angular hierarchical injectors, creating state namespace collisions when multiple orders are viewed simultaneously.'
      },
      {
        id: 'opt-b',
        text: 'Create a scoped Context Provider wrapping the order sub-tree, providing an instantiated custom hook or Zustand vanilla store instance created via useRef().',
        isCorrect: true,
        critique: 'A scoped Provider passing a store reference (created per instance via useRef) provides exact 1-to-1 parity with Angular ElementInjectors: scoped isolation, clean teardown, and granular subscriptions.'
      },
      {
        id: 'opt-c',
        text: 'Pass the service down through 12 levels of props.',
        isCorrect: false,
        critique: 'Prop drilling across deep subtrees creates high coupling and maintenance nightmares.'
      },
      {
        id: 'opt-d',
        text: 'Export a singleton class instance from a TypeScript file.',
        isCorrect: false,
        critique: 'Singletons share state globally across all component instances, preventing multiple independent orders from coexisting.'
      }
    ],
    architectTakeaway: 'React Context combined with instance-scoped store closures (`useRef`) replicates Angular hierarchical ElementInjectors with zero framework boilerplate.'
  }
];

export const QuizArena: React.FC = () => {
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const activeQuiz = ARCHITECT_QUIZZES[currentQuizIndex];

  const handleSelectOption = (optionId: string) => {
    if (isAnswered) return;
    setSelectedOptionId(optionId);
    setIsAnswered(true);

    const chosen = activeQuiz.options.find(o => o.id === optionId);
    if (chosen?.isCorrect) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    setSelectedOptionId(null);
    setIsAnswered(false);
    setCurrentQuizIndex(prev => (prev + 1) % ARCHITECT_QUIZZES.length);
  };

  const handleReset = () => {
    setSelectedOptionId(null);
    setIsAnswered(false);
    setCurrentQuizIndex(0);
    setScore(0);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 216, 255, 0.1)', color: 'var(--react-cyan)', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          <Award size={15} /> Staff & Lead Interview Drills
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Architect Scenario Quizzes & Code Puzzles
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '800px', margin: 0 }}>
          Real-world enterprise system dilemmas: evaluate trade-offs, defend architectural decisions, and review in-depth Staff Engineer critiques.
        </p>
      </div>

      {/* Progress & Meta Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-secondary)',
        padding: '0.85rem 1.25rem',
        borderRadius: '10px',
        border: '1px solid var(--border-subtle)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '12px',
            background: 'rgba(168, 85, 247, 0.15)',
            color: '#c084fc',
            fontWeight: 700
          }}>
            {activeQuiz.difficulty}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Domain: <strong>{activeQuiz.domain}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            Question <strong>{currentQuizIndex + 1}</strong> of <strong>{ARCHITECT_QUIZZES.length}</strong>
          </span>
          <span style={{
            background: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--emerald-success, #10b981)',
            padding: '0.25rem 0.65rem',
            borderRadius: '12px',
            fontWeight: 700
          }}>
            Score: {score} / {ARCHITECT_QUIZZES.length}
          </span>
        </div>
      </div>

      {/* Scenario Question Card */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: '12px',
        padding: '1.75rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Production Dilemma:
        </div>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          {activeQuiz.scenario}
        </p>

        <div style={{
          background: 'var(--bg-primary)',
          padding: '1rem',
          borderRadius: '8px',
          borderLeft: '4px solid var(--react-cyan)',
          fontWeight: 700,
          fontSize: '1rem',
          color: 'var(--text-primary)'
        }}>
          {activeQuiz.question}
        </div>
      </div>

      {/* Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {activeQuiz.options.map(option => {
          const isSelected = selectedOptionId === option.id;
          let borderColor = 'var(--border-subtle)';
          let bgColor = 'var(--bg-secondary)';

          if (isAnswered) {
            if (option.isCorrect) {
              borderColor = 'var(--emerald-success, #10b981)';
              bgColor = 'rgba(16, 185, 129, 0.08)';
            } else if (isSelected) {
              borderColor = 'var(--rose-danger, #f43f5e)';
              bgColor = 'rgba(239, 68, 68, 0.08)';
            }
          } else if (isSelected) {
            borderColor = 'var(--react-cyan)';
          }

          return (
            <div
              key={option.id}
              onClick={() => handleSelectOption(option.id)}
              style={{
                background: bgColor,
                border: `2px solid ${borderColor}`,
                borderRadius: '10px',
                padding: '1.25rem',
                cursor: isAnswered ? 'default' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {option.text}
                </span>

                {isAnswered && (
                  <div>
                    {option.isCorrect ? (
                      <CheckCircle2 style={{ color: 'var(--emerald-success, #10b981)' }} size={20} />
                    ) : isSelected ? (
                      <XCircle style={{ color: 'var(--rose-danger, #f43f5e)' }} size={20} />
                    ) : null}
                  </div>
                )}
              </div>

              {/* In-Depth Critique */}
              {isAnswered && (
                <div style={{
                  fontSize: '0.82rem',
                  color: option.isCorrect ? 'var(--emerald-success, #10b981)' : 'var(--text-secondary)',
                  marginTop: '0.25rem',
                  lineHeight: 1.5,
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.5rem'
                }}>
                  <strong>Staff Critique:</strong> {option.critique}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Staff Takeaway Callout (Visible After Answering) */}
      {isAnswered && (
        <div style={{
          background: 'rgba(0, 216, 255, 0.08)',
          border: '1px solid var(--react-cyan)',
          borderRadius: '10px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Sparkles style={{ color: 'var(--react-cyan)', flexShrink: 0 }} size={24} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--react-cyan)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Staff Architectural Principle
            </div>
            <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {activeQuiz.architectTakeaway}
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={handleReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: 'transparent',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          <RotateCcw size={14} /> Reset Quiz Progress
        </button>

        {isAnswered && (
          <button
            onClick={handleNext}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.5rem',
              borderRadius: '8px',
              background: 'var(--react-cyan)',
              color: '#000',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Next Scenario <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
