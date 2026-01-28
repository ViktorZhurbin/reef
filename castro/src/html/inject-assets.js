/**
 * Asset Injection
 *
 * Collects assets from plugins and injects them into HTML.
 *
 * Assets include:
 * - Scripts (castro-island.js, component bundles)
 * - Stylesheets (component CSS)
 * - Import maps (tells browser where to load "preact" from)
 *
 * Import maps let us write `import { h } from "preact"` in browser code
 * and have it resolve to a CDN URL, no bundler needed.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { defaultPlugins } from "../islands/plugins.js";

/**
 * @import { Asset, ImportsMap } from '../types.d.ts'
 */

/**  @type {string | null} */
let cachedLiveReloadJs = null;

/**
 * Get live reload script (bundled, cached)
 */
async function getLiveReloadAsset() {
	if (cachedLiveReloadJs) return cachedLiveReloadJs;

	cachedLiveReloadJs = await readFile(
		join(import.meta.dirname, "../dev/live-reload.js"),
		"utf-8",
	);

	return cachedLiveReloadJs;
}

/**
 * Collect all assets and import maps from plugins
 *
 * @returns {Promise<{ assets: Asset[]; mergedImportMap: ImportsMap }>}
 */
export async function collectAssets() {
	/** @type {ImportsMap} */
	const mergedImportMap = {};
	/** @type {Asset[]} */
	const assets = [];

	// Collect from plugins
	for (const plugin of defaultPlugins) {
		const importMap = plugin.getImportMap?.() ?? {};
		Object.assign(mergedImportMap, importMap);

		const pluginAssets = plugin.getAssets?.() ?? [];
		assets.push(...pluginAssets);
	}

	// Auto-inject live reload in dev mode
	if (process.env.NODE_ENV === "development") {
		const content = await getLiveReloadAsset();

		assets.push({
			content,
			tag: "script",
			attrs: { type: "module" },
		});
	}

	return { assets, mergedImportMap };
}

/**
 * Inject assets and import maps into HTML
 *
 * @param {string} html - HTML to inject into
 * @param {{ assets?: Asset[], mergedImportMap?: ImportsMap }} options
 * @returns {string} HTML with injected assets
 */
export function injectAssets(html, { assets = [], mergedImportMap = {} }) {
	let output = html;

	// Generate HTML strings
	const importMapHtml = generateImportMapHtml(mergedImportMap);
	const assetsHtml = generateAssetsHtml(assets);

	// Inject into HTML
	if (importMapHtml || assetsHtml) {
		const headCloseIndex = output.indexOf("</head>");
		const bodyCloseIndex = output.indexOf("</body>");

		const injectionHtml = [importMapHtml, assetsHtml].filter(Boolean).join("");

		if (headCloseIndex !== -1) {
			output =
				output.slice(0, headCloseIndex) +
				injectionHtml +
				output.slice(headCloseIndex);
		} else if (bodyCloseIndex !== -1) {
			output =
				output.slice(0, bodyCloseIndex) +
				injectionHtml +
				output.slice(bodyCloseIndex);
		}
	}

	// Ensure DOCTYPE
	if (!output.startsWith("<!DOCTYPE")) {
		output = `<!DOCTYPE html>\n${output}`;
	}

	return output;
}

/**
 * Generate import map script tag
 *
 * @param {ImportsMap} importMap
 * @returns {string}
 */
function generateImportMapHtml(importMap) {
	if (!Object.keys(importMap).length) return "";

	return `
		<script type="importmap">
			${JSON.stringify({ imports: importMap }, null, 2)}
		</script>
	`.trim();
}

/**
 * Generate HTML for assets (scripts and links)
 *
 * @param {Asset[]} assets
 * @returns {string}
 */
function generateAssetsHtml(assets) {
	return assets
		.map((asset) => {
			if (typeof asset === "string") return asset;

			const attrs = attributesToString(asset.attrs);

			if (asset.tag === "link") {
				return `<link ${attrs}>`;
			}

			if (asset.tag === "script") {
				return `<script ${attrs}>${asset.content || ""}</script>`;
			}

			return "";
		})
		.join("\n");
}

/**
 * Convert object to HTML attribute string
 *
 * @param {Record<string, string | boolean>} [attrs]
 * @returns {string}
 */
function attributesToString(attrs = {}) {
	return Object.entries(attrs)
		.map(([key, value]) => {
			if (value === true) return key;
			if (value === false || value === null || value === undefined) return "";
			return `${key}="${value}"`;
		})
		.filter(Boolean)
		.join(" ");
}
