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
 * @returns {Promise<{ module: any, cssFiles: esbuild.OutputFile[] }>}
 */
export async function compileJSX(sourcePath) {
	const outputPath = createTempPath(sourcePath);

	// Build configuration for pages/layouts (Node.js SSR at build time)
	const result = await esbuild.build({
		entryPoints: [sourcePath],
		write: false, // Keep output in memory for immediate execution
		outfile: outputPath,
		jsx: "automatic", // Use new JSX transform (no need to import h)
		jsxImportSource: "preact", // Auto-import JSX runtime from preact
		bundle: true, // Resolve all imports to single output
		packages: "external", // Don't bundle node_modules (keep as imports for Node.js)
		format: "esm", // Output ES modules
		target: "node22", // Node.js target (this code runs at build time, not in browser)
		logLevel: "warning",
		loader: {
			".css": "css", // Extract CSS into separate files for injection
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
		cssFiles,
	};
}
