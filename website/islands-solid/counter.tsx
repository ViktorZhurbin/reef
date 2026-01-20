import { createSignal } from "solid-js";
import "./counter.css";

const Counter = ({ initial }: { initial?: number }) => {
	const [count, setCount] = createSignal<number>(initial ?? 0);

	return (
		<div class="counter-solid">
			<h3>Solid Counter Island</h3>
			<p>Count: {count()}</p>
			<div class="buttons">
				<button onClick={() => setCount(count() - 1)}>−</button>
				<button onClick={() => setCount(count() + 1)}>+</button>
				<button onClick={() => setCount(0)}>Reset</button>
			</div>
		</div>
	);
};

export default Counter;
