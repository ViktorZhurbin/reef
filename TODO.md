# Roadmapp

## Clean up and better organize lib and utils folders

## Configurable paths
Use reef.config.js file to configure output, content and other directories (current defaults are in `constants/dir.js`)

## JSX Pages - v2

Allow layout wrapping in pages/.

- Same logic as the current data-cascade: default > reef.js > frontmatter, but with `metadata` instead of frontmatter
- Pass all metadata fields as props to layout


1. **Metadata exports** - Title, layout selection, custom fields
   ```jsx
  export const metadata = {
      title: 'Welcome',
      layout: 'default'
    };

    export default function Landing() {
      return (
        <main>
          <h1>Welcome to Reef</h1>
          <counter-solid></counter-solid>
        </main>
      );
    }
   ```
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

- [ ] Add `reef create <project-name>` CLI command (new project scaffold)
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
