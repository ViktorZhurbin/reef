import fsPromises from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";
import {
	CONTENT_DIR,
	OUTPUT_DIR,
	PAGES_DIR,
	PUBLIC_DIR,
} from "../constants/dir.js";
import { preactIslands } from "../islands/preact/index.js";
import { solidIslands } from "../islands/solid/index.js";
import { buildJSXPage } from "./build-jsx-page.js";
import { loadConfig } from "./config-loader.js";
import { loadLayouts } from "./layouts.js";
import { buildMdPage } from "./build-md-page.js";

/**
 * @import { BuildAllOptions } from '../types/build.js';
 */

const formatMs = (ms) => `${Math.round(ms)}ms`;

// Load layouts once at module load
let layouts = await loadLayouts();

// Load config once at module load
const config = await loadConfig();

/**
 * Reload layouts (for dev mode when layout files change)
 */
export async function reloadLayouts() {
	layouts = await loadLayouts();
}

const defaultPlugins = [solidIslands(), preactIslands()];

/**
 * Build all markdown files to HTML
 * @param {BuildAllOptions} [options] - Build options
 */
export async function buildAll(options = {}) {
	const { injectScript = "", verbose = false, plugins = [] } = options;
	const startTime = performance.now();

	// Clean up output directory and recreate it
	await fsPromises.rm(OUTPUT_DIR, { recursive: true, force: true });
	await fsPromises.mkdir(OUTPUT_DIR, { recursive: true });

	// Copy public directory to output if it exists
	try {
		await fsPromises.cp(PUBLIC_DIR, OUTPUT_DIR, { recursive: true });
	} catch (err) {
		// Silently skip if public directory doesn't exist
		if (err.code !== "ENOENT") {
			throw err;
		}
	}

	// Merge plugins from config and options
	const allPlugins = [
		...(config?.plugins || []),
		...defaultPlugins,
		...plugins,
	];

	// Run plugin onBuild hooks (for file copying, etc.)
	for (const plugin of allPlugins) {
		if (plugin.onBuild) {
			await plugin.onBuild({ outputDir: OUTPUT_DIR, contentDir: CONTENT_DIR });
		}
	}

	// Helper to safely build files from a directory (handles missing directories)
	const safeBuildFrom = async (dir, pattern, buildFn, extraOptions = {}) => {
		try {
			return await Array.fromAsync(
				fsPromises.glob(path.join(dir, pattern)),
				(filePath) => {
					const relativePath = path.relative(dir, filePath);
					return buildFn(relativePath, {
						injectScript,
						logOnStart: verbose,
						plugins: allPlugins,
						...extraOptions,
					});
				},
			);
		} catch (err) {
			// Directory doesn't exist, return empty array
			if (err.code === "ENOENT") {
				return [];
			}
			throw err;
		}
	};

	// Build all markdown files
	const mdBuildPromises = await safeBuildFrom(
		CONTENT_DIR,
		"**/*.md",
		buildMdPage,
		{ layouts },
	);

	// Build all JSX pages
	const jsxBuildPromises = await safeBuildFrom(
		PAGES_DIR,
		"**/*.{jsx,tsx}",
		buildJSXPage,
	);

	// Combine all build promises
	const allBuildPromises = [...mdBuildPromises, ...jsxBuildPromises];

	if (allBuildPromises.length === 0) {
		console.warn(`No files found in ${CONTENT_DIR} or ${PAGES_DIR}`);
		return;
	}

	const results = await Promise.all(allBuildPromises);

	const successCount = results.filter((r) => r === true).length;
	const failCount = allBuildPromises.length - successCount;

	const buildTime = formatMs(performance.now() - startTime);

	const successMessage = styleText(
		"green",
		`Wrote ${successCount} files in ${buildTime}`,
	);
	if (failCount > 0) {
		console.info(
			`${successMessage} ${styleText("yellow", `(${failCount} failed)`)}`,
		);
	} else {
		console.info(successMessage);
	}
}
