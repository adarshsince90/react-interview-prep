import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_INTERVIEWS } from './interviewsData';
import type { InterviewTab } from './types';
import {
  Briefcase,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Award,
  Layers,
  FileText,
  MessageSquareCode,
  ShieldCheck,
  Terminal,
  Zap,
  TrendingUp,
  Users
} from 'lucide-react';

export const InterviewsArena: React.FC = () => {
  // 1. Scenario Selection
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const roundParam = params.get('round');
    if (roundParam && MOCK_INTERVIEWS.some(m => m.id === roundParam)) {
      return roundParam;
    }
    return MOCK_INTERVIEWS[0].id;
  });

  const activeScenario = useMemo(() => {
    return MOCK_INTERVIEWS.find(m => m.id === selectedScenarioId) || MOCK_INTERVIEWS[0];
  }, [selectedScenarioId]);

  // Sync round in URL
  const handleSelectScenario = (id: string) => {
    setSelectedScenarioId(id);
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'interviews');
    url.searchParams.set('round', id);
    window.history.pushState({ view: 'interviews', round: id }, '', url.pathname + '?' + url.searchParams.toString());
  };

  // 2. Active Tab Selection
  const [activeTab, setActiveTab] = useState<InterviewTab>('simulation');

  // 3. Interactive Timer State (45:00 countdown)
  const initialSeconds = useMemo(() => activeScenario.durationMinutes * 60, [activeScenario]);
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Reset timer when scenario changes
  useEffect(() => {
    setSecondsLeft(activeScenario.durationMinutes * 60);
    setIsTimerRunning(false);
  }, [activeScenario]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    } else if (secondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerProgress = useMemo(() => {
    const total = activeScenario.durationMinutes * 60;
    return Math.max(0, Math.min(100, Math.round(((total - secondsLeft) / total) * 100)));
  }, [activeScenario, secondsLeft]);

  // 4. Socratic Turns State (expanded turns & revealed responses)
  const [expandedTurnId, setExpandedTurnId] = useState<string>(activeScenario.socraticTurns[0]?.id || '');
  const [revealedTurns, setRevealedTurns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExpandedTurnId(activeScenario.socraticTurns[0]?.id || '');
    setRevealedTurns({});
  }, [activeScenario]);

  const toggleTurnReveal = (turnId: string) => {
    setRevealedTurns(prev => ({ ...prev, [turnId]: !prev[turnId] }));
  };

  // 5. Candidate Scratchpad Notes (stored per scenario in localStorage)
  const notesStorageKey = `interview_notes_${activeScenario.id}`;
  const [scratchpadNotes, setScratchpadNotes] = useState<string>(() => {
    return localStorage.getItem(notesStorageKey) || '';
  });

  useEffect(() => {
    setScratchpadNotes(localStorage.getItem(`interview_notes_${activeScenario.id}`) || '');
  }, [activeScenario.id]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setScratchpadNotes(val);
    localStorage.setItem(notesStorageKey, val);
  };

  // 6. Rubric Scores State (stored per scenario in localStorage)
  const rubricStorageKey = `interview_rubric_${activeScenario.id}`;
  const [rubricScores, setRubricScores] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(rubricStorageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`interview_rubric_${activeScenario.id}`);
      setRubricScores(saved ? JSON.parse(saved) : {});
    } catch {
      setRubricScores({});
    }
  }, [activeScenario.id]);

  const handleSetScore = (criterionId: string, score: number) => {
    const next = { ...rubricScores, [criterionId]: score };
    setRubricScores(next);
    localStorage.setItem(rubricStorageKey, JSON.stringify(next));
  };

  const totalRubricScore = useMemo(() => {
    return Object.values(rubricScores).reduce((acc, score) => acc + score, 0);
  }, [rubricScores]);

  const maxRubricScore = useMemo(() => {
    return activeScenario.rubricCriteria.length * 5;
  }, [activeScenario]);

  const readinessRating = useMemo(() => {
    if (totalRubricScore >= 22) return { label: 'Principal Architect (L7)', color: 'var(--react-cyan)' };
    if (totalRubricScore >= 18) return { label: 'Staff Engineer (L6)', color: 'var(--emerald-success)' };
    if (totalRubricScore >= 14) return { label: 'Senior Engineer (L5)', color: 'var(--amber-warning)' };
    return { label: 'Developing Architect', color: 'var(--text-muted)' };
  }, [totalRubricScore]);

  // 7. Code Snippet Copy State
  const [copiedSnippetIndex, setCopiedSnippetIndex] = useState<number | null>(null);
  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetIndex(index);
    setTimeout(() => setCopiedSnippetIndex(null), 2000);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem 2rem' }}>
      {/* Top Banner & Header */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}
      >
        <div style={{ flex: '1 1 500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                background: 'rgba(14, 165, 233, 0.12)',
                color: 'var(--react-cyan)',
                border: '1px solid rgba(14, 165, 233, 0.25)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <Briefcase size={13} />
              Sprint 19: Staff & Principal Mock Interviews
            </span>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)'
              }}
            >
              {activeScenario.difficulty}
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
            {activeScenario.number}: {activeScenario.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0, maxWidth: '850px' }}>
            {activeScenario.tagline}
          </p>
        </div>

        {/* Live Countdown Timer Widget */}
        <div
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            minWidth: '240px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Interview Timer
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={14} color={secondsLeft < 300 ? 'var(--amber-warning)' : 'var(--react-cyan)'} />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: secondsLeft < 300 ? 'var(--amber-warning)' : 'var(--text-primary)'
                }}
              >
                {formatTimer(secondsLeft)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '5px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${timerProgress}%`,
                background: secondsLeft < 300 ? 'var(--amber-warning)' : 'var(--react-cyan)',
                transition: 'width 1s linear'
              }}
            />
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            <button
              onClick={() => setIsTimerRunning(prev => !prev)}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                background: isTimerRunning ? 'rgba(239, 68, 68, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                color: isTimerRunning ? '#ef4444' : 'var(--react-cyan)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {isTimerRunning ? <Pause size={13} /> : <Play size={13} />}
              {isTimerRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setSecondsLeft(activeScenario.durationMinutes * 60);
              }}
              title="Reset Timer"
              style={{
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Master-Detail Layout */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left Sidebar: 4 Mock Interview Scenarios */}
        <aside style={{ width: '330px', flexShrink: 0 }}>
          <div style={{ marginBottom: '0.8rem', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Staff Interview Scenarios
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {MOCK_INTERVIEWS.map(item => {
              const isSelected = item.id === activeScenario.id;
              const savedRubric = localStorage.getItem(`interview_rubric_${item.id}`);
              const savedScore = savedRubric ? Object.values(JSON.parse(savedRubric) as Record<string, number>).reduce((a, b) => a + b, 0) : null;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectScenario(item.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    padding: '1rem',
                    borderRadius: '10px',
                    background: isSelected ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                    border: `1px solid ${isSelected ? item.color : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 150ms ease',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: isSelected ? item.color : 'var(--bg-primary)',
                        color: isSelected ? '#ffffff' : 'var(--text-muted)'
                      }}
                    >
                      {item.number}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} />
                      {item.durationMinutes} min
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.3 }}>
                    {item.title}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '0.72rem', color: item.color, fontWeight: 600 }}>
                      {item.track}
                    </span>
                    {savedScore !== null && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--emerald-success)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Award size={12} />
                        {savedScore}/25 pts
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Context Card */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'var(--bg-tertiary)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.35rem' }}>
              <Sparkles size={14} color="var(--react-cyan)" />
              Socratic Interview Mode
            </div>
            Practice answering each turn out loud or on the scratchpad before clicking &quot;Reveal Staff Defense&quot; to calibrate your architectural depth.
          </div>
        </aside>

        {/* Right Main Stage: Content Tabs */}
        <section style={{ flex: 1, minWidth: 0 }}>
          {/* Tab Switcher */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.75rem',
              marginBottom: '1.5rem'
            }}
          >
            {[
              { id: 'simulation', label: '1. Socratic Simulation', icon: MessageSquareCode },
              { id: 'specs', label: '2. System Specs & Constraints', icon: FileText },
              { id: 'rubric', label: '3. Staff Rubric & Scorecard', icon: Award },
              { id: 'defense', label: '4. Architectural Defense Transcript', icon: Layers }
            ].map(tab => {
              const isTabActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as InterviewTab)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    background: isTabActive ? 'var(--bg-secondary)' : 'transparent',
                    border: `1px solid ${isTabActive ? 'var(--border-subtle)' : 'transparent'}`,
                    color: isTabActive ? 'var(--react-cyan)' : 'var(--text-secondary)',
                    fontWeight: isTabActive ? 700 : 500,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: Socratic Simulation */}
          {activeTab === 'simulation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Interviewer Profile Card */}
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(14, 165, 233, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--react-cyan)',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    flexShrink: 0
                  }}
                >
                  <Users size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Interviewer: {activeScenario.interviewerProfile.name}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--react-cyan)', fontWeight: 600 }}>
                    {activeScenario.interviewerProfile.role} • {activeScenario.interviewerProfile.companyProfile}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Style:</span> {activeScenario.interviewerProfile.interviewStyle}
                  </div>
                </div>
              </div>

              {/* Socratic Turns Accordion */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {activeScenario.socraticTurns.map((turn, index) => {
                  const isExpanded = expandedTurnId === turn.id;
                  const isRevealed = revealedTurns[turn.id];

                  return (
                    <div
                      key={turn.id}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() => setExpandedTurnId(isExpanded ? '' : turn.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1.1rem 1.4rem',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              background: 'var(--bg-tertiary)',
                              color: 'var(--text-secondary)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px'
                            }}
                          >
                            Turn {index + 1}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)' }}>
                            {turn.phaseTitle}
                          </span>
                        </div>
                        {isExpanded ? <ChevronDown size={18} color="var(--text-muted)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
                      </button>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div style={{ padding: '0 1.4rem 1.4rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          {/* Interviewer Prompt Speech Bubble */}
                          <div
                            style={{
                              background: 'var(--code-bg)',
                              borderLeft: '4px solid var(--react-cyan)',
                              borderRadius: '0 8px 8px 0',
                              padding: '1.1rem 1.3rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--react-cyan)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Interviewer Prompt
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                Tone: {turn.interviewerTone}
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--code-text)', lineHeight: 1.6, fontStyle: 'italic' }}>
                              {turn.interviewerPrompt}
                            </p>
                          </div>

                          {/* Candidate Discovery Checklists */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                            {/* Clarifications */}
                            <div style={{ background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-subtle)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
                                <HelpCircle size={14} color="var(--amber-warning)" />
                                Expected Clarifications & Questions:
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {turn.candidateClarifications.map((c, i) => (
                                  <li key={i}>{c}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Key Signals */}
                            <div style={{ background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-subtle)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
                                <CheckCircle2 size={14} color="var(--emerald-success)" />
                                Signals Interviewer is Evaluating:
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {turn.keySignalsToDemonstrate.map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Reveal Staff Defense Toggle */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.3rem' }}>
                            <button
                              onClick={() => toggleTurnReveal(turn.id)}
                              style={{
                                alignSelf: 'flex-start',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                background: isRevealed ? 'var(--bg-tertiary)' : 'var(--react-cyan)',
                                color: isRevealed ? 'var(--text-primary)' : '#000000',
                                border: '1px solid var(--border-subtle)',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                transition: 'all 150ms ease'
                              }}
                            >
                              <Sparkles size={14} />
                              {isRevealed ? 'Hide Staff Architect Defense' : 'Reveal Staff Architect Defense'}
                            </button>

                            {isRevealed && (
                              <div
                                style={{
                                  background: 'var(--bg-primary)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: '8px',
                                  padding: '1.25rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '1rem'
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--emerald-success)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                                    Authoritative Candidate Defense
                                  </div>
                                  <div
                                    style={{
                                      fontSize: '0.88rem',
                                      color: 'var(--text-primary)',
                                      lineHeight: 1.65,
                                      whiteSpace: 'pre-line'
                                    }}
                                  >
                                    {turn.candidateResponseDefense}
                                  </div>
                                </div>

                                <div
                                  style={{
                                    background: 'rgba(14, 165, 233, 0.08)',
                                    border: '1px solid rgba(14, 165, 233, 0.2)',
                                    borderRadius: '6px',
                                    padding: '0.75rem 1rem',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-secondary)'
                                  }}
                                >
                                  <strong style={{ color: 'var(--react-cyan)' }}>Staff Mentor Pro-Tip: </strong>
                                  {turn.deepDiveTip}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Candidate Scratchpad Section */}
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '1.25rem 1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    <Terminal size={15} color="var(--react-cyan)" />
                    Candidate Live Scratchpad &amp; Architecture Notes
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Auto-saved to localStorage
                  </span>
                </div>
                <textarea
                  value={scratchpadNotes}
                  onChange={handleNotesChange}
                  placeholder="Jot down your clarifying questions, capacity calculations, thread layout, and trade-off points here before revealing the answers..."
                  rows={4}
                  style={{
                    width: '100%',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    resize: 'vertical',
                    lineHeight: 1.5
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: System Specs & Constraints */}
          {activeTab === 'specs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Functional Requirements */}
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.4rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 0, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--emerald-success)" />
                  1. Functional Requirements
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.3rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  {activeScenario.specs.functionalRequirements.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Non-Functional Requirements & SLAs */}
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.4rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 0, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={16} color="var(--react-cyan)" />
                  2. Non-Functional Requirements &amp; Performance SLAs
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.3rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  {activeScenario.specs.nonFunctionalRequirements.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Capacity & Volume Calculations */}
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.4rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 0, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={16} color="var(--amber-warning)" />
                  3. Scale &amp; Capacity Estimation Table
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Metric</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Value</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Architectural Implication</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeScenario.specs.trafficAndVolumeCalculations.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{row.metric}</td>
                          <td style={{ padding: '0.6rem 0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--react-cyan)' }}>{row.value}</td>
                          <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>{row.implication}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Out of Scope */}
              <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem 1.4rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.5rem 0' }}>
                  Out-of-Scope Boundaries
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {activeScenario.specs.outOfScope.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: Staff Rubric & Scorecard */}
          {activeTab === 'rubric' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Scorecard Summary Card */}
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.5rem 2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.5rem'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Self-Evaluation Scorecard
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {totalRubricScore} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {maxRubricScore} Points</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Calculated Readiness</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: readinessRating.color }}>
                      {readinessRating.label}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setRubricScores({});
                      localStorage.removeItem(rubricStorageKey);
                    }}
                    style={{
                      padding: '0.45rem 0.8rem',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Reset Scorecard
                  </button>
                </div>
              </div>

              {/* Rubric Criteria List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {activeScenario.rubricCriteria.map(criterion => {
                  const currentScore = rubricScores[criterion.id] || 0;

                  return (
                    <div
                      key={criterion.id}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        padding: '1.4rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-primary)' }}>
                          {criterion.name}
                        </span>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'var(--bg-tertiary)', color: 'var(--react-cyan)' }}>
                          Weight: {criterion.weight}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 1rem 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {criterion.description}
                      </p>

                      {/* 4 Levels */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                        {criterion.levels.map(lvl => {
                          const isSelected = currentScore === lvl.score;

                          return (
                            <button
                              key={lvl.score}
                              onClick={() => handleSetScore(criterion.id, lvl.score)}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.35rem',
                                padding: '0.85rem',
                                borderRadius: '8px',
                                background: isSelected ? 'rgba(14, 165, 233, 0.12)' : 'var(--bg-tertiary)',
                                border: `1px solid ${isSelected ? 'var(--react-cyan)' : 'var(--border-subtle)'}`,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 120ms ease'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.8rem', color: isSelected ? 'var(--react-cyan)' : 'var(--text-primary)' }}>
                                  {lvl.score} pts: {lvl.title}
                                </span>
                                {isSelected && <CheckCircle2 size={14} color="var(--react-cyan)" />}
                              </div>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                {lvl.description}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Architectural Defense Transcript */}
          {activeTab === 'defense' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Elevator Pitch Callout */}
              <div
                style={{
                  background: 'rgba(14, 165, 233, 0.08)',
                  border: '1px solid rgba(14, 165, 233, 0.25)',
                  borderRadius: '10px',
                  padding: '1.25rem 1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.76rem', fontWeight: 800, color: 'var(--react-cyan)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
                  <Zap size={14} />
                  3-Minute Executive Elevator Pitch
                </div>
                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.65, fontStyle: 'italic' }}>
                  &quot;{activeScenario.defenseTranscript.elevatorPitch}&quot;
                </p>
              </div>

              {/* ASCII Architecture Diagram Box */}
              <div
                style={{
                  background: 'var(--code-bg)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  overflowX: 'auto'
                }}
              >
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                  System Architecture Topology Blueprint
                </div>
                <pre
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    color: 'var(--code-text)',
                    lineHeight: 1.35,
                    whiteSpace: 'pre'
                  }}
                >
                  {activeScenario.defenseTranscript.asciiDiagram}
                </pre>
              </div>

              {/* Core Architecture Text */}
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: 1.7
                }}
              >
                <div
                  style={{ whiteSpace: 'pre-line' }}
                  dangerouslySetInnerHTML={{
                    __html: activeScenario.defenseTranscript.coreArchitectureText
                      .replace(/^### (.*$)/gim, '<h3 style="color: var(--react-cyan); margin: 1.2rem 0 0.5rem 0; font-size: 1.1rem; font-weight: 700;">$1</h3>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-primary);">$1</strong>')
                  }}
                />
              </div>

              {/* Architecture Code Snippets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Production Architecture Snippets
                </h3>
                {activeScenario.defenseTranscript.codeSnippets.map((snippet, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--code-bg)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        padding: '0.65rem 1rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--code-text)' }}>
                        {snippet.title}
                      </span>
                      <button
                        onClick={() => handleCopyCode(snippet.code, idx)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: 'transparent',
                          border: 'none',
                          color: copiedSnippetIndex === idx ? 'var(--emerald-success)' : 'var(--text-muted)',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        {copiedSnippetIndex === idx ? <Check size={13} /> : <Copy size={13} />}
                        {copiedSnippetIndex === idx ? 'Copied!' : 'Copy'}
                      </button>
                    </div>

                    <pre
                      style={{
                        margin: 0,
                        padding: '1.1rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        color: 'var(--code-text)',
                        lineHeight: 1.5,
                        overflowX: 'auto'
                      }}
                    >
                      <code>{snippet.code}</code>
                    </pre>

                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderTop: '1px solid var(--border-subtle)',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <strong style={{ color: 'var(--text-primary)' }}>Annotation: </strong>
                      {snippet.explanation}
                    </div>
                  </div>
                ))}
              </div>

              {/* Trade-Off Matrix Table */}
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '1.4rem'
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 0, marginBottom: '0.8rem' }}>
                  Architectural Trade-Off Matrix
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Approach</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Latency &amp; Perf</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Memory &amp; Complexity</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Resilience &amp; Risk</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Staff Verdict</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeScenario.defenseTranscript.tradeoffMatrix.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{row.approach}</td>
                          <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>{row.latencyAndPerf}</td>
                          <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>{row.memoryAndComplexity}</td>
                          <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>{row.resilienceAndRisk}</td>
                          <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: row.verdict.includes('Gold Standard') ? 'var(--emerald-success)' : 'var(--amber-warning)' }}>
                            {row.verdict}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Staff Pro Tips Box */}
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '1.4rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.88rem', color: 'var(--react-cyan)', marginBottom: '0.6rem' }}>
                  <Sparkles size={16} />
                  Staff Architect Interview Delivery Principles
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.3rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {activeScenario.defenseTranscript.staffProTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
