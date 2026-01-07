# @vktrz/bare-islands

Plugin for [@vktrz/bare-static](https://www.npmjs.com/package/@vktrz/bare-static) that enables interactive islands architecture with web components.

## What It Does

The bare-islands plugin automatically:

- Discovers `*.component.js` files in your `./components` directory
- Copies them to the build output
- Injects `<script>` tags only on pages that use them
- Handles dependency copying (like bare-signals)

This keeps the core SSG minimal while providing interactive capabilities for those who need them.

## Installation

```bash
npm install @vktrz/bare-islands
```

## Usage

Create a `bare.config.js` file in your project root:

```javascript
import { bareIslands } from "@vktrz/bare-islands";

export default {
	plugins: [bareIslands()],
};
```

Create your web components in `./components/` using the `*.component.js` naming pattern:

```javascript
// components/counter.component.js
import { createSignal, createEffect } from "/vendor/bare-signals.js";

class CounterComponent extends HTMLElement {
	connectedCallback() {
		const [count, setCount] = createSignal(0);

		const button = document.createElement("button");
		button.onclick = () => setCount(count() + 1);

		createEffect(() => {
			button.textContent = `Count: ${count()}`;
		});

		this.appendChild(button);
	}
}

customElements.define("counter-component", CounterComponent);
```

Use the component in your markdown:

```markdown
# My Page

<counter-component></counter-component>
```

## Options

```javascript
bareIslands({
	componentsDir: "./components", // Default: './components'
});
```

## How It Works

The plugin uses the bare-static plugin system with two hooks:

- **`onBuild()`** - Discovers `*.component.js` files in components directory and copies them to `dist/components/`
- **`getScripts()`** - Analyzes each page's content and returns `<script type="module">` tags **only for components used on that page**

### Smart Component Loading

The plugin automatically detects which components are used on each page by scanning for custom element tags (tags with hyphens like `<counter-component>`). Only the necessary scripts are injected, improving performance by avoiding unused JavaScript.

**Example:**

- `index.md` contains `<counter-component>` → gets counter.component.js script
- `about.md` has no components → gets no component scripts

This "islands architecture" means interactive components are loaded only where needed.

### Component Naming Convention

Component files **must** use the `*.component.js` naming pattern. The file name (minus `.component.js`) becomes the element name:

- `counter.component.js` → `<counter-component>`
- `my-widget.component.js` → `<my-widget-component>`

**Files ignored (won't be copied):**

- `utils.js` - no `.component.js` suffix
- `helpers.js` - no `.component.js` suffix
- `counter.test.js` - no `.component.js` suffix

This ensures only actual components are included in your build, keeping it clean and performant.

## Requirements

- Node.js >= 24.0.0
- @vktrz/bare-static >= 1.0.0

## Philosophy

This plugin follows the bare-static philosophy:

- **Keep it simple** - No complex configuration
- **Keep it small** - Minimal code, maximum clarity
- **Error on real problems** - Silent when nothing to do
- **No defensive programming** - Trust the file system

## License

MIT
