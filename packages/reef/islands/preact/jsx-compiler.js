import fsPromises from "node:fs/promises";
import path from "node:path";
import tsPreset from "@babel/preset-typescript";
import * as esbuild from "esbuild";
import { createBabelPlugin, writeEsbuildOutput } from "../../utils/index.js";

/**
 * A tiny esbuild plugin to handle Preact JSX via Babel
 */
const preactBabelPlugin = createBabelPlugin("preact-babel", () => ({
	presets: [[tsPreset]],
	plugins: [
		[
			"@babel/plugin-transform-react-jsx",
			{
				runtime: "automatic",
				importSource: "preact",
			},
		],
	],
}));

export async function compileJSXIsland({
	sourcePath,
	outputPath,
	elementName,
}) {
	/**
	 * Virtual entry for Preact using preact-custom-element
	 * Much simpler than Solid version - register() handles everything
	 */
	const virtualEntry = `
    import register from 'preact-custom-element';
    import Component from './${path.basename(sourcePath)}';

    // Register component as custom element
    // Empty array = no observed attributes (or infer from propTypes)
    register(Component, '${elementName}', [], { shadow: false });
  `.trim();

	const result = await esbuild.build({
		stdin: {
			contents: virtualEntry,
			resolveDir: path.dirname(sourcePath),
			loader: "js",
		},
		bundle: true,
		format: "esm",
		target: "es2020",
		write: false,
		outfile: outputPath, // Helper for CSS generation
		plugins: [preactBabelPlugin],
		external: [
			"preact",
			"preact/hooks",
			"preact/jsx-runtime",
			"preact-custom-element",
		],
		logLevel: "warning",
	});

	await fsPromises.mkdir(path.dirname(outputPath), { recursive: true });
	return writeEsbuildOutput(result);
}
