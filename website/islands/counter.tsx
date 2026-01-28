import { defineIsland } from "@vktrz/castro";
import type { FunctionComponent } from "preact";
import { useState } from "preact/hooks";
import "./counter.css";

interface CounterProps {
	initial?: number;
}

const Counter: FunctionComponent<CounterProps> = ({ initial = 0 }) => {
	const [count, setCount] = useState<number>(initial);

	return (
		<div class="preact-counter">
			<h3>Preact Counter Island</h3>
			<p>Count: {count}</p>
			<div class="buttons">
				<button onClick={() => setCount(count - 1)}>−</button>
				<button onClick={() => setCount(count + 1)}>+</button>
				<button onClick={() => setCount(initial)}>Reset</button>
			</div>
		</div>
	);
};

export default defineIsland(Counter);
