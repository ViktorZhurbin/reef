Read the README file

## Core Principles
1. **Keep it simple** - Just convert `.md` > `.html`
2. **Keep it small** - No edge case coverage, no scope creep. Only use dependencies with high benefits/size ratio
3. **Keep it readable** - No "hacks" to reduce LOC
4. **Good DX** - Nice logging, proper error handling, live reload, etc
5. **No defensive programming** - Startup failures crash with native errors. Runtime failures degrade gracefully only where expected

**Bloat detection:** So far `src/` folder is under 250 lines of code (`npm run loc`). Keep it low, but not at the expense of the core principles above.
