import { castValue } from "../../../utils/castValue.js";
import { stripDataPrefix, toCamelCase } from "../../../utils/props.js";
import { renderIslandSSR } from "./render-ssr.js";

/**
 * @import { IslandComponent } from '../../../types/island.js';
 */

/**
 * Wraps custom elements with <reef-island> for lazy loading.
 * @param {string} content - HTML content
 * @param {IslandComponent[]} components - Island components to wrap
 * @param {string} loadingStrategy - Default loading strategy (e.g., "on:visible", "on:idle")
 * @returns {Promise<string>} Transformed HTML */
export async function wrapWithIsland(
	content,
	components,
	loadingStrategy = "on:visible",
) {
	if (!components.length) return content;

	const componentMap = new Map(
		components.map((c) => [c.elementName.toLowerCase(), c]),
	);

	const tagNames = components.map((c) => c.elementName).join("|");
	const tagRegex = new RegExp(
		`<(${tagNames})([^>]*)>([\\s\\S]*?)<\\/\\1>`,
		"gi",
	);

	const matches = Array.from(content.matchAll(tagRegex));
	if (matches.length === 0) return content;

	// Phase 1: Prepare all async replacement data
	const replacements = await Promise.all(
		matches.map(async (match) => {
			const [fullMatch, tagName, attrs, innerContent] = match;
			const component = componentMap.get(tagName.toLowerCase());

			if (!component) {
				return {
					index: match.index,
					length: fullMatch.length,
					markup: fullMatch,
				};
			}

			const props = extractProps(attrs);
			let staticHtml = innerContent;

			if (component.ssrCode) {
				const rendered = await renderIslandSSR({
					props,
					compiledCode: component.ssrCode,
					framework: component.framework,
					elementName: component.elementName,
				});
				if (rendered) staticHtml = rendered;
			}

			const markup = `
<div class="reef-island-container">
  <reef-island ${loadingStrategy} import="${component.outputPath}">
    <${component.elementName}${attrs}>${staticHtml}</${component.elementName}>
    ${component.cssPath ? `<link rel="stylesheet" href="${component.cssPath}">` : ""}
  </reef-island>
</div>`.trim();

			return { index: match.index, length: fullMatch.length, markup };
		}),
	);

	// Phase 2: Single-pass "Stitch" (The Performance Fix)
	// We construct the string once rather than copying it multiple times
	let result = "";
	let lastIndex = 0;

	for (const { index, length, markup } of replacements) {
		// Add text from end of last match to start of this match
		result += content.slice(lastIndex, index) + markup;
		lastIndex = index + length;
	}

	// Add remaining content
	result += content.slice(lastIndex);

	return result;
}

function extractProps(attrsString) {
	/** @type Record<string, unknown> */
	const props = {};
	const attrRegex = /([a-z0-9-]+)=["']([^"']*)["']/g;

	for (const [, key, value] of attrsString.matchAll(attrRegex)) {
		const attrName = stripDataPrefix(key);
		const camelKey = toCamelCase(attrName);

		props[camelKey] = castValue(value);
	}

	return props;
}
