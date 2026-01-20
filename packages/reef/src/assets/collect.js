import { join } from "node:path";
import * as esbuild from "esbuild";
import { defaultPlugins } from "../plugins/defaultPlugins.js";

/**
 * Centralized asset and import map collection
 */

/**
 * @import { Asset, ImportMap } from '../types/island.js';
 */

/**
 * Collect all assets and import maps from plugins and auto-inject dev scripts
 * @param {Object} params
 * @param {string} params.pageContent - Page content to scan for component usage
 * @returns {Promise<{ assets: Asset[]; mergedImportMap: ImportMap;}>}
 */
export async function collectAssets() {
	/** @type {ImportMap} */
	const mergedImportMap = {};
	/** @type {Asset[]} */
	const assets = [];

	// Collect from plugins
	for (const plugin of defaultPlugins) {
		if (plugin.getImportMap) {
			const importMap = plugin.getImportMap();
			if (importMap) Object.assign(mergedImportMap, importMap);
		}

		if (plugin.getAssets) {
			const pluginAssets = plugin.getAssets();
			assets.push(...pluginAssets);
		}
	}

	// Auto-inject live reload asset in dev mode
	if (process.env.NODE_ENV === "development") {
		const result = await esbuild.build({
			entryPoints: [join(import.meta.dirname, "../dev/live-reload.js")],
			write: false,
			bundle: true,
			format: "esm",
			target: "node22",
			logLevel: "warning",
		});

		const liveReloadJs = result.outputFiles[0].text;

		assets.push({
			tag: "script",
			attrs: { type: "module" },
			content: liveReloadJs,
		});
	}

	return { assets, mergedImportMap };
}
