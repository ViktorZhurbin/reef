import { basename, extname, join } from "node:path";
import { styleText } from "node:util";
import { FrameworkConfig } from "../framework-config.js";
import { compileIsland } from "./compile-island.js";

/**
 * @import { IslandComponent, SupportedFramework } from '../../../types/island.js';
 */

/**
 * Process JSX island files - compile and register as web components
 * @param {{
 * 	sourceDir: string,
 * 	outputDir: string;
 * 	framework: SupportedFramework;
 * }} options
 *
 * @returns {Promise<IslandComponent[] | undefined>}
 */
export async function processJSXIslands({ sourceDir, outputDir, framework }) {
	const OUTPUT_COMPONENTS_DIR = "components";

	const { elementSuffix } = FrameworkConfig[framework];

	// Discover island files using Bun.Glob
	const glob = new Bun.Glob("*.{jsx,tsx}");
	const jsxFiles = [];

	try {
		for await (const fileName of glob.scan(sourceDir)) {
			jsxFiles.push(fileName);
		}
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

	/** @type IslandComponent[] */
	const discoveredComponents = [];
	const compiledIslands = [];

	if (jsxFiles.length === 0) return discoveredComponents;

	const outputComponentsDir = join(outputDir, OUTPUT_COMPONENTS_DIR);

	for (const fileName of jsxFiles) {
		const elementName = getElementName(fileName, elementSuffix);
		const outputFileName = `${elementName}.js`;

		const sourcePath = join(sourceDir, fileName);
		const outputPath = join(outputComponentsDir, outputFileName);

		try {
			const compilationResult = await compileIsland({
				sourcePath,
				outputPath,
				framework,
			});

			/** @type {IslandComponent} */
			const component = {
				elementName,
				outputPath: `/${OUTPUT_COMPONENTS_DIR}/${outputFileName}`,
				framework,
				ssrCode: compilationResult?.ssrCode || null,
			};

			// Add CSS path if it exists
			if (compilationResult?.cssOutputPath) {
				const cssFileName = basename(compilationResult.cssOutputPath);
				component.cssPath = `/${OUTPUT_COMPONENTS_DIR}/${cssFileName}`;
			}

			discoveredComponents.push(component);
			compiledIslands.push({ sourcePath, elementName });
		} catch (e) {
			const err = /** @type {NodeJS.ErrnoException} */ (e);

			throw new Error(`Failed to process island ${fileName}: ${err.message}`);
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

		return discoveredComponents;
	}
}

/**
 * @param {string} fileName
 * @param {string} [suffix]
 */
function getElementName(fileName, suffix = "-component") {
	const ext = extname(fileName);
	const baseName = basename(fileName, ext);

	return `${baseName}${suffix}`;
}
