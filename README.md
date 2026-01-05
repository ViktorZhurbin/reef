# Micro Blog

A minimal markdown-to-HTML blog generator that happens to work.

## Philosophy & Constraints

This project explores the **minimum** needed for a static site generator. It's an exercise in simplicity.

### Core Principles

**What We Optimize For:**
- Minimal dependencies
- Good DX
- Keep it small and readable
- Simple mental model (.md > .html)

**What We Explicitly Don't Care About:**
- Edge case handling
- Production-grade error recovery
- Perfect developer ergonomics
- Enterprise features

### Rules to Stay Minimal

1. **Avoid new dependencies** - unless they're tiny and solve security/correctness issues
2. **No defensive programming** - let it fail visibly when misconfigured
3. **No features "for later"** - solve real problems, not hypothetical ones
4. **Prefer simple over clever** - avoid abstractions until pain is clear
5. **Document assumptions** instead of handling edge cases

**Bloat detection:** If the codebase grows beyond ~300 lines of actual code (`npm run loc`), something went wrong.

### Why Polka + sirv?

We chose these micro-frameworks over pure Node.js because:
- **Correctness**: MIME type detection, path traversal security, range requests are easy to get wrong
- **Tiny**: Total added weight is ~320KB (polka 36KB + sirv 76KB + utilities)
- **Battle-tested**: Used by SvelteKit, Vite, and thousands of projects
- **Less code**: Reduced server from 95+ lines of manual handling to ~78 lines
- **Better DX**: Express-like routing is more readable than manual `if (req.url === ...)`

This isn't "adding a framework" - it's delegating security-critical file serving to experts.

This isn't a framework. It's a learning tool that happens to work.

## Features

- ✓ Converts markdown files to HTML
- ✓ Dev server with live reload via SSE
- ✓ Minimal dependencies: `marked` (parser), `polka` (routing), `sirv` (static files)
- ✓ Fast, secure static file serving with proper MIME types

## Quick Start

```bash
# Install dependency
npm install

# Build static HTML files
npm run build

# Run dev server with live reload
npm run dev
```

Then open http://localhost:3000 in your browser.

## Project Structure

```
/
├── content/          # Your .md files go here
├── src/          # Build and dev scripts
│   ├── build.js      # Production build script
│   ├── server.js     # Dev server with live reload
│   ├── live-reload.js # Client-side SSE live reload
│   └── lib/              # Shared build utilities
│        └── builder.js    # Async build logic with parallel processing
├── dist/             # Generated .html files
├── template.html     # HTML template with placeholders
└── package.json      # Dependencies: marked, polka, sirv
```

## Usage

### Writing Posts

1. Create a `.md` file in the `content/` folder
2. Run `npm run build` or `npm run dev`
3. Find your HTML in `dist/`

### Development

The dev server watches for changes in `content/` and automatically rebuilds.

### Production

Run `npm run build` to generate HTML files, then deploy the `dist/` folder to any static host.

## How It Works

**template.html**:
- HTML template with `{{title}}` and `{{content}}` placeholders
- Includes basic styling for clean typography

**lib/builder.js** (~130 lines):
- Async build logic with parallel file processing using native `fsPromises.glob()`

**server.js** (~78 lines):
- Dev server built with Polka (Express-like framework)
- Watches `content/` and rebuilds only the changed file
- SSE endpoint at `/events` for live reload notifications
- Static file serving via `sirv` with automatic MIME types, caching, and security
- Handles range requests, path traversal protection, index fallbacks

**live-reload.js** (~10 lines):
- Client-side script using EventSource API
- Connects to `/events` endpoint for real-time updates
- Automatically reloads page when server pushes 'reload' event
