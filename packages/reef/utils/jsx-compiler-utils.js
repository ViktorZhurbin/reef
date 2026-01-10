import fsPromises from "node:fs/promises";

/**
 * @import { Plugin as EsbuildPlugin } from 'esbuild'
 * @import { TransformOptions as BabelTransformOptions } from '@babel/core'
 */

/**
 * Creates a generic Babel plugin for esbuild that transforms JSX files
 * @param {string} name - Plugin name
 * @param {(filepath: string) => BabelTransformOptions} getBabelConfig - Function that receives the file path and returns Babel config (presets, plugins)
 * @returns {EsbuildPlugin} esbuild plugin
 */
export function createBabelPlugin(name, getBabelConfig) {
	return {
		name,
		setup(build) {
			build.onLoad({ filter: /\.[jt]sx$/ }, async (args) => {
				const source = await fsPromises.readFile(args.path, "utf8");

				const babelConfig = getBabelConfig(args.path);
				const { code } = await import("@babel/core").then((babel) =>
					babel.transformAsync(source, {
						filename: args.path,
						...babelConfig,
					})
				);

				return { contents: code, loader: "js" };
			});
		},
	};
}

/**
 * Writes esbuild output files to disk and returns the CSS path if generated
 * @param {import('esbuild').BuildResult} result - The esbuild result object
 * @returns {Promise<{cssOutputPath: string | null}>} The path to the generated CSS file, or null
 */
export async function writeEsbuildOutput(result) {
	let cssOutputPath = null;

	// Write all output files (JS and potential CSS)
	if (result.outputFiles) {
		for (const file of result.outputFiles) {
			await fsPromises.writeFile(file.path, file.text);

			if (file.path.endsWith(".css")) {
				cssOutputPath = file.path;
			}
		}
	}

	return { cssOutputPath };
}
