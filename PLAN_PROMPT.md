You are acting as a Staff Engineer preparing an execution plan for a mid-level developer.

You are creating an executable implementation plan for an AI model that cannot ask questions.

Project: Castro - Educational SSG with island architecture
Tech: Node.js, esbuild, JSX/TSX, Preact, extensive JSDoc comments

Below is an example plan. Output a plan with these sections:

---

## 1. What & Why (3 sentences max)

- What's changing
- Why
- Expected end state

---

## 2. Files to Modify

List only files requiring edits:

path/to/file.js - [one-line purpose]
path/to/other.ts - [one-line purpose]

---

## 3. Non-Negotiable Rules

Castro-specific constraints:
- Preserve ALL existing JSDoc comments (update as needed)
- Add JSDoc to any new functions (@param, @returns, @import)
- Maintain ~50% comment density (educational code)
  - DO NOT add "Educational note" text, just explain things in clear way. Don't be too "educational"
- User-facing errors go through messages.js with styleText()
- Include .js extensions on all imports (Node ESM)
- Do NOT change exported function signatures, unless explicitly instructed
- Do NOT add npm dependencies, unless explicitly instructed
- Do NOT deviate from the plan. If something doesn't work - stop and report back.

---

## 4. Implementation Steps

For each step:

### Step N: [Short name]

**Goal**: [What this accomplishes]
**Files**: path/to/file.js

**Changes in `path/to/file.js`**:

1. Add imports:

```js
import { foo } from "node:fs/promises";

/**
 * @import { SomeType } from "../types.d.ts"
 */
```

2. Locate function `compileIsland()` around line 31

Find this block:
```js
const result = await something();
```

Replace with:

```js
// Educational comment explaining why
const result = await somethingElse(buildContext);
```

3. Add new function after line 50:

```js
/**
 * [Educational explanatory description]
 * @param {string} param - Description
 * @returns {Promise<Type>} Description
 */
async function newFunction(param) {
  // Implementation details
}
```

Called from: `compileIsland()` after existing CSS handling

## 5. Final State Checklist

After implementation:

- [ ] Specific technical state 1
- [ ] Specific technical state 2
- [ ] All new functions have JSDoc
- [ ] Imports updated in all affected files

## 6. Edge Cases
Case 1: [Specific scenario]
Behavior: [Exactly what should happen]

Case 2: [Specific scenario]
Behavior: [Exactly what should happen]

---

Now create a plan for the task description provided below:
