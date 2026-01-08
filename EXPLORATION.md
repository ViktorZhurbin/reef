# Bare Static: Exploration & Learnings

**Internal documentation capturing insights from SSG/reactivity exploration**

This document exists to preserve the "why" behind architectural decisions and to maintain a single source of truth for the project's philosophy.

---

## 🎯 Core Principles

### 1. Learning First, Production Second

**Goal**: Build understanding, not another framework.

Building bare-signals taught more about reactivity than using Solid ever would. Understanding primitives lets you see through framework abstractions. This project is fundamentally about education - if it becomes a useful tool, that's a bonus.

### 2. Keep It Simple

**Rule**: No scope creep, only features that are useful (and fun).

Most SSG value comes from ~20% of features. For markdown → HTML, DIY beats learning framework quirks. Don't add features "just in case" - add them when they solve a real problem you're experiencing.

### 3. Keep It Small

**Metric**: Watch LOC count (`npm run loc`), but not at expense of other principles.

Bundle size matters for islands architecture. Every kilobyte counts when shipping JavaScript to browsers. However, don't sacrifice readability for LOC reduction.

```
Target sizes:
- Core SSG: <200 LOC
- Plugin system: <50 LOC
- Solid runtime: ~7kb
- Individual islands: <5kb each
```

### 4. Keep It Readable

**Rule**: No "hacks" to reduce LOC.

Code should be understandable six months from now. Clever tricks that save 10 lines but require mental gymnastics to parse are not worth it. Future you will thank present you.

### 5. Good DX

**Requirements**: Nice logging, proper error handling, live reload, fast rebuilds.

Developer experience matters. If the tool is painful to use, you won't use it. Invest in error messages, helpful logs, and fast feedback loops.

### 6. No Defensive Programming

**Philosophy**: Startup failures crash with native errors. Runtime failures degrade gracefully only where expected.

Don't wrap everything in try-catch "just in case." Let bugs surface loudly during development. Only handle errors you expect and can recover from (network failures, missing files, etc.).

### 7. Static First

**Architecture**: 95% static HTML (0kb JS), 5% interactive islands.

The default should be zero JavaScript. Interactive features are the exception, not the rule. For blog/docs content, most of the page is static - comments, search, code playgrounds can be isolated islands.

---

## 🔍 Key Discoveries

### Discovery 1: Islands ≠ Complex

**Insight**: Web components solve hydration automatically via `connectedCallback()`.

Astro's partial hydration solves resumability for multi-framework architectures. But for a single-framework approach, web components already provide automatic hydration. **Don't build what the browser gives you for free.**

**Implication**: No need for custom partial hydration system, client directives (load/visible/idle), or framework adapters. Just use web components as island containers.

### Discovery 2: Framework Inside Island

**Insight**: An island can be an entire Solid app - routing, state management, API calls, nested components.

The web component is just the entry point. Inside that boundary, it's full Solid with no limitations. This means you can have complex interactions inside an island without building complex infrastructure.

**Implication**: No need to design for "simple" islands. If an island needs routing or complex state, just use Solid's built-in solutions.

### Discovery 3: Static First is Real

**Insight**: For blog/docs content, 95% of the page is static HTML (0kb JS).

The 5% that's interactive (comments, search, code playground) can be isolated islands. This isn't just theoretical - it's the actual content split for documentation sites and blogs.

**Implication**: Default to static. Only reach for JavaScript when a feature genuinely requires interactivity.

### Discovery 4: Learning > Using

**Insight**: Building bare-signals taught more about reactivity than using Solid.

Understanding primitives (signals, effects, memos) at ~167 LOC lets you see through framework abstractions. You now understand *why* Solid makes certain API decisions and *how* fine-grained reactivity works under the hood.

**Implication**: Keep bare-signals as educational reference. Don't delete it even when switching to Solid for production. The learning has value independent of production use.

### Discovery 5: Bundle Size Matters

**Data**:
```
bare-signals:    ~2kb   (educational reference)
Mastro:          2.8kb  (maverick-js/signals)
Solid.js:        ~7kb   (production choice) ✓
Alpine.js:       ~10kb
Preact:          ~4kb   (but VDOM)
React:           ~45kb  (overkill)
```

**Insight**: Solid hits the sweet spot - small runtime, powerful features, fine-grained reactivity.

For islands architecture, shipping 45kb of React for a counter component is absurd. But Preact's 4kb comes with VDOM overhead. Solid's 7kb with fine-grained reactivity is optimal.

**Implication**: Choose Solid for production islands. The extra 3kb over Preact is worth it for better reactivity model and better DX.

### Discovery 6: Framework Overhead is Real

**Insight**: Most SSG value comes from ~20% of features.

Big frameworks like Eleventy, Hugo, Docusaurus ship with template languages, i18n, plugin ecosystems, theme systems, etc. For "markdown to HTML," you need ~200 LOC and a markdown parser.

**Implication**: Build only what you need. Don't pre-emptively add features for hypothetical future requirements.

### Discovery 7: Web Components as Hydration Boundary

**Insight**: `connectedCallback()` fires when element is added to DOM - perfect hydration point.

This is the key architectural insight. Web components already provide:
- Lifecycle hooks (connectedCallback, disconnectedCallback)
- Attribute observation (attributeChangedCallback)
- Custom element registry (customElements.define)
- Automatic instantiation when HTML is parsed

**Implication**: Islands architecture "for free" from the browser. Just render Solid inside connectedCallback.

---

## 📊 Framework Comparison

### Mastro Reactive

**Size**: 2.8kb (uses maverick-js/signals)

**Approach**:
- Signals + data-bind attributes
- Custom elements + ReactiveElement base class
- HTML web components (server renders, client enhances)
- Progressive enhancement philosophy

**What's Interesting**:
- Tiny bundle size
- Server-side rendering with HTML web components
- Progressive enhancement approach (works without JS)

**Where We Differ**:
- They use data-bind attributes; we use Solid JSX
- They ship custom ReactiveElement; we wrap Solid components
- Their approach is more "HTML-first"; ours is "JavaScript-first"

**Takeaway**: Great inspiration for keeping bundle small and progressive enhancement. But we want full component power (JSX, composition) over minimalism.

### Brisa

**Size**: Full framework (not minimal)

**Approach**:
- Signals via WebContext (state/store/derived)
- Build-time optimizations for reactivity
- Transferable store (server ↔ client)
- Server-side rendering with hydration

**What's Interesting**:
- Signals exposed through context API
- Build-time signal tracking
- Server/client state synchronization

**Where We Differ**:
- Full framework vs minimal tool
- We're client-only islands; they're full SSR + hydration
- We use Solid signals; they have custom implementation

**Takeaway**: Interesting patterns for state synchronization, but too much complexity for our "learning first" goal.

### Astro

**Size**: Full framework + adapters

**Approach**:
- Multi-framework support (React, Vue, Svelte, etc.)
- Partial hydration with client directives
- Islands architecture
- Component-based with Astro files

**What's Interesting**:
- Popularized islands architecture
- Client directives (load/visible/idle) are elegant API
- Multi-framework support

**Where We Differ**:
- They build custom partial hydration; we use web components
- Multi-framework vs single-framework (Solid)
- Complex build system vs simple tool

**Takeaway**: Astro is solving "support multiple frameworks." We're solving "understand islands with one framework." Different problems, different solutions.

### Eleventy

**Size**: Full framework

**Approach**:
- Template languages (Nunjucks, Liquid, Handlebars, etc.)
- Data cascade
- Plugin ecosystem
- Zero-JS by default

**What's Interesting**:
- Pure static by default
- Flexible template system
- Large community

**Where We Differ**:
- Template soup vs markdown + Solid islands
- Magic globals vs explicit imports
- We're learning; they're production-ready

**Takeaway**: Good inspiration for "static first" philosophy. But template languages are not the direction we want.

---

## 🚫 What We're NOT Pursuing (And Why)

### Template Languages

**Examples**: Nunjucks, Liquid, Handlebars, Pug

**Why Not**:
- Learning another syntax for basic conditionals/loops
- Poor TypeScript support
- Debugging is painful (no source maps)
- Magic globals without types

**Our Approach**: Markdown for content, JSX for components. Use JavaScript for logic.

### Framework-Agnostic Reactivity

**Idea**: Support React, Vue, Preact, Solid, Alpine, etc.

**Why Not**:
- Complexity explosion (different APIs, lifecycles, build tools)
- Goes against "learning first" principle
- Maintenance nightmare for one person
- We're not building Astro

**Our Approach**: Pick one framework (Solid), understand it deeply.

### Custom Partial Hydration System

**Idea**: Build client directives like `client:load`, `client:visible`, `client:idle`

**Why Not**:
- Web components already provide hydration via `connectedCallback()`
- Intersection Observer already exists for lazy loading
- Months of work for marginal benefit
- Not the interesting part of the learning

**Our Approach**: Use web components. Add Intersection Observer later if needed.

### Virtual DOM

**Examples**: React, Preact, Vue

**Why Not**:
- Solid's fine-grained reactivity is more efficient
- Larger bundle sizes (reconciliation overhead)
- We're shipping runtime to browser - size matters

**Our Approach**: Solid's compile-time optimizations + fine-grained reactivity.

### Multi-Framework Islands

**Idea**: Mix React, Vue, Solid islands on same page

**Why Not**:
- Shipping multiple runtimes (React 45kb + Vue 33kb + Solid 7kb = 85kb!)
- Supporting multiple build pipelines
- Complexity with no learning benefit for this project

**Our Approach**: Solid only. If you need different framework, fork the project.

### Backward Compatibility

**Idea**: Maintain compatibility across versions

**Why Not**:
- This is an experimental project
- Early stage - APIs will change
- Slows down iteration and learning

**Our Approach**: Move fast, break things, document learnings.

---

## 🎨 Architectural Patterns

### Pattern 1: Web Components as Island Containers

**Code**:
```javascript
class CounterComponent extends HTMLElement {
  connectedCallback() {
    const props = this.getAttributeProps();
    render(() => <Counter {...props} />, this);
  }
}
```

**Why**: Browser handles instantiation, lifecycle, and cleanup. We just render Solid inside.

### Pattern 2: Shared Runtime, Separate Islands

**Code**:
```html
<!-- One runtime for entire page -->
<script src="/vendor/solid-runtime.js"></script>

<!-- Individual islands -->
<script src="/components/counter.js"></script>
<script src="/components/form.js"></script>
```

**Why**: Solid runtime is shared across all islands. Only pay the 7kb cost once per page.

### Pattern 3: Progressive Enhancement (Future)

**Code**:
```html
<!-- Server-rendered HTML works without JS -->
<counter-component initial="5">
  <p>Count: 5</p>
  <button>+</button>
</counter-component>

<!-- JS enhances with interactivity -->
<script src="/components/counter.js"></script>
```

**Why**: Content visible immediately. Interactivity added when JS loads.

### Pattern 4: Attributes → Props Conversion

**Code**:
```javascript
// HTML: <counter-component initial="5" step="2">
getAttributeProps() {
  return {
    initial: Number(this.getAttribute('initial')) || 0,
    step: Number(this.getAttribute('step')) || 1,
  };
}
```

**Why**: HTML attributes are strings. Need type coercion for JavaScript props.

### Pattern 5: Build-Time Wrapper Generation

**Input**: `islands/counter.jsx` (Solid component)

**Output**: `dist/components/counter.js` (Web component wrapper)

**Why**: User writes clean Solid code. Build generates boilerplate.

---

## 🛠️ Technical Decisions

### Decision 1: Solid.js for Islands

**Options Considered**:
- bare-signals (2kb) - Educational but limited
- Preact (4kb) - Small but VDOM overhead
- Alpine (10kb) - Attribute-based, not component-focused
- Solid (7kb) - Fine-grained reactivity, JSX support

**Decision**: Solid.js

**Reasoning**:
- Fine-grained reactivity (no VDOM diffing)
- JSX support (familiar, TypeScript-friendly)
- Small runtime (~7kb)
- Full component ecosystem (routing, state, etc.)
- Compiler optimizations

### Decision 2: Web Components for Hydration

**Options Considered**:
- Custom partial hydration (Astro approach)
- Framework-specific hydration (React.hydrate)
- Web components (native browser API)

**Decision**: Web components

**Reasoning**:
- Browser handles lifecycle automatically
- No custom hydration infrastructure needed
- Standard API, good browser support
- Natural isolation boundary for islands

### Decision 3: esbuild for JSX Compilation (Likely)

**Options Considered**:
- esbuild - Well-tested, plugin ecosystem
- Bun - Native JSX, faster, simpler API
- Babel - Too slow, too complex

**Decision**: Leaning toward esbuild, may try Bun

**Reasoning**:
- esbuild is battle-tested and fast
- Solid plugin exists for esbuild
- Bun is interesting but less mature
- Can always switch later

### Decision 4: islands/ Directory for JSX Files

**Options Considered**:
- Mix `.jsx` and `.component.js` files
- Dedicated `islands/` directory
- Flexible (anywhere, detect by extension)

**Decision**: Dedicated `islands/` directory

**Reasoning**:
- Clear separation (vanilla JS components vs Solid islands)
- Easy to glob for build system
- Conventional (Astro uses this pattern)
- Future: different build pipelines for different types

### Decision 5: CSS Modules (Probably)

**Options Considered**:
- Shadow DOM - True encapsulation but complex theming
- Global styles - Simple but naming conflicts
- CSS Modules - Build-time solution, scoped classes

**Decision**: Leaning toward CSS Modules

**Reasoning**:
- Scoped by default, global when needed
- No Shadow DOM complexity
- Good TypeScript support
- Build-time solution (no runtime overhead)

**Not Decided**: Still exploring. May start with global styles and add CSS Modules later.

---

## 📈 Exploration Timeline

### Phase 1: Framework Evaluation (Months Ago)

**Activities**:
- Explored Eleventy, Astro, Hugo, Jekyll
- Questioned framework complexity vs value
- Concluded: DIY beats learning framework quirks for simple use case

**Outcome**: Decision to build own SSG to understand fundamentals.

### Phase 2: Building Fundamentals (Recent Weeks)

**Activities**:
- Built core SSG engine (~200 LOC)
- Implemented plugin system
- Added markdown conversion, dev server, live reload
- Achieved: Working SSG that builds markdown to HTML

**Outcome**: Understanding of SSG mechanics without framework magic.

### Phase 3: Reactivity Exploration (Past Week)

**Activities**:
- Built bare-signals (~167 LOC) to understand primitives
- Studied Mastro Reactive, Brisa, Astro patterns
- Discovered web components as hydration mechanism
- Chose Solid.js for production islands

**Outcome**: Clear path forward - Solid inside web components.

### Phase 4: Current Focus (Now)

**Activities**:
- Planning JSX compilation pipeline
- Designing web component wrapper generation
- Preparing to integrate Solid.js

**Next Steps**:
1. Proof of concept (counter island)
2. Build pipeline integration
3. Complex island test
4. Bundle size measurement

---

## 🎓 Learning Resources & Inspiration

### Frameworks Studied

**Mastro Reactive**: Minimal approach, progressive enhancement, HTML web components

**Brisa**: Build-time signal optimizations, transferable store patterns

**Astro**: Islands architecture, client directives API, multi-framework support

**Eleventy**: Static-first philosophy, plugin ecosystem patterns

### Key Concepts Learned

**Signals**: Reactive primitives (state, effects, memos) - learned by building bare-signals

**Islands Architecture**: Isolated interactive regions in static pages

**Web Components**: Native browser API for custom elements with lifecycle hooks

**Fine-Grained Reactivity**: Solid's approach vs VDOM reconciliation

**Progressive Enhancement**: Server-rendered HTML enhanced with client JS

### Conversations That Shaped Direction

- Framework evaluation → DIY decision
- SSG fundamentals implementation
- Reactivity exploration → Solid.js choice
- Web components discovery → no custom hydration needed

---

## 🔮 Future Considerations

### TypeScript Support

**Status**: Not started

**Approach**:
- `.tsx` files for islands
- Type-safe props with interfaces
- May generate types from component metadata

**Priority**: Medium (after JSX compilation works)

### CSS Solution

**Status**: Open question

**Options**: Shadow DOM, global styles, CSS Modules

**Priority**: Low (can start with global styles)

### Lazy Loading Islands

**Status**: Not started

**Approach**: Intersection Observer for below-fold islands

**Priority**: Low (optimization, not core feature)

### Server-Side Rendering

**Status**: Not planned

**Rationale**: Static site - everything is already "server rendered" as HTML

**Exception**: May add for island content if needed for SEO

### Build-Time Optimizations

**Status**: Future

**Ideas**:
- Tree-shake unused Solid features
- Dead code elimination
- Minification strategies
- Content-based cache busting

**Priority**: Low (optimize for understanding first, performance later)

---

## 💭 Open Questions

### 1. Props Validation

Should we validate props at runtime or rely on TypeScript?

**Options**:
- Runtime validation (add bundle size)
- TypeScript only (no runtime cost)
- Component metadata (optional validation)

### 2. Error Boundaries

How should Solid errors in islands be handled?

**Options**:
- Let errors crash the island (fail loudly)
- Error boundary per island (graceful degradation)
- Global error handler

### 3. Island Communication

How should islands communicate if needed?

**Options**:
- Custom events (dispatchEvent/addEventListener)
- Shared state in window object
- Don't - islands should be isolated

**Leaning toward**: Custom events for rare cases, prefer isolation.

### 4. Development Mode

Should dev mode be different from production?

**Options**:
- Same - simplicity
- Different - better DX (HMR, verbose errors)

**Leaning toward**: Start same, add dev-specific features if needed.

---

## 🎯 Success Metrics

### Understanding (Primary Goal)

- ✅ Understand how SSG works (file routing, markdown parsing, templating)
- ✅ Understand signals and reactive primitives
- ⏳ Understand JSX compilation and code generation
- ⏳ Understand islands architecture in practice

### Implementation (Secondary Goal)

- ✅ Working SSG that builds markdown to HTML
- ✅ Plugin system for extensibility
- ✅ Working vanilla JS components
- ⏳ Working Solid JSX islands
- ⏳ Competitive bundle sizes vs Astro

### Documentation (Tertiary Goal)

- ⏳ Document architecture decisions
- ⏳ Write guides for common patterns
- ⏳ Share learnings publicly

---

*This document captures the "why" behind bare-static. Update it when discoveries are made or decisions change. It's a living document that should evolve with the project.*
