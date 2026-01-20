/**
 * @import { Asset, ImportMap } from '../types/island.js';
 */

/**
 * Merge multiple import map objects into one HTML string
 * @param {Object} options
 * @param {ImportMap} options.mergedImportMap - Import map configs to inject
 * @returns {string} The <script type="importmap">... string
 */
export function generateImportMapHtml({ mergedImportMap }) {
	if (!Object.keys(mergedImportMap)?.length) return "";

	const importMap = { imports: mergedImportMap };

	return `
		<script type="importmap">
			${JSON.stringify(importMap, null, 2)}
		</script>
	`.trim();
}

/**
 * Render assets (scripts/links) to HTML string
 * @param {Object} options
 * @param {Asset[]} options.assets - Assets to inject
 * @returns {string} The combined HTML string of assets
 */
export function generateAssetsHtml({ assets = [] }) {
	return assets
		.map((asset) => {
			if (typeof asset === "string") return asset;

			const attrs = attributesToString(asset.attrs);

			// Handle <link> tags (Void element, no closing tag)
			if (asset.tag === "link") {
				return `<link ${attrs}>`;
			}

			// Handle <script> tags
			if (asset.tag === "script") {
				return `<script ${attrs}>${asset.content || ""}</script>`;
			}

			return "";
		})
		.join("\n");
}

/**
 * Helper: Convert an object to an HTML attribute string
 * e.g. { type: "module", defer: true } -> 'type="module" defer'
 */
function attributesToString(attrs = {}) {
	return Object.entries(attrs)
		.map(([key, value]) => {
			if (value === true) return key; // Boolean attribute
			if (value === false || value === null || value === undefined) return "";
			return `${key}="${value}"`;
		})
		.filter(Boolean) // Remove empty strings
		.join(" ");
}
