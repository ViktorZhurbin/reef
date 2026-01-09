import {
	generateScriptsForUsedComponents,
	processJSXIslands,
} from "@vktrz/bare-static/plugin-utils";
import { compileJSXIsland } from "./jsx-compiler.js";

const DEFAULT_ISLANDS_DIR = "islands-preact";
const OUTPUT_DIR = "dist";

/**
 * Bare Islands Preact Plugin
 * Enables interactive islands architecture with Preact JSX components
 *
 * @param {Object} options - Plugin configuration
 * @param {string} [options.islandsDir] - Directory containing JSX islands
 * @returns {Object} Plugin instance with hooks
 */
export function bareIslandsPreact(options = {}) {
	const { islandsDir = DEFAULT_ISLANDS_DIR } = options;

	let discoveredComponents = [];

	return {
		name: "bare-islands-preact",

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

