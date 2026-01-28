/**
 * Preact Islands Plugin
 *
 * Plugin that discovers, compiles, and integrates Preact islands.
 *
 * What it does:
 * - onBuild: Scans islands/ directory and compiles each component
 * - getImportMap: Returns CDN URLs for Preact runtime
 * - watchDirs: Tells dev server to rebuild when islands/ changes
 *
 * Islands are wrapped during JSX page rendering (page-jsx.js), not in transform hook.
 */

import { ISLANDS_DIR, OUTPUT_DIR } from "../config.js";
import { PreactConfig } from "./preact-config.js";
import { islands } from "./registry.js";

/**
 * @import { CastroPlugin } from '../types.d.ts'
 */

/**
 * Plugin that discovers and compiles Preact island components
 *
 * @param {{ islandsDir?: string }} [options]
 * @returns {CastroPlugin}
 */
export function preactIslands(options = {}) {
	const { islandsDir = ISLANDS_DIR } = options;

	return {
		name: "islands-preact",

		// Watch islands directory for changes in dev mode
		watchDirs: [islandsDir],

		/**
		 * Build hook: discover, compile, and load islands into registry
		 */
		async onBuild({ outputDir = OUTPUT_DIR }) {
			await islands.load({ islandsDir, outputDir });
		},

		/**
		 * Return import map for Preact runtime
		 */
		getImportMap() {
			if (islands.getAll().size === 0) return null;

			return PreactConfig.importMap;
		},
	};
}
