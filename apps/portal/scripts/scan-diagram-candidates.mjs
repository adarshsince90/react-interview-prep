import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const notesRoot = path.resolve(__dirname, '../../../notes');

console.log(`🔍 Scanning notes directory: ${notesRoot}\n`);

const phases = fs.readdirSync(notesRoot).filter(f => {
  const full = path.join(notesRoot, f);
  return fs.statSync(full).isDirectory() && f.startsWith('phase-');
}).sort();

let totalFiles = 0;
let section3TimelineCandidates = [];
let section8ArchitectureCandidates = [];
let otherAsciiCandidates = [];
let existingMermaidCount = 0;

for (const phase of phases) {
  const phaseDir = path.join(notesRoot, phase);
  const files = fs.readdirSync(phaseDir).filter(f => f.endsWith('.md')).sort();

  for (const file of files) {
    totalFiles++;
    const filePath = path.join(phaseDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Split content by section headings: ## <number>. <Title>
    const sectionRegex = /^##\s+(\d+)\.\s+(.*)$/gm;
    let match;
    const sections = [];
    while ((match = sectionRegex.exec(content)) !== null) {
      sections.push({
        num: parseInt(match[1], 10),
        title: match[2].trim(),
        index: match.index
      });
    }

    // Inspect code blocks in each section
    for (let i = 0; i < sections.length; i++) {
      const current = sections[i];
      const nextIndex = i + 1 < sections.length ? sections[i + 1].index : content.length;
      const sectionText = content.slice(current.index, nextIndex);

      // Regex for code blocks
      // First check if this section already has a mermaid block
      const hasMermaidAlready = /```mermaid\n/.test(sectionText);
      const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
      let cbMatch;

      while ((cbMatch = codeBlockRegex.exec(sectionText)) !== null) {
        const lang = (cbMatch[1] || '').toLowerCase().trim();
        const code = cbMatch[2];

        if (lang === 'mermaid') {
          existingMermaidCount++;
          continue;
        }

        // If this section already has a mermaid diagram, skip counting its ASCII fallback as a pending candidate!
        if (hasMermaidAlready) {
          continue;
        }

        // Ignore real programming code
        const codeLangs = ['ts', 'tsx', 'typescript', 'js', 'jsx', 'javascript', 'csharp', 'cs', 'json', 'bash', 'sh', 'html', 'css', 'sql', 'yaml', 'diff'];
        if (codeLangs.includes(lang)) {
          continue;
        }

        // Check for ASCII box/arrow/timeline signals
        const hasBoxChars = code.includes('+---') || code.includes('┌──') || code.includes('├──') || code.includes('|---|') || code.includes('+===+');
        const hasArrows = code.includes('-->') || code.includes('──►') || code.includes('->') || code.includes('| v') || code.includes('===>');
        const hasTimelineMarkers = /\b(19\d\d|20\d\d)\s*[-:]/i.test(code);

        const isAsciiCandidate = hasBoxChars || (hasArrows && code.includes('|')) || (current.num === 3 && hasTimelineMarkers);

        if (isAsciiCandidate) {
          const item = {
            phase,
            file,
            sectionNum: current.num,
            sectionTitle: current.title,
            lang: lang || 'untagged',
            lineCount: code.split('\n').length
          };

          if (current.num === 3 && (hasTimelineMarkers || hasBoxChars)) {
            section3TimelineCandidates.push(item);
          } else if (current.num === 8) {
            section8ArchitectureCandidates.push(item);
          } else {
            otherAsciiCandidates.push(item);
          }
        }
      }
    }
  }
}

console.log(`================ SCAN SUMMARY ================`);
console.log(`📚 Total Handbook Chapters Scanned: ${totalFiles}`);
console.log(`✨ Already Native Mermaid Diagrams:  ${existingMermaidCount}`);
console.log(`📅 Section 3 (Evolution Timeline) Candidates: ${section3TimelineCandidates.length}`);
console.log(`🏛️ Section 8 (Architecture/Flow) Candidates:   ${section8ArchitectureCandidates.length}`);
console.log(`🧩 Other ASCII Diagram Candidates (Sec 5/6/7): ${otherAsciiCandidates.length}`);
console.log(`==============================================\n`);

console.log(`--- Section 3 (Timeline) Breakdown by Phase ---`);
const s3ByPhase = {};
section3TimelineCandidates.forEach(c => {
  s3ByPhase[c.phase] = (s3ByPhase[c.phase] || 0) + 1;
});
console.table(s3ByPhase);

console.log(`\n--- Section 8 (Architecture) Breakdown by Phase ---`);
const s8ByPhase = {};
section8ArchitectureCandidates.forEach(c => {
  s8ByPhase[c.phase] = (s8ByPhase[c.phase] || 0) + 1;
});
console.table(s8ByPhase);
