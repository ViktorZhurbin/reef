import { styleText } from "node:util";
import { FrameworkConfig } from "../framework-config.js";

/**
 * @import { BunPlugin } from "bun"
 * @import { SupportedFramework } from "../../../types/island.js"
 */

/**
 * esbuild plugin to stub out CSS imports for SSR
 * CSS is not needed for server-side rendering
 * @type {BunPlugin}
 */
const cssStubPlugin = {
	name: "css-stub",
	setup(build) {
		// Stub out all CSS imports
		build.onResolve({ filter: /\.css$/ }, () => ({
			path: "css-stub",
			namespace: "css-stub",
		}));

		build.onLoad({ filter: /.*/, namespace: "css-stub" }, () => ({
			contents: "export default {};",
			loader: "js",
		}));
	},
};

/**
 * Compiles island component for SSR (Node.js execution)
 * Returns compiled code as string instead of writing to disk
 *
 * @param {Object} params
 * @param {string} params.sourcePath - Source file path
 * @param {SupportedFramework} params.framework
 * @returns {Promise<string | null>} Compiled code or null if compilation fails
 */
export async function compileIslandSSR({ sourcePath, framework }) {
	const config = FrameworkConfig[framework];
	const buildConfig = config.getBuildConfig(true);

	try {
		// Merge plugins: CSS stub plugin must come after framework plugins
		// so that framework-specific transformations happen first
		const mergedPlugins = [...(buildConfig.plugins ?? []), cssStubPlugin];

		const result = await Bun.build({
			entrypoints: [sourcePath],
			format: "esm",
			minify: false,
			packages: "external",
			target: "node", // Match reef's node requirement
			write: false, // Keep in memory
			...buildConfig,
			plugins: mergedPlugins, // Override plugins with merged list
		});

		const code = await result.outputs[0].text();

		// Return the compiled code as a string
		return code || "";
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		console.warn(
			styleText("yellow", `SSR compilation skipped for ${sourcePath}:`),
			err.message,
		);
		return null;
	}
}
