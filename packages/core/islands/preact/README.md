# islands-preact

Create Preact components in `islands-preact/`:

```jsx
// islands-preact/counter.jsx
import { useState } from "preact/hooks";

export default function Counter(props) {
	const [count, setCount] = useState(props.initial ?? 0);

	return (
		<div>
			<p>Count: {count}</p>
			<button onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	);
}
```

Use components in markdown, named as `{filename}-preact`:

```markdown
# My Page

<counter-preact></counter-preact>
```

## How It Works

- Discovers `.jsx` and `.tsx` files in `islands-preact/`
- Compiles them to web components using `preact-custom-element`
- Loads Preact runtime from CDN via import maps (~4kb)
- Injects scripts only on pages that use the components

Element naming: `counter.jsx` → `<counter-preact>`

## Use with Other Frameworks

You can use multiple island plugins together. If you have `islands-solid/counter.jsx` and `islands-preact/counter.jsx`, both frameworks can coexist on the same page: just add `<counter-solid>` and `<counter-preact>` to your markdown.
