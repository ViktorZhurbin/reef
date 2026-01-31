/**
 * Builder - Main Build Orchestrator
 *
 * This is the entry point for building your site.
 * It coordinates all the steps:
 * 1. Load layouts
 * 2. Clean and prepare output directory
 * 3. Copy public assets
 * 4. Run plugin build hooks
 * 5. Build all pages (markdown and JSX)
 */

import { cp, glob, mkdir, rm } from "node:fs/promises";
import { join, relative } from "node:path";
import { OUTPUT_DIR, PAGES_DIR, PUBLIC_DIR } from "../constants.js";
import { defaultPlugins } from "../islands/plugins.js";
import { layouts } from "../layouts/registry.js";
import { messages } from "../messages/index.js";
import { formatMs } from "../utils/format.js";
import { buildJSXPage } from "./page-jsx.js";
import { buildMarkdownPage } from "./page-markdown.js";

/**
 * Build all pages to HTML
 *
 * @param {{ verbose?: boolean }} [options]
 */
export async function buildAll(options = {}) {
	const { verbose = false } = options;
	const startTime = performance.now();

	console.info(messages.build.starting);

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
	for (const plugin of defaultPlugins) {
		if (plugin.onBuild) {
			await plugin.onBuild({ outputDir: OUTPUT_DIR, contentDir: PAGES_DIR });
		}
	}

	// Initialize layouts registry
	await layouts.load();

	// Collect all pages and detect route conflicts
	//
	// We scan all .md, .jsx, and .tsx files in pages/ and check if any
	// would produce the same .html output path (e.g., foo.md and foo.jsx
	// both want to become foo.html). This prevents silent overwrites.
	/** @type {string[]} */
	const mdFilePaths = [];
	/** @type {string[]} */
	const jsxFilePaths = [];

	const outputMap = new Map(); // htmlPath → sourceFile (for conflict detection)

	try {
		await Array.fromAsync(
			glob(join(PAGES_DIR, "**/*.{md,jsx,tsx}")),
			(filePath) => {
				const relativePath = relative(PAGES_DIR, filePath);
				const htmlPath = relativePath.replace(/\.(md|[jt]sx)$/, ".html");

				// Detect route conflicts (two files producing same output)
				if (outputMap.has(htmlPath)) {
					const existingFile = outputMap.get(htmlPath);
					const errorMessage = messages.errors.routeConflict(
						`${PAGES_DIR}/${existingFile}`,
						`${PAGES_DIR}/${relativePath}`,
					);

					throw new Error(errorMessage);
				}

				outputMap.set(htmlPath, relativePath);

				// Categorize by type
				if (relativePath.endsWith(".md")) {
					mdFilePaths.push(relativePath);
				} else {
					jsxFilePaths.push(relativePath);
				}
			},
		);
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		if (err.code === "ENOENT") {
			return;
		}
		throw err;
	}

	// Build all pages
	let resultsCount = 0;

	for (const relativePath of mdFilePaths) {
		await buildMarkdownPage(relativePath, { logOnStart: verbose });
		resultsCount++;
	}

	for (const relativePath of jsxFilePaths) {
		await buildJSXPage(relativePath, { logOnStart: verbose });
		resultsCount++;
	}

	if (resultsCount === 0) {
		console.warn(messages.build.noFiles);
		return;
	}

	const buildTime = formatMs(performance.now() - startTime);
	console.info(messages.build.success(`${resultsCount}`, buildTime));
}
