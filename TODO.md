# Roadmap

Should probably think of a better naming for the core package. And update naming for plugins (plugin-solid, plugin-*)

## Focus 

- [ ] [core] JSX for layouts, templating, static components
- [ ] [core] configurable paths (output, content)
- [ ] [core]: Watch all files, rebuild on change (config, content, components
- [ ] TSX support (core and plugins)
- [ ] [plugin] Explore micro-frameworks (LitHTML, HyperHTML, IncrementalDOM, modern alternatives)
- [ ] [core] Watch `.t|jsx` files, rebuild on change
- [ ] [plugin] code syntax highlight
- [ ] Lazy load islands (Intersection Observer for below-fold islands)
- [ ] Consider preloading framework runtime for critical islands 
- [ ] Consider static > island swapping to avoid layout jump

---

## 📚 Documentation

### High Priority Docs

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

- [ ] Test suite for bare-islands-\* plugins
- [ ] Test island mounting/unmounting in web components
- [ ] Test nested components inside island
- [ ] Test one complex Solid island (routing, state, API calls)
