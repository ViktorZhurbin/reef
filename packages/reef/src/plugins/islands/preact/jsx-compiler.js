import { basename, dirname } from "node:path";
import * as esbuild from "esbuild";
import { writeBuildOutput } from "../../../utils/write-build-output.js";

export async function compilePreactIsland({ sourcePath, outputPath }) {
	/**
	 * Virtual entry for Preact - exports component for is-land lazy loading
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
		jsx: "automatic",
		jsxImportSource: "preact",
		external: ["preact", "preact/hooks", "preact/jsx-runtime"],
		logLevel: "warning",
	});

	return writeBuildOutput(result, outputPath);
}
