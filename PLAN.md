# Castro Framework - Development Instructions

## Project Overview

Castro is a satirical educational Static Site Generator that teaches island architecture through ~1500 lines of well-commented, self-explanatory code. Built on the existing Reef codebase, it wraps serious technical implementation in communist-themed presentation.

**Core Philosophy:**
- Code is serious, clean, and educational
- Satire is in presentation layer only (CLI, errors, docs, naming)
- Educational value takes priority over jokes
- Try to keep actual codebase slim (currently <1500 LOC) + add explanatory comments generously to make sure every bit is clear to those who want to understand islands architecture

## What We're Building

### Educational Core
- Working SSG with island architecture
- Selective hydration (only interactive components get JS)
- SSR/SSG with build-time rendering
- Simple, readable codebase that teaches by example
- Every file has explanatory comments showing "why" not just "what"

### Communist Wrapper (Satire Layer)
- CLI with themed output ("Consulting Central Committee...")
- Error messages from "The Ministry of Errors"
- Config file: `manifesto.js`
- Hydration directives: `no:pasaran`, `lenin:awake`, `comrade:visible`
- Marketing copy with communist puns

### The Value Proposition
"Understand how modern SSGs implement island architecture by reading <1500 lines of commented code. The communist theme makes it memorable. The architecture lessons are real."

---

## Phase 3: Documentation Site

### Task 3.1: Create Docs Site Structure
**Goal:** Documentation site built with Castro itself (dogfooding)

**Required pages:**

2. **The Manifesto (Introduction)**
   - What is island architecture (serious)
   - Why it matters for performance (serious)
   - How Castro implements it (serious)
   - Why we made it funny (meta/honest)

4. **The Codebase Tour**
   - Annotated walkthrough of the source
   - "This is the parser, here's how it works..."
   - "This is hydration, here's the technique..."
   - Learn by reading, not guessing

5. **404 Page**
   - "This page has been redacted by the Ministry of Truth. It never existed."

6. **About Page**
   - "From each component according to its complexity, to each page according to its needs."
   - Explain it's educational, satire is wrapper
   - Zero-config, maximum-discipline philosophy

**Success criteria:**
- Site is built using Castro
- All pages render correctly
- Navigation works
- Demonstrates framework capabilities

---

## Phase 4: Polish & Launch

Review README and update as needed, after all the changes above.
---

## Quality Gates

Before moving to next phase, verify:

**Code Quality:**
- ✅ Can someone learn from this code right now?
- ✅ Are comments educational, not just descriptive?
- ✅ Is codebase under 1500 LOC (excluding comments)?

**Satire Balance:**
- ✅ Does satire enhance or distract from learning?
- ✅ Are errors still helpful despite jokes?
- ✅ Would you show this to a senior dev without embarrassment?

**Educational Value:**
- ✅ Does it actually teach islands architecture?
- ✅ Can someone read it and understand the concepts?
- ✅ Are examples clear and practical?

---

## Critical Principles

**Remember:**
1. **Code is serious, wrapper is funny** - Never sacrifice clarity for jokes
2. **Education first** - Satire makes it memorable, education makes it valuable
3. **Keep it simple** - <1500 LOC is a feature, not a limitation
4. **Comment generously** - Every function teaches something
5. **Dogfood it** - Docs site must be built with Castro
6. **Ship and iterate** - Launch with minimum viable content, expand based on feedback

---

## Puns & Slogans (For Marketing)

Use these in docs/marketing:

- "No component hoards JS unless it is socially necessary"
- "Workers of the web, unite!"
- "The performance is... mandatory"
- "Bundle sizes will be redistributed equally"
- "The people's framework. Bundle sizes will be redistributed equally. ✊"
- "Redistribute interactivity to the components that need it most."
- "Seize the means of rendering"
- "Your 5-year plan to understand islands architecture"
- "Coming to npm after the revolution 🚩"

---

## What Success Looks Like

**Launch state:**
- Codebase is educational-ready (<1500 LOC + comments)
- CLI works with themed output
- 3 directives implemented and documented
- Docs site exists with at least one tutorial
- README sells the concept

**Long-term success:**
- People say "I learned islands by reading Castro"
- Used as educational resource
- Community contributes improvements
- Referenced in tutorials/blog posts
- GitHub stars (quantity less important than quality engagement)

---

## Next Immediate Actions

1. Document current Reef file structure in STRUCTURE.md
2. Decide if reorganization needed
3. Start adding educational comments to one file as test
4. This reveals pace and style that works

Then proceed through phases sequentially.
