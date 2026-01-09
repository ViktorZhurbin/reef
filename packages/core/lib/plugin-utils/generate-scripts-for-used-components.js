import { filterUsedComponents } from "./filter-used-components.js";
import { generateScriptTag } from "./generate-script-tag.js";

/**
 * Generate script tags for components used on a page
 * Filters components by page content and returns script tags for only used components
 *
 * @param {Array<{elementName: string, outputPath: string}>} discoveredComponents - All available components
 * @param {string} pageContent - HTML or markdown content to scan for usage
 * @returns {string[]} Array of script tag strings
 *
 * @example
 * generateScriptsForUsedComponents(
 *   [{elementName: 'counter-preact', outputPath: '/components/counter-preact.js'}],
 *   '<counter-preact></counter-preact>'
 * )
 * // Returns: ['<script type="module" src="/components/counter-preact.js"></script>']
 */
export function generateScriptsForUsedComponents(
	discoveredComponents,
	pageContent,
) {
	const usedComponents = filterUsedComponents(discoveredComponents, pageContent);
	return usedComponents.map(({ outputPath }) => generateScriptTag(outputPath));
}
