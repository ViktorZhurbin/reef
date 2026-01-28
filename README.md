# Castro

*An educational framework for understanding island architecture*

Castro is a working Static Site Generator that implements island architecture in under 1300 lines of well-commented, readable code. The communist theme makes it memorable. The architecture lessons are real.

**Learn by reading code, not documentation.**

## What Is This?

Island architecture is how modern frameworks (Astro, Fresh, Qwik) achieve great performance. Instead of shipping JavaScript for your entire page, you selectively hydrate only the interactive components. The rest stays as static HTML.

Castro shows you exactly how this works by implementing it from scratch.

In essence, Castro splits the render tree **at build time** into:
1. static HTML
2. interactive islands (pre-rendered + hydrated on demand)

## What You'll Learn

Reading through Castro's codebase, you'll understand:

- **Island Architecture** - How to selectively hydrate components
- **SSR/SSG** - Build-time vs runtime rendering strategies
- **Progressive Enhancement** - Static HTML first, JavaScript on demand
- **Web Components** - Using custom elements as hydration boundaries
- **Build Tools** - How esbuild compilation pipelines work
- **Dev Servers** - File watching, live reload via SSE
- **Plugin Systems** - Extensible architecture patterns

The code is extensively commented to explain not just *what* it does, but *why* and *how*.

## Quick Start

```bash
npm install @vktrz/castro preact
```

**Project structure:**
```
my-site/
├── manifesto.js       # Optional config
├── pages/             # Your content (.md, .jsx, .tsx)
│   └── index.md
├── layouts/           # Page layouts (.jsx, .tsx)
│   └── default.jsx
├── components/        # Static reusable components (.jsx, .tsx)
│   └── Button.jsx
└── islands/           # Interactive components (.jsx, .tsx)
    └── counter.tsx
```

**Component types:**
- **`components/`** - Static UI components, server-side only, no JS shipped to client
- **`islands/`** - Interactive components that ship JavaScript to the browser
- Use `components/` for headers, footers, buttons, cards, etc.
- Use `islands/` only when you need client-side interactivity

**Add scripts to package.json:**
```json
{
  "scripts": {
    "dev": "castro",
    "build": "castro build"
  }
}
```

**Create a layout** (`layouts/default.jsx`):
```jsx
export default ({ title, content }) => (
  <html>
    <head>
      <title>{title}</title>
    </head>
    <body dangerouslySetInnerHTML={{ __html: content }} />
  </html>
);
```

**Create a page** (`pages/index.md`):
```markdown
---
title: My Site
---
# Hello World

This is static HTML. Fast to load, no JavaScript needed.
```

**Create reusable components** (`components/Button.jsx`):
```jsx
export function Button({ href, children }) {
  return <a href={href} className="btn">{children}</a>;
}
```

Import components in pages, layouts, or islands:
```jsx
import { Button } from "../components/Button.jsx";

export default function Home() {
  return (
    <div>
      <Button href="/about">Learn More</Button>
    </div>
  );
}
```

**Add an island** (`islands/counter.tsx`):
```tsx
import { useState } from "preact/hooks";

export default function Counter({ initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Use the island** in any page:
```jsx
<preact-counter data-initial-count="5" />
```

Run `npm run dev` and visit `http://localhost:3000`.

## The Revolutionary Directives

While learning, you get communist-themed hydration directives:

- **`comrade:visible`** - Hydrate when scrolled into view (default)
  *"Only work when the people are watching"*

- **`lenin:awake`** - Hydrate immediately on page load
  *"The leader is always ready"*

- **`no:pasaran`** - Static render only, no JavaScript shipped
  *"They shall not pass (to the client)"*

These map to standard island patterns. The names just make them more memorable while learning.

Example usage:
```jsx
<castro-island lenin:awake import="/components/counter.js">
  <preact-counter data-count="0" />
</castro-island>
```

(Note: Castro wraps islands automatically, you just write `<preact-counter>`)

## How It Works

1. **Build time**: Castro compiles your pages and islands
   - Markdown/JSX pages → HTML
   - Island components → Separate JS bundles
   - SSR renders islands to static HTML

2. **Browser receives**: Pure HTML with `<castro-island>` wrappers
   - Page loads instantly
   - No JavaScript executed yet

3. **Hydration triggers**: Based on directive
   - `comrade:visible`: When scrolled into viewport
   - `lenin:awake`: Immediately
   - `no:pasaran`: Never (stays static)

4. **Island loads**: JavaScript downloaded and component becomes interactive

Result: Fast initial page load, progressive enhancement, minimal JavaScript.

## Why "Castro"?

Because learning complex architectural patterns should be memorable. The communist satire is a wrapper around serious educational code.

The framework is real. The performance benefits are real. The puns just make it stick in your memory while you read the implementation.

## Project Status

Castro is an educational project. It's a real, working SSG that you can use, but the primary goal is teaching. Use it to:

- Learn how island architecture works internally
- Understand modern SSG compilation pipelines
- See Web Components as hydration boundaries
- Study a complete but minimal build tool

For production projects, consider [Astro](https://astro.build) or [Fresh](https://fresh.deno.dev).

## Documentation

The code is the documentation. Start reading from:

- `castro/src/cli.js` - Entry point
- `castro/src/build/builder.js` - Build orchestration
- `castro/src/islands/` - Island architecture implementation
- `castro/src/dev/server.js` - Development server

Every file has detailed comments explaining the implementation.

## Contributing

This is an educational project. PRs welcome if they:

- **Improve code clarity/comments** - Make it easier to learn from
- **Fix bugs** - Keep it working correctly
- **Enhance educational value** - Better examples, clearer explanations
- **Add tutorial content** - Help others learn

Joke PRs are fun but secondary to learning value.

## Requirements

- Node.js 24+
- Preact 10+ (peer dependency)

## License

MIT - The people's license

---

*"From each component according to its complexity, to each page according to its needs."*
