import { basename, dirname } from "node:path";
import * as esbuild from "esbuild";
import { writeBuildOutput } from "../../utils/index.js";

export async function compilePreactIsland({
	sourcePath,
	outputPath,
	elementName,
}) {
	/**
	 * Virtual entry for Preact using preact-custom-element
	 */
	const virtualEntry = `
    import register from 'preact-custom-element';
    import Component from './${basename(sourcePath)}';

    // Register component as custom element
    // Empty array = no observed attributes (or infer from propTypes)
    register(Component, '${elementName}', [], { shadow: false });
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
		jsx: "automatic",
		jsxImportSource: "preact",
		external: [
			"preact",
			"preact/hooks",
			"preact/jsx-runtime",
			"preact-custom-element",
		],
		logLevel: "warning",
	});

	return writeBuildOutput(result, outputPath);
}
