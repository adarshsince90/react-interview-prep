# ADR-003: Publication-First Curriculum Generation & Socratic Mentorship Cadence

## Context
The student is an experienced Senior Backend & Enterprise Engineer. Rather than spending long sessions on repetitive conversational exchanges for every individual chapter before reading, the user requested:
1. Generate all pending chapters across Phase 05, Phase 06, and Phase 07 using our established publication-grade format upfront.
2. Read and master the material independently via the interactive web portal at their own pace.
3. Bring specific, sticky doubts and architectural edge cases to the mentor for deep-dive Socratic clarification, active recall drills, and mock interview practice.

## Decision
1. **Publication-First Batch Generation:**
   - Author all remaining 25 chapters across Phase 05, Phase 06, and Phase 07 using the established `/generate-markdown` skill.
   - Every chapter must strictly implement the 20-Section layout, 5-layer pedagogy, self-contained code blocks, ASCII diagrams, and companion lab links.
   - Automatically re-index into `apps/portal` manifest after each phase is generated.
2. **In-Portal Active Learning & Question Capture:**
   - The user reads chapters in the modernized web portal.
   - The user records thoughts, doubts, and edge-case questions in the in-reader "Notes & Questions" drawer.
   - With one click ("Copy for Mentor"), aggregated questions are brought into chat.
3. **Socratic Mentorship & Architect Review Cadence:**
   - Mentor deep-dives focus on nuanced runtime mechanics, memory leaks, system redesigns, and Angular/.NET architectural bridge synthesis.
   - Mentor conducts mock interview scenarios targeting Senior, Lead, and Staff engineer benchmarks.

## Consequences
- **Positive:**
  - Accelerates curriculum availability: the learner has immediate access to the entire end-to-end curriculum in the portal.
  - Mentorship time is spent on high-leverage architectural debates and interview preparation rather than waiting for chapter drafting.
  - The learner controls the learning velocity.
- **Negative / Trade-offs:**
  - High upfront authoring volume (25 chapters across 3 phases). Must ensure consistent technical depth and 0 LaTeX syntax across all generated files.
