import { detectCustomElements } from "./detect-custom-elements.js";

/**
 * @import { IslandComponent } from '../types/island.js';
 */

/**
 * Filter components to only those actually used on a page
 * Detects custom elements in content and returns matching components
 *
 * @param {IslandComponent[]} discoveredComponents - All available components
 * @param {string} pageContent - HTML or markdown content to scan for usage
 * @returns {IslandComponent[]} Components that are actually used in the page
 *
 * @example
 * filterUsedComponents(
 *   [{elementName: 'counter-preact', outputPath: '/components/counter-preact.js'}],
 *   '<counter-preact></counter-preact>'
 * )
 * // Returns: [{elementName: 'counter-preact', outputPath: '/components/counter-preact.js'}]
 */
export function filterUsedComponents(discoveredComponents, pageContent) {
	const usedElements = detectCustomElements(pageContent);
	return discoveredComponents.filter(({ elementName }) =>
		usedElements.has(elementName)
	);
}
