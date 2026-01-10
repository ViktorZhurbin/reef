# Bare Static: Current Roadmap

**Status**: Educational SSG project exploring islands architecture with web components

**Current Focus**: JSX compilation pipeline that wraps JSX components in web components

---

## 📚 Documentation

### High Priority Docs

- [ ] Document JSX component conventions (file naming, props)
- [ ] Document web component wrapper pattern
- [ ] Quick start guide: "Your first island"

### Examples

- [ ] Counter (basic signal usage)
- [ ] Form with validation (effects, multiple signals)
- [ ] Nested components - create a mini dashboard

---

## 🛠️ Developer Experience

- [ ] Add `bare-static create-island <name>` CLI command (generates `.jsx` scaffold)
- [ ] Better error messages (e.g., "Island X used but not found")
- [ ] Validate JSX compilation errors (helpful Solid error messages)
- [ ] Add Solid island template/boilerplate
- [ ] TypeScript support for islands (`.tsx`)
- [ ] Dev mode: Watch `.jsx` files, rebuild on change

---

## ⚡ Performance

- [ ] Minify Solid runtime and island code in production?
- [ ] Add cache busting (content hash in filenames)
- [ ] Bundle Solid runtime separately (shared across all islands)
- [ ] Measure bundle size: bare-static + Solid vs Astro approach
- [ ] Tree-shake unused Solid features (only ship what islands use)
- [ ] Lazy load islands (Intersection Observer for below-fold islands)
- [ ] Consider preloading Solid runtime for critical islands

---

## 🧪 Testing

### Core Tests

- [ ] Test suite for bare-islands-\* plugins
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

## 🎯 Next Milestones

1. **Complex island test**: Validate "no limitations" theory (routing, state, API calls)
2. Better name for the project
3. **Bundle comparison**: Measure bare-static + Solid vs Astro/Fresh
4. **Documentation**: Quick start guide and examples
5. **Polish**: Better errors, CLI commands, TypeScript support
