import { useState, useMemo, useEffect } from 'react';
import manifestData from './assets/manifest.json';
import type { ManifestData, TopicItem } from './core/types/manifest';
import { Dashboard } from './features/dashboard/Dashboard';
import { TopicReader } from './features/topic-reader/TopicReader';
import { VisualizerHub } from './features/visualizers/VisualizerHub';
import { FlashcardsArena } from './features/flashcards/FlashcardsArena';
import { QuizArena } from './features/quizzes/QuizArena';
import { GlobalSearchModal } from './features/search/GlobalSearchModal';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Search,
  Menu,
  X,
  Sparkles,
  Sun,
  Moon,
  CheckCircle2,
  Award
} from 'lucide-react';
import {
  getStoredTheme,
  setStoredTheme,
  getCompletedTopicIds
} from './core/utils/progressStorage';
import { formatTopicBadgeAndTitle } from './core/utils/slugify';

const manifest = manifestData as unknown as ManifestData;

export function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'reader' | 'labs' | 'flashcards' | 'quizzes'>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getStoredTheme());
  const [completedIds, setCompletedIds] = useState<string[]>(() => getCompletedTopicIds());
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  // Default to first topic in Phase 03 or first available topic
  const initialTopic = useMemo(() => {
    const phase03 = manifest.phases.find(p => p.id === 'phase-03');
    return phase03?.topics[0] || manifest.phases[0]?.topics[0];
  }, []);

  const [selectedTopic, setSelectedTopic] = useState<TopicItem>(initialTopic);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Flattened topic list across all phases for global sequential ordering
  const allTopics = useMemo(() => manifest.phases.flatMap(p => p.topics), []);

  // History stack for back navigation
  const [topicHistory, setTopicHistory] = useState<TopicItem[]>([]);

  // Find current phase and sequential neighbors
  const currentTopicIndex = useMemo(
    () => allTopics.findIndex(t => t.id === selectedTopic.id),
    [allTopics, selectedTopic]
  );
  const prevSequentialTopic = currentTopicIndex > 0 ? allTopics[currentTopicIndex - 1] : null;
  const nextSequentialTopic =
    currentTopicIndex !== -1 && currentTopicIndex < allTopics.length - 1
      ? allTopics[currentTopicIndex + 1]
      : null;

  const currentPhase = useMemo(
    () => manifest.phases.find(p => p.id === selectedTopic.phaseId),
    [selectedTopic]
  );

  // Initialize theme attribute on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync URL parameters on initial load & popstate (browser back/forward)
  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const topicId = params.get('topic');
      const view = params.get('view');
      const labId = params.get('lab');

      if (topicId) {
        const match = allTopics.find(t => t.id === topicId);
        if (match) {
          setSelectedTopic(match);
          setActiveView('reader');
          return;
        }
      }

      if (view === 'labs') {
        if (labId) setSelectedLabId(labId);
        setActiveView('labs');
        return;
      }

      if (view === 'flashcards') {
        setActiveView('flashcards');
        return;
      }

      if (view === 'quizzes') {
        setActiveView('quizzes');
        return;
      }

      setActiveView('dashboard');
    };

    syncFromUrl();

    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, [allTopics]);

  // Global Ctrl+K / Cmd+K listener to open search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen to progress update events from TopicReader/Dashboard
  useEffect(() => {
    const handleProgressUpdate = () => {
      setCompletedIds(getCompletedTopicIds());
    };
    window.addEventListener('progress_updated', handleProgressUpdate);
    return () => window.removeEventListener('progress_updated', handleProgressUpdate);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
  };

  // Filter topics for search
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: TopicItem[] = [];
    for (const phase of manifest.phases) {
      for (const topic of phase.topics) {
        if (topic.title.toLowerCase().includes(q) || topic.filename.toLowerCase().includes(q)) {
          results.push(topic);
        }
      }
    }
    return results;
  }, [searchQuery]);

  const handleSelectTopic = (topic: TopicItem, pushHistory: boolean = true) => {
    if (pushHistory && selectedTopic.id !== topic.id && activeView === 'reader') {
      setTopicHistory(prev => [...prev, selectedTopic]);
    }
    setSelectedTopic(topic);
    setActiveView('reader');
    setSearchQuery('');

    // Sync browser URL
    const url = new URL(window.location.href);
    url.searchParams.set('topic', topic.id);
    url.searchParams.delete('view');
    url.searchParams.delete('lab');
    url.hash = '';
    window.history.pushState({ topicId: topic.id }, '', url.pathname + '?' + url.searchParams.toString());

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchToReader = () => {
    setActiveView('reader');
    setSearchQuery('');
    const url = new URL(window.location.href);
    url.searchParams.set('topic', selectedTopic.id);
    url.searchParams.delete('view');
    url.searchParams.delete('lab');
    url.hash = '';
    window.history.pushState({ topicId: selectedTopic.id }, '', url.pathname + '?' + url.searchParams.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBack = () => {
    if (topicHistory.length > 0) {
      const prevTopic = topicHistory[topicHistory.length - 1];
      setTopicHistory(prev => prev.slice(0, -1));
      setSelectedTopic(prevTopic);
      setActiveView('reader');

      const url = new URL(window.location.href);
      url.searchParams.set('topic', prevTopic.id);
      url.searchParams.delete('view');
      url.searchParams.delete('lab');
      url.hash = '';
      window.history.pushState({ topicId: prevTopic.id }, '', url.pathname + '?' + url.searchParams.toString());

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleNavigateHome();
    }
  };

  const handleNavigateHome = () => {
    setActiveView('dashboard');
    setSearchQuery('');
    const cleanPath = window.location.pathname;
    window.history.pushState({ view: 'dashboard' }, '', cleanPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchLab = (labId?: string) => {
    const activeLab = labId || selectedLabId || 'lab-10-jsx-compiler';
    setSelectedLabId(activeLab);
    setActiveView('labs');
    setSearchQuery('');

    const url = new URL(window.location.href);
    url.searchParams.delete('topic');
    url.searchParams.set('view', 'labs');
    url.searchParams.set('lab', activeLab);
    url.hash = '';
    window.history.pushState({ view: 'labs', labId: activeLab }, '', url.pathname + '?' + url.searchParams.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchToFlashcards = () => {
    setActiveView('flashcards');
    setSearchQuery('');
    const url = new URL(window.location.href);
    url.searchParams.delete('topic');
    url.searchParams.delete('lab');
    url.searchParams.set('view', 'flashcards');
    url.hash = '';
    window.history.pushState({ view: 'flashcards' }, '', url.pathname + '?' + url.searchParams.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchToQuizzes = () => {
    setActiveView('quizzes');
    setSearchQuery('');
    const url = new URL(window.location.href);
    url.searchParams.delete('topic');
    url.searchParams.delete('lab');
    url.searchParams.set('view', 'quizzes');
    url.hash = '';
    window.history.pushState({ view: 'quizzes' }, '', url.pathname + '?' + url.searchParams.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // In-app SPA navigation for cross-markdown links (supports section hashes)
  const handleNavigateToTopic = (topicIdOrPath: string) => {
    const rawPath = topicIdOrPath.split('#')[0];
    const hash = topicIdOrPath.split('#')[1];
    const cleanName = rawPath.split('/').pop()?.replace('.md', '') || rawPath;
    
    for (const phase of manifest.phases) {
      const match = phase.topics.find(
        t => t.id === cleanName || t.filename.replace('.md', '') === cleanName
      );
      if (match) {
        handleSelectTopic(match, true);
        if (hash) {
          setTimeout(() => {
            const targetEl = document.getElementById(hash) || 
                             Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
                               .find(h => {
                                 const txt = h.textContent?.toLowerCase() || '';
                                 const norm = txt.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                 return norm.includes(hash.toLowerCase()) || txt.includes(hash.replace(/-/g, ' '));
                               });
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth' });
            }
          }, 350);
        }
        return;
      }
    }
    console.warn('Target topic not found in manifest:', topicIdOrPath);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top Navigation Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {activeView === 'reader' && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.25rem'
              }}
              title="Toggle Sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          <div
            onClick={handleNavigateHome}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(2, 132, 199, 0.1)',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem'
              }}
            >
              ⚛️
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                React & Runtime Architecture
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Mastery Portal & Simulation Lab
              </div>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search 110 chapters (Ctrl+K)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (!searchQuery) setIsSearchModalOpen(true);
              }}
              style={{
                width: '100%',
                padding: '0.45rem 4.5rem 0.45rem 2.25rem',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
            <button
              onClick={() => setIsSearchModalOpen(true)}
              title="Global Full-Text Search (Ctrl+K)"
              style={{
                position: 'absolute',
                right: '0.5rem',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '0.15rem 0.45rem',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                fontFamily: 'monospace',
                cursor: 'pointer'
              }}
            >
              Ctrl K
            </button>
          </div>

          {/* Search Dropdown Results */}
          {filteredTopics.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                right: 0,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                maxHeight: '300px',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1000
              }}
            >
              {filteredTopics.map(t => (
                <div
                  key={t.id}
                  onClick={() => handleSelectTopic(t)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{t.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{t.phaseId}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View Switcher Tabs & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-tertiary)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={handleNavigateHome}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                background: activeView === 'dashboard' ? 'var(--bg-secondary)' : 'transparent',
                color: activeView === 'dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeView === 'dashboard' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <LayoutDashboard size={15} /> Dashboard
            </button>

            <button
              onClick={handleSwitchToReader}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                background: activeView === 'reader' ? 'var(--bg-secondary)' : 'transparent',
                color: activeView === 'reader' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeView === 'reader' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <BookOpen size={15} /> Handbook
            </button>

            <button
              onClick={() => handleLaunchLab('lab-10-jsx-compiler')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                background: activeView === 'labs' ? 'var(--bg-secondary)' : 'transparent',
                color: activeView === 'labs' ? 'var(--react-cyan)' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeView === 'labs' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <Layers size={15} /> Labs
            </button>

            <button
              onClick={handleSwitchToFlashcards}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                background: activeView === 'flashcards' ? 'var(--bg-secondary)' : 'transparent',
                color: activeView === 'flashcards' ? '#c084fc' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeView === 'flashcards' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <Sparkles size={15} /> Flashcards
            </button>

            <button
              onClick={handleSwitchToQuizzes}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                background: activeView === 'quizzes' ? 'var(--bg-secondary)' : 'transparent',
                color: activeView === 'quizzes' ? 'var(--amber-warning, #f59e0b)' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeView === 'quizzes' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <Award size={15} /> Quizzes
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} color="var(--js-yellow)" />}
          </button>
        </div>
      </header>

      {/* Main Body Layout */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Collapsible Sidebar (Active in Reader Mode) */}
        {activeView === 'reader' && sidebarOpen && (
          <aside
            style={{
              width: '320px',
              flexShrink: 0,
              background: 'var(--bg-secondary)',
              borderRight: '1px solid var(--border-subtle)',
              height: 'calc(100vh - 61px)',
              position: 'sticky',
              top: '61px',
              overflowY: 'auto',
              padding: '1.25rem 0.75rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0.5rem 0.75rem 0.5rem' }}>
              Handbook Curriculum
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {manifest.phases.map(phase => {
                const completedInPhase = phase.topics.filter(t => completedIds.includes(t.id)).length;
                const totalInPhase = phase.topics.length;

                return (
                  <div key={phase.id}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        padding: '0.4rem 0.55rem',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '6px',
                        marginBottom: '0.4rem'
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {phase.title}
                      </span>
                      {totalInPhase > 0 && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            color: completedInPhase === totalInPhase ? 'var(--emerald-success)' : 'var(--text-muted)',
                            background: 'var(--bg-secondary)',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '10px',
                            fontWeight: 600,
                            flexShrink: 0
                          }}
                        >
                          {completedInPhase}/{totalInPhase}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {phase.topics.map(t => {
                        const isSelected = selectedTopic.id === t.id;
                        const isDone = completedIds.includes(t.id);

                        const { badge: badgeText, cleanTitle } = formatTopicBadgeAndTitle(t.title);

                        return (
                          <button
                            key={t.id}
                            onClick={() => handleSelectTopic(t)}
                            title={t.title}
                            style={{
                              textAlign: 'left',
                              padding: '0.42rem 0.55rem',
                              borderRadius: '6px',
                              background: isSelected ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                              color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                              border: isSelected ? '1px solid var(--react-cyan)' : '1px solid transparent',
                              fontSize: '0.79rem',
                              fontWeight: isSelected ? 600 : 400,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.5rem',
                              transition: 'all 150ms ease'
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  fontFamily: 'var(--font-mono)',
                                  padding: '0.1rem 0.35rem',
                                  borderRadius: '4px',
                                  background: isSelected ? 'var(--react-cyan)' : 'var(--bg-tertiary)',
                                  color: isSelected ? '#ffffff' : 'var(--text-muted)',
                                  flexShrink: 0
                                }}
                              >
                                {badgeText}
                              </span>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {cleanTitle}
                              </span>
                            </span>

                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                              {isDone && <CheckCircle2 size={13} color="var(--emerald-success)" />}
                              {t.lab && <Sparkles size={13} color="var(--react-cyan)" />}
                            </span>
                          </button>
                        );
                      })}
                      {phase.topicCount === 0 && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.25rem 0.5rem' }}>
                          Chapters coming soon
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* Content Viewport */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {activeView === 'dashboard' && (
            <Dashboard
              manifest={manifest}
              onSelectTopic={handleSelectTopic}
              onLaunchLab={handleLaunchLab}
            />
          )}

          {activeView === 'reader' && (
            <TopicReader
              topic={selectedTopic}
              phaseTitle={currentPhase?.title}
              phaseBadge={currentPhase?.badge}
              prevSequentialTopic={prevSequentialTopic}
              nextSequentialTopic={nextSequentialTopic}
              onSelectTopic={handleSelectTopic}
              previousTopicInHistory={topicHistory.length > 0 ? topicHistory[topicHistory.length - 1] : null}
              onGoBack={handleGoBack}
              onNavigateHome={handleNavigateHome}
              onLaunchLab={handleLaunchLab}
              onNavigateToTopic={handleNavigateToTopic}
              isCompleted={completedIds.includes(selectedTopic.id)}
              onToggleCompleted={() => setCompletedIds(getCompletedTopicIds())}
            />
          )}

          {activeView === 'labs' && (
            <VisualizerHub initialLabId={selectedLabId} />
          )}

          {activeView === 'flashcards' && (
            <FlashcardsArena />
          )}

          {activeView === 'quizzes' && (
            <QuizArena />
          )}
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectTopic={handleSelectTopic}
      />
    </div>
  );
}
