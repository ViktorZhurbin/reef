/**
 * Island Import Parser
 *
 * Uses esbuild transform to reliably detect island imports.
 *
 * Restrictions (for simplicity):
 * - Only DEFAULT imports are supported
 * - Format: import ComponentName from "../islands/path/to/file.tsx"
 *
 * Not supported (intentionally):
 * - Named imports: import { Counter } from "..."
 * - Namespace imports: import * as Counter from "..."
 * - Re-exports: export { Counter } from "..."
 */

import { readFile } from "node:fs/promises";
import * as esbuild from "esbuild";
import { ISLANDS_DIR } from "../config.js";

/**
 * Parse island imports using esbuild transform
 *
 * Returns a map of import paths to imported names.
 * Uses named capture groups for clarity.
 *
 * Example: Map { "../islands/counter.tsx" => "Counter" }
 *
 * @param {string} sourcePath - Path to source file
 * @returns {Promise<Map<string, string>>} Map of importPath -> importedName
 */
export async function parseIslandImports(sourcePath) {
	const source = await readFile(sourcePath, "utf-8");

	// Transform with esbuild to normalize and validate syntax
	let result;
	try {
		result = await esbuild.transform(source, {
			loader: sourcePath.endsWith(".tsx") ? "tsx" : "jsx",
			format: "esm",
			target: "esnext",
			logLevel: "silent",
		});
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		// If esbuild can't parse the file, return empty map
		console.warn(
			`Failed to parse ${sourcePath} for island imports:`,
			err.message,
		);
		return new Map();
	}

	const imports = new Map();

	// Parse esbuild's normalized output using named capture groups
	//
	// esbuild converts all imports to a standard form like:
	//   import Counter2 from "../islands/counter.tsx";
	//
	// Pattern explanation:
	//   import\s+                        - "import" keyword with whitespace
	//   (?<baseName>\w+?)                - capture base name (e.g., "Counter")
	//   (?<suffix>\d*)                   - optional number suffix (e.g., "2")
	//   \s+from\s+                       - " from " with whitespace
	//   ["'](?<importPath>[^"']+)["']   - import path in quotes
	//
	// Note: esbuild adds number suffixes to avoid naming conflicts.
	// We preserve these suffixes as they represent the actual imported name.

	const importRegex =
		/import\s+(?<baseName>\w+?)(?<suffix>\d*)\s+from\s+["'](?<importPath>[^"']+)["']/g;

	for (const match of result.code.matchAll(importRegex)) {
		if (!match.groups) continue;

		const { baseName, suffix, importPath } = match.groups;

		// Only process imports from islands/ directory
		if (!importPath.includes(`/${ISLANDS_DIR}/`)) continue;

		// Reconstruct original name
		// If esbuild added a number suffix, keep it (e.g., Counter2)
		// Otherwise use base name (e.g., Counter)
		const importedName = baseName + (suffix || "");

		imports.set(importPath, importedName);
	}

	return imports;
}
