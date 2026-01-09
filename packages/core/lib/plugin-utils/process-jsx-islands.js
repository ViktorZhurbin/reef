import fsPromises from "node:fs/promises";
import path from "node:path";
import { getElementName } from "./get-element-name.js";

/**
 * Process JSX island files - compile and register as web components
 * Generic helper for islands plugins to discover, compile, and track components
 *
 * @param {Object} options - Processing options
 * @param {string} options.islandsDir - Directory containing JSX island files
 * @param {string} options.outputDir - Build output directory
 * @param {Array} options.discoveredComponents - Array to populate with discovered components
 * @param {string} options.elementSuffix - Suffix for custom element names (e.g., '-preact', '-solid')
 * @param {Function} options.compileIsland - Compiler function that takes {sourcePath, outputPath, elementName}
 * @returns {Promise<void>}
 *
 * @example
 * await processJSXIslands({
 *   islandsDir: 'islands-preact',
 *   outputDir: 'dist',
 *   discoveredComponents: [],
 *   elementSuffix: '-preact',
 *   compileIsland: compilePreactIsland
 * })
 */
export async function processJSXIslands({
	islandsDir,
	outputDir,
	discoveredComponents,
	elementSuffix,
	compileIsland,
}) {
	try {
		const files = await fsPromises.readdir(islandsDir);
		const jsxFiles = files.filter(
			(f) => f.endsWith(".jsx") || f.endsWith(".tsx"),
		);

		if (jsxFiles.length === 0) return;

		const outputComponentsDir = path.join(outputDir, "components");
		await fsPromises.mkdir(outputComponentsDir, { recursive: true });

		for (const fileName of jsxFiles) {
			const elementName = getElementName(fileName, elementSuffix);
			const outputFileName = `${elementName}.js`;

			try {
				const sourcePath = path.join(islandsDir, fileName);

				await compileIsland({
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
