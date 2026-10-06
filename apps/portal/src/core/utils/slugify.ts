/**
 * Robust heading slugifier shared between manifest build scripts and runtime markdown renderers.
 * Decodes HTML entities and normalizes punctuation to ensure 100% anchor match rate.
 */
export function slugifyHeading(text: string): string {
  return text
    // Decode common HTML entities produced by markdown parsers or raw entities
    .replace(/&amp;/gi, 'and')
    .replace(/&quot;/gi, '')
    .replace(/&#39;/gi, '')
    .replace(/&lt;/gi, '')
    .replace(/&gt;/gi, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Strip markdown formatting symbols (bold, italic, code backticks)
    .replace(/[`*]/g, '')
    .toLowerCase()
    // Strip non-alphanumeric characters (keep letters, digits, spaces, and hyphens)
    .replace(/[^\w\s-]/g, '')
    .trim()
    // Collapse consecutive whitespace and hyphens into single hyphen
    .replace(/[\s-]+/g, '-')
    // Strip leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalizes chapter and topic titles into a clean two-digit badge and human-readable title.
 * Examples:
 * - "Chapter 01: JavaScript Execution Model" -> { badge: "01", cleanTitle: "JavaScript Execution Model" }
 * - "Phase 04 — Chapter 02: Reconciliation" -> { badge: "02", cleanTitle: "Reconciliation" }
 * - "Architectural Companion: Application Lifecycle" -> { badge: "AC", cleanTitle: "Application Lifecycle" }
 */
export function formatTopicBadgeAndTitle(rawTitle: string): { badge: string; cleanTitle: string } {
  // Architectural Companion check
  if (/^Architectural Companion/i.test(rawTitle)) {
    const clean = rawTitle.replace(/^Architectural Companion[:\s-]*/i, '').trim();
    return { badge: 'AC', cleanTitle: clean || 'Application Lifecycle & Architecture' };
  }

  // Matches: "Phase 04 — Chapter 02: ...", "Chapter 01: ...", "Topic 03: ...", "06: ..."
  const matchNum = rawTitle.match(/(?:Phase\s+\d+\s*[-—:]\s*)?(?:Chapter|Topic)?\s*(\d+)[:\s-]*(.*)/i);
  if (matchNum) {
    const num = parseInt(matchNum[1], 10);
    const badge = isNaN(num) ? matchNum[1] : String(num).padStart(2, '0');
    const clean = matchNum[2]?.trim() || rawTitle;
    return { badge, cleanTitle: clean };
  }

  return { badge: '•', cleanTitle: rawTitle };
}
