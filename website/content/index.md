# bare-static

A minimal markdown-based static site generator with optional interactive islands.

- **Fast** - Pure markdown, zero JavaScript by default
- **Simple** - No config, just a directory of `.md` files
- **Extensible** - Add interactive islands with Preact or Solid.js when needed
- **Small** - ~30kb total with runtimes

## Plugins

Add interactivity only where you need it:

- [bare-islands-preact](/bare-islands-preact.html) - Lightweight Preact components (~4kb runtime)
- [bare-islands-solid](/bare-islands-solid.html) - Reactive Solid.js components (~7kb runtime)

Here's an interactive Solid.js counter island:

<counter-solid></counter-solid>

Here's a Preact counter island:

<counter-preact></counter-preact>

## Quick Start

```bash
npm install @vktrz/bare-static
```

Create `bare.config.js`:

```javascript
export default {
	plugins: [],
};
```

Create `content/index.md`:

```markdown
# Hello World

This is a static page.
```

Build:

```bash
bare-static build
```

Output goes to `dist/`.

## Philosophy

- **Keep it simple** - No scope creep, only what's useful
- **Keep it small** - No edge case coverage, lean dependencies
- **Keep it readable** - No "hacks" to reduce LOC
- **Good DX** - Nice logging, proper error handling, live reload
- **No defensive programming** - Startup failures crash with native errors

## Learn More

Check out the [plugin documentation](/bare-islands-preact.html) to see how to add interactive components to your pages.
