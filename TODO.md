# Bare Static: Current Roadmap

**Status**: Educational SSG project exploring islands architecture with Solid.js

**Current Focus**: JSX compilation pipeline that wraps Solid components in web components

---

## 🔥 High Priority: JSX + Solid.js Islands

### Goal

Write Solid components in JSX, automatically wrap them in web components for islands architecture.

### Key Insight

**Web components + Solid.js = simple islands without building partial hydration**

- `connectedCallback()` provides automatic hydration
- Web components are thin wrappers; real logic stays in Solid
- Ship Solid runtime (~7kb) once, share across all islands
- Full Solid power (routing, state, nested components) inside each island

### Approach

**User writes normal Solid components:**

```jsx
// islands/counter.jsx
import { createSignal } from "solid-js";

export default function Counter({ initial = 0 }) {
	const [count, setCount] = createSignal(initial);

	return (
		<div class="counter">
			<p>Count: {count()}</p>
			<button onClick={() => setCount(count() + 1)}>+</button>
		</div>
	);
}
```

**Build generates web component wrapper:**

```javascript
// dist/components/counter.js
import { render } from "solid-js/web";
import Counter from "../islands/counter.jsx";

class CounterComponent extends HTMLElement {
	connectedCallback() {
		const initial = this.getAttribute("initial") || 0;
		render(() => <Counter initial={initial} />, this);
	}
}
customElements.define("counter-component", CounterComponent);
```

**In markdown:**

```html
<counter-component initial="5"></counter-component>
```

### Implementation Tasks

- [ ] Set up esbuild/Bun with Solid JSX preset
- [ ] Create web component wrapper generator
- [ ] Detect `.jsx` files in islands/ directory
- [ ] Bundle Solid runtime to vendor/ (separate from components)
- [ ] Handle component props (HTML attributes → Solid props)
- [ ] Test nested Solid components inside island
- [ ] Test multiple islands on same page (shared runtime)
- [ ] Measure bundle size vs Astro/Fresh

### Open Questions

1. **Build tool**: esbuild vs Bun for JSX compilation?
   - esbuild: Well-tested, plugin ecosystem
   - Bun: Native JSX support, faster, simpler API

2. **Islands directory**: Where do `.jsx` files live?
   - `islands/` (dedicated directory) ← **Leaning toward this**
   - Mix with `.component.js` files
   - Flexible (anywhere, detected by extension)

3. **CSS approach**: How should component styles work?
   - Shadow DOM: True encapsulation, complex theming
   - Global styles: Simple, potential conflicts
   - CSS Modules: Build-time solution, needs tooling ← **Probably this**

### Success Criteria

- [ ] Can write Solid components in JSX (`.jsx` files)
- [ ] Auto-generates web component wrappers at build time
- [ ] Solid runtime ships once per page, shared across islands
- [ ] Props work intuitively (HTML attributes → Solid props)
- [ ] Dev experience is smooth (fast rebuilds, good errors)
- [ ] Output is web components wrapping Solid islands
- [ ] Full Solid power inside islands (no limitations)
- [ ] Bundle size competitive: bare-static + Solid ≤ Astro equivalent
- [ ] Complex island test passes (nested components, routing, state)

---

## 🟡 Medium Priority: Component Improvements

### Props Support

**Goal**: Pass data from markdown to components.

**Syntax:**

```html
<!-- Simple attributes -->
<counter-component initial="5"></counter-component>

<!-- JSON data attribute for complex props -->
<data-fetcher data='{"url": "/api/posts", "limit": 10}'></data-fetcher>
```

**Implementation**: Components read attributes in `connectedCallback()`.

**Tasks:**
- [ ] Design props parsing strategy (string vs JSON)
- [ ] Implement attribute → props conversion in wrapper generator
- [ ] Handle type coercion (string "5" → number 5)
- [ ] Test with complex nested data structures

### Component Metadata

**Goal**: Components declare their requirements/configuration (optional, may not be needed).

**Approach:**

```javascript
// counter.jsx
export const meta = {
	name: "counter-component",
	props: {
		initial: { type: "number", default: 0 },
		step: { type: "number", default: 1 },
	},
};

export default function Counter({ initial = 0 }) {
	// ...
}
```

**Tasks:**
- [ ] Define metadata format
- [ ] Extract metadata during build
- [ ] Use for validation/optimization (optional)
- [ ] Generate TypeScript types from metadata (future)

**Note**: May not be needed if TypeScript handles this better.

---

## 📚 Documentation

### High Priority Docs

- [ ] Add "Interactive Islands with Solid.js" section to README
- [ ] Document JSX component conventions (file naming, props)
- [ ] Document web component wrapper pattern
- [ ] Quick start guide: "Your first Solid island"

### Examples

- [ ] Counter (basic signal usage)
- [ ] Form with validation (effects, multiple signals)
- [ ] Data fetcher (async, error handling)
- [ ] Nested components (Solid composition inside island)

### Reference Docs

- [ ] Document bare-signals (educational reference only)
- [ ] Add comparison: bare-static vs Astro/Eleventy/Hugo
- [ ] Document bundle size benefits
- [ ] Architecture decisions explained

---

## 🛠️ Developer Experience

- [ ] Add `bare-static create-island <name>` CLI command (generates `.jsx` scaffold)
- [ ] Better error messages (e.g., "Island X used but not found")
- [ ] Validate JSX compilation errors (helpful Solid error messages)
- [ ] Add Solid island template/boilerplate
- [ ] TypeScript support for islands (`.tsx`)
- [ ] Dev mode: Watch `.jsx` files, rebuild on change
- [ ] HMR exploration (full reload is fine for now)

---

## ⚡ Performance

- [ ] Minify Solid runtime and island code in production
- [ ] Add cache busting (content hash in filenames)
- [ ] Bundle Solid runtime separately (shared across all islands)
- [ ] Measure bundle size: bare-static + Solid vs Astro approach
- [ ] Tree-shake unused Solid features (only ship what islands use)
- [ ] Lazy load islands (Intersection Observer for below-fold islands)
- [ ] Consider preloading Solid runtime for critical islands

---

## 🧪 Testing

### Core Tests

- [ ] Test suite for bare-islands plugin (JSX compilation)
- [ ] Test Solid island mounting/unmounting in web components
- [ ] Test web component wrapper generation
- [ ] Test props passing (attributes → Solid props)
- [ ] Test multiple islands on same page (shared runtime)
- [ ] Test nested Solid components inside island

### Integration Tests

- [ ] Test error handling (missing files, JSX syntax errors)
- [ ] Integration tests for full build pipeline (markdown → HTML → islands)
- [ ] Test one complex Solid island (routing, state, API calls)

---

## 🎯 Core Principles

1. **Learning first, production second** - Build understanding, not another framework
2. **Keep it simple** - No scope creep, only useful (and fun) features
3. **Keep it small** - Bundle size matters (watch LOC with `npm run loc`)
4. **Keep it readable** - No "hacks" to reduce LOC
5. **Good DX** - Nice logging, proper error handling, live reload
6. **Static first** - 95% static HTML (0kb JS), 5% interactive islands

---

## 🔍 Key Discoveries from Exploration

### Islands ≠ Complex

Astro's partial hydration solves resumability for multi-framework architectures. But web components already hydrate automatically via `connectedCallback()`. **Don't build what the browser gives you for free.**

### Framework Inside Island

An island can be an entire Solid app - routing, state management, API calls, nested components. The web component is just the entry point. **No limitations on island complexity.**

### Static First is Real

For blog/docs content, 95% of the page is static HTML (0kb JS). The 5% that's interactive (comments, search, code playground) can be isolated islands. **This is the core value prop.**

### Learning > Using

Building bare-signals taught more about reactivity than using Solid ever would. Understanding primitives lets you see through framework abstractions. **Educational approach validated.**

### Bundle Size Matters

```
bare-signals:    ~2kb   (educational reference)
Mastro:          2.8kb  (maverick-js/signals)
Solid.js:        ~7kb   (production choice) ✓
Alpine.js:       ~10kb
Preact:          ~4kb   (but VDOM)
React:           ~45kb  (overkill)
```

For islands architecture, every kilobyte counts. Solid hits the sweet spot: small runtime, powerful features, fine-grained reactivity.

### Framework Overhead is Real

Most SSG value comes from ~20% of features. For markdown → HTML, DIY beats learning framework quirks. **Build understanding, not another framework.**

---

## 🚫 What We're NOT Pursuing

- ❌ Template languages (Eleventy's Nunjucks/Liquid soup)
- ❌ Framework-agnostic reactivity (complexity explosion)
- ❌ Custom partial hydration system (web components solve this)
- ❌ Virtual DOM approaches (Solid's fine-grained reactivity is better)
- ❌ Multi-framework support (adds too much complexity)
- ❌ Backward compatibility (experimental project for now)

---

## 📍 Current Status

**What Works:**
- ✅ Core SSG engine (~200 LOC)
- ✅ Plugin system (onBuild, getScripts hooks)
- ✅ Markdown → HTML conversion with live reload
- ✅ Smart component loading (only used components)
- ✅ Auto-discovery of `.component.js` files
- ✅ bare-signals implementation (educational reference)

**Next Milestone:**
Proof of concept: Solid JSX → web component wrapper with working counter island

**Exploration Journey:**
1. Framework evaluation → DIY decision
2. Built SSG fundamentals (routing, markdown, dev server, plugins)
3. Built bare-signals (~167 LOC) to understand reactivity primitives
4. Studied Mastro, Brisa, Astro patterns
5. Discovered web components as automatic hydration mechanism
6. Chose Solid.js for production islands (7kb, fine-grained reactivity)
7. **Current**: Implement JSX compilation pipeline

---

## 🎯 Next Milestones

1. **Proof of concept**: Solid JSX → web component wrapper (counter island)
2. **Build pipeline**: Integrate esbuild or Bun for JSX compilation
3. **Complex island test**: Validate "no limitations" theory (routing, state, API calls)
4. **Bundle comparison**: Measure bare-static + Solid vs Astro/Fresh
5. **Documentation**: Quick start guide and examples
6. **Polish**: Better errors, CLI commands, TypeScript support

---

*This is a learning project. It's okay to change direction based on discoveries. Document learnings and tradeoffs.*
