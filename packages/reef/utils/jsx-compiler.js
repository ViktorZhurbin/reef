import fsPromises from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as esbuild from "esbuild";
import { preactBabelPlugin } from "./index.js";

/**
 * Compile JSX/TSX to JavaScript using esbuild + Babel
 *
 * @param {string} sourcePath - Path to JSX/TSX source file
 * @param {string} outputPath - Path to write compiled JS
 * @param {object} [options] - Compilation options
 * @param {boolean} [options.bundle=true] - Whether to bundle dependencies
 * @param {string} [options.format='esm'] - Output format
 * @param {string} [options.target='es2020'] - Target environment
 * @returns {Promise<void>}
 *
 * @example
 * await compileJSX('layouts/default.jsx', '/tmp/default.js');
 */
export async function compileJSX(sourcePath, outputPath, options = {}) {
	const {
		bundle = true,
		format = "esm",
		target = "es2020",
		logLevel = "warning",
	} = options;

	const result = await esbuild.build({
		entryPoints: [sourcePath],
		bundle,
		format,
		target,
		write: false,
		outfile: outputPath,
		plugins: [preactBabelPlugin],
		logLevel,
	});

	await fsPromises.mkdir(path.dirname(outputPath), { recursive: true });
	await fsPromises.writeFile(outputPath, result.outputFiles[0].text);
}

/**
 * Dynamically import a compiled JavaScript module
 * Uses file:// URLs for Node.js ES module import
 *
 * @param {string} compiledPath - Path to compiled JavaScript file
 * @returns {Promise<any>} The imported module
 *
 * @example
 * const module = await loadCompiledModule('/tmp/default.js');
 * const component = module.default;
 */
export async function loadCompiledModule(compiledPath) {
	const moduleUrl = pathToFileURL(compiledPath).href;
	return await import(moduleUrl);
}

/**
 * Compile and load a JSX/TSX module in one step
 * Useful for one-time compilation + import
 *
 * @param {string} sourcePath - Path to JSX/TSX source file
 * @param {string} outputPath - Path to write compiled JS
 * @param {object} [options] - Compilation options (see compileJSX)
 * @returns {Promise<any>} The imported module
 *
 * @example
 * const layoutModule = await compileAndLoadJSX('layouts/default.jsx', '/tmp/default.js');
 * const LayoutComponent = layoutModule.default;
 */
export async function compileAndLoadJSX(sourcePath, outputPath, options = {}) {
	await compileJSX(sourcePath, outputPath, options);
	return await loadCompiledModule(outputPath);
}
