// Browser-persisted storage utility for topic completion, scratchpad notes, and UI preferences

const COMPLETED_KEY = 'react_prep_completed_topics';
const NOTES_KEY_PREFIX = 'react_prep_notes_';
const THEME_KEY = 'react_prep_theme';

export function getCompletedTopicIds(): string[] {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isTopicCompleted(topicId: string): boolean {
  const completed = getCompletedTopicIds();
  return completed.includes(topicId);
}

export function toggleTopicCompleted(topicId: string): boolean {
  try {
    const completed = getCompletedTopicIds();
    const index = completed.indexOf(topicId);
    let newState: boolean;
    if (index > -1) {
      completed.splice(index, 1);
      newState = false;
    } else {
      completed.push(topicId);
      newState = true;
    }
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(completed));
    window.dispatchEvent(new Event('progress_updated'));
    return newState;
  } catch {
    return false;
  }
}

export function getTopicNotes(topicId: string): string {
  try {
    return localStorage.getItem(`${NOTES_KEY_PREFIX}${topicId}`) || '';
  } catch {
    return '';
  }
}

export function saveTopicNotes(topicId: string, notes: string): void {
  try {
    localStorage.setItem(`${NOTES_KEY_PREFIX}${topicId}`, notes);
  } catch {
    // ignore quota errors
  }
}

export function getStoredTheme(): 'light' | 'dark' {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    return theme === 'dark' ? 'dark' : 'light'; // default is light
  } catch {
    return 'light';
  }
}

export function setStoredTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  } catch {
    // ignore
  }
}

const RECENT_TOPICS_KEY = 'react_prep_recent_topics';

export function getRecentTopicIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_TOPICS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordRecentTopicId(topicId: string): void {
  try {
    const recents = getRecentTopicIds().filter(id => id !== topicId);
    recents.unshift(topicId); // most recent first
    const trimmed = recents.slice(0, 5); // keep up to 5 in storage
    localStorage.setItem(RECENT_TOPICS_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new Event('recent_topics_updated'));
  } catch {
    // ignore
  }
}
