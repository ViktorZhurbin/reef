import fsPromises from "node:fs/promises";
import path from "node:path";
import {
	detectCustomElements,
	generateScriptTag,
	getElementName,
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
export function bareIslands(options = {}) {
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
			await processIslands(islandsDir, outputDir, discoveredComponents);
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
					"solid-js/h/jsx-runtime": "https://esm.sh/solid-js/h/jsx-runtime",
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
			// Detect which custom elements are used on this page
			const usedElements = detectCustomElements(pageContent);

			// Filter components to only those used on this page
			const usedComponents = discoveredComponents.filter(({ elementName }) =>
				usedElements.has(elementName),
			);

			// Return script tags only for used components
			return usedComponents.map(({ outputPath }) =>
				generateScriptTag(outputPath),
			);
		},
	};
}

/**
 * Process JSX island files - compile with esbuild and wrap in web components
 * @param {string} islandsDir - Islands directory
 * @param {string} outputDir - Output directory
 * @param {Array} discoveredComponents - Array to track discovered components
 */
async function processIslands(islandsDir, outputDir, discoveredComponents) {
	try {
		const files = await fsPromises.readdir(islandsDir);
		const jsxFiles = files.filter(
			(f) => f.endsWith(".jsx") || f.endsWith(".tsx"),
		);

		if (jsxFiles.length === 0) return;

		const outputComponentsDir = path.join(outputDir, "components");
		await fsPromises.mkdir(outputComponentsDir, { recursive: true });

		for (const fileName of jsxFiles) {
			const extension = path.extname(fileName);
			const elementName = getElementName(fileName);
			const outputFileName = fileName.replace(extension, ".js");

			try {
				const sourcePath = path.join(islandsDir, fileName);

				console.log({ sourcePath });
				await compileJSXIsland({
					sourcePath,
					outputPath: path.join(outputComponentsDir, outputFileName),
					elementName,
				});

				discoveredComponents.push({
					type: "island",
					sourceDir: islandsDir,
					sourceFile: fileName,
					elementName,
					outputPath: `/components/${outputFileName}`,
				});
			} catch (err) {
				throw new Error(`Failed to process island ${fileName}: ${err.message}`);
			}
		}
	} catch (err) {
		if (err.code === "ENOENT") return;
		throw err;
	}
}
