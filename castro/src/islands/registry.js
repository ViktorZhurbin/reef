/**
 * Islands Registry
 *
 * Central command for the islands system. Handles:
 * 1. Discovery & Compilation (Build time)
 * 2. Storage (Registry of available islands)
 * 3. Resolution (Mapping imports to islands during page rendering)
 */

import { access, glob, mkdir } from "node:fs/promises";
import { join, relative } from "node:path";
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

	/** @type {Set<string>} */
	#currentPageCSS = new Set();

	/**
	 * Collects assets for currently processed island
	 *
	 * @param {string} componentName
	 */
	trackIsland(componentName) {
		const island = this.getIsland(componentName);

		if (island?.publicCssPath) {
			this.#currentPageCSS.add(island.publicCssPath);
		}
	}

	/**
	 * Returns CSS paths for all islands detected on a page, and clears tracking state
	 *
	 * @returns {{ cssPaths: string[] }}
	 */
	untrackPageIslands() {
		const cssPaths = Array.from(this.#currentPageCSS);
		this.#currentPageCSS.clear();

		return { cssPaths };
	}

	/**
	 * Load (or reload) all islands from disk
	 * @param {{ islandsDir: string, outputDir: string }} options
	 * @returns {Promise<void>}
	 */
	async load({ islandsDir, outputDir }) {
		// Clear existing islands (for reload support)
		this.#islands.clear();

		try {
			// Check if islands directory exists
			await access(islandsDir);
		} catch (e) {
			const err = /** @type {NodeJS.ErrnoException} */ (e);
			if (err.code === "ENOENT") {
				console.warn(
					styleText("red", `Islands directory not found:`),
					styleText("magenta", islandsDir),
				);
				return;
			}
			throw err;
		}

		// Prepare output directory
		const outputIslandsDir = join(outputDir, islandsDir);
		await mkdir(outputIslandsDir, { recursive: true });

		// Process each island file
		/** @type {{ sourcePath: string }[]} */
		const compiledIslands = [];

		await Array.fromAsync(
			glob(join(islandsDir, "**/*.{jsx,tsx}")),
			async (sourcePath) => {
				// Preserve directory structure in output
				// e.g., islands/ui/Button.tsx → ui/Button.tsx → ui/Button.js
				const outputFilePath = relative(
					islandsDir,
					sourcePath.replace(/\.[jt]sx?$/, ".js"),
				);

				const outputPath = join(outputIslandsDir, outputFilePath);
				const publicPath = `/${islandsDir}/${outputFilePath}`;

				try {
					// Compiler handles all path logic and returns public HTTP paths
					const component = await compileIsland({
						sourcePath,
						outputPath,
						publicPath,
					});

					const existingIsland = this.#islands.get(component.name);
					// Check for component name collision
					if (existingIsland) {
						const currentFilePath = relative(process.cwd(), sourcePath);
						const existingFilePath = relative(
							process.cwd(),
							existingIsland.sourcePath,
						);

						throw new Error(
							`\n${styleText("red", "❌ Component name collision:")}\n\n` +
								`Component name ${styleText("cyan", `"${component.name}"`)} is defined in multiple files:\n` +
								`  ${styleText("yellow", "1.")} ${existingFilePath}\n` +
								`  ${styleText("yellow", "2.")} ${currentFilePath}\n\n` +
								`${styleText("bold", "Each island must have a unique component name.")}`,
						);
					}

					this.#islands.set(component.name, component);
					compiledIslands.push({ sourcePath });
				} catch (e) {
					const err = /** @type {NodeJS.ErrnoException} */ (e);
					throw new Error(err.message);
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
	}

	/**
	 * Get all islands
	 * @returns {IslandsMap}
	 */
	getAll() {
		return this.#islands;
	}

	/**
	 * Check if a component name matches a registered island
	 * Uses explicit component names from defineIsland() calls.
	 *
	 * @param {string} componentName - Component function name from VNode
	 * @returns {boolean}
	 */
	isIsland(componentName) {
		return this.#islands.has(componentName);
	}

	/**
	 * Get island metadata from registry by component name
	 *
	 * @param {string} componentName - Component function name from VNode
	 * @returns {IslandComponent | undefined}
	 */
	getIsland(componentName) {
		return this.#islands.get(componentName);
	}
}

// Export singleton instance
export const islands = new IslandsRegistry();
