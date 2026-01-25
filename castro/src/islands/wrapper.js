/**
 * Island Wrapper
 *
 * Transforms HTML to wrap custom elements with <castro-island>.
 *
 * Process:
 * 1. Find all custom element tags in HTML (e.g., <preact-counter>)
 * 2. Try to render them to static HTML at build time (SSR)
 * 3. Wrap them in <castro-island> with import path and loading strategy
 * 4. Browser will lazy-load and hydrate when conditions are met
 *
 * This runs at BUILD TIME. The output is static HTML with deferred
 * JavaScript loading infrastructure.
 */

import { getPropsFromAttributeString } from "./client-runtime.js";
import { renderIslandSSR } from "./ssr-renderer.js";

/**
 * @import { ComponentsMap } from '../types.d.ts'
 */

/**
 * Wrap custom elements with <castro-island> for lazy loading
 *
 * Reads hydration directive from the component tag itself:
 * - <preact-counter no:pasaran> → Static only, no JS shipped
 * - <preact-counter lenin:awake> → Immediate hydration
 * - <preact-counter comrade:visible> → Hydrate when visible (default)
 *
 * Also collects CSS files used by islands on this page.
 *
 * @param {string} content - HTML content to transform
 * @param {ComponentsMap} componentsMap - Known island components
 * @returns {Promise<{ html: string, cssFiles: string[] }>} Transformed HTML and CSS files
 */
export async function wrapWithIsland(content, componentsMap) {
	if (!componentsMap.size) return { html: content, cssFiles: [] };

	// Build regex to find all component tags
	const tagNames = Array.from(componentsMap.keys()).join("|");
	const tagRegex = new RegExp(
		`<(${tagNames})([^>]*)>([\\s\\S]*?)<\\/\\1>`,
		"gi",
	);

	const matches = Array.from(content.matchAll(tagRegex));
	if (matches.length === 0) return { html: content, cssFiles: [] };

	// Collect CSS files used by islands on this page (deduplicated)
	/** @type {Set<string>} */
	const cssFiles = new Set();

	// Process all matches and prepare replacements
	const replacements = await Promise.all(
		matches.map(async (match) => {
			const [fullMatch, tagName, attrs, innerContent] = match;
			const component = componentsMap.get(tagName.toLowerCase());

			if (!component) {
				return {
					index: match.index,
					length: fullMatch.length,
					markup: fullMatch,
				};
			}

			// Extract hydration directive from attributes
			const directive = extractDirective(attrs);

			// Extract props from data-* attributes for SSR
			const props = getPropsFromAttributeString(attrs);
			let staticHtml = innerContent;

			// Try to render component at build time (SSR)
			if (component.ssrCode) {
				const rendered = await renderIslandSSR({
					props,
					compiledCode: component.ssrCode,
					elementName: component.elementName,
				});
				if (rendered) staticHtml = rendered;
			}

			// Remove directive attributes from component tag
			// castro-island wrapper will have the directive instead
			let cleanedAttrs = attrs
				.replace(/\s*no:pasaran\s*/g, "")
				.replace(/\s*lenin:awake\s*/g, "")
				.replace(/\s*comrade:visible\s*/g, "")
				.trim();

			// Ensure space before attributes if they exist
			if (cleanedAttrs) {
				cleanedAttrs = " " + cleanedAttrs;
			}

			// Collect CSS file for this component (if it has one)
			if (component.cssPath) {
				cssFiles.add(component.cssPath);
			}

			// Handle no:pasaran - static only, no client JS
			if (directive === "no:pasaran") {
				// Return just the static HTML without castro-island wrapper
				const markup = `<${component.elementName}${cleanedAttrs}>${staticHtml}</${component.elementName}>`;
				return { index: match.index, length: fullMatch.length, markup };
			}

			// Build the wrapper markup with castro-island
			// CSS is collected above and will be injected in <head> by the page writer
			const markup = `
<div class="castro-island-container">
  <castro-island ${directive} import="${component.outputPath}">
    <${component.elementName}${cleanedAttrs}>${staticHtml}</${component.elementName}>
  </castro-island>
</div>`.trim();

			return { index: match.index, length: fullMatch.length, markup };
		}),
	);

	// Single-pass string reconstruction
	// We build the new string by: keeping everything before a match,
	// inserting the replacement markup, repeat for each match,
	// then append everything after the last match.
	let result = "";
	let lastIndex = 0;

	for (const { index, length, markup } of replacements) {
		result += content.slice(lastIndex, index) + markup;
		lastIndex = index + length;
	}

	result += content.slice(lastIndex);

	return {
		html: result,
		cssFiles: Array.from(cssFiles),
	};
}

/**
 * Extract hydration directive from attributes string
 *
 * Looks for: no:pasaran, lenin:awake, or comrade:visible
 * Returns the directive found, or defaults to "comrade:visible"
 *
 * @param {string} attrsString - Raw attributes string
 * @returns {string} Directive name
 */
function extractDirective(attrsString) {
	if (attrsString.includes("no:pasaran")) return "no:pasaran";
	if (attrsString.includes("lenin:awake")) return "lenin:awake";
	if (attrsString.includes("comrade:visible")) return "comrade:visible";

	// Default to lazy loading when visible
	return "comrade:visible";
}
