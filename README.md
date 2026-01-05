# Micro Blog

A minimal markdown-to-HTML blog generator that happens to work.


## Features

- ✓ Converts markdown files to HTML
- ✓ Dev server with live reload via SSE
- ✓ Minimal dependencies: `marked` (parser), `polka` (routing), `sirv` (static files)


## Philosophy & Constraints

This project explores the **minimum** needed for a static site generator. It's an exercise in simplicity, but with an important note: quality is important and security cannot be neglected.

### Core Principles
1. **Keep it simple** - Just convert `.md` > `.html`
2. **Keep it small** - No edge case coverage, no scope creep. Only use dependencies with high benefits/size ratio
3. **Keep it readable** - No "hacks" to reduce LOC
4. **Good DX** - Nice logging, proper error handling, live reload, etc

**Bloat detection:** So far `src/` folder is under 250 lines of code (`npm run loc`). Keep it low, but not at the expense of the core principles above.


## Quick Start

```bash
# Install dependencies
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

**lib/builder.js**:
- Async build logic with parallel file processing

**server.js**:
- Dev server built with Polka - Handles range requests, path traversal protection, index fallbacks
- Static file serving via `sirv` with automatic MIME types, caching, and security
- Watches `content/` and rebuilds changed files
- SSE endpoint at `/events` for live reload


**live-reload.js**:
- Client-side script using EventSource API
- Connects to `/events` endpoint for real-time updates
- Automatically reloads page when server pushes 'reload' event
