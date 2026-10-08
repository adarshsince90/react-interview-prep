import React, { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-json';
import type { TopicItem } from '../../core/types/manifest';
import {
  BookOpen,
  Sparkles,
  Clock,
  FileText,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  CornerUpLeft,
  Home,
  ToggleLeft,
  ToggleRight,
  ListOrdered,
  CheckCircle2,
  Circle,
  MessageSquare,
  Copy,
  Check,
  ArrowUp,
  ExternalLink,
  X
} from 'lucide-react';
import {
  isTopicCompleted,
  toggleTopicCompleted,
  getTopicNotes,
  saveTopicNotes,
  recordRecentTopicId
} from '../../core/utils/progressStorage';
import { slugifyHeading } from '../../core/utils/slugify';
import manifestData from '../../assets/manifest.json';

import mermaid from 'mermaid';
import { TermHoverCard } from './TermHoverCard';
import { CORE_ARCH_TERMS, type TermDefinition } from './termDictionary';

function resolveTopicFromHref(href: string): { topic: TopicItem; hash?: string; phaseTitle?: string } | null {
  const [pathPart, hash] = href.split('#');
  const cleanFilename = pathPart.split('/').pop()?.replace('.md', '');
  if (!cleanFilename) return null;

  for (const phase of (manifestData as any).phases) {
    const match = phase.topics.find((t: TopicItem) => t.id === cleanFilename || t.filename.replace('.md', '') === cleanFilename);
    if (match) {
      return { topic: match, hash, phaseTitle: phase.title };
    }
  }
  return null;
}

// Configure marked to render headings with unique ID anchors and responsive mermaid code blocks
marked.use({
  renderer: {
    heading(token) {
      const slug = slugifyHeading(token.text);
      return `<h${token.depth} id="${slug}" class="heading-anchor-target">${token.text}</h${token.depth}>\n`;
    },
    code({ text, lang }: { text: string; lang?: string }) {
      if (lang === 'mermaid') {
        return `<div class="mermaid-container"><div class="mermaid">${text}</div></div>`;
      }
      return false;
    }
  }
});

function cleanMarkdownFormatting(text: string): string {
  return text
    // Replace block LaTeX ($$...$$) ONLY when containing actual LaTeX math backslash commands
    // and never match across JavaScript code identifiers like $$typeof or backticks
    .replace(/(?<![`\w])\$\$\s*([\s\S]+?)\s*\$\$(?![`\w])/g, (match, math) => {
      // Must contain LaTeX command tokens like \frac, \text, \approx, etc.
      if (!math.includes('\\')) {
        return match; // Keep untouched (e.g., $$typeof, template literals)
      }
      const clean = math
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
        .replace(/\\approx/g, '≈')
        .replace(/\\times/g, '×')
        .replace(/\\mathbf\{([^}]+)\}/g, '$1')
        .replace(/\\rightarrow/g, '→')
        .replace(/\\implies/g, '→')
        .trim();
      return `\n\n> 📐 **Formula:** \`${clean}\`\n\n`;
    })
    // Replace inline LaTeX ($...$) ONLY containing LaTeX escape tokens and not ordinary code/currency
    .replace(/(?<![`$\w])\$([^$\n]+?)\$(?![`$\w])/g, (match, inner) => {
      if (inner.includes('\\')) {
        return inner
          .replace(/\\text\{([^}]+)\}/g, '$1')
          .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
          .replace(/\\approx/g, '≈')
          .replace(/\\sim/g, '~')
          .replace(/\\times/g, '×')
          .replace(/\\mathbf\{([^}]+)\}/g, '$1')
          .replace(/\\rightarrow/g, '→')
          .replace(/\\to\b/g, '→')
          .replace(/\\implies/g, '→')
          .trim();
      }
      return match;
    })
    // Also defensively catch any stray LaTeX arrow tokens in prose outside code blocks
    .replace(/(?<![`\w\\])\\rightarrow(?![`\w])/g, '→')
    .replace(/(?<![`\w\\])\\to(?![`\w])/g, '→');
}

interface TopicReaderProps {
  topic: TopicItem;
  phaseTitle?: string;
  phaseBadge?: string;
  prevSequentialTopic?: TopicItem | null;
  nextSequentialTopic?: TopicItem | null;
  onSelectTopic?: (topic: TopicItem) => void;
  previousTopicInHistory?: TopicItem | null;
  onGoBack?: () => void;
  onNavigateHome?: () => void;
  onLaunchLab?: (labId: string) => void;
  onNavigateToTopic?: (topicIdOrPath: string) => void;
  isCompleted?: boolean;
  onToggleCompleted?: () => void;
}

export const TopicReader: React.FC<TopicReaderProps> = ({
  topic,
  phaseTitle,
  phaseBadge,
  prevSequentialTopic,
  nextSequentialTopic,
  onSelectTopic,
  previousTopicInHistory,
  onGoBack,
  onNavigateHome,
  onLaunchLab,
  onNavigateToTopic,
  isCompleted: propIsCompleted,
  onToggleCompleted
}) => {
  const [contentHtml, setContentHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [architectBridgeMode, setArchitectBridgeMode] = useState<boolean>(true);
  const [completed, setCompleted] = useState<boolean>(() => isTopicCompleted(topic.id));
  const [userNotes, setUserNotes] = useState<string>(() => getTopicNotes(topic.id));
  const [copied, setCopied] = useState<boolean>(false);
  const [notesExpanded, setNotesExpanded] = useState<boolean>(true);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const [quickPeekTarget, setQuickPeekTarget] = useState<{
    topic: TopicItem;
    hash?: string;
    phaseTitle?: string;
    rawHref: string;
    excerpt?: string;
    loading?: boolean;
  } | null>(null);
  const [hoveredTermCard, setHoveredTermCard] = useState<{
    data: TermDefinition;
    rect: DOMRect;
  } | null>(null);
  const termHoverTimerRef = useRef<any>(null);
  const termHideTimerRef = useRef<any>(null);
  const isTermCardHoveredRef = useRef<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Clear hover card state on topic switch
  useEffect(() => {
    setHoveredTermCard(null);
    if (termHoverTimerRef.current) clearTimeout(termHoverTimerRef.current);
    if (termHideTimerRef.current) clearTimeout(termHideTimerRef.current);
  }, [topic]);

  // Dismiss hover card on window scroll
  useEffect(() => {
    const handleScroll = () => {
      if (hoveredTermCard) {
        setHoveredTermCard(null);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hoveredTermCard]);

  // Sync completion and notes state on topic change
  useEffect(() => {
    setCompleted(propIsCompleted !== undefined ? propIsCompleted : isTopicCompleted(topic.id));
    setUserNotes(getTopicNotes(topic.id));
    setCopied(false);
    setActiveSectionId('');
    recordRecentTopicId(topic.id);
  }, [topic, propIsCompleted]);

  // Track scroll position for reading progress bar & Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) {
        setReadingProgress(0);
      } else {
        const progress = Math.min(100, Math.max(0, (window.scrollY / scrollHeight) * 100));
        setReadingProgress(progress);
      }
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [topic, contentHtml]);

  // Load and parse markdown note
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const baseUrl = import.meta.env.BASE_URL.endsWith('/') 
      ? import.meta.env.BASE_URL 
      : `${import.meta.env.BASE_URL}/`;
    const noteUrl = `${baseUrl}${topic.relativePath.replace(/^\//, '')}`;

    fetch(noteUrl)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load note: HTTP ${res.status}`);
        }
        return res.text();
      })
      .then(markdown => {
        if (!isMounted) return;
        const sanitizedMarkdown = cleanMarkdownFormatting(markdown);
        const rawHtml = marked.parse(sanitizedMarkdown) as string;
        const sanitized = DOMPurify.sanitize(rawHtml, {
          ADD_ATTR: ['id', 'class', 'target'],
          ADD_TAGS: ['div', 'span', 'details', 'summary']
        });
        setContentHtml(sanitized);
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [topic]);

  // Syntax highlighting, Mermaid diagrams, code copy buttons & Architect Bridge
  useEffect(() => {
    if (!loading && contentRef.current) {
      Prism.highlightAllUnder(contentRef.current);

      // Render vector Mermaid diagrams
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'var(--font-sans)',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis',
          wrappingWidth: 320,
          nodeSpacing: 35,
          rankSpacing: 40
        },
        themeVariables: {
          fontFamily: 'var(--font-sans)',
          primaryColor: isDark ? '#1e293b' : '#f8fafc',
          primaryTextColor: isDark ? '#f8fafc' : '#0f172a',
          primaryBorderColor: isDark ? '#38bdf8' : '#0284c7',
          lineColor: isDark ? '#38bdf8' : '#0284c7',
          clusterBkg: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(241, 245, 249, 0.8)',
          clusterBorder: isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(2, 132, 199, 0.3)'
        }
      });

      const mermaidNodes = contentRef.current.querySelectorAll<HTMLElement>('.mermaid');
      if (mermaidNodes.length > 0) {
        mermaid.run({
          nodes: Array.from(mermaidNodes)
        }).catch(err => {
          console.warn('Mermaid rendering notice:', err);
        });
      }

      // Attach copy buttons to pre code blocks
      const preBlocks = contentRef.current.querySelectorAll('pre');
      preBlocks.forEach(pre => {
        if (pre.parentElement?.classList.contains('code-block-wrapper')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        pre.parentNode?.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-copy-btn';
        copyBtn.type = 'button';
        copyBtn.innerHTML = `<span>Copy</span>`;
        copyBtn.setAttribute('title', 'Copy code to clipboard');
        copyBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const codeText = pre.querySelector('code')?.innerText || pre.innerText;
          navigator.clipboard.writeText(codeText).then(() => {
            copyBtn.innerHTML = `<span>Copied!</span>`;
            copyBtn.style.color = '#10b981';
            setTimeout(() => {
              copyBtn.innerHTML = `<span>Copy</span>`;
              copyBtn.style.color = '';
            }, 2000);
          });
        };
        wrapper.appendChild(copyBtn);
      });

      if (architectBridgeMode) {
        const headings = contentRef.current.querySelectorAll('h2');
        headings.forEach(h => {
          const text = h.textContent || '';
          if (text.includes('10. Angular Comparison') || text.includes('11. .NET Comparison')) {
            h.style.background = 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)';
            h.style.borderLeft = '4px solid #10b981';
            h.style.padding = '0.5rem 0.75rem';
            h.style.borderRadius = '0 6px 6px 0';
          }
        });
      }
    }
  }, [contentHtml, loading, architectBridgeMode]);

  // ScrollSpy: observe headings to update active section in right panel TOC
  useEffect(() => {
    if (!contentRef.current || loading) return;

    const headings = contentRef.current.querySelectorAll<HTMLElement>('h2[id], h3[id]');
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollPos = window.scrollY + 130;
      let currentId = '';
      headings.forEach(h => {
        if (h.offsetTop <= scrollPos) {
          currentId = h.id;
        }
      });
      if (currentId) {
        setActiveSectionId(currentId);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [contentHtml, loading]);

  // In-app markdown link & section anchor interception
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Same-page anchor jump (#section-...)
      if (href.startsWith('#')) {
        e.preventDefault();
        const anchorId = href.substring(1);
        const targetEl = document.getElementById(anchorId) ||
          Array.from(el.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(h => {
            const txt = h.textContent?.toLowerCase() || '';
            const normalized = txt.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return normalized.includes(anchorId.toLowerCase()) || txt.includes(anchorId.replace(/-/g, ' '));
          });
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }

      // Intercept local relative markdown links
      if (href.endsWith('.md') || href.includes('.md#') || href.includes('phase-')) {
        e.preventDefault();
        const resolved = resolveTopicFromHref(href);
        if (resolved) {
          setQuickPeekTarget({
            topic: resolved.topic,
            hash: resolved.hash,
            phaseTitle: resolved.phaseTitle,
            rawHref: href,
            loading: true
          });

          const baseUrl = import.meta.env.BASE_URL.endsWith('/') 
            ? import.meta.env.BASE_URL 
            : `${import.meta.env.BASE_URL}/`;
          const targetUrl = `${baseUrl}${resolved.topic.relativePath.replace(/^\//, '')}`;

          fetch(targetUrl)
            .then(res => res.text())
            .then(md => {
              const lines = md.split('\n');
              let excerpt = '';
              let capturing = false;
              for (const line of lines) {
                if (line.startsWith('## 1.') || line.startsWith('## Why')) {
                  capturing = true;
                  continue;
                }
                if (capturing) {
                  if (line.startsWith('## ') || line.startsWith('---')) break;
                  if (line.trim() && !line.startsWith('#')) {
                    excerpt += line.trim() + ' ';
                    if (excerpt.length > 280) break;
                  }
                }
              }
              setQuickPeekTarget(prev => prev ? {
                ...prev,
                excerpt: excerpt ? (excerpt.slice(0, 260) + '...') : 'Detailed architectural walkthrough and runtime breakdown.',
                loading: false
              } : null);
            })
            .catch(() => {
              setQuickPeekTarget(prev => prev ? {
                ...prev,
                excerpt: 'Detailed architectural walkthrough and runtime breakdown.',
                loading: false
              } : null);
            });
          return;
        }

        if (onNavigateToTopic) {
          onNavigateToTopic(href);
        }
      }
    };

    el.addEventListener('click', handleAnchorClick);
    return () => {
      el.removeEventListener('click', handleAnchorClick);
    };
  }, [contentHtml, onNavigateToTopic]);

  // Highlight architectural terms and wire up interactive hover cards
  useEffect(() => {
    if (loading || !contentRef.current) return;
    const rootEl = contentRef.current;

    const sortedKeys = Object.keys(CORE_ARCH_TERMS).sort((a, b) => b.length - a.length);
    const highlightedTerms = new Set<string>();

    const walkTextNodes = (node: Node) => {
      if (highlightedTerms.size === sortedKeys.length) return;

      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (
          ['pre', 'code', 'a', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'svg', 'script', 'style'].includes(tag) ||
          el.classList.contains('mermaid') ||
          el.classList.contains('mermaid-container') ||
          el.classList.contains('code-block-wrapper') ||
          el.classList.contains('arch-term-hover')
        ) {
          return;
        }
        for (let child = node.firstChild; child; child = child.nextSibling) {
          walkTextNodes(child);
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue;
        if (!text || text.trim().length === 0) return;

        for (const key of sortedKeys) {
          if (highlightedTerms.has(key)) continue;

          const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b(${escapedKey})\\b`, 'i');
          const match = regex.exec(text);

          if (match && match.index !== undefined) {
            highlightedTerms.add(key);

            const matchIndex = match.index;
            const matchedText = match[0];
            const afterText = text.substring(matchIndex + matchedText.length);
            const beforeText = text.substring(0, matchIndex);

            const parent = node.parentNode;
            if (!parent) return;

            const span = document.createElement('span');
            span.className = 'arch-term-hover';
            span.dataset.termKey = key;
            span.textContent = matchedText;

            const afterNode = document.createTextNode(afterText);
            node.nodeValue = beforeText;

            parent.insertBefore(span, node.nextSibling);
            parent.insertBefore(afterNode, span.nextSibling);

            walkTextNodes(afterNode);
            return;
          }
        }
      }
    };

    walkTextNodes(rootEl);

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.arch-term-hover') as HTMLElement | null;
      if (target) {
        const key = target.dataset.termKey;
        if (key && CORE_ARCH_TERMS[key]) {
          if (termHideTimerRef.current) {
            clearTimeout(termHideTimerRef.current);
            termHideTimerRef.current = null;
          }
          if (termHoverTimerRef.current) {
            clearTimeout(termHoverTimerRef.current);
          }
          termHoverTimerRef.current = setTimeout(() => {
            setHoveredTermCard({
              data: CORE_ARCH_TERMS[key],
              rect: target.getBoundingClientRect()
            });
          }, 180);
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.arch-term-hover');
      if (target) {
        if (termHoverTimerRef.current) {
          clearTimeout(termHoverTimerRef.current);
          termHoverTimerRef.current = null;
        }
        termHideTimerRef.current = setTimeout(() => {
          if (!isTermCardHoveredRef.current) {
            setHoveredTermCard(null);
          }
        }, 280);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.arch-term-hover') as HTMLElement | null;
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        const key = target.dataset.termKey;
        if (key && CORE_ARCH_TERMS[key]) {
          setHoveredTermCard(prev => 
            prev?.data.term === CORE_ARCH_TERMS[key].term 
              ? null 
              : { data: CORE_ARCH_TERMS[key], rect: target.getBoundingClientRect() }
          );
        }
      }
    };

    rootEl.addEventListener('mouseover', handleMouseOver);
    rootEl.addEventListener('mouseout', handleMouseOut);
    rootEl.addEventListener('click', handleClick);

    return () => {
      rootEl.removeEventListener('mouseover', handleMouseOver);
      rootEl.removeEventListener('mouseout', handleMouseOut);
      rootEl.removeEventListener('click', handleClick);
    };
  }, [contentHtml, loading, topic]);

  const handleTermPeek = (targetTopicId: string) => {
    setHoveredTermCard(null);
    for (const phase of (manifestData as any).phases) {
      const match = phase.topics.find((t: TopicItem) => t.id === targetTopicId);
      if (match) {
        setQuickPeekTarget({
          topic: match,
          phaseTitle: phase.title,
          rawHref: match.relativePath,
          loading: true
        });

        const baseUrl = import.meta.env.BASE_URL.endsWith('/') 
          ? import.meta.env.BASE_URL 
          : `${import.meta.env.BASE_URL}/`;
        const targetUrl = `${baseUrl}${match.relativePath.replace(/^\//, '')}`;

        fetch(targetUrl)
          .then(res => res.text())
          .then(md => {
            const lines = md.split('\n');
            let excerpt = '';
            let capturing = false;
            for (const line of lines) {
              if (line.startsWith('## 1.') || line.startsWith('## Why')) {
                capturing = true;
                continue;
              }
              if (capturing) {
                if (line.startsWith('## ') || line.startsWith('---')) break;
                if (line.trim() && !line.startsWith('#')) {
                  excerpt += line.trim() + ' ';
                  if (excerpt.length > 280) break;
                }
              }
            }
            setQuickPeekTarget(prev => prev ? {
              ...prev,
              excerpt: excerpt ? (excerpt.slice(0, 260) + '...') : 'Detailed architectural walkthrough and runtime breakdown.',
              loading: false
            } : null);
          })
          .catch(() => {
            setQuickPeekTarget(prev => prev ? {
              ...prev,
              excerpt: 'Detailed architectural walkthrough and runtime breakdown.',
              loading: false
            } : null);
          });
        break;
      }
    }
  };

  const handleTermNavigate = (targetTopicId: string, anchor?: string) => {
    setHoveredTermCard(null);
    if (onNavigateToTopic) {
      onNavigateToTopic(`${targetTopicId}${anchor ? `#${anchor}` : ''}`);
    } else if (onSelectTopic) {
      for (const phase of (manifestData as any).phases) {
        const match = phase.topics.find((t: TopicItem) => t.id === targetTopicId);
        if (match) {
          onSelectTopic(match);
          break;
        }
      }
    }
  };

  const handleToggleComplete = () => {
    const nextState = toggleTopicCompleted(topic.id);
    setCompleted(nextState);
    if (onToggleCompleted) {
      onToggleCompleted();
    }
  };

  const handleNotesChange = (val: string) => {
    setUserNotes(val);
    saveTopicNotes(topic.id, val);
  };

  const handleCopyQuestionForMentor = () => {
    if (!userNotes.trim()) return;

    const formatted = `### Mentor Question on: ${topic.title}
> **Chapter Reference:** \`${topic.relativePath}\` | **Phase:** ${topic.phaseId}

**My Question / Architectural Nuance:**
${userNotes.trim()}
`;

    navigator.clipboard.writeText(formatted).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleJumpToSection = (anchor: string, title: string) => {
    let targetEl = document.getElementById(anchor);
    if (!targetEl && contentRef.current) {
      targetEl = contentRef.current.querySelector(`[id*="${anchor}"]`) as HTMLElement | null;
    }
    if (!targetEl && contentRef.current) {
      const cleanT = title.replace(/[^a-z0-9]/gi, '').toLowerCase();
      targetEl = Array.from(contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(h => {
        const cleanH = (h.textContent || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
        return cleanH === cleanT || cleanH.includes(cleanT) || cleanT.includes(cleanH);
      }) as HTMLElement | null;
    }
    if (targetEl) {
      const navbarHeight = 84;
      const y = targetEl.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSectionId(anchor);
      window.history.replaceState(null, '', `#${anchor}`);
    }
  };

  return (
    <>
      {/* Top Reading Progress Bar */}
      <div className="reading-progress-track">
        <div className="reading-progress-fill" style={{ width: `${readingProgress}%` }} />
      </div>

      <div className="topic-reader-main-grid">
        {/* Main Reading Column */}
        <div key={topic.id} className="chapter-content-enter prose-reading-container" style={{ minWidth: 0 }}>
          {/* Mobile/Tablet Collapsible Table of Contents Bar */}
          <div className="topic-reader-mobile-toc-bar">
            <details style={{ cursor: 'pointer' }}>
              <summary style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)', userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ListOrdered size={16} color="var(--react-cyan)" />
                  <span>Chapter Navigation ({topic.headings.length} Sections)</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {Math.round(readingProgress)}% read ▾
                </span>
              </summary>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.75rem', maxHeight: '240px', overflowY: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                {topic.headings.map((heading, idx) => {
                  const isBridge = heading.title.includes('Angular') || heading.title.includes('.NET');
                  const isActive = activeSectionId === heading.anchor;
                  return (
                    <a
                      key={idx}
                      href={`#${heading.anchor}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleJumpToSection(heading.anchor, heading.title);
                      }}
                      className={`toc-nav-link ${isBridge ? 'architect-bridge' : ''} ${isActive ? 'active' : ''}`}
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                    >
                      {heading.title}
                    </a>
                  );
                })}
              </div>
            </details>
          </div>

          {/* Top Wayfinding & Breadcrumb Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1.25rem',
              padding: '0.25rem 0.25rem'
            }}
          >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', flexWrap: 'wrap' }}>
            <button
              onClick={onNavigateHome}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.4rem',
                borderRadius: '4px',
                fontWeight: 600,
                transition: 'color 150ms ease'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              title="Return to Roadmap Dashboard"
            >
              <Home size={14} /> Dashboard
            </button>
            <ChevronRight size={13} color="var(--text-muted)" />
            <span
              style={{
                background: 'rgba(2, 132, 199, 0.08)',
                color: 'var(--react-cyan)',
                border: '1px solid rgba(2, 132, 199, 0.2)',
                borderRadius: '4px',
                padding: '0.15rem 0.5rem',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            >
              {phaseBadge || topic.phaseId}
            </span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              {phaseTitle || topic.phaseId}
            </span>
            <ChevronRight size={13} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600, maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {topic.title}
            </span>
          </div>

          {/* History "Go Back" Action */}
          {previousTopicInHistory && onGoBack && (
            <button
              onClick={onGoBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: 'var(--shadow-sm)'
              }}
              title={`Return to: ${previousTopicInHistory.title}`}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.borderColor = 'var(--react-cyan)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-tertiary)';
                e.currentTarget.style.borderColor = 'var(--border-medium)';
              }}
            >
              <CornerUpLeft size={14} color="var(--react-cyan)" />
              <span>Back to: <strong style={{ fontWeight: 600 }}>{previousTopicInHistory.title.length > 25 ? previousTopicInHistory.title.slice(0, 25) + '...' : previousTopicInHistory.title}</strong></span>
            </button>
          )}
        </div>

        {/* Header Bar */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><BookOpen size={14} /> {topic.phaseId}</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> ~{topic.readingTimeMin} min read</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FileText size={14} /> {topic.wordCount} words</span>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                {topic.title}
              </h1>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Mark Complete Button */}
              <button
                onClick={handleToggleComplete}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '6px',
                  background: completed ? 'rgba(5, 150, 105, 0.12)' : 'var(--bg-tertiary)',
                  color: completed ? 'var(--emerald-success)' : 'var(--text-secondary)',
                  border: `1px solid ${completed ? 'var(--emerald-success)' : 'var(--border-subtle)'}`,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                {completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                {completed ? 'Completed' : 'Mark as Read'}
              </button>

              {/* Architect Bridge Mode Toggle */}
              <button
                onClick={() => setArchitectBridgeMode(!architectBridgeMode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '6px',
                  background: architectBridgeMode ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-tertiary)',
                  color: architectBridgeMode ? '#059669' : 'var(--text-muted)',
                  border: `1px solid ${architectBridgeMode ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {architectBridgeMode ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                Architect Bridge
              </button>

              {/* Lab Launch Button */}
              {topic.lab && onLaunchLab && (
                <button
                  onClick={() => onLaunchLab(topic.lab!.labId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, var(--react-cyan) 0%, #0369a1 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <Sparkles size={15} /> Launch Lab <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Markdown Content Container */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid var(--border-medium)', borderTopColor: 'var(--react-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '1rem', fontWeight: 500 }}>Loading handbook chapter...</p>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--rose-danger)', borderRadius: '8px', padding: '1.5rem', color: '#f87171' }}>
            <strong>Failed to render chapter:</strong> {error}
          </div>
        )}

        {!loading && !error && (
          <div
            ref={contentRef}
            className="markdown-body"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '2.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
        )}

        {/* Bottom Navigation: Sequential Walker (Previous / Next Topic Cards) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            marginTop: '2.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          {prevSequentialTopic ? (
            <button
              onClick={() => onSelectTopic && onSelectTopic(prevSequentialTopic)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '0.4rem',
                padding: '1.25rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: 'var(--shadow-sm)',
                color: 'inherit'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--react-cyan)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                <ArrowLeft size={13} /> PREVIOUS CHAPTER
              </span>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {prevSequentialTopic.title}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {prevSequentialTopic.phaseId} • ~{prevSequentialTopic.readingTimeMin} min read
              </span>
            </button>
          ) : (
            <div />
          )}

          {nextSequentialTopic ? (
            <button
              onClick={() => onSelectTopic && onSelectTopic(nextSequentialTopic)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '0.4rem',
                padding: '1.25rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                textAlign: 'right',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: 'var(--shadow-sm)',
                color: 'inherit'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--react-cyan)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                NEXT CHAPTER <ArrowRight size={13} />
              </span>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {nextSequentialTopic.title}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {nextSequentialTopic.phaseId} • ~{nextSequentialTopic.readingTimeMin} min read
              </span>
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* Right Column: Sticky TOC & Question Drawer */}
      <div
        className="topic-reader-right-sidebar"
        style={{
          position: 'sticky',
          top: '78px',
          alignSelf: 'start',
          maxHeight: 'calc(100vh - 96px)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          paddingRight: '0.25rem'
        }}
      >
        {/* Table of Contents */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.85rem',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.88rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ListOrdered size={16} color="var(--react-cyan)" />
              Chapter Navigation
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {Math.round(readingProgress)}%
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
            {topic.headings.map((heading, idx) => {
              const isBridge = heading.title.includes('Angular') || heading.title.includes('.NET');
              const isActive = activeSectionId === heading.anchor;

              return (
                <a
                  key={idx}
                  href={`#${heading.anchor}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleJumpToSection(heading.anchor, heading.title);
                  }}
                  className={`toc-nav-link ${isBridge ? 'architect-bridge' : ''} ${isActive ? 'active' : ''}`}
                  title={heading.title}
                >
                  {heading.title}
                </a>
              );
            })}
          </div>
        </div>

        {/* Scratchpad & Mentor Question Drawer */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div
            onClick={() => setNotesExpanded(!notesExpanded)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: notesExpanded ? '0.75rem' : 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
              <MessageSquare size={16} color="var(--purple-accent)" />
              Notes & Questions
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {notesExpanded ? 'Collapse' : 'Expand'}
            </span>
          </div>

          {notesExpanded && (
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Auto-saved in browser. Copy and paste into agent chat anytime for deep-dive answers.
              </p>
              <textarea
                value={userNotes}
                onChange={e => handleNotesChange(e.target.value)}
                placeholder="Jot down questions, edge cases, or mental model doubts..."
                rows={5}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0.65rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  lineHeight: 1.5
                }}
              />

              <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCopyQuestionForMentor}
                  disabled={!userNotes.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    background: copied ? 'var(--emerald-success)' : 'var(--purple-accent)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: userNotes.trim() ? 'pointer' : 'not-allowed',
                    opacity: userNotes.trim() ? 1 : 0.5,
                    transition: 'all 150ms ease'
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied to Clipboard!' : 'Copy for Mentor'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Floating Back to Top Action */}
    {showBackToTop && (
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="back-to-top-btn"
        title="Scroll back to top"
        aria-label="Scroll back to top"
      >
        <ArrowUp size={18} />
      </button>
    )}

    {/* Floating Return to Previous Topic Action */}
    {previousTopicInHistory && onGoBack && (
      <button
        onClick={onGoBack}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 90,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          color: 'var(--text-primary)',
          padding: '0.65rem 1.1rem',
          borderRadius: '30px',
          fontSize: '0.82rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-md)',
          backdropFilter: 'blur(8px)',
          transition: 'all 200ms ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--react-cyan)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border-medium)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        title={`Return to ${previousTopicInHistory.title}`}
      >
        <CornerUpLeft size={15} color="var(--react-cyan)" />
        <span>Back to: {previousTopicInHistory.title.length > 24 ? previousTopicInHistory.title.slice(0, 24) + '...' : previousTopicInHistory.title}</span>
      </button>
    )}

    {/* Quick Peek Concept Modal */}
    {quickPeekTarget && (
      <div
        onClick={() => setQuickPeekTarget(null)}
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
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '560px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '14px',
            padding: '1.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--react-cyan)',
                  background: 'rgba(2, 132, 199, 0.12)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  display: 'inline-block',
                  marginBottom: '0.4rem'
                }}
              >
                {quickPeekTarget.phaseTitle || quickPeekTarget.topic.phaseId}
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                {quickPeekTarget.topic.title}
              </h3>
            </div>
            <button
              onClick={() => setQuickPeekTarget(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {quickPeekTarget.hash && (
            <div style={{ fontSize: '0.8rem', color: 'var(--emerald-success)', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>
              <Sparkles size={14} /> Referenced Section: <strong>{quickPeekTarget.hash.replace(/-/g, ' ')}</strong>
            </div>
          )}

          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', minHeight: '80px' }}>
            {quickPeekTarget.loading ? (
              <span style={{ color: 'var(--text-muted)' }}>Loading concept summary...</span>
            ) : (
              quickPeekTarget.excerpt || 'Comprehensive guide covering first principles, engine architecture, and production trade-offs.'
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => setQuickPeekTarget(null)}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Keep Reading
            </button>
            <button
              onClick={() => {
                const targetHref = quickPeekTarget.rawHref;
                setQuickPeekTarget(null);
                if (onNavigateToTopic) {
                  onNavigateToTopic(targetHref);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, var(--react-cyan) 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <ExternalLink size={14} /> Open Full Chapter
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Smart Architectural Term Hover Card */}
    {hoveredTermCard && (
      <TermHoverCard
        data={hoveredTermCard.data}
        rect={hoveredTermCard.rect}
        onPeek={handleTermPeek}
        onNavigate={handleTermNavigate}
        onClose={() => setHoveredTermCard(null)}
        onMouseEnter={() => {
          isTermCardHoveredRef.current = true;
          if (termHideTimerRef.current) {
            clearTimeout(termHideTimerRef.current);
            termHideTimerRef.current = null;
          }
        }}
        onMouseLeave={() => {
          isTermCardHoveredRef.current = false;
          termHideTimerRef.current = setTimeout(() => {
            setHoveredTermCard(null);
          }, 250);
        }}
      />
    )}
  </>
);
};
