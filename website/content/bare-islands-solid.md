# bare-islands-solid

Plugin for bare-static that adds interactive Solid.js components as web components.

## What It Does

- Discovers `*.jsx` and `*.tsx` files in your `./islands` directory
- Compiles them using Babel and esbuild
- Wraps them as web components using `solid-element`
- Injects `<script>` tags **only on pages that use them**
- Adds import maps for Solid.js runtime from CDN

Solid.js is reactive and compact (~7kb), making it great for interactive islands with minimal overhead.

## Installation

```bash
npm install @vktrz/bare-islands-solid solid-js
```

## Setup

Create `bare.config.js`:

```javascript
import { bareIslandsSolid } from "@vktrz/bare-islands-solid";

export default {
  plugins: [bareIslandsSolid()],
};
```

Create your component in `./islands/counter.jsx`:

```javascript
import { createSignal } from "solid-js";

export default function Counter(props) {
  const [count, setCount] = createSignal(props.initial ?? 0);

  return (
    <div>
      <p>Count: {count()}</p>
      <button onClick={() => setCount(count() + 1)}>
        Increment
      </button>
    </div>
  );
}
```

Use it in your markdown:

```markdown
# My Page

<counter-solid></counter-solid>
```

## How It Works

The plugin automatically:

1. Finds all `.jsx`/`.tsx` files in `./islands/`
2. Compiles them to web components
3. Scans each page's markdown for custom element tags
4. Injects scripts **only for components used on that page**

This means:
- `index.md` with `<counter-solid>` gets the counter script
- `about.md` with no components gets no scripts
- Zero JavaScript overhead on pages without islands

## Component Naming

File name → Custom element name:
- `counter.jsx` → `<counter-solid>`
- `my-widget.jsx` → `<my-widget-solid>`

The `-solid` suffix prevents conflicts with other framework plugins like `bare-islands-preact`.

## Coexist with Other Frameworks

Use Solid.js and Preact on the same page:

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
bareIslandsSolid({
  islandsDir: "./islands", // Directory with components
});
```

## Bundle Size

- **Solid.js runtime**: ~7kb
- **Preact runtime**: ~4kb (for comparison)
- **React runtime**: ~45kb (for comparison)

## Requirements

- Node.js >= 24.0.0
- @vktrz/bare-static >= 1.0.0
- solid-js >= 1.0.0

[Back to home](/index.html)
