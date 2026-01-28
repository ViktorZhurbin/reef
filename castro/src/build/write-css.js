/**
 * CSS Writing Utility
 *
 * Shared function for writing CSS files extracted by esbuild.
 * Used by both pages and layouts.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import { OUTPUT_DIR } from "../config.js";

/**
 * @import * as esbuild from 'esbuild'
 * @import { Asset } from '../types.d.ts'
 */

/**
 * Write CSS files to a specified directory
 *
 * @param {esbuild.OutputFile[]} cssFiles - CSS output from esbuild
 * @param {string} outputDir - Directory to write CSS files to
 * @returns {Promise<Asset[]>} CSS assets for injection
 */
export async function writeCSSFiles(cssFiles, outputDir) {
	if (cssFiles.length === 0) return [];

	const cssAssets = [];

	// Ensure output directory exists
	await mkdir(outputDir, { recursive: true });

	for (const cssFile of cssFiles) {
		// esbuild outputs files like "component.tsx.css" or "page.jsx.css"
		// Strip the source extension to get clean names like "page.css"
		const originalName = basename(cssFile.path);
		const cssFileName = originalName.replace(/\.(jsx|tsx|js|ts)\.css$/, ".css");

		const cssOutputPath = join(outputDir, cssFileName);

		// Write CSS to disk
		await writeFile(cssOutputPath, cssFile.text);

		// Calculate public path (relative to output root)
		const cssPublicPath = `/${relative(OUTPUT_DIR, cssOutputPath)}`;

		// Create Asset object for unified injection
		cssAssets.push({
			tag: "link",
			attrs: { rel: "stylesheet", href: cssPublicPath },
		});
	}

	return cssAssets;
}
