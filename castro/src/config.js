/**
 * Castro Configuration
 *
 * All configuration constants and config file loading in one place.
 * This centralizes the "where things live" knowledge.
 */

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { access } from "node:fs/promises";
import { join, parse, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { messages } from "./messages.js";

// ============================================================================
// Directory Constants
// ============================================================================

/** Output directory for built files */
export const OUTPUT_DIR = "dist";

/** Static assets that get copied as-is */
export const PUBLIC_DIR = "public";

/** Layout components directory */
export const LAYOUTS_DIR = "layouts";

/** Source pages (markdown and JSX) */
export const PAGES_DIR = "pages";

/** Island components directory */
export const ISLANDS_DIR = "islands";

// ============================================================================
// Config File
// ============================================================================

/** User config file name */
export const CONFIG_FILE = "manifesto.js";

/**
 * @import { CastroConfig } from './types.d.ts'
 */

/**
 * Load user configuration file
 * @returns {Promise<CastroConfig | null>} Configuration object or null if file doesn't exist
 */
export async function loadConfig() {
	try {
		await access(CONFIG_FILE);
		const configUrl = pathToFileURL(CONFIG_FILE).href;
		const config = await import(configUrl);
		return config.default;
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		if (err.code === "ENOENT") return null;
		throw new Error(messages.errors.configLoadFailed(err.message));
	}
}

// ============================================================================
// Persistent Cache Directory
// ============================================================================

/** Cache directory for compiled modules (persistent, not cleaned on exit) */
const CACHE_ROOT = join(process.cwd(), "node_modules/.cache/castro");

/**
 * Clean up cache directory at startup
 *
 * Called once at the beginning of the process to ensure a fresh state.
 * Files persist after the process exits for inspection and debugging.
 */
export function cleanupTempDir() {
	try {
		rmSync(CACHE_ROOT, { recursive: true, force: true });
	} catch {}
}

/**
 * Ensures the directory exists and returns the path
 * @param {string} subpath
 * @returns {string}
 */
export function resolveTempDir(subpath) {
	const resolvedSubpath = resolve(process.cwd(), subpath);
	const relativeSubpath = relative(process.cwd(), resolvedSubpath);
	const dirPath = join(CACHE_ROOT, relativeSubpath);

	mkdirSync(dirPath, { recursive: true });

	return dirPath;
}

/**
 * Generates the cache file path for compiled code
 *
 * Mirrors the source file structure inside node_modules/.cache/castro/
 * For example: pages/blog/post.tsx → node_modules/.cache/castro/pages/blog/post.tsx.js
 *
 * @param {string} sourcePath
 * @param {string} [subpath] - Optional subdirectory (e.g., "ssr" for SSR builds)
 * @returns {string}
 */
export function createTempPath(sourcePath, subpath = "") {
	const parsed = parse(sourcePath);
	const targetDir = resolveTempDir(join(parsed.dir, subpath));
	const fullPath = join(targetDir, `${parsed.base}.js`);

	return fullPath;
}

/**
 * Write content to cache file and return importable URL
 * @param {string} sourcePath
 * @param {string} content
 * @param {string} [subpath]
 * @returns {string}
 */
function writeTempFile(sourcePath, content, subpath = "") {
	const fullPath = createTempPath(sourcePath, subpath);

	try {
		writeFileSync(fullPath, content);
	} catch (err) {
		console.error(`Failed to write cache file: ${fullPath}`, err);
		throw err;
	}

	// pathToFileURL is essential for Windows support in ESM imports
	const pathUrl = pathToFileURL(fullPath).href;

	// Cache-busting ensures fresh imports
	return `${pathUrl}?t=${Date.now()}`;
}

/**
 * Load code from cache file and import it as a module
 *
 * Writes compiled code to a cache file in node_modules/.cache/castro
 * and imports it as an ES module. This approach allows proper module
 * resolution for packages like preact, which is essential since all code
 * must share the same instance.
 *
 * @param {string} sourcePath - Original source path
 * @param {string} content - Compiled JavaScript code
 * @param {string} [subpath] - Optional subdirectory
 * @returns {Promise<any>} The imported module
 */
export async function getModule(sourcePath, content, subpath) {
	const fileUrl = writeTempFile(sourcePath, content, subpath);
	const module = await import(fileUrl);

	return module;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Format milliseconds for display
 * @param {number} ms
 */
export const formatMs = (ms) => `${Math.round(ms)}ms`;
