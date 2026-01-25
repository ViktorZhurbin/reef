/**
 * Island Processor
 *
 * Discovers and compiles island components from the islands/ directory.
 *
 * File-to-element naming:
 * - islands/counter.tsx → <preact-counter>
 * - islands/nav.tsx → <preact-nav>
 *
 * The prefix identifies the framework. Custom elements require a hyphen
 * in their name (to distinguish from built-in HTML elements), so we use
 * the framework name as the prefix. This makes it obvious which framework
 * is hydrating each component.
 */

import { access, glob, mkdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { styleText } from "node:util";
import { messages } from "../messages.js";
import { compileIsland } from "./compiler.js";
import { PreactConfig } from "./preact-config.js";

/**
 * @import { IslandComponent } from '../types.d.ts'
 */

/**
 * Process all island files in a directory
 *
 * @param {{ sourceDir: string, outputDir: string }} options
 * @returns {Promise<IslandComponent[]>} Discovered and compiled components
 */
export async function processIslands({ sourceDir, outputDir }) {
	const OUTPUT_COMPONENTS_DIR = "components";

	const { elementPrefix } = PreactConfig;

	try {
		// Check if islands directory exists
		await access(sourceDir);
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		if (err.code === "ENOENT") {
			console.warn(
				styleText("red", `Islands directory not found:`),
				styleText("magenta", sourceDir),
			);
			return [];
		}
		throw err;
	}

	// Prepare output directory
	const outputComponentsDir = join(outputDir, OUTPUT_COMPONENTS_DIR);
	await mkdir(outputComponentsDir, { recursive: true });

	// Process each island file

	/** @type {IslandComponent[]} */
	const discoveredComponents = [];

	/** @type {{ sourcePath: string; elementName: string; }[]} */
	const compiledIslands = [];

	await Array.fromAsync(
		glob(join(sourceDir, "**/*.{jsx,tsx}")),
		async (sourcePath) => {
			const fileName = basename(sourcePath);
			const elementName = getElementName(fileName, elementPrefix);
			const outputFileName = `${elementName}.js`;
			const outputPath = join(outputComponentsDir, outputFileName);

			try {
				const compilationResult = await compileIsland({
					sourcePath,
					outputPath,
				});

				/** @type {IslandComponent} */
				const component = {
					elementName,
					outputPath: `/${OUTPUT_COMPONENTS_DIR}/${outputFileName}`,
					ssrCode: compilationResult?.ssrCode || null,
				};

				// Add CSS path if component has styles
				if (compilationResult?.cssOutputPath) {
					const cssFileName = basename(compilationResult.cssOutputPath);
					component.cssPath = `/${OUTPUT_COMPONENTS_DIR}/${cssFileName}`;
				}

				discoveredComponents.push(component);
				compiledIslands.push({ sourcePath, elementName });
			} catch (e) {
				const err = /** @type {NodeJS.ErrnoException} */ (e);

				throw new Error(
					messages.errors.islandBuildFailed(fileName, err.message),
				);
			}
		},
	);

	// Log compiled islands
	if (compiledIslands.length > 0) {
		console.info(
			styleText("green", messages.files.compiled(compiledIslands.length)),
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

	return discoveredComponents;
}

/**
 * Convert filename to custom element name
 *
 * @param {string} fileName - e.g., "counter.tsx"
 * @param {string} [prefix] - e.g., "preact"
 * @returns {string} - e.g., "preact-counter"
 */
function getElementName(fileName, prefix = "component") {
	const ext = extname(fileName);
	const baseName = basename(fileName, ext);

	return `${prefix}-${baseName}`;
}
