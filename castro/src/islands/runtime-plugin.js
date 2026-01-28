/**
 * Castro Island Runtime Plugin
 *
 * Copies the island runtime file to dist/ and injects it into HTML.
 *
 * Runtime file:
 * - castro-island.js: Custom element definition for <castro-island>
 *
 * This file runs in the browser and handles lazy loading/hydration.
 */

import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

/**
 * @import { CastroPlugin } from '../types.d.ts'
 */

/**
 * Plugin that loads the castro-island custom element runtime
 * @returns {CastroPlugin}
 */
export function castroIslandRuntime() {
	return {
		name: "castro-island-runtime",

		getAssets() {
			return [
				{
					tag: "script",
					attrs: { type: "module", src: "/castro-island.js" },
				},
			];
		},

		async onBuild({ outputDir }) {
			await mkdir(dirname(outputDir), { recursive: true });

			// Copy runtime file to dist
			await copyFile(
				join(import.meta.dirname, "./hydration.js"),
				join(outputDir, "castro-island.js"),
			);
		},
	};
}
