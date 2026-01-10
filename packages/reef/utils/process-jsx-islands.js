import fsPromises from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";
import { getElementName } from "./get-element-name.js";

/**
 * @import { IslandComponent } from '../types/island.js';
 */

/**
 * Process JSX island files - compile and register as web components
 * Generic helper for islands plugins to discover, compile, and track components
 *
 * @param {Object} options - Processing options
 * @param {string} options.islandsDir - Directory containing JSX island files
 * @param {string} options.outputDir - Build output directory
 * @param {string} options.elementSuffix - Suffix for custom element names (e.g., '-preact', '-solid')
 * @param {Function} options.compileIsland - Compiler function that takes {sourcePath, outputPath, elementName}
 * @returns {Promise<IslandComponent[]>} Array of discovered components
 *
 * @example
 * const components = await processJSXIslands({
 *   islandsDir: 'islands-preact',
 *   outputDir: 'dist',
 *   elementSuffix: '-preact',
 *   compileIsland: compilePreactIsland
 * })
 */
export async function processJSXIslands({
	islandsDir,
	outputDir,
	elementSuffix,
	compileIsland,
}) {
	const OUTPUT_COMPONENTS_DIR = "components";
	/** @type {IslandComponent[]} */
	const discoveredComponents = [];
	/** @type {{ sourcePath: string, elementName: string }[]} */
	const compiledIslands = [];

	// Check if islands directory exists
	try {
		await fsPromises.access(islandsDir);
	} catch (err) {
		if (err.code === "ENOENT") {
			console.warn(
				styleText("red", `Islands directory not found:`),
				styleText("magenta", islandsDir),
			);
			return [];
		}
		// rethrow
		throw err;
	}

	try {
		const files = await fsPromises.readdir(islandsDir);
		const jsxFiles = files.filter((f) => /\.[jt]sx$/.test(f));

		if (jsxFiles.length === 0) return [];

		const outputComponentsDir = path.join(outputDir, OUTPUT_COMPONENTS_DIR);
		await fsPromises.mkdir(outputComponentsDir, { recursive: true });

		for (const fileName of jsxFiles) {
			const elementName = getElementName(fileName, elementSuffix);
			const outputFileName = `${elementName}.js`;

			try {
				const sourcePath = path.join(islandsDir, fileName);
				const outputPath = path.join(outputComponentsDir, outputFileName);

				const result = await compileIsland({
					sourcePath,
					outputPath,
					elementName,
				});

				/** @type {IslandComponent} */
				const component = {
					elementName,
					outputPath: `/${OUTPUT_COMPONENTS_DIR}/${outputFileName}`,
				};

				// Add CSS path if it exists
				if (result?.cssOutputPath) {
					const cssFileName = path.basename(result.cssOutputPath);
					component.cssPath = `/${OUTPUT_COMPONENTS_DIR}/${cssFileName}`;
				}

				discoveredComponents.push(component);
				compiledIslands.push({ sourcePath, elementName });
			} catch (err) {
				throw new Error(`Failed to process island ${fileName}: ${err.message}`);
			}
		}

		// Log compiled islands
		if (compiledIslands.length > 0) {
			console.info(
				styleText(
					"green",
					`✓ Compiled ${compiledIslands.length} island${
						compiledIslands.length > 1 ? "s" : ""
					}:`,
				),
			);
			for (const { sourcePath, elementName } of compiledIslands) {
				console.info(
					`  ${styleText("cyan", sourcePath)} → ${styleText(
						"magenta",
						`<${elementName}>`,
					)}`,
				);
			}
		}
	} catch (err) {
		if (err.code === "ENOENT") return [];
		throw err;
	}

	return discoveredComponents;
}
