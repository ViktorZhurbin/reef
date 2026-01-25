/**
 * Preact Islands Plugin
 *
 * Plugin that discovers, compiles, and integrates Preact islands.
 *
 * What it does:
 * - onBuild: Scans islands/ directory and compiles each component
 * - getImportMap: Returns CDN URLs for Preact runtime
 * - transform: Wraps <preact-*> tags in HTML with <castro-island>
 * - watchDirs: Tells dev server to rebuild when islands/ changes
 */

import { ISLANDS_DIR, OUTPUT_DIR } from "../config.js";
import { PreactConfig } from "./preact-config.js";
import { processIslands } from "./processor.js";
import { wrapWithIsland } from "./wrapper.js";

/**
 * @import { CastroPlugin, ComponentMap } from '../types.d.ts'
 */

/**
 * Plugin that discovers and compiles Preact island components
 *
 * @param {{ sourceDir?: string }} [options]
 * @returns {CastroPlugin}
 */
export function preactIslands(options = {}) {
	const { sourceDir = ISLANDS_DIR } = options;

	/** @type {ComponentMap} */
	let componentMap = new Map();

	return {
		name: "islands-preact",

		// Watch islands directory for changes in dev mode
		watchDirs: [sourceDir],

		/**
		 * Build hook: discover, compile, and copy components
		 */
		async onBuild({ outputDir = OUTPUT_DIR }) {
			componentMap = await processIslands({
				sourceDir,
				outputDir,
			});
		},

		/**
		 * Return import map for Preact runtime
		 */
		getImportMap() {
			if (componentMap.size === 0) return null;

			return PreactConfig.importMap;
		},

		/**
		 * Transform HTML: wrap components in <castro-island> tags and render SSR
		 */
		async transform({ content }) {
			if (componentMap.size === 0) return content;

			return await wrapWithIsland(content, componentMap);
		},
	};
}
