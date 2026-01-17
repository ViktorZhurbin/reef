import { OUTPUT_DIR } from "../../../constants/dir.js";
import { processJSXIslands } from "../../../utils/process-jsx-islands.js";
import { wrapWithIsland } from "../../../utils/wrap-with-island.js";
import { compileSolidIsland } from "./jsx-compiler.js";

/**
 * @import { IslandComponent } from '../../../types/island.js';
 * @import { ReefPlugin, IslandPluginOptions, PluginBuildContext, PluginTransformContext } from '../../../types/plugin.js';
 */

const DEFAULT_ISLANDS_DIR = "islands-solid";

/**
 * Reef Islands Solid Plugin
 * Enables interactive islands architecture with Solid.js JSX components
 *
 * @param {IslandPluginOptions} [options] - Plugin configuration
 * @returns {ReefPlugin} Plugin instance with hooks
 */
export function solidIslands(options = {}) {
	const { islandsDir = DEFAULT_ISLANDS_DIR } = options;

	/** @type {IslandComponent[]} */
	let discoveredComponents = [];

	return {
		name: "islands-solid",

		// Watch islands directory for changes in dev mode
		watchDirs: [islandsDir],

		/**
		 * Hook: Called during build to discover, compile, and copy components
		 * @param {PluginBuildContext} context - Build context
		 */
		async onBuild({ outputDir = OUTPUT_DIR }) {
			discoveredComponents = [];

			// Process JSX islands
			discoveredComponents = await processJSXIslands({
				islandsDir,
				outputDir,
				elementSuffix: "-solid",
				compileIsland: compileSolidIsland,
				framework: "solid",
			});
		},

		/**
		 * Hook: Returns import map configuration for Solid.js runtime from CDN
		 * @returns {Promise<import('../../../types/plugin.js').ImportMapConfig|null>} Import map config or null
		 */
		async getImportMap() {
			if (discoveredComponents.length === 0) return null;

			return {
				imports: {
					"solid-js": "https://esm.sh/solid-js",
					"solid-js/web": "https://esm.sh/solid-js/web",
				},
			};
		},

		/**
		 * Hook: Transform HTML to wrap components in <is-land> tags
		 * @param {PluginTransformContext} context - Transform context
		 * @returns {Promise<string>} Transformed HTML
		 */
		async transform({ content }) {
			if (discoveredComponents.length === 0) return content;
			return wrapWithIsland(content, discoveredComponents, "on:visible");
		},
	};
}
