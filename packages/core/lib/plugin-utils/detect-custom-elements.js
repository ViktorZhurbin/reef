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
