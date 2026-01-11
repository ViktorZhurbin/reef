import fsPromises from "node:fs/promises";
import path from "node:path";
import * as esbuild from "esbuild";
import { preactBabelPlugin, writeEsbuildOutput } from "../../utils/index.js";

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
