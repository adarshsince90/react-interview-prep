import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, X, BookOpen, Layers, Sparkles, ChevronRight } from 'lucide-react';
import type { ManifestData, TopicItem } from '../../core/types/manifest';
import manifestData from '../../assets/manifest.json';

const manifest = manifestData as unknown as ManifestData;

export interface SearchIndexItem {
  type: 'chapter' | 'section' | 'concept';
  id: string; // topic id
  phaseId: string;
  phaseBadge: string;
  phaseTitle: string;
  topicTitle?: string;
  title: string;
  snippet?: string;
  anchor: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic: (topic: TopicItem) => void;
  onNavigateToTopic?: (topicIdOrPath: string) => void;
}

// Module-level cache so search index is fetched once per session
let cachedIndex: SearchIndexItem[] | null = null;

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTopic,
  onNavigateToTopic
}) => {
  const [query, setQuery] = useState<string>('');
  const [searchIndex, setSearchIndex] = useState<SearchIndexItem[] | null>(() => cachedIndex);
  const [isLoadingIndex, setIsLoadingIndex] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lazy-load public/search-index.json when modal opens
  useEffect(() => {
    if (isOpen && !cachedIndex && !isLoadingIndex) {
      setIsLoadingIndex(true);
      const baseUrl = import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`;
      
      fetch(`${baseUrl}search-index.json`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data: SearchIndexItem[]) => {
          cachedIndex = data;
          setSearchIndex(data);
          setIsLoadingIndex(false);
        })
        .catch(err => {
          console.warn('Could not lazy-load search-index.json, falling back to manifest:', err);
          setIsLoadingIndex(false);
        });
    }
  }, [isOpen, isLoadingIndex]);

  // Fallback flat topics from manifest if index isn't ready
  const fallbackTopics = useMemo<SearchIndexItem[]>(() => {
    return manifest.phases.flatMap(phase =>
      phase.topics.map(topic => ({
        type: 'chapter' as const,
        id: topic.id,
        phaseId: phase.id,
        phaseBadge: phase.badge,
        phaseTitle: phase.title,
        title: topic.title,
        anchor: ''
      }))
    );
  }, []);

  // Filter search results across Chapters, Sections, and Vocabulary Concepts
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    const source = searchIndex || fallbackTopics;

    const matched = source.filter(item => {
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchTopic = item.topicTitle?.toLowerCase().includes(q);
      const matchSnippet = item.snippet?.toLowerCase().includes(q);
      const matchPhase = item.phaseTitle?.toLowerCase().includes(q);
      const matchId = item.id?.toLowerCase().includes(q);
      return matchTitle || matchTopic || matchSnippet || matchPhase || matchId;
    });

    // Score & sort: exact/starts-with title first, then chapter > section > concept
    return matched.sort((a, b) => {
      const aTitleLower = a.title.toLowerCase();
      const bTitleLower = b.title.toLowerCase();

      const aExact = aTitleLower === q;
      const bExact = bTitleLower === q;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStarts = aTitleLower.startsWith(q);
      const bStarts = bTitleLower.startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      const typeWeight = { chapter: 0, section: 1, concept: 2 };
      return typeWeight[a.type] - typeWeight[b.type];
    }).slice(0, 25);
  }, [query, searchIndex, fallbackTopics]);

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

  const handleResultClick = (item: SearchIndexItem) => {
    if (item.type === 'chapter') {
      const allTopics = manifest.phases.flatMap(p => p.topics);
      const match = allTopics.find(t => t.id === item.id);
      if (match) {
        onSelectTopic(match);
      } else if (onNavigateToTopic) {
        onNavigateToTopic(item.id);
      }
    } else {
      const target = item.anchor ? `${item.id}#${item.anchor}` : item.id;
      if (onNavigateToTopic) {
        onNavigateToTopic(target);
      } else {
        const allTopics = manifest.phases.flatMap(p => p.topics);
        const match = allTopics.find(t => t.id === item.id);
        if (match) onSelectTopic(match);
      }
    }
    handleClose();
  };

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
        paddingTop: '8vh'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '720px',
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
            placeholder="Search across chapters, sections & concepts (e.g. Fiber, Event Loop, WeakMap, WriteBarrier, Strangler Fig)..."
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
        <div style={{ maxHeight: '460px', overflowY: 'auto', padding: '0.5rem' }}>
          {query.trim() === '' ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              <div style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Deep Full-Text Architecture Search
              </div>
              <div>Search across 110 chapters, 2,200+ detailed sections, and core engineering concepts.</div>
            </div>
          ) : searchResults.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No results found matching "<strong>{query}</strong>".
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const isChapter = item.type === 'chapter';
              const isSection = item.type === 'section';
              const isConcept = item.type === 'concept';

              return (
                <div
                  key={`${item.id}-${item.anchor || item.title}-${idx}`}
                  onClick={() => handleResultClick(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    {isChapter && <BookOpen size={16} style={{ color: 'var(--react-cyan)', flexShrink: 0, marginTop: '2px' }} />}
                    {isSection && <Layers size={16} style={{ color: 'var(--emerald-success)', flexShrink: 0, marginTop: '2px' }} />}
                    {isConcept && <Sparkles size={16} style={{ color: 'var(--purple-accent)', flexShrink: 0, marginTop: '2px' }} />}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            background: isChapter
                              ? 'rgba(2, 132, 199, 0.15)'
                              : isSection
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(124, 58, 237, 0.15)',
                            color: isChapter
                              ? 'var(--react-cyan)'
                              : isSection
                              ? 'var(--emerald-success)'
                              : 'var(--purple-accent)'
                          }}
                        >
                          {item.type}
                        </span>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </div>
                      </div>

                      {isConcept && item.snippet && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.snippet}
                        </div>
                      )}

                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span>{item.phaseTitle}</span>
                        {item.topicTitle && (
                          <>
                            <span>›</span>
                            <span>{item.topicTitle}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <ChevronRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '0.5rem' }} />
                </div>
              );
            })
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
          <span>Indexing 110 chapters, 2,200+ sections & concept definitions</span>
          <span>Press <code>ESC</code> to dismiss</span>
        </div>
      </div>
    </div>
  );
};
