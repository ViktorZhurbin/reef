# Bare Static

A minimalist SSG framework with optional reactivity islands.

## Features

✓ Markdown to HTML

✓ JSX to static HTML 

✓ JSX to interactive components (with plugins for Solid.js, Preact)

✓ Dev server with live reload

✓ Plugins for extensibility (reactivity, code highlight)

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

TODO: needs update

At the root of the project, add `content/` folder with `.md` files, and a `template.html` with `{{title}}` and `{{content}}` placeholders.

Example: https://github.com/ViktorZhurbin/bare-static/tree/main/packages/website

## Plugins

Extend bare-static with plugins via `bare.config.js`:

```javascript
import { bareIslandsSolid } from "@vktrz/bare-islands-solid";
import { bareIslandsPreact } from "@vktrz/bare-islands-preact";

export default {
	plugins: [bareIslandsSolid(), bareIslandsPreact()],
};
```

### Available Plugins

Write regular Solid.js and/or Preact code, and add it as interactive "islands" to static pages. 
You can have components from different frameworks on the same page.

- [plugin-solid](https://github.com/ViktorZhurbin/bare-static/packages/bare-islands-solid)

- [plugin-preact](https://github.com/ViktorZhurbin/bare-static/packages/bare-islands-preact)

### Plugin API

Plugins are objects with optional hooks:

```javascript
export function myPlugin(options = {}) {
	return {
		name: "my-plugin",

		// Called during build - copy files, process assets, etc.
		async onBuild({ outputDir, contentDir }) {
			// Your build logic
		},

		// Returns script tags to inject into pages
		async getScripts({ pageContent }) {
			// pageContent is the markdown source for the current page
			return ['<script src="/my-script.js"></script>'];
		},
	};
}
```
