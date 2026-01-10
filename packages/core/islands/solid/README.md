# islands-solid

Create Solid components in `islands-solid/`:

```jsx
// islands-solid/counter.jsx
import { createSignal } from "solid-js";

export default function Counter(props) {
	const [count, setCount] = createSignal(props.initial ?? 0);

	return (
		<div>
			<p>Count: {count()}</p>
			<button onClick={() => setCount(count() + 1)}>Increment</button>
		</div>
	);
}
```

Use components in markdown, named as `{filename}-solid`:

```markdown
# My Page

<counter-solid></counter-solid>
```

## How It Works

- Discovers `.jsx` and `.tsx` files in `islands-solid/`
- Compiles them to web components using `solid-element`
- Loads Solid runtime from CDN via import maps
- Injects scripts only on pages that use the components

Element naming: `counter.jsx` → `<counter-solid>`

## Use with Other Frameworks

You can use multiple island plugins together. If you have `islands-solid/counter.jsx` and `islands-preact/counter.jsx`, both frameworks can coexist on the same page: just add `<counter-solid>` and `<counter-preact>` to your markdown.
