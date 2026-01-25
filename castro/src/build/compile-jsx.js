/**
 * JSX Compiler
 *
 * Compiles JSX/TSX files to JavaScript using esbuild.
 * Used for pages and layouts at build time.
 *
 * esbuild is very fast and handles:
 * - JSX/TSX transpilation
 * - TypeScript type stripping (types removed, not checked)
 * - Module bundling
 * - CSS extraction (for pages that import stylesheets)
 */

import * as esbuild from "esbuild";
import { createTempPath, getModule } from "../config.js";

/**
 * Compile JSX/TSX to JavaScript and import the module
 *
 * Also extracts any imported CSS files for later injection.
 *
 * @param {string} sourcePath - Path to JSX/TSX file
 * @returns {Promise<{ module: any, cssFiles: { path: string, text: string }[] }>}
 */
export async function compileJSX(sourcePath) {
	const outputPath = createTempPath(sourcePath);

	const result = await esbuild.build({
		entryPoints: [sourcePath],
		write: false, // Keep output in memory, don't write to disk
		outfile: outputPath,
		jsx: "automatic", // Use new JSX transform (no need to import h)
		jsxImportSource: "preact", // Auto-import JSX runtime from preact
		bundle: true, // Include all imports in output
		packages: "external", // Don't bundle node_modules, keep as imports
		format: "esm", // Output ES modules
		target: "node22", // We're running this in Node.js, not browser
		logLevel: "warning",
		loader: {
			".css": "css", // Extract CSS into separate files
		},
	});

	// Separate JS and CSS output files
	const jsFile = result.outputFiles.find((f) => f.path.endsWith(".js"));
	const cssFiles = result.outputFiles.filter((f) => f.path.endsWith(".css"));

	if (!jsFile) {
		throw new Error(`No JavaScript output generated for ${sourcePath}`);
	}

	return {
		module: await getModule(sourcePath, jsFile.text),
		cssFiles: cssFiles.map((file) => ({
			path: file.path,
			text: file.text,
		})),
	};
}
