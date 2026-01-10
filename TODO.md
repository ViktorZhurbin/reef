# Roadmap

## 🎯 Meta

- Should probably think of a better naming for the core package. And update naming for plugins (plugin-solid, plugin-\*)

---

## 🚀 Core Features

### Configuration

- [ ] Configurable paths (output, content)

---

## 🏝️ Plugin Features

### Islands Architecture

- [ ] Lazy load islands (Intersection Observer for below-fold islands)
- [ ] Consider preloading framework runtime for critical islands
- [ ] Consider static > island swapping to avoid layout jump

### Plugin Development

- [ ] Explore micro-frameworks (LitHTML, HyperHTML, IncrementalDOM, modern alternatives)
- [ ] Code syntax highlight

---

## 📚 Documentation

### High Priority Docs

- Update and unify plugin docs format
- [ ] Document JSX component conventions (file naming, props)
- [ ] Document main conventions (folder structure, naming, config options, templating)
- [ ] Document web component wrapper pattern
- [ ] Quick start guide: "Your first island"

### Examples

- [ ] Counter (basic signal usage)
- [ ] Form with validation (effects, multiple signals)
- [ ] Nested components - create a mini dashboard

---

## 🛠️ Developer Experience

- [ ] Add `bare-static create <project-name>` CLI command (new project scaffold)
- [ ] Better error messages (e.g., "Island X used but not found")
- [ ] Validate JSX compilation errors (helpful error messages)

---

## ⚡ Performance

- [ ] Minify js in production
- [ ] Bundle frameworks at build, instead of CDN?
- [ ] Add cache busting (content hash in filenames)
- [ ] Tree-shake unused Solid features (only ship what islands use)?

---

## 🧪 Testing

### Core Tests

- [ ] Test suite for islands plugins
- [ ] Test island mounting/unmounting in web components
- [ ] Test nested components inside island
- [ ] Test one complex Solid island (routing, state, API calls)
