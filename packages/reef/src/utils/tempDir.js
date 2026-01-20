import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, parse, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const TEMP_ROOT = join(process.cwd(), "node_modules/.reef-temp");

export function cleanupTempDir() {
	try {
		rmSync(TEMP_ROOT, { recursive: true, force: true });
	} catch {}
}

export function setupCleanupOnExit() {
	// Ensures cleanup happens on success or Ctrl+C
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
 * @param {string} sourcePath
 * @param {string} [subpath]
 * @returns {string}
 */
export function createTempPath(sourcePath, subpath = "") {
	const parsed = parse(sourcePath);

	// Combine the source file's directory with the optional subpath
	const targetDir = resolveTempDir(join(parsed.dir, subpath));
	const fullPath = join(targetDir, `${parsed.base}.js`);

	return fullPath;
}

/**
 * @param {string} sourcePath
 * @param {string} content
 * @param {string} [subpath]
 *
 * @returns {string}
 */
function writeTempFile(sourcePath, content, subpath = "") {
	const fullPath = createTempPath(sourcePath, subpath);

	writeFileSync(fullPath, content);

	// pathToFileURL is essential for Windows support in ESM imports
	const pathUrl = pathToFileURL(fullPath).href;

	// Cache-busting ensures that if the same file is compiled twice,
	// Node.js doesn't serve the old version from memory.
	return `${pathUrl}?t=${Date.now()}`;
}

/**
 * Cleanly imports a generated string as a module and removes the trace.
 * @param {string} sourcePath
 * @param {string} content
 * @param {string} [subpath]
 */
export async function getModule(sourcePath, content, subpath) {
	// Write to a temp file
	const fileUrl = writeTempFile(sourcePath, content, subpath);

	// Load it into the V8 engine
	const module = await import(fileUrl);

	return module;
}
