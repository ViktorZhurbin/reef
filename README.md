# Micro Blog

A minimal markdown-to-HTML blog generator with only 1 dependency.

## Features

- ✓ Converts markdown files to HTML
- ✓ Dev server with live reload
- ✓ Only 1 npm dependency (`marked`)
- ✓ ~150 lines of code total
- ✓ Built with Node.js built-ins

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
├── scripts/          # Client-side JavaScript files
│   └── live-reload.js
├── dist/            # Generated .html files
├── template.html    # HTML template with {{title}} and {{content}} placeholders
├── build.js         # Converts markdown to HTML
├── server.js        # Dev server with file watcher
└── package.json     # Just one dependency: marked
```

## Usage

### Writing Posts

1. Create a `.md` file in the `content/` folder
2. Write your content in markdown
3. Run `npm run build` or `npm run dev`
4. Find your HTML in `dist/`

### Development

The dev server watches for changes in `content/` and automatically rebuilds. The browser will reload when changes are detected.

### Production

Run `npm run build` to generate HTML files, then deploy the `dist/` folder to any static host.

## How It Works

**template.html**:
- HTML template with `{{title}}` and `{{content}}` placeholders
- Easy to customize - just edit the HTML file
- Includes basic styling for clean typography

**build.js** (~20 lines):
- Reads `template.html` and all `.md` files from `content/`
- Converts markdown to HTML using `marked`
- Replaces placeholders in template
- Writes files to `dist/`

**server.js** (~40 lines):
- Runs the build process
- Watches `content/` for changes
- Serves files from `dist/` via HTTP
- Reads `scripts/live-reload.js` and injects it into HTML
- Provides `/reload-check` endpoint for live reload polling

**scripts/live-reload.js**:
- Client-side script for browser live reload
- Polls server every 2 seconds for changes
- Automatically reloads page when content updates

## Why So Minimal?

This project demonstrates that you don't need complex frameworks or build tools to create a static site generator. Just Node.js built-ins and one tiny dependency.
