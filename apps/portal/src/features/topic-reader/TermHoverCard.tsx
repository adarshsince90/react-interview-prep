import React from 'react';
import { BookOpen, Sparkles, ArrowRight, X } from 'lucide-react';
import type { TermDefinition } from './termDictionary';

interface TermHoverCardProps {
  data: TermDefinition;
  rect: DOMRect;
  onPeek: (topicId: string) => void;
  onNavigate: (topicId: string, anchor?: string) => void;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const TermHoverCard: React.FC<TermHoverCardProps> = ({
  data,
  rect,
  onPeek,
  onNavigate,
  onClose,
  onMouseEnter,
  onMouseLeave
}) => {
  // Compute floating positioning relative to viewport
  const cardWidth = 340;
  const cardHeightEstimate = 190;
  
  let left = rect.left + rect.width / 2 - cardWidth / 2;
  // Viewport horizontal guard
  if (left < 16) left = 16;
  if (left + cardWidth > window.innerWidth - 16) {
    left = window.innerWidth - cardWidth - 16;
  }

  // Vertical placement: prefer above the term, fallback below if near top
  let top = rect.top - cardHeightEstimate - 12;
  if (top < 70) {
    top = rect.bottom + 12;
  }

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${cardWidth}px`,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: '12px',
        padding: '1.1rem 1.25rem',
        boxShadow: 'var(--shadow-lg), 0 0 20px rgba(2, 132, 199, 0.15)',
        backdropFilter: 'blur(16px)',
        zIndex: 1000,
        pointerEvents: 'auto',
        animation: 'chapterFadeIn 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        color: 'var(--text-primary)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'rgba(2, 132, 199, 0.12)',
              color: 'var(--react-cyan)'
            }}
          >
            <Sparkles size={14} />
          </span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--react-cyan)' }}>
            Architectural Concept
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close hover card"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '4px'
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Term Title */}
      <h4 style={{ margin: '0 0 0.45rem 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
        {data.term}
      </h4>

      {/* Definition */}
      <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.84rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
        {data.definition}
      </p>

      {/* Origin Meta */}
      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <BookOpen size={12} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {data.phaseBadge ? `[${data.phaseBadge}] ` : ''}{data.topicTitle}
        </span>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => onPeek(data.topicId)}
          style={{
            flex: 1,
            padding: '0.38rem 0.65rem',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            fontSize: '0.76rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            transition: 'all 120ms ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--react-cyan)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          Peek Summary
        </button>

        <button
          onClick={() => onNavigate(data.topicId, data.anchor)}
          style={{
            flex: 1,
            padding: '0.38rem 0.65rem',
            background: 'linear-gradient(135deg, var(--react-cyan) 0%, #0369a1 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.76rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          Read Chapter <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};
