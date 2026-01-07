import fsPromises from "node:fs/promises";
import path from "node:path";

const COMPONENTS_DIR = "components";
const OUTPUT_DIR = "dist";

/**
 * Detect custom element tags in content
 * Custom elements always contain a hyphen (e.g., <counter-component>)
 * @param {string} content - Markdown or HTML content
 * @returns {Set<string>} Set of custom element tag names
 */
function detectCustomElements(content) {
	// Match opening tags with hyphens: <tag-name> or <tag-name attr="value">
	const tagPattern = /<([a-z][a-z0-9]*-[a-z0-9-]*)/gi;
	const matches = content.matchAll(tagPattern);
	const elementNames = new Set();

	for (const match of matches) {
		elementNames.add(match[1].toLowerCase());
	}

	return elementNames;
}

/**
 * Map component file name to element name
 * counter.component.js → counter-component
 * my-widget.component.js → my-widget-component
 * @param {string} fileName - Component file name
 * @returns {string} Element name
 */
function getElementName(fileName) {
	// Remove .component.js extension
	return fileName.replace(/\.component\.js$/, "-component");
}

/**
 * Bare Islands Plugin
 * Enables interactive islands architecture by discovering and injecting web components
 *
 * @param {Object} options
 * @param {string} [options.componentsDir] - Your components folder
 * @returns {Object} Plugin instance with hooks
 */
export function bareIslands(options = {}) {
	const componentsDir = options.componentsDir || COMPONENTS_DIR;
	let discoveredComponents = [];

	return {
		name: "bare-islands",

		/**
		 * Hook: Called during build to copy component files and dependencies
		 * @param {Object} context - Build context
		 * @param {string} [context.outputDir] - The output directory path
		 */
		async onBuild({ outputDir = OUTPUT_DIR }) {
			discoveredComponents = [];

			// Copy components directory if it exists and has files
			try {
				const files = await fsPromises.readdir(componentsDir);
				const componentFiles = files.filter((f) => f.endsWith(".component.js"));

				if (!componentFiles.length) return;

				await fsPromises.mkdir(path.join(outputDir, componentsDir), {
					recursive: true,
				});

				for (const fileName of componentFiles) {
					try {
						await fsPromises.copyFile(
							path.join(componentsDir, fileName),
							path.join(outputDir, componentsDir, fileName),
						);

						// Track discovered components for script generation
						discoveredComponents.push({
							dir: componentsDir,
							file: fileName,
						});
					} catch (err) {
						throw new Error(
							`Failed to copy component ${fileName}: ${err.message}`,
						);
					}
				}

				// Copy bare-signals from package if it exists
				const bareSignalsSource = "../bare-signals/lib/index.js";
				try {
					await fsPromises.access(bareSignalsSource);
					const vendorDir = path.join(outputDir, "vendor");
					await fsPromises.mkdir(vendorDir, { recursive: true });
					await fsPromises.copyFile(
						bareSignalsSource,
						path.join(vendorDir, "bare-signals.js"),
					);
				} catch {
					// bare-signals package not found, skip (user will handle dependencies)
				}
			} catch (err) {
				// If it's ENOENT (directory doesn't exist), silently skip - nothing to do
				if (err.code === "ENOENT") return;

				// Otherwise, it's a real error - rethrow it
				throw err;
			}
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
			const usedComponents = discoveredComponents.filter(({ file }) => {
				const elementName = getElementName(file);
				return usedElements.has(elementName);
			});

			// Return script tags only for used components
			return usedComponents.map(
				({ dir, file }) =>
					`<script type="module" src="/${dir}/${file}"></script>`,
			);
		},
	};
}
