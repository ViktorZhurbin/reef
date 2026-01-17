/**
 * Framework initialization script for is-land
 * Registers framework handlers for Preact and Solid.js
 *
 * This script runs once per page to register framework-specific mounting logic
 */

// Preact initialization - register handler for type="preact"
Island.addInitType("preact", async (target) => {
	const { createElement: h, render } = await import("preact");
	const module = await import(target.getAttribute("import"));

	const props = getDataAttributes(target.attributes);

	render(h(module.default, props), target);
});

// Solid.js initialization - register handler for type="solid"
Island.addInitType("solid", async (target) => {
	const { render } = await import("solid-js/web");
	const module = await import(target.getAttribute("import"));

	const props = getDataAttributes(target.attributes);

	render(() => module.default(props), target);
});

// Extract props from data-* attributes
function getDataAttributes(attributes) {
	const props = {};

	const DATA_PREFIX = "data-";
	for (const attr of attributes) {
		if (attr.name.startsWith(DATA_PREFIX)) {
			const propName = attr.name.slice(DATA_PREFIX.length);
			props[propName] = attr.value;
		}
	}

	return props;
}
