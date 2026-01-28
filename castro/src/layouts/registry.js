/**
 * Layouts Registry
 *
 * Singleton that holds all loaded layout components.
 * Layouts are JSX functions that wrap page content.
 *
 * Educational note: A "registry" is a pattern for storing
 * and accessing shared resources. Here we store layout
 * functions so any page can use them.
 */

import { loadLayouts } from "./loader.js";

/**
 * @import { LayoutComponent, Asset, LayoutsMap, AssetsMap } from '../types.d.ts'
 */

/**
 * Singleton registry for layouts
 */
class LayoutsRegistry {
	/** @type {LayoutsMap} */
	#layouts = new Map();

	/** @type {AssetsMap} */
	#layoutCssAssets = new Map();

	/**
	 * Load (or reload) all layouts from disk
	 * @returns {Promise<void>}
	 */
	async load() {
		const { layouts, cssAssets } = await loadLayouts();
		this.#layouts = layouts;
		this.#layoutCssAssets = cssAssets;
	}

	/**
	 * Get all layouts
	 * @returns {LayoutsMap}
	 */
	getAll() {
		return this.#layouts;
	}

	/**
	 * Get a specific layout by name
	 * @param {string} name - Layout name (filename without extension)
	 * @returns {LayoutComponent | undefined}
	 */
	get(name) {
		return this.#layouts.get(name);
	}

	/**
	 * Get CSS assets for a specific layout
	 * @param {string} name - Layout name (filename without extension)
	 * @returns {Asset[]}
	 */
	getCssAssets(name) {
		return this.#layoutCssAssets.get(name) ?? [];
	}
}

// Export singleton instance
export const layouts = new LayoutsRegistry();
