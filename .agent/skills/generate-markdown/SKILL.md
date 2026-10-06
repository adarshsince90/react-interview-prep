---
name: generate-markdown
description: Generates a complete, publication-grade engineering handbook markdown chapter following deep-dive discussion.
---

# Generate Engineering Handbook Chapter

Use this workflow to transform technical discussions, doubt clarifications, and runtime mechanics into a complete, senior-architect-grade handbook chapter.

## Workflow

1. Review the conversation and confirm that all doubts, architectural comparisons, and internal mechanics discussed for the topic are completely captured.
2. Structure the chapter strictly using the following 20 sections, adhering to the **5-Layer Learning Pedagogy**:
   - 1. Why This Topic Exists
   - 2. Learning Objectives
   - 3. Historical Evolution
   - 4. First Principles & Intuitive Physical Analogies (Layer 1: Relatable real-world physical metaphors)
   - 5. Internal Working & Engine Architecture (Layer 2: V8 C++ structures and heap records)
   - 6. Runtime Flow & Execution Traces
   - 7. Memory Model & Heap Layout
   - 8. Visual Diagrams (ASCII / Text)
   - 9. Real World Usage & Production Patterns
   - 10. Angular Comparison
   - 11. .NET Comparison
   - 12. Enterprise Perspective & Production Risks (Layer 4: Real-world failure modes and security risks)
   - 13. Performance Considerations
   - 14. Tradeoffs
   - 15. Common Mistakes & Interview Traps
   - 16. Interview Questions & Architectural Answers (Senior, Lead, Architect - Layer 5: Code drills and design puzzles)
   - 17. Senior-Level Mental Model & "How to Remember This Forever" (Layer 3: Unforgettable memory anchors & mental pegs)
   - 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)
   - 19. Key Takeaways
   - 20. Revision Sheet

3. Maintain the technical depth:
   - Target audience: Senior Engineer / Architect (11+ years experience).
   - Draw direct comparisons to Angular (Zone.js, ChangeDetection, RxJS, DI, Signals) and .NET (CLR, memory allocation, LINQ, records, async state machines) isolated strictly in Sections 10 and 11.
   - Ensure runtime and memory diagrams (ASCII / text-based) are included.
   - **Self-Contained Snippets:** All code examples must be fully written out in standard fenced markdown code blocks (`tsx`, `typescript`, `csharp`, etc.) so the handbook remains 100% self-sufficient forever.
   - **Dual-Context Lab Linking:** In Section 9, include the companion lab callout:
     `> 🧪 **Companion Interactive Lab:** [LabName.tsx](../../apps/portal/src/features/visualizers/topic-XX/LabName.tsx) | Live in Portal: \`lab-id\``
   - **File Saving & Output:** Save the completed chapter directly into `notes/phase-XX/` using `write_to_file`. Provide a concise confirmation with clickable links to the file and summary takeaways. Do NOT re-dump the entire massive markdown file into the chat response once saved.
