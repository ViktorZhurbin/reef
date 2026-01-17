import { join } from "node:path";
import * as esbuild from "esbuild";
import { defaultPlugins } from "../plugins/defaultPlugins.js";

/**
 * Centralized asset and import map collection
 */

/**
 * @import { Asset, ImportMapConfig, ReefPlugin } from '../types/plugin.js';
 */

/**
 * Collect all assets and import maps from plugins and auto-inject dev scripts
 * @param {Object} params
 * @param {string} params.pageContent - Page content to scan for component usage
 * @returns {Promise<{ assets: Asset[], importMapConfigs: ImportMapConfig[] }>}
 */
export async function collectAssets({ pageContent }) {
	/** @type {ImportMapConfig[]} */
	const importMapConfigs = [];
	/** @type {Asset[]} */
	const assets = [];

	// Collect from plugins
	for (const plugin of defaultPlugins) {
		if (plugin.getImportMap) {
			const importMapConfig = await plugin.getImportMap();
			if (importMapConfig) importMapConfigs.push(importMapConfig);
		}

		if (plugin.getAssets) {
			const pluginAssets = await plugin.getAssets({ pageContent });
			assets.push(...pluginAssets);
		}
	}

	// Auto-inject live reload asset in dev mode
	if (process.env.REEF_DEV === "true") {
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

	return { assets, importMapConfigs };
}
