import { readFile } from "node:fs/promises";
import { basename, dirname } from "node:path";
import tsPreset from "@babel/preset-typescript";
import solidPreset from "babel-preset-solid";
import * as esbuild from "esbuild";
import { writeBuildOutput } from "../../../utils/write-build-output.js";

/**
 * A tiny esbuild plugin to handle Solid JSX via Babel
 */
const solidBabelPlugin = {
	name: "solid-babel",
	setup(build) {
		build.onLoad({ filter: /\.[jt]sx$/ }, async (args) => {
			const source = await readFile(args.path, "utf8");

			const { code } = await import("@babel/core").then((babel) =>
				babel.transformAsync(source, {
					filename: args.path,
					presets: [
						[solidPreset, { generate: "dom", hydratable: false }],
						[tsPreset],
					],
				}),
			);

			return { contents: code, loader: "js" };
		});
	},
};

export async function compileSolidIsland({ sourcePath, outputPath }) {
	/**
	 * Virtual entry for Solid - exports component for is-land lazy loading
	 */
	const virtualEntry = `
    import Component from './${basename(sourcePath)}';
    export default Component;
  `.trim();

	const result = await esbuild.build({
		stdin: {
			contents: virtualEntry,
			resolveDir: dirname(sourcePath),
			loader: "js",
		},
		bundle: true,
		format: "esm",
		target: "es2020",
		write: false,
		outfile: outputPath, // Helper for CSS generation
		plugins: [solidBabelPlugin], // Let esbuild handle CSS natively
		external: ["solid-js", "solid-js/web"],
		logLevel: "warning",
	});

	return writeBuildOutput(result, outputPath);
}
