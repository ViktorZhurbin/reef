Read the README file

## Core Principles

1. **Keep it simple** - No scope creep, only things that are useful (and fun)
2. **Keep it small** - No edge case coverage. Only use dependencies with high benefits/size ratio
3. **Keep it readable** - No "hacks" to reduce LOC
4. **Good DX** - Nice logging, proper error handling, live reload, etc
5. **No defensive programming** - Startup failures crash with native errors. Runtime failures degrade gracefully only where expected

**Bloat detection:** Watch out for LOC count (check with `npm run loc`), but not at the expense of the core principles above.

## IMPORTANT

This is an experimental personal project for now. No need to take care of backward compatibility
