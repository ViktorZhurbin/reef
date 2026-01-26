/**
 * Islands Registry
 *
 * Central command for the islands system. Handles:
 * 1. Discovery & Compilation (Build time)
 * 2. Storage (Registry of available islands)
 * 3. Resolution (Mapping imports to islands during page rendering)
 */

import { access, glob, mkdir } from "node:fs/promises";
import { basename, extname, join, relative } from "node:path";
import { styleText } from "node:util";
import { messages } from "../messages.js";
import { compileIsland } from "./compiler.js";

/**
 * @import { IslandComponent, IslandsMap } from '../types.d.ts'
 */

/**
 * Singleton registry for islands
 */
class IslandsRegistry {
	/** @type {IslandsMap} */
	#islands = new Map();

	/** @type {string} */
	#sourceDir = "";

	/**
	 * Load (or reload) all islands from disk
	 * @param {{ sourceDir: string, outputDir: string }} options
	 * @returns {Promise<void>}
	 */
	async load({ sourceDir, outputDir }) {
		this.#sourceDir = sourceDir;
		const componentsMap = new Map();

		try {
			// Check if islands directory exists
			await access(sourceDir);
		} catch (e) {
			const err = /** @type {NodeJS.ErrnoException} */ (e);
			if (err.code === "ENOENT") {
				console.warn(
					styleText("red", `Islands directory not found:`),
					styleText("magenta", sourceDir),
				);
				this.#islands = componentsMap;
				return;
			}
			throw err;
		}

		// Prepare output directory
		const outputIslandsDir = join(outputDir, this.#sourceDir);
		await mkdir(outputIslandsDir, { recursive: true });

		// Process each island file
		/** @type {{ sourcePath: string }[]} */
		const compiledIslands = [];

		await Array.fromAsync(
			glob(join(sourceDir, "**/*.{jsx,tsx}")),
			async (sourcePath) => {
				const fileName = basename(sourcePath);
				const registryKey = this.deriveRegistryKey(sourcePath);

				// Convert "ui/Button.tsx" → "ui/Button.js"
				const ext = extname(registryKey);
				const outputFileName = registryKey.replace(ext, ".js");
				const outputPath = join(outputIslandsDir, outputFileName);

				try {
					const compilationResult = await compileIsland({
						sourcePath,
						outputPath,
					});

					/** @type {IslandComponent} */
					const component = {
						outputPath: `/${this.#sourceDir}/${outputFileName}`,
						ssrCode: compilationResult?.ssrCode || null,
					};

					// Add CSS path if component has styles
					if (compilationResult?.cssOutputPath) {
						const cssFileName = basename(compilationResult.cssOutputPath);
						component.cssPath = `/${this.#sourceDir}/${cssFileName}`;
					}

					componentsMap.set(registryKey, component);
					compiledIslands.push({ sourcePath });
				} catch (e) {
					const err = /** @type {NodeJS.ErrnoException} */ (e);
					throw new Error(
						messages.errors.islandBuildFailed(fileName, err.message),
					);
				}
			},
		);

		// Log compiled islands
		if (compiledIslands.length > 0) {
			console.info(
				styleText("green", messages.files.compiled(compiledIslands.length)),
			);
			for (const { sourcePath } of compiledIslands) {
				const relativePath = relative(process.cwd(), sourcePath);
				console.info(`  ${styleText("cyan", relativePath)}`);
			}
		}

		this.#islands = componentsMap;
	}

	/**
	 * Derive registry key from island file path
	 *
	 * Uses path relative to islands/ directory to preserve structure.
	 *
	 * Examples:
	 *   /path/to/islands/counter.tsx → "counter.tsx"
	 *   /path/to/islands/ui/Button.tsx → "ui/Button.tsx"
	 *
	 * @param {string} absolutePath - Absolute path to island file
	 * @returns {string} Registry key (relative path with extension)
	 */
	deriveRegistryKey(absolutePath) {
		// Get path relative to islands directory
		const pathAfterSourceDir = relative(this.#sourceDir, absolutePath);

		return pathAfterSourceDir;
	}

	/**
	 * Get all islands
	 * @returns {IslandsMap}
	 */
	getAll() {
		return this.#islands;
	}

	/**
	 * Create a resolver for a specific page's imports
	 * @param {Map<string, string>} importedIslands - Map of importPath -> importName
	 * @returns {IslandResolver}
	 */
	createResolver(importedIslands) {
		return new IslandResolver(importedIslands, this.#islands, this.#sourceDir);
	}
}

/**
 * Resolver for a specific page context
 * Matches imported component names to detailed island metadata
 */
export class IslandResolver {
	/** @type {Map<string, string>} */
	#importMap;

	/** @type {IslandsMap} */
	#registry;

	/** @type string */
	#sourceDir;

	/** @type {Set<string>} */
	#collectedCSS = new Set();

	/**
	 * @param {Map<string, string>} importMap - importPath -> importName
	 * @param {string} sourceDir
	 * @param {IslandsMap} registry
	 */
	constructor(importMap, registry, sourceDir) {
		this.#importMap = importMap;
		this.#registry = registry;
		this.#sourceDir = sourceDir;
	}

	/**
	 * Check if a component name matches an imported island
	 * @param {string} componentName - Component function name from VNode
	 * @returns {boolean}
	 */
	isIsland(componentName) {
		// Check if any imported island has this component name
		for (const [, importedName] of this.#importMap) {
			if (importedName === componentName) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Get island metadata from registry by component name
	 * @param {string} componentName - Component function name from VNode
	 * @returns {IslandComponent | null}
	 */
	getIsland(componentName) {
		// Find the import path that matches this component name
		let matchingImportPath = null;
		for (const [importPath, importedName] of this.#importMap) {
			if (importedName === componentName) {
				matchingImportPath = importPath;
				break;
			}
		}

		if (!matchingImportPath) return null;

		// Derive registry key from import path
		const registryKey = this.#deriveKeyFromImportPath(matchingImportPath);

		const island = this.#registry.get(registryKey);

		if (!island) {
			throw new Error(
				`Island registry mismatch: "${componentName}" from "${matchingImportPath}" ` +
					`maps to key "${registryKey}" but no island found in registry.\n` +
					`Available islands: ${Array.from(this.#registry.keys()).join(", ")}`,
			);
		}

		if (island.cssPath) {
			this.#collectedCSS.add(island.cssPath);
		}

		return island;
	}

	/**
	 * Derive registry key from import path
	 *
	 * Extracts the relative path after the islands directory.
	 * Uses the directory name from sourceDir (configurable, not hardcoded).
	 *
	 * Examples (assuming sourceDir is "islands" or ends with "/islands"):
	 *   "../islands/counter.tsx" → "counter.tsx"
	 *   "../../islands/ui/Button.tsx" → "ui/Button.tsx"
	 *
	 * @param {string} importPath - Import path from source code
	 * @returns {string} Registry key
	 */
	#deriveKeyFromImportPath(importPath) {
		// Escape special regex characters to prevent regex injection
		// e.g., "my.islands" becomes "my\\.islands"
		const escapedDirName = this.#sourceDir.replace(
			/[.*+?^${}()|[\]\\]/g,
			"\\$&",
		);

		// Build regex with named capture group using the escaped directory name
		// Pattern: /dirName/path/to/file.tsx
		const pattern = new RegExp(
			`\\/(?<dirName>${escapedDirName})\\/(?<pathAfterDir>.+)$`,
		);

		const match = importPath.match(pattern);

		if (!match || !match.groups) {
			throw new Error(
				`Invalid island import path: "${importPath}". ` +
					`Island imports must include "/${this.#sourceDir}/" in the path.`,
			);
		}

		return match.groups.pathAfterDir;
	}

	/**
	 * Get all collected CSS files
	 * @returns {string[]}
	 */
	getCollectedCSS() {
		return Array.from(this.#collectedCSS);
	}
}

// Export singleton instance
export const islands = new IslandsRegistry();
