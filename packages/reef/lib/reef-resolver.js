import fsPromises from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { CONTENT_DIR } from "../constants/dir.js";

/**
 * @import { Frontmatter } from '../types/layout.js';
 */

/**
 * Walk up directory tree from file path looking for reef.js files
 * Stops at CONTENT_DIR boundary
 *
 * @param {string} filePath - Path to markdown file (relative or absolute)
 * @returns {Promise<Frontmatter|null>} reef.js data object or null if not found
 *
 * @example
 * // content/blog/nested/post.md
 * // Checks: content/blog/nested/reef.js → content/blog/reef.js → content/reef.js
 * const data = await findReefData('content/blog/nested/post.md');
 * // → { layout: 'blog', tags: ['tech'] }
 */
async function findReefData(filePath) {
	// Resolve to absolute path to handle both relative and absolute inputs
	const absoluteFilePath = path.resolve(filePath);
	let currentDir = path.dirname(absoluteFilePath);
	const contentDirAbsolute = path.resolve(CONTENT_DIR);

	while (currentDir.startsWith(contentDirAbsolute)) {
		const reefPath = path.join(currentDir, "reef.js");

		try {
			await fsPromises.access(reefPath);
			// reef.js exists, load it with cache busting for dev mode
			const reefUrl = pathToFileURL(reefPath).href;
			const reefModule = await import(`${reefUrl}?t=${Date.now()}`);

			if (reefModule.default) {
				return reefModule.default;
			}
		} catch (err) {
			// reef.js doesn't exist or failed to load, continue up the tree
		}

		// Move up one directory
		const parentDir = path.dirname(currentDir);
		if (parentDir === currentDir) break; // Reached filesystem root
		currentDir = parentDir;
	}

	return null;
}

/**
 * Resolve which layout to use for a content file via data cascade
 * Priority: frontmatter > reef.js (walking up tree) > default
 *
 * @param {string} filePath - Path to markdown file (relative or absolute)
 * @param {Frontmatter} frontmatter - Parsed frontmatter from file
 * @returns {Promise<string>} Layout name to use
 */
export async function resolveLayout(filePath, frontmatter = {}) {
	// 1. Frontmatter wins (highest priority)
	if (frontmatter?.layout) return frontmatter.layout;

	// 2. Walk up directory tree looking for reef.js
	const reefData = await findReefData(filePath);
	if (reefData?.layout) return reefData.layout;

	// 3. Fall back to default layout
	return "default";
}
