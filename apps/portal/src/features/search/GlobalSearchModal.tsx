import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, X, BookOpen, ChevronRight } from 'lucide-react';
import type { ManifestData, TopicItem } from '../../core/types/manifest';
import manifestData from '../../assets/manifest.json';

const manifest = manifestData as unknown as ManifestData;

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic: (topic: TopicItem) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTopic
}) => {
  const [query, setQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten all 110 topics with phase context
  const allTopicsWithPhase = useMemo(() => {
    return manifest.phases.flatMap(phase =>
      phase.topics.map(topic => ({
        ...topic,
        phaseTitle: phase.title,
        phaseNumber: phase.id
      }))
    );
  }, []);

  // Filter topics based on search query
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return allTopicsWithPhase.filter(topic =>
      topic.title.toLowerCase().includes(q) ||
      topic.phaseTitle.toLowerCase().includes(q) ||
      topic.relativePath.toLowerCase().includes(q) ||
      topic.id.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [query, allTopicsWithPhase]);

  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard shortcut listener (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Search Header Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-primary)'
        }}>
          <Search size={20} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search across all 110 topics (e.g. Fiber, Event Loop, Signals, BFF, CRDT)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--text-primary)'
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
          <span style={{
            fontSize: '0.72rem',
            padding: '0.2rem 0.45rem',
            borderRadius: '4px',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-muted)',
            fontFamily: 'monospace'
          }}>
            ESC
          </span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '0.5rem' }}>
          {query.trim() === '' ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Type a keyword, concept, or algorithm name to search 110 chapters across 12 phases.
            </div>
          ) : searchResults.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No chapters found matching "<strong>{query}</strong>".
            </div>
          ) : (
            searchResults.map(topic => (
              <div
                key={topic.id}
                onClick={() => {
                  onSelectTopic(topic);
                  handleClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <BookOpen size={16} style={{ color: 'var(--react-cyan)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {topic.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{topic.phaseTitle}</span>
                      <span>•</span>
                      <span>{topic.relativePath}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
            ))
          )}
        </div>

        {/* Footer Meta */}
        <div style={{
          padding: '0.65rem 1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-primary)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Indexing 110 publication-grade chapters</span>
          <span>Tip: Press <code>ESC</code> to close</span>
        </div>
      </div>
    </div>
  );
};
