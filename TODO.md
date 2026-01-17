# Reef Roadmap

## 🏗️ Core Architecture

### is-land

Decision: Try is-land library first

- [ ] Wrap components in <is-land on:visible> during build
- [ ] Add is-land.js to import maps
- [ ] Register framework init types (preact/solid)

Alternative: Build custom ReefIsland if is-land feels limiting

- [ ] IntersectionObserver for on:visible
- [ ] requestIdleCallback for on:idle
- [ ] Promise-based state machine (~60 LOC)

### Code Organization

- [ ] Extract shared compilation logic (layouts + islands + pages)

---

## 🎨 Features

### JSX Pages v2 - Layout Support

- [ ] Support CSS imports!
- [ ] Support component imports!




### Configuration

- [ ] Make paths configurable via reef.config.js
  - `contentDir`, `pagesDir`, `layoutsDir`, `outputDir`
  - Currently hardcoded in constants/dir.js

### Error Handling

- [ ] Better error messages ("Island X used but not found in islands-*/")
- [ ] Validate JSX compilation errors with helpful context
- [ ] Catch routing conflicts (pages/about.jsx + content/about.md)

### Developer Experience

- [ ] reef create <project-name> CLI command (scaffold new projects)
- [ ] Improved dev server logging (clearer rebuild messages)


## 🔬 Research & Learning

### Explore Similar Projects

- Astro
- 11ty
- SolidStart, SvelteKit - DX, conventions, approach to SSG
- Fresh (Deno) - Islands without build step
- Lume - Modern 11ty-style SSG with JSX
- Lit - Native web components reactivity
- Vite, esbuild, Parcel - for plugin architecture

## 📚 Documentation

### User Guides

- [ ] Quick start: "From static to your first island"
- [ ] Folder structure and routing conventions
- [ ] Config file reference (reef.config.js)

### Island Usage

- [ ] Component naming conventions (Counter.jsx → counter-solid)
- [ ] Props and attributes (how to pass data to islands)
- [ ] Web component wrapper pattern explanation

### Examples

- [ ] Simple nested components
- [ ] Complex example: mini dashboard with multiple islands
- [ ] Real-world: Build reef's own docs site with reef

## ⚡ Production Ready

### Performance

- [ ] Minify JS in production builds

```js
// In island compilers
await esbuild.build({
  // ... existing config
  minify: process.env.NODE_ENV === 'production',
});
```

- [ ] Content hash in filenames (cache busting).
```js
// Only rebuild changed files
const cache = new Map();
if (cache.get(filePath) === hash(content)) {
  return; // Skip rebuild
}
```
- [ ] CSS bundling and optimization
```js
// Granular updates (CSS without page reload)
if (changedFile.endsWith('.css')) {
  broadcast({ type: 'css-update', href: '/styles.css' });
} else {
  broadcast({ type: 'reload' });
}
```

### Testing

- [ ] Define testing strategy (unit? integration? e2e?)
- [ ] Test island detection and injection
- [ ] Test layout resolution cascade

## 🧹 Polish

### Routing

- [ ] Research Astro, 11ty, etc routing conventions
- [ ] Handle duplicate routes (pages/ vs content/)
- [ ] Document routing priority/conflicts

### Refactoring

- [ ] Extract duplicate compilation logic
- [ ] Simplify plugin API surface
- [ ] Review complexity added this week
