import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * @import { ReefPlugin } from '../../types/plugin.js';
 */

/**
 * Injects is-land core library and framework initialization scripts
 *
 * @returns {ReefPlugin} Plugin instance
 */
export function isLandCore() {
	return {
		name: "is-land-core",

		async getAssets() {
			// Read the initialization script
			const initScriptPath = join(import.meta.dirname, "./init-runtime.js");
			const initScriptContent = await readFile(initScriptPath, "utf-8");

			return [
				{
					tag: "script",
					attrs: {
						type: "module",
						src: "https://cdn.jsdelivr.net/npm/@11ty/is-land@5.0.0/is-land.js",
					},
				},
				{
					tag: "script",
					attrs: {
						type: "module",
					},
					content: initScriptContent,
				},
			];
		},
	};
}
