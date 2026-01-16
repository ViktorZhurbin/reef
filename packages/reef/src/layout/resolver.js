import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { styleText } from "node:util";
import { PAGES_DIR } from "../constants/dir.js";

/**
 * @import { PageMeta } from '../types/layout.js';
 */

/**
 * Resolve which layout to use via data cascade
 * Priority: frontmatter > reef.js (walking up tree) > default
 *
 * @param {string} filePath - Path to markdown file
 * @param {PageMeta} meta - Parsed frontmatter
 * @returns {Promise<string>} Layout name
 */
export async function resolveLayout(filePath, meta = {}) {
	// 1. Frontmatter has highest priority
	if (meta?.layout) return meta.layout;

	// 2. Walk up tree for reef.js
	const reefData = await findReefData(filePath);
	if (reefData?.layout) return reefData.layout;

	// 3. Fallback
	return "default";
}

/**
 * Walk up directory tree looking for reef.js
 * Stops at PAGES_DIR boundary
 * @param {string} filePath
 */
async function findReefData(filePath) {
	const absoluteFilePath = resolve(filePath);
	const pagesDirAbsolute = resolve(PAGES_DIR);

	// Check if file is within PAGES_DIR; if not, return early
	const initialRelPath = relative(pagesDirAbsolute, dirname(absoluteFilePath));
	if (initialRelPath.startsWith("..")) {
		return null;
	}

	let currentDir = dirname(absoluteFilePath);

	while (true) {
		const reefPath = join(currentDir, "reef.js");

		// Check if reef.js exists using Bun's native file API
		const reefExists = await Bun.file(reefPath).exists();

		if (reefExists) {
			try {
				const reefUrl = pathToFileURL(reefPath).href;

				// Cache-busting in dev mode to pick up file changes
				const importPath =
					process.env.NODE_ENV === "development"
						? `${reefUrl}?t=${Date.now()}`
						: reefUrl;

				const reefModule = await import(importPath);

				if (reefModule.default) {
					return reefModule.default;
				}
			} catch (e) {
				const err = /** @type {NodeJS.ErrnoException} */ (e);

				console.error(
					styleText("red", `Error loading configuration at ${reefPath}`),
				);
				throw err;
			}
		}

		// Try to move up
		const parentDir = dirname(currentDir);

		// Stop if we've reached filesystem root
		if (parentDir === currentDir) break;

		// Stop if next move would take us above PAGES_DIR
		const nextRelPath = relative(pagesDirAbsolute, parentDir);
		if (nextRelPath.startsWith("..")) break;

		currentDir = parentDir;
	}

	return null;
}
