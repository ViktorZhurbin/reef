import { OUTPUT_DIR } from "../../constants/dir.js";
import {
	generateTagsForUsedComponents,
	processJSXIslands,
} from "../../utils/index.js";
import { compileJSXIsland } from "./jsx-compiler.js";

/**
 * @import { IslandComponent } from '../../types/island.js';
 * @import { ReefPlugin, IslandPluginOptions, PluginBuildContext, PluginScriptContext } from '../../types/plugin.js';
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
				compileIsland: compileJSXIsland,
			});
		},

		/**
		 * Hook: Returns import map for Solid.js runtime from CDN
		 * @returns {Promise<string|null>} Import map script tag or null
		 */
		async getImportMap() {
			if (discoveredComponents.length === 0) return null;

			const importMap = {
				imports: {
					"solid-js": "https://esm.sh/solid-js",
					"solid-js/web": "https://esm.sh/solid-js/web",
					"solid-element": "https://esm.sh/solid-element",
				},
			};

			return `<script type="importmap">${JSON.stringify(
				importMap,
				null,
				2
			)}</script>`;
		},

		/**
		 * Hook: Returns script tags to inject into pages
		 * Only injects scripts for components actually used on the page
		 * @param {PluginScriptContext} context - Script context
		 * @returns {Promise<string[]>} Array of script tag strings
		 */
		async getScripts({ pageContent }) {
			return generateTagsForUsedComponents(discoveredComponents, pageContent);
		},
	};
}
