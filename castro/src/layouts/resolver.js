/**
 * Layout Resolver
 *
 * Determines which layout to use for a page via "data cascade":
 * 1. Frontmatter/meta `layout` property (highest priority)
 * 2. castro.js file in directory tree (walking up)
 * 3. "default" layout (fallback)
 *
 * The directory cascade pattern means you can create pages/blog/castro.js
 * with `export default { layout: "blog" }` and all pages in pages/blog/
 * will automatically use the blog layout, unless overridden.
 */

import { access } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { styleText } from "node:util";
import { PAGES_DIR } from "../config.js";

/**
 * @import { PageMeta } from '../types.d.ts'
 */

/**
 * Resolve which layout to use for a page
 *
 * Note: This function is only called for pages that use layouts.
 * Pages with layout: false or layout: "none" skip layout wrapping entirely.
 *
 * @param {string} filePath - Path to the page file
 * @param {PageMeta} [meta] - Page metadata/frontmatter
 * @returns {Promise<string>} Layout name
 */
export async function resolveLayout(filePath, meta = {}) {
	// 1. Frontmatter/meta has highest priority
	if (meta?.layout) return meta.layout;

	// 2. Walk up tree looking for castro.js
	const castroData = await findCastroData(filePath);
	if (castroData?.layout) return castroData.layout;

	// 3. Fallback to default
	return "default";
}

/**
 * Walk up directory tree looking for castro.js config
 * Stops at PAGES_DIR boundary
 *
 * @param {string} filePath
 * @returns {Promise<{layout?: string} | null>}
 */
async function findCastroData(filePath) {
	const absoluteFilePath = resolve(filePath);
	const pagesDirAbsolute = resolve(PAGES_DIR);

	// Check if file is within PAGES_DIR
	const initialRelPath = relative(pagesDirAbsolute, dirname(absoluteFilePath));
	if (initialRelPath.startsWith("..")) {
		return null;
	}

	let currentDir = dirname(absoluteFilePath);

	while (true) {
		const castroPath = join(currentDir, "castro.js");

		try {
			await access(castroPath);

			const castroUrl = pathToFileURL(castroPath).href;

			// Cache-busting in dev mode
			const importPath =
				process.env.NODE_ENV === "development"
					? `${castroUrl}?t=${Date.now()}`
					: castroUrl;

			const castroModule = await import(importPath);

			if (castroModule.default) {
				return castroModule.default;
			}
		} catch (e) {
			const err = /** @type {NodeJS.ErrnoException} */ (e);

			if (err.code !== "ENOENT") {
				console.error(
					styleText("red", `Error loading configuration at ${castroPath}`),
				);
				throw err;
			}
		}

		// Move up
		const parentDir = dirname(currentDir);

		// Stop at filesystem root
		if (parentDir === currentDir) break;

		// Stop at PAGES_DIR boundary
		const nextRelPath = relative(pagesDirAbsolute, parentDir);
		if (nextRelPath.startsWith("..")) break;

		currentDir = parentDir;
	}

	return null;
}
