import { detectCustomElements } from "./detect-custom-elements.js";

/**
 * @import { IslandComponent } from '../types/island.js';
 */

/**
 * Wraps custom elements with <is-land> for lazy loading
 *
 * @param {string} content - HTML content
 * @param {IslandComponent[]} components - Island components to wrap
 * @param {string} loadingStrategy - Default loading strategy (e.g., "on:visible", "on:idle")
 * @returns {string} Transformed HTML
 */
export function wrapWithIsland(
	content,
	components,
	loadingStrategy = "on:visible",
) {
	let transformed = content;
	const usedElements = detectCustomElements(content);

	for (const component of components) {
		if (!usedElements.has(component.elementName)) continue;

		// Match the component tag (with attributes and content)
		const tagRegex = new RegExp(
			`<${component.elementName}([^>]*)>([\\s\\S]*?)<\\/${component.elementName}>`,
			"gi",
		);

		transformed = transformed.replace(tagRegex, (match, attrs, innerContent) => {
			// Build island markup
			const parts = [];

			parts.push(
				`<is-land ${loadingStrategy} type="${component.framework}" import="${component.outputPath}">`,
			);
			parts.push(`  <${component.elementName}${attrs}>${innerContent}</${component.elementName}>`);
			parts.push("  <template data-island>");

			// CSS loaded lazily inside island
			if (component.cssPath) {
				parts.push(`    <link rel="stylesheet" href="${component.cssPath}">`);
			}

			parts.push("  </template>");
			parts.push("</is-land>");

			return parts.join("\n");
		});
	}

	return transformed;
}
