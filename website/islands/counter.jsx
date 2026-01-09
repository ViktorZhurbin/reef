import { createSignal } from "solid-js";

export default function Counter(props) {
	console.log("Counter props:", {
		initial: props.initial,
		type: typeof props.initial,
	});
	const [count, setCount] = createSignal(props.initial);
	console.log("Initial count:", count());

	return (
		<div style="padding: 20px; border: 2px solid #333; border-radius: 8px; max-width: 300px;">
			<h3>Solid Counter Island</h3>
			<p style="font-size: 24px; margin: 10px 0;">Count: {count()}</p>
			<div style="display: flex; gap: 10px;">
				<button
					onClick={() => {
						console.log("Decrement clicked, current:", count());
						setCount(count() - 1);
					}}
					style="padding: 10px 20px; cursor: pointer;"
				>
					-
				</button>
				<button
					onClick={() => {
						console.log("Increment clicked, current:", count());
						setCount(count() + 1);
					}}
					style="padding: 10px 20px; cursor: pointer;"
				>
					+
				</button>
				<button
					onClick={() => setCount(0)}
					style="padding: 10px 20px; cursor: pointer;"
				>
					Reset
				</button>
			</div>
		</div>
	);
}
