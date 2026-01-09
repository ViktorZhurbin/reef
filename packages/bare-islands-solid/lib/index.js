import {
	generateScriptsForUsedComponents,
	processJSXIslands,
} from "@vktrz/bare-static/plugin-utils";
import { compileJSXIsland } from "./jsx-compiler.js";

const DEFAULT_ISLANDS_DIR = "islands";
const OUTPUT_DIR = "dist";

/**
 * Bare Islands Plugin
 * Enables interactive islands architecture with Solid.js JSX components
 *
 * @param {Object} options - Plugin configuration
 * @param {string} [options.islandsDir] - Directory containing JSX islands
 * @returns {Object} Plugin instance with hooks
 */
export function bareIslandsSolid(options = {}) {
	const { islandsDir = DEFAULT_ISLANDS_DIR } = options;

	let discoveredComponents = [];

	return {
		name: "bare-islands",

		// Watch islands directory for changes in dev mode
		watchDirs: [islandsDir],

		/**
		 * Hook: Called during build to discover, compile, and copy components
		 * @param {Object} context - Build context
		 * @param {string} context.outputDir - The output directory path
		 */
		async onBuild({ outputDir = OUTPUT_DIR }) {
			discoveredComponents = [];

			// Process JSX islands
			await processJSXIslands({
				islandsDir,
				outputDir,
				discoveredComponents,
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

			return `<script type="importmap">${JSON.stringify(importMap, null, 2)}</script>`;
		},

		/**
		 * Hook: Returns script tags to inject into pages
		 * Only injects scripts for components actually used on the page
		 * @param {Object} context - Script context
		 * @param {string} context.pageContent - The markdown content of the page
		 * @returns {Promise<string[]>} Array of script tag strings
		 */
		async getScripts({ pageContent }) {
			return generateScriptsForUsedComponents(discoveredComponents, pageContent);
		},
	};
}

