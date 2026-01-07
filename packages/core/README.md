# Bare Static

A minimal markdown-to-HTML generator that happens to work.

Exploring what it takes to build a minimal static site generator tool.


## Features

✓ Converts markdown files to HTML

✓ Dev server with live reload


## Quick Start
Install: `npm i @vktrz/bare-static`

Add scripts to `package.json`:
```json
"scripts": {
    "dev": "bare-static",
    "build": "bare-static build"
}
```

## Requirements

At the root of the project, add `content/` folder with `.md` files, and a `template.html` with `{{title}}` and `{{content}}` placeholders.

Example: https://github.com/ViktorZhurbin/bare-static/tree/main/packages/website

## How It Works

**builder.js**:
- Async build logic with parallel file processing

**dev.js**:
- Dev server serving static files
- Watches `content/`, rebuilds and reloads page on file change

**live-reload.js**:
- Client-side script for live reload in dev mode
- Connects to `/events` endpoint of dev server for real-time updates
- Automatically reloads page when server pushes 'reload' event
