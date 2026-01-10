import { filterUsedComponents } from "./filter-used-components.js";
import { generateScriptTag } from "./generate-script-tag.js";

/**
 * @import { IslandComponent } from '../types/island.js';
 */

/**
 * Generate script and CSS link tags for components used on a page
 * Filters components by page content and returns both script and stylesheet tags
 *
 * @param {IslandComponent[]} discoveredComponents - All available components
 * @param {string} pageContent - HTML or markdown content to scan for usage
 * @returns {string[]} Array of script and link tag strings
 *
 * @example
 * generateScriptsAndCSSForUsedComponents(
 *   [
 *     {elementName: 'counter-preact', outputPath: '/components/counter-preact.js', cssPath: '/components/counter-preact.css'},
 *     {elementName: 'button-preact', outputPath: '/components/button-preact.js'}
 *   ],
 *   '<counter-preact></counter-preact>'
 * )
 * // Returns: [
 * //   '<script type="module" src="/components/counter-preact.js"></script>',
 * //   '<link rel="stylesheet" href="/components/counter-preact.css">'
 * // ]
 */
export function generateTagsForUsedComponents(
	discoveredComponents,
	pageContent,
) {
	const usedComponents = filterUsedComponents(
		discoveredComponents,
		pageContent,
	);
	const tags = [];

	for (const component of usedComponents) {
		// Add script tag
		tags.push(generateScriptTag(component.outputPath));

		// Add CSS link tag if component has CSS
		if (component.cssPath) {
			tags.push(`<link rel="stylesheet" href="${component.cssPath}">`);
		}
	}

	return tags;
}
