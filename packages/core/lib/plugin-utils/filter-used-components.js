import { detectCustomElements } from "./detect-custom-elements.js";

/**
 * Filter components to only those actually used on a page
 * Detects custom elements in content and returns matching components
 *
 * @param {Array<{elementName: string}>} discoveredComponents - All available components
 * @param {string} pageContent - HTML or markdown content to scan for usage
 * @returns {Array} Components that are actually used in the page
 *
 * @example
 * filterUsedComponents(
 *   [{elementName: 'counter-preact'}, {elementName: 'button-preact'}],
 *   '<counter-preact></counter-preact>'
 * )
 * // Returns: [{elementName: 'counter-preact'}]
 */
export function filterUsedComponents(discoveredComponents, pageContent) {
	const usedElements = detectCustomElements(pageContent);
	return discoveredComponents.filter(({ elementName }) =>
		usedElements.has(elementName),
	);
}
