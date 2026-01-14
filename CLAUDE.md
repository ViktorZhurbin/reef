## IMPORTANT

- Read the README.md and EXPLORATION.md for context
- This is an experimental personal project for now. No need to take care of backward compatibility and maintaining legacy logic
- website/ is the playground where all tools from packages/ are being used
- you can run pnpm build/dev from the root to build/start dev server of the website
- website/dist/ is cleaned up automatically on build/dev

## Core Principles

1. **Keep it simple** - No scope creep, only things that are useful (and fun)
2. **Keep it small** - No edge case coverage. Only use dependencies with high benefits/size ratio
3. **Keep it readable** - No "hacks" to reduce LOC
4. **Good DX** - Nice logging, proper error handling, live reload, etc
5. **No defensive programming** - Startup failures crash with native errors. Runtime failures degrade gracefully only where expected

**Bloat detection:** Watch out for LOC count (check with `npm run loc`), but not at the expense of the core principles above.

# Reef Guiding Principles

## Sustainability First
Future you should be able to return after 6 months and understand everything.

- Minimal dependencies (each one is a maintenance liability)
- Proven tools over cutting-edge (boring is good)
- Cross-platform by default (Windows compatibility matters)
- Simple over clever (straightforward beats impressive)
- Test critical paths (not everything, but enough to catch regressions)

## Code as Communication
Code is read 10x more than written. Optimize for reading.

- Self-documenting: names explain intent, structure reveals flow
- Types tell the story (TypeScript types are inline documentation)
- Comments explain "why" not "what"
- Obvious file structure (where things are should be predictable)
- Minimal cognitive load (grasp a module in <5 minutes)

## Do More with Less
Every line of code is a liability. Question necessity.

- Solve problems with minimal code
- Remove accidental complexity
- Prefer composition until abstraction proves needed
- Delete aggressively (unused code is tech debt)
- Built-in > plugin (until pattern emerges)

## Learning-Driven Development
This is an educational project. When learning stops, so do you.

- Build only what teaches new concepts
- Understand before abstracting
- Document discoveries for future self
- Prioritize transferable skills
- Stop at diminishing returns

## User Empathy
Easier to use = easier to maintain. Even if user is future you.

- Clear error messages (what's wrong + how to fix)
- Sensible defaults (should work with minimal config)
- Examples over extensive docs (show, don't tell)
- Progressive disclosure (simple simple, complex possible)

## Future-Proof by Default
Reduce tomorrow's maintenance burden today.

- Stable foundation (mature core dependencies)
- Web standards > framework APIs
- Version intentionally (breaking changes need reason)
- Write migration guides if you break things
