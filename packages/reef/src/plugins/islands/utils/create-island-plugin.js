import { OUTPUT_DIR } from "../../../constants/dir.js";
import { FrameworkConfig } from "../framework-config.js";
import { processJSXIslands } from "./process-jsx-islands.js";
import { wrapWithIsland } from "./wrap-with-island.js";

/**
 * @import { IslandPluginOptions, IslandComponent, SupportedFramework } from '../../../types/island.js';
 * @import { ReefPlugin } from '../../../types/plugin.js';
 */

/**
 * Factory function to create island plugins for different frameworks
 *
 * @param {Object} params
 * @param {SupportedFramework} params.framework
 * @returns {(options?: IslandPluginOptions) => ReefPlugin} Plugin factory
 */
export function createIslandPlugin({ framework }) {
	const config = FrameworkConfig[framework];

	return (options = {}) => {
		const { sourceDir = config.defaultDir } = options;

		/** @type {IslandComponent[]} */
		let discoveredComponents = [];

		return {
			name: `islands-${framework}`,

			// Watch islands directory for changes in dev mode
			watchDirs: [sourceDir],

			/**
			 * Hook: Called during build to discover, compile, and copy components
			 */
			async onBuild({ outputDir = OUTPUT_DIR }) {
				discoveredComponents =
					(await processJSXIslands({
						sourceDir,
						outputDir,
						framework,
					})) ?? [];
			},

			getAssets() {
				return config.assets ?? [];
			},

			/**
			 * Hook: Returns import map configuration for framework runtime from CDN
			 */
			getImportMap() {
				if (discoveredComponents.length === 0) return null;

				return config.importMap;
			},

			/**
			 * Hook: Transform HTML to wrap components in <reef-island> tags and render SSR
			 */
			async transform({ content }) {
				if (discoveredComponents.length === 0) return content;

				return await wrapWithIsland(
					content,
					discoveredComponents,
					"on:visible",
				);
			},
		};
	};
}
