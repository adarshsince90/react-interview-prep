import React, { useState, useEffect } from 'react';
import type { ManifestData, TopicItem } from '../../core/types/manifest';
import { Layers, Sparkles, CheckCircle2, Circle, Terminal, Award } from 'lucide-react';
import { getCompletedTopicIds } from '../../core/utils/progressStorage';
import { formatTopicBadgeAndTitle } from '../../core/utils/slugify';

interface DashboardProps {
  manifest: ManifestData;
  onSelectTopic: (topic: TopicItem) => void;
  onLaunchLab: (labId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ manifest, onSelectTopic, onLaunchLab }) => {
  const [completedIds, setCompletedIds] = useState<string[]>(() => getCompletedTopicIds());

  useEffect(() => {
    const handleUpdate = () => {
      setCompletedIds(getCompletedTopicIds());
    };
    window.addEventListener('progress_updated', handleUpdate);
    return () => window.removeEventListener('progress_updated', handleUpdate);
  }, []);

  const totalTopics = manifest.totalTopics || 16;
  const completedCount = completedIds.length;
  const overallPercentage = Math.round((completedCount / totalTopics) * 100);

  return (
    <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Hero Banner */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '2.5rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(2, 132, 199, 0.1)', color: 'var(--react-cyan)', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
            <Award size={16} /> Senior Angular + .NET → Senior / Staff React Architect
          </div>
          <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            React & JavaScript Runtime Architecture Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            A publication-grade engineering handbook and companion simulation laboratory designed for deep first-principles learning, architectural comparison, and senior interview drills.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onLaunchLab('lab-10-jsx-compiler')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.35rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--react-cyan) 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Sparkles size={17} /> Launch JSX Simulator
            </button>
            <button
              onClick={() => onLaunchLab('lab-11-component-purity')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.35rem',
                borderRadius: '8px',
                background: 'rgba(124, 58, 237, 0.1)',
                color: 'var(--purple-accent)',
                border: '1px solid rgba(124, 58, 237, 0.25)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <Terminal size={17} /> Test Component Purity
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>Handbook Study Progress</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {completedCount} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {totalTopics} Topics</span>
          </div>
          <div style={{ marginTop: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${overallPercentage}%`, background: 'var(--emerald-success)', height: '100%', transition: 'width 300ms ease' }} />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--emerald-success)', marginTop: '0.35rem', fontWeight: 600 }}>
            {overallPercentage}% Curriculum Completed
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>Interactive Labs Active</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--react-cyan)', fontFamily: 'var(--font-mono)' }}>
            2 <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Live in Portal</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Lab 10 (JSX) & Lab 11 (Purity) • Lab 12 queued
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>Active Mentorship Focus</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--amber-warning)', marginTop: '0.35rem' }}>
            Phase 03: React Core
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Topic 06: Props vs State Immutability
          </div>
        </div>
      </div>

      {/* Phase Roadmap Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={20} color="var(--react-cyan)" />
          Curriculum & Phase Roadmap
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {manifest.phases.map(phase => {
            const completedInPhase = phase.topics.filter(t => completedIds.includes(t.id)).length;
            const isFullyComplete = phase.topicCount > 0 && completedInPhase === phase.topicCount;

            return (
              <div
                key={phase.id}
                className="roadmap-phase-card"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '420px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 200ms ease'
                }}
              >
                <div style={{ flexShrink: 0, marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isFullyComplete ? 'var(--emerald-success)' : 'var(--react-cyan)', background: isFullyComplete ? 'rgba(5, 150, 105, 0.1)' : 'rgba(2, 132, 199, 0.1)', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                      {phase.badge}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {completedInPhase} / {phase.topicCount} Completed
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem', letterSpacing: '-0.01em' }}>
                    {phase.title}
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {phase.description}
                  </p>

                  {/* Phase Progress Bar */}
                  {phase.topicCount > 0 && (
                    <div style={{ width: '100%', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.round((completedInPhase / phase.topicCount) * 100)}%`,
                          height: '100%',
                          background: isFullyComplete ? 'var(--emerald-success)' : 'linear-gradient(90deg, var(--react-cyan), #38bdf8)',
                          transition: 'width 300ms ease'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Topic Jump Links (Scrollable if topics exceed height) */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.75rem',
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    paddingRight: '0.35rem'
                  }}
                >
                  {phase.topics.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic', padding: '1rem' }}>
                      Curriculum topics scheduled for authoring
                    </div>
                  ) : (
                    phase.topics.map(t => {
                      const isDone = completedIds.includes(t.id);
                      const { badge: badgeText, cleanTitle } = formatTopicBadgeAndTitle(t.title);

                      return (
                        <button
                          key={t.id}
                          onClick={() => onSelectTopic(t)}
                          title={t.title}
                          style={{
                            textAlign: 'left',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.4rem 0.55rem',
                            borderRadius: '6px',
                            transition: 'all 150ms ease',
                            gap: '0.5rem'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--bg-tertiary)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>
                            {isDone ? (
                              <CheckCircle2 size={14} color="var(--emerald-success)" style={{ flexShrink: 0 }} />
                            ) : (
                              <Circle size={14} color="var(--border-medium)" style={{ flexShrink: 0 }} />
                            )}
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                fontFamily: 'var(--font-mono)',
                                padding: '0.08rem 0.3rem',
                                borderRadius: '3px',
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-muted)',
                                flexShrink: 0
                              }}
                            >
                              {badgeText}
                            </span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {cleanTitle}
                            </span>
                          </span>
                          {t.lab && (
                            <span style={{ fontSize: '0.68rem', fontWeight: 600, background: 'rgba(2, 132, 199, 0.1)', color: 'var(--react-cyan)', padding: '0.1rem 0.35rem', borderRadius: '3px', flexShrink: 0 }}>
                              Lab
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
