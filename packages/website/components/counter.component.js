/**
 * Interactive Counter Component
 * Demonstrates bare-signals reactivity in a web component
 */
import { createSignal, createEffect } from "/vendor/bare-signals.js";

class CounterComponent extends HTMLElement {
	connectedCallback() {
		// Create reactive signal
		const [count, setCount] = createSignal(0);

		// Build DOM structure
		const container = document.createElement("div");
		container.style.cssText = `
			border: 2px solid #4CAF50;
			border-radius: 8px;
			padding: 20px;
			margin: 20px 0;
			text-align: center;
			background: #f9f9f9;
		`;

		const title = document.createElement("h3");
		title.textContent = "🔢 Interactive Counter";
		title.style.marginTop = "0";

		const display = document.createElement("p");
		display.style.cssText = `
			font-size: 2em;
			font-weight: bold;
			color: #4CAF50;
			margin: 15px 0;
		`;

		const buttonContainer = document.createElement("div");
		buttonContainer.style.cssText =
			"display: flex; gap: 10px; justify-content: center;";

		const incrementBtn = this.createButton("+ Increment", () =>
			setCount(count() + 1),
		);
		const decrementBtn = this.createButton("- Decrement", () =>
			setCount(count() - 1),
		);
		const resetBtn = this.createButton("Reset", () => setCount(0));

		// Reactive effect - updates display when count changes
		createEffect(() => {
			display.textContent = `Count: ${count()}`;
		});

		// Assemble component
		buttonContainer.appendChild(decrementBtn);
		buttonContainer.appendChild(resetBtn);
		buttonContainer.appendChild(incrementBtn);

		container.appendChild(title);
		container.appendChild(display);
		container.appendChild(buttonContainer);

		this.appendChild(container);

		console.log("✅ Counter component initialized with bare-signals");
	}

	createButton(text, onClick) {
		const button = document.createElement("button");
		button.textContent = text;
		button.onclick = onClick;
		button.style.cssText = `
			padding: 10px 20px;
			font-size: 1em;
			border: none;
			border-radius: 5px;
			background: #4CAF50;
			color: white;
			cursor: pointer;
			transition: background 0.2s;
		`;
		button.onmouseover = () => (button.style.background = "#45a049");
		button.onmouseout = () => (button.style.background = "#4CAF50");
		return button;
	}
}

customElements.define("counter-component", CounterComponent);
