import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

/**
 * @import { ReefPlugin } from '../../../types/plugin.js';
 *
 * Plugin to load the reef-island custom element runtime
 *
 * @returns {ReefPlugin} Plugin instance
 */
export function reefIsland() {
	return {
		name: "reef-island",

		getAssets() {
			return [
				{
					tag: "script",
					attrs: {
						type: "module",
						src: "/reef-island.js",
					},
				},
			];
		},

		async onBuild({ outputDir }) {
			// Copy reef-island.js to dist during build
			const runtimePath = join(import.meta.dirname, "./custom-element.js");
			const destPath = join(outputDir, "reef-island.js");

			await mkdir(dirname(destPath), { recursive: true });
			await copyFile(runtimePath, destPath);
		},
	};
}
