import path from "node:path";

/**
 * Core utilities for plugins
 *
 * These are optional helpers that plugins can use to simplify common tasks.
 * Plugins are free to implement their own versions if they need custom behavior.
 */

/**
 * Detect custom elements (web components) in HTML/markdown content
 * Matches tags with hyphens following W3C custom element naming convention
 *
 * @param {string} content - HTML or markdown content to scan
 * @returns {Set<string>} Set of custom element names found
 *
 * @example
 * detectCustomElements('<counter-component></counter-component>')
 * // Returns: Set(['counter-component'])
 */
export function detectCustomElements(content) {
	// Match custom element opening tags: <element-name>
	// Custom elements must contain a hyphen to avoid conflicts with standard HTML elements
	const tagPattern = /<([a-z][a-z0-9]*-[a-z0-9-]*)/gi;
	const matches = content.matchAll(tagPattern);
	const elements = new Set();

	for (const match of matches) {
		elements.add(match[1].toLowerCase());
	}

	return elements;
}

/**
 * Convert a file name to a custom element name
 * Removes the file extension and optionally adds a suffix
 *
 * @param {string} fileName - Source file name (e.g., 'counter.jsx', 'button.js')
 * @param {string} [suffix='-component'] - Suffix to add (default: '-component')
 * @returns {string} Custom element name with hyphen
 *
 * @example
 * getElementName('counter.jsx')
 * // Returns: 'counter-component'
 *
 * getElementName('my-button.jsx')
 * // Returns: 'my-button-component'
 *
 * getElementName('data-table.jsx', '-island')
 * // Returns: 'data-table-island'
 */
export function getElementName(fileName, suffix = "-component") {
	const ext = path.extname(fileName);
	const baseName = path.basename(fileName, ext);

	return `${baseName}${suffix}`;
}

/**
 * Generate a script tag for ES module imports
 *
 * @param {string} src - Script source path
 * @param {object} [options] - Additional options
 * @param {boolean} [options.module=true] - Use type="module"
 * @param {boolean} [options.defer=false] - Add defer attribute
 * @returns {string} Script tag HTML
 *
 * @example
 * generateScriptTag('/components/solid-counter.js')
 * // Returns: '<script type="module" src="/components/solid-counter.js"></script>'
 */
export function generateScriptTag(src, options = {}) {
	const { module = true, defer = false } = options;

	const attrs = [];
	if (module) attrs.push('type="module"');
	if (defer) attrs.push("defer");
	attrs.push(`src="${src}"`);

	return `<script ${attrs.join(" ")}></script>`;
}
