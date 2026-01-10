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

const DEFAULT_ISLANDS_DIR = "islands-preact";

/**
 * Reef Islands Preact Plugin
 * Enables interactive islands architecture with Preact JSX components
 *
 * @param {IslandPluginOptions} [options] - Plugin configuration
 * @returns {ReefPlugin} Plugin instance with hooks
 */
export function preactIslands(options = {}) {
	const { islandsDir = DEFAULT_ISLANDS_DIR } = options;

	/** @type {IslandComponent[]} */
	let discoveredComponents = [];

	return {
		name: "islands-preact",

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
				elementSuffix: "-preact",
				compileIsland: compileJSXIsland,
			});
		},

		/**
		 * Hook: Returns import map for Preact runtime from CDN
		 * @returns {Promise<string|null>} Import map script tag or null
		 */
		async getImportMap() {
			if (discoveredComponents.length === 0) return null;

			const importMap = {
				imports: {
					preact: "https://cdn.jsdelivr.net/npm/preact@10.28.2/+esm",
					"preact/hooks":
						"https://cdn.jsdelivr.net/npm/preact@10.28.2/hooks/+esm",
					"preact/jsx-runtime":
						"https://cdn.jsdelivr.net/npm/preact@10.28.2/jsx-runtime/+esm",
					"preact-custom-element":
						"https://cdn.jsdelivr.net/npm/preact-custom-element@4.6.0/dist/preact-custom-element.esm.js",
				},
			};

			return `<script type="importmap">${JSON.stringify(
				importMap,
				null,
				2,
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
