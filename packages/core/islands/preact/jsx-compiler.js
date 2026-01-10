import fsPromises from "node:fs/promises";
import path from "node:path";
import tsPreset from "@babel/preset-typescript";
import {
	createBabelPlugin,
	writeEsbuildOutput,
} from "@vktrz/bare-static/plugin-utils";
import * as esbuild from "esbuild";

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
    // shadow: false = no shadow DOM (consistent with Solid version)
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
