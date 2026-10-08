import { ChallengesArena } from './features/challenges/ChallengesArena';
import { InterviewsArena } from './features/interviews/InterviewsArena';
import { IncidentsArena } from './features/incidents/IncidentsArena';
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
  Award,
  Code2,
  Briefcase,
  Flame
} from 'lucide-react';
import {
  getStoredTheme,
  setStoredTheme,
  getCompletedTopicIds
} from './core/utils/progressStorage';
import { formatTopicBadgeAndTitle } from './core/utils/slugify';

const manifest = manifestData as unknown as ManifestData;

// Flattened topic list across all phases for global sequential ordering
const allTopics: TopicItem[] = manifest.phases.flatMap(p => p.topics);

// Resolve initial SPA route synchronously from URL search params on mount
function resolveInitialRoute(defaultTopic: TopicItem): {
  view: 'dashboard' | 'reader' | 'labs' | 'challenges' | 'interviews' | 'incidents' | 'flashcards' | 'quizzes';
  topic: TopicItem;
  labId: string | null;
} {
  if (typeof window === 'undefined') {
    return { view: 'dashboard', topic: defaultTopic, labId: null };
  }
  const params = new URLSearchParams(window.location.search);
  const topicId = params.get('topic');
  const view = params.get('view');
  const labId = params.get('lab');

  if (topicId) {
    const match = allTopics.find(t => t.id === topicId);
    if (match) {
      return { view: 'reader', topic: match, labId: null };
    }
  }

  if (view === 'labs') {
    return { view: 'labs', topic: defaultTopic, labId: labId || null };
  }

  if (view === 'challenges') {
    return { view: 'challenges', topic: defaultTopic, labId: null };
  }

  if (view === 'interviews') {
    return { view: 'interviews', topic: defaultTopic, labId: null };
  }

  if (view === 'incidents') {
    return { view: 'incidents', topic: defaultTopic, labId: null };
  }

  if (view === 'flashcards') {
    return { view: 'flashcards', topic: defaultTopic, labId: null };
  }

  if (view === 'quizzes') {
    return { view: 'quizzes', topic: defaultTopic, labId: null };
  }

  return { view: 'dashboard', topic: defaultTopic, labId: null };
}


export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getStoredTheme());
  const [completedIds, setCompletedIds] = useState<string[]>(() => getCompletedTopicIds());
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Default to first topic in Phase 03 or first available topic
  const initialTopic = useMemo(() => {
    const phase03 = manifest.phases.find(p => p.id === 'phase-03');
    return phase03?.topics[0] || manifest.phases[0]?.topics[0];
  }, []);

  // Synchronously compute initial view and parameters from URL to prevent flash of dashboard on refresh
  const [initialRoute] = useState(() => resolveInitialRoute(initialTopic));

  const [activeView, setActiveView] = useState<'dashboard' | 'reader' | 'labs' | 'challenges' | 'interviews' | 'incidents' | 'flashcards' | 'quizzes'>(initialRoute.view);
  const [selectedTopic, setSelectedTopic] = useState<TopicItem>(initialRoute.topic);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(initialRoute.labId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

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

      if (view === 'challenges') {
        setActiveView('challenges');
        return;
      }

      if (view === 'interviews') {
        setActiveView('interviews');
        return;
      }

      if (view === 'incidents') {
        setActiveView('incidents');
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
    setMobileNavOpen(false);
    if (typeof window !== 'undefined' && window.innerWidth <= 860) {
      setSidebarOpen(false);
    }

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
    setMobileNavOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set('topic', selectedTopic.id);
    url.searchParams.delete('view');
    url.searchParams.delete('lab');
    url.hash = '';
    window.history.pushState({ topicId: selectedTopic.id }, '', url.pathname + '?' + url.searchParams.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBack = () => {
    setMobileNavOpen(false);
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
    setMobileNavOpen(false);
    const cleanPath = window.location.pathname;
    window.history.pushState({ view: 'dashboard' }, '', cleanPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchLab = (labId?: string) => {
    const activeLab = labId || selectedLabId || 'lab-10-jsx-compiler';
    setSelectedLabId(activeLab);
    setActiveView('labs');
    setSearchQuery('');
    setMobileNavOpen(false);

    const url = new URL(window.location.href);
    url.searchParams.delete('topic');
    url.searchParams.set('view', 'labs');
    url.searchParams.set('lab', activeLab);
    url.hash = '';
    window.history.pushState({ view: 'labs', labId: activeLab }, '', url.pathname + '?' + url.searchParams.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchToChallenges = () => {
    setActiveView('challenges');
    setSearchQuery('');
    setMobileNavOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'challenges');
    url.searchParams.delete('topic');
    url.searchParams.delete('lab');
    url.hash = '';
    window.history.pushState({ view: 'challenges' }, '', url.pathname + '?' + url.searchParams.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchToFlashcards = () => {
    setActiveView('flashcards');
    setSearchQuery('');
    setMobileNavOpen(false);
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
    setMobileNavOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('topic');
    url.searchParams.delete('lab');
    url.searchParams.set('view', 'quizzes');
    url.hash = '';
    window.history.pushState({ view: 'quizzes' }, '', url.pathname + '?' + url.searchParams.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchToInterviews = () => {
    setActiveView('interviews');
    setSearchQuery('');
    setMobileNavOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('topic');
    url.searchParams.delete('lab');
    url.searchParams.set('view', 'interviews');
    url.hash = '';
    window.history.pushState({ view: 'interviews' }, '', url.pathname + '?' + url.searchParams.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchToIncidents = () => {
    setActiveView('incidents');
    setSearchQuery('');
    setMobileNavOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('topic');
    url.searchParams.delete('lab');
    url.searchParams.set('view', 'incidents');
    url.hash = '';
    window.history.pushState({ view: 'incidents' }, '', url.pathname + '?' + url.searchParams.toString());
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
          padding: '0.65rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
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
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', minWidth: 0 }}
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
                fontSize: '1.1rem',
                flexShrink: 0
              }}
            >
              ⚛️
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                React & Runtime Architecture
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Mastery Portal & Simulation Lab
              </div>
            </div>
          </div>
        </div>

        {/* Global Search Bar (Desktop) */}
        <div className="portal-search-desktop" style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
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

        {/* View Switcher Tabs, Search Trigger & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Mobile Search Icon Trigger */}
          <button
            className="portal-search-mobile-btn"
            onClick={() => setIsSearchModalOpen(true)}
            title="Global Search (Ctrl+K)"
          >
            <Search size={17} />
          </button>

          {/* Desktop Inline Navigation Tabs */}
          <div className="portal-nav-desktop-tabs">
            <button
              onClick={handleNavigateHome}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.75rem',
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
                padding: '0.45rem 0.75rem',
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
                padding: '0.45rem 0.75rem',
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
              onClick={handleSwitchToChallenges}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                background: activeView === 'challenges' ? 'var(--bg-secondary)' : 'transparent',
                color: activeView === 'challenges' ? 'var(--react-cyan)' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeView === 'challenges' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <Code2 size={15} /> Challenges
            </button>

            <button
              onClick={handleSwitchToInterviews}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                background: activeView === 'interviews' ? 'var(--bg-secondary)' : 'transparent',
                color: activeView === 'interviews' ? 'var(--emerald-success)' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeView === 'interviews' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <Briefcase size={15} /> Mock Interviews
            </button>

            <button
              onClick={handleSwitchToIncidents}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                background: activeView === 'incidents' ? 'var(--bg-secondary)' : 'transparent',
                color: activeView === 'incidents' ? '#f87171' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeView === 'incidents' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <Flame size={15} /> War Room
            </button>

            <button
              onClick={handleSwitchToFlashcards}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.75rem',
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
                padding: '0.45rem 0.75rem',
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
              transition: 'all 150ms ease',
              flexShrink: 0
            }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} color="var(--js-yellow)" />}
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            className="portal-nav-mobile-toggle"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            title="Toggle Navigation Menu"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Over Navigation Drawer */}
      {mobileNavOpen && (
        <div className="portal-mobile-drawer-backdrop" onClick={() => setMobileNavOpen(false)}>
          <div className="portal-mobile-drawer-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.25rem' }}>⚛️</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Architecture Portal</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>110 Chapters • 12 Living Labs</div>
                </div>
              </div>
              <button
                onClick={() => setMobileNavOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Navigation List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1 }}>
              <button
                onClick={handleNavigateHome}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '8px',
                  background: activeView === 'dashboard' ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeView === 'dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  fontWeight: activeView === 'dashboard' ? 700 : 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <LayoutDashboard size={18} color="var(--react-cyan)" /> Dashboard
              </button>

              <button
                onClick={handleSwitchToReader}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '8px',
                  background: activeView === 'reader' ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeView === 'reader' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  fontWeight: activeView === 'reader' ? 700 : 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <BookOpen size={18} color="var(--purple-accent)" /> Handbook (110 Topics)
              </button>

              <button
                onClick={() => handleLaunchLab('lab-10-jsx-compiler')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '8px',
                  background: activeView === 'labs' ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeView === 'labs' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  fontWeight: activeView === 'labs' ? 700 : 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Layers size={18} color="var(--react-cyan)" /> Simulation Labs (12)
              </button>

              <button
                onClick={handleSwitchToChallenges}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '8px',
                  background: activeView === 'challenges' ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeView === 'challenges' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  fontWeight: activeView === 'challenges' ? 700 : 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Code2 size={18} color="var(--emerald-success)" /> Machine Coding Challenges
              </button>

              <button
                onClick={handleSwitchToInterviews}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '8px',
                  background: activeView === 'interviews' ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeView === 'interviews' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  fontWeight: activeView === 'interviews' ? 700 : 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Briefcase size={18} color="var(--emerald-success)" /> Staff Mock Interviews
              </button>

              <button
                onClick={handleSwitchToIncidents}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '8px',
                  background: activeView === 'incidents' ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeView === 'incidents' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  fontWeight: activeView === 'incidents' ? 700 : 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Flame size={18} color="#f87171" /> Incident War Room
              </button>

              <button
                onClick={handleSwitchToFlashcards}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '8px',
                  background: activeView === 'flashcards' ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeView === 'flashcards' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  fontWeight: activeView === 'flashcards' ? 700 : 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Sparkles size={18} color="#c084fc" /> Flashcards
              </button>

              <button
                onClick={handleSwitchToQuizzes}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '8px',
                  background: activeView === 'quizzes' ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeView === 'quizzes' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  fontWeight: activeView === 'quizzes' ? 700 : 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Award size={18} color="var(--amber-warning)" /> Scenario Quizzes
              </button>

              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  setIsSearchModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '8px',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginTop: '0.5rem'
                }}
              >
                <Search size={18} /> Global Search (Ctrl+K)
              </button>
            </div>

            {/* Drawer Progress Footer */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span>Curriculum Progress</span>
                <span style={{ fontWeight: 700, color: 'var(--emerald-success)' }}>
                  {Math.round((completedIds.length / allTopics.length) * 100)}%
                </span>
              </div>
              <div style={{ height: '5px', background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.round((completedIds.length / allTopics.length) * 100)}%`, height: '100%', background: 'var(--emerald-success)' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Body Layout */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Collapsible Sidebar (Active in Reader Mode) */}
        {activeView === 'reader' && sidebarOpen && (
          <>
            <div
              className="portal-reader-sidebar-backdrop"
              onClick={() => setSidebarOpen(false)}
            />
            <aside
              className="portal-reader-sidebar-aside"
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
        </>
      )}

        {/* Content Viewport */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {activeView === 'dashboard' && (
            <Dashboard
              manifest={manifest}
              onSelectTopic={handleSelectTopic}
              onLaunchLab={handleLaunchLab}
              onNavigateView={(view) => {
                if (view === 'interviews') handleSwitchToInterviews();
                if (view === 'incidents') handleSwitchToIncidents();
              }}
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

          {activeView === 'challenges' && (
            <ChallengesArena />
          )}

          {activeView === 'interviews' && (
            <InterviewsArena />
          )}

          {activeView === 'incidents' && (
            <IncidentsArena />
          )}
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectTopic={handleSelectTopic}
        onNavigateToTopic={handleNavigateToTopic}
      />
    </div>
  );
}
