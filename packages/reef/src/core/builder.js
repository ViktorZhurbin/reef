import { cp, mkdir, rm } from "node:fs/promises";
import { styleText } from "node:util";
import { OUTPUT_DIR, PAGES_DIR, PUBLIC_DIR } from "../constants/dir.js";
import { layouts } from "../layout/registry.js";
import { defaultPlugins } from "../plugins/defaultPlugins.js";
import { formatMs } from "../utils/format.js";
import { buildJSXPage } from "./build-jsx-page.js";
import { buildMdPage } from "./build-md-page.js";

const allPlugins = defaultPlugins;

/**
 * Build all markdown files to HTML
 * @param {object} [options]
 * @param {boolean} [options.verbose]
 */
export async function buildAll(options = {}) {
	const { verbose = false } = options;
	const startTime = performance.now();

	// init layouts registry
	await layouts.load();

	// Clean up output directory and recreate it
	await rm(OUTPUT_DIR, { recursive: true, force: true });
	await mkdir(OUTPUT_DIR, { recursive: true });

	// Copy public directory to output if it exists
	try {
		await cp(PUBLIC_DIR, OUTPUT_DIR, { recursive: true });
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		// Silently skip if public directory doesn't exist
		if (err.code !== "ENOENT") {
			throw err;
		}
	}

	// Run plugin onBuild hooks (for file copying, etc.)
	for (const plugin of allPlugins) {
		if (plugin.onBuild) {
			await plugin.onBuild({ outputDir: OUTPUT_DIR, contentDir: PAGES_DIR });
		}
	}

	// Collect all files and detect route conflicts in one pass
	const mdFilePaths = [];
	const jsxFilePaths = [];
	const outputMap = new Map(); // htmlPath → sourceFile (for conflict detection)

	const glob = new Bun.Glob("**/*.{md,jsx,tsx}");

	for await (const relativePath of glob.scan(PAGES_DIR)) {
		const htmlPath = relativePath.replace(/\.(md|[jt]sx)$/, ".html");

		// Detect conflicts inline
		if (outputMap.has(htmlPath)) {
			const existingFile = outputMap.get(htmlPath);
			const errorMessage = [
				styleText("yellow", "⚠ Duplicate route conflict detected."),
				`\n${styleText("yellow", "Remove/rename one of the conflicting files to continue:")}`,
				`\n - ${PAGES_DIR}/${existingFile}`,
				`\n - ${PAGES_DIR}/${relativePath}`,
			].join("");

			throw new Error(errorMessage);
		}

		outputMap.set(htmlPath, relativePath);

		// Categorize by type for building
		if (relativePath.endsWith(".md")) {
			mdFilePaths.push(relativePath);
		} else {
			jsxFilePaths.push(relativePath);
		}
	}

	// Build all collected files
	let resultsCount = 0;

	for (const relativePath of mdFilePaths) {
		await buildMdPage(relativePath, {
			logOnStart: verbose,
		});
		resultsCount++;
	}

	for (const relativePath of jsxFilePaths) {
		await buildJSXPage(relativePath, {
			logOnStart: verbose,
		});
		resultsCount++;
	}

	if (resultsCount === 0) {
		console.warn(`No files found in ${PAGES_DIR}`);
		return;
	}

	const buildTime = formatMs(performance.now() - startTime);
	const successMessage = styleText(
		"green",
		`Wrote ${resultsCount} files in ${buildTime}`,
	);

	console.info(successMessage);
}
