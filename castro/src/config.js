/**
 * Castro Configuration
 *
 * All configuration constants and config file loading in one place.
 * This centralizes the "where things live" knowledge.
 */

import { access } from "node:fs/promises";
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
// Temp Directory Utilities
// ============================================================================

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, parse, relative, resolve } from "node:path";

/** Temp directory for compiled modules */
const TEMP_ROOT = join(process.cwd(), "node_modules/.castro-temp");

/** Clean up temp directory */
export function cleanupTempDir() {
	try {
		rmSync(TEMP_ROOT, { recursive: true, force: true });
	} catch {}
}

/** Register cleanup handlers for process exit */
export function setupCleanupOnExit() {
	process.on("exit", cleanupTempDir);
	process.on("SIGINT", () => process.exit());
	process.on("SIGTERM", () => process.exit());
}

/**
 * Ensures the directory exists and returns the path.
 * @param {string} subpath
 * @returns {string}
 */
export function resolveTempDir(subpath) {
	const resolvedSubpath = resolve(process.cwd(), subpath);
	const relativeSubpath = relative(process.cwd(), resolvedSubpath);
	const dirPath = join(TEMP_ROOT, relativeSubpath);

	mkdirSync(dirPath, { recursive: true });

	return dirPath;
}

/**
 * Generates the disk path for the temp file.
 *
 * Mirrors the source file structure inside node_modules/.castro-temp/
 * For example: pages/blog/post.tsx → node_modules/.castro-temp/pages/blog/post.tsx.js
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
 * Write content to temp file and return importable URL
 * @param {string} sourcePath
 * @param {string} content
 * @param {string} [subpath]
 * @returns {string}
 */
function writeTempFile(sourcePath, content, subpath = "") {
	const fullPath = createTempPath(sourcePath, subpath);

	writeFileSync(fullPath, content);

	// pathToFileURL is essential for Windows support in ESM imports
	const pathUrl = pathToFileURL(fullPath).href;

	// Cache-busting ensures fresh imports
	return `${pathUrl}?t=${Date.now()}`;
}

/**
 * Write code to temp file and import it as a module
 *
 * We can't directly import code from a string in ESM, so we:
 * 1. Write the compiled code to a temp file
 * 2. Generate a file:// URL with cache-busting timestamp
 * 3. Dynamic import() the file URL
 *
 * @param {string} sourcePath
 * @param {string} content - Compiled JavaScript code
 * @param {string} [subpath]
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
