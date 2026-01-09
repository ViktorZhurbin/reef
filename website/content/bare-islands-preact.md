# bare-islands-preact

Plugin for bare-static that adds interactive Preact components as web components.

## What It Does

- Discovers `*.jsx` and `*.tsx` files in your `./islands-preact` directory
- Compiles them using Babel and esbuild
- Wraps them as web components using `preact-custom-element`
- Injects `<script>` tags **only on pages that use them**
- Adds import maps for Preact runtime from CDN

Preact is tiny (~4kb), making it perfect for adding small interactive islands to static pages.

## Installation

```bash
npm install @vktrz/bare-islands-preact preact
```

## Setup

Create `bare.config.js`:

```javascript
import { bareIslandsPreact } from "@vktrz/bare-islands-preact";

export default {
  plugins: [bareIslandsPreact()],
};
```

Create your component in `./islands-preact/counter.jsx`:

```javascript
import { useState } from "preact/hooks";

export default function Counter({ initial = 0 }) {
  const [count, setCount] = useState(initial);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

Use it in your markdown:

```markdown
# My Page

<counter-preact></counter-preact>
```

## How It Works

The plugin automatically:

1. Finds all `.jsx`/`.tsx` files in `./islands-preact/`
2. Compiles them to web components
3. Scans each page's markdown for custom element tags
4. Injects scripts **only for components used on that page**

This means:
- `index.md` with `<counter-preact>` gets the counter script
- `about.md` with no components gets no scripts
- Zero JavaScript overhead on pages without islands

## Component Naming

File name → Custom element name:
- `counter.jsx` → `<counter-preact>`
- `my-widget.jsx` → `<my-widget-preact>`

The `-preact` suffix prevents conflicts with other framework plugins like `bare-islands-solid`.

## Coexist with Other Frameworks

Use Preact and Solid.js on the same page:

```javascript
import { bareIslandsSolid } from "@vktrz/bare-islands-solid";
import { bareIslandsPreact } from "@vktrz/bare-islands-preact";

export default {
  plugins: [
    bareIslandsSolid(),
    bareIslandsPreact(),
  ],
};
```

- `<counter-solid>` for Solid.js islands
- `<counter-preact>` for Preact islands

No conflicts, both work together.

## Options

```javascript
bareIslandsPreact({
  islandsDir: "./islands-preact", // Directory with components
});
```

## Bundle Size

- **Preact runtime**: ~4kb
- **Solid.js runtime**: ~7kb (for comparison)
- **React runtime**: ~45kb (for comparison)

## Requirements

- Node.js >= 24.0.0
- @vktrz/bare-static >= 1.0.0
- preact >= 10.0.0

[Back to home](/index.html)
