/**
 * Island Compiler
 *
 * Compiles island components for both client and server:
 * - Client: Bundled JS that runs in the browser
 * - Server: Code that runs at build time for SSR
 *
 * We compile twice because the environments differ:
 * - Browser needs bundled code with import map externals
 * - Node.js needs unbundled code that can import packages
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { styleText } from "node:util";
import * as esbuild from "esbuild";
import { PreactConfig } from "./preact-config.js";

/**
 * @import { IslandComponent } from "../types.d.ts"
 */

/**
 * Compile an island component for both client and SSR
 *
 * Centralizes all path logic - takes filesystem paths, returns public HTTP paths.
 *
 * @param {{ sourcePath: string, outputPath: string, publicPath: string }} params
 * @returns {Promise<IslandComponent>}
 */
export async function compileIsland({ sourcePath, outputPath, publicPath }) {
	try {
		// Read source to extract component name
		const source = await readFile(sourcePath, "utf-8");
		const componentName = extractComponentName(source);

		// Validate that island uses defineIsland
		if (!componentName) {
			const fileName = basename(sourcePath);
			throw new Error(
				`\n❌ Island "${fileName}" must use defineIsland().\n\n` +
					`Example:\n` +
					`  ${styleText("cyan", "import { defineIsland } from 'castro';")}\n\n` +
					`  ${styleText("cyan", `export default defineIsland(function ${fileName.replace(/\.(tsx?|jsx?)$/, "")}(props) {`)}\n` +
					`  ${styleText("cyan", "  return <div>...</div>;")}\n` +
					`  ${styleText("cyan", "});")}\n`,
			);
		}

		// Compile client version (runs in browser)
		const clientBuildResult = await compileIslandClient({
			sourcePath,
			outputPath,
		});

		// Compile SSR version (runs at build time in Node.js)
		const ssrCode = await compileIslandSSR({ sourcePath });

		// Write files and construct public paths
		let publicCssPath;

		if (clientBuildResult.outputFiles) {
			await mkdir(dirname(outputPath), { recursive: true });

			for (const file of clientBuildResult.outputFiles) {
				// Write to disk
				await writeFile(file.path, file.text);

				// Track CSS file for public path
				if (file.path.endsWith(".css")) {
					const cssFileName = basename(file.path);
					publicCssPath = `/${dirname(publicPath)}/${cssFileName}`.replace(
						/\/+/g,
						"/",
					);
				}
			}
		}

		return {
			ssrCode,
			sourcePath,
			publicJsPath: publicPath,
			publicCssPath,
			name: componentName,
		};
	} catch (err) {
		console.info(styleText("red", "Island build failed: "), err);
		throw err;
	}
}

/**
 * Compile island for client-side execution
 *
 * Creates a module that exports a mounting function.
 * The mounting function handles hydration when called.
 *
 * @param {{ sourcePath: string, outputPath: string }} params
 * @returns {Promise<esbuild.BuildResult>}
 */
async function compileIslandClient({ sourcePath, outputPath }) {
	const config = PreactConfig;

	// Create entry point that imports component and exports mounting function
	const virtualEntry = `
		import Component from './${basename(sourcePath)}';

		export default async (container, props = {}) => {
			${PreactConfig.hydrateFnString}
		}
	`.trim();

	const buildConfig = config.getBuildConfig();

	// Build configuration for island client bundle (browser execution)
	const result = await esbuild.build({
		stdin: {
			contents: virtualEntry, // Use generated mounting code as entry (not a file)
			resolveDir: dirname(sourcePath),
			loader: "js",
		},
		outfile: outputPath,
		bundle: true, // Bundle all dependencies into single browser-ready file
		format: "esm", // Output ES modules (modern browsers support)
		target: "es2020", // Browser target (supports modern JS features)
		write: false, // Keep output in memory for processing
		loader: {
			".css": "css", // Extract CSS into separate files for <link> injection
		},
		...buildConfig, // Framework-specific settings (JSX config, etc.)
	});

	return result;
}

/**
 * Compile island for server-side rendering (Node.js execution)
 *
 * SSR compilation differs from client:
 * - Target is Node.js, not browser
 * - CSS imports are stubbed out (Node can't import CSS files)
 * - Result is kept in memory, not written to disk
 * - Used only to generate static HTML at build time
 *
 * @param {{ sourcePath: string }} params
 * @returns {Promise<string | undefined>} Compiled code or null if fails
 */
async function compileIslandSSR({ sourcePath }) {
	const config = PreactConfig;
	const buildConfig = config.getBuildConfig();

	try {
		// CSS stub plugin - intercepts CSS imports and returns empty module.
		// Components often import CSS (e.g., import "./counter.css"), which
		// works in browsers but breaks in Node.js. During SSR we only need
		// the HTML output, so we stub out CSS imports.
		/** @type {esbuild.Plugin} */
		const cssStubPlugin = {
			name: "css-stub",
			setup(build) {
				build.onResolve({ filter: /\.css$/ }, () => ({
					path: "css-stub",
					namespace: "css-stub",
				}));

				build.onLoad({ filter: /.*/, namespace: "css-stub" }, () => ({
					contents: "export default {};",
					loader: "js",
				}));
			},
		};

		// Build configuration for island SSR (Node.js execution at build time)
		const result = await esbuild.build({
			entryPoints: [sourcePath],
			bundle: true, // Bundle component and dependencies for execution
			format: "esm", // Output ES modules
			platform: "node", // Node.js platform (enables Node-specific optimizations)
			target: "node22", // Node.js target (this code runs at build time for SSR)
			write: false, // Keep output in memory for immediate execution
			...buildConfig, // Framework-specific settings (JSX config, etc.)
			plugins: [...(buildConfig.plugins ?? []), cssStubPlugin], // Stub CSS imports
		});

		return result.outputFiles?.[0].text || "";
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		console.warn(
			styleText("yellow", `SSR compilation skipped for ${sourcePath}:`),
			err.message,
		);
	}
}

/**
 * Extract component name from island source
 *
 * Looks for defineIsland() wrapper and extracts component name.
 * Supports multiple patterns:
 * - defineIsland(function Counter() { ... })
 * - defineIsland((props) => { ... }) with const Counter = ...
 * - defineIsland(Counter) where Counter is defined separately
 *
 * @param {string} source - Island source code
 * @returns {string | null} Component name or null
 */
function extractComponentName(source) {
	// Check if this island uses defineIsland
	if (!source.includes("defineIsland")) {
		return null;
	}

	// Match: defineIsland(function ComponentName
	const namedFunctionMatch = source.match(
		/defineIsland\s*\(\s*function\s+([A-Z]\w*)/,
	);
	if (namedFunctionMatch) {
		return namedFunctionMatch[1];
	}

	// Match: const ComponentName = defineIsland(
	const constMatch = source.match(/const\s+([A-Z]\w*)\s*=\s*defineIsland\s*\(/);
	if (constMatch) {
		return constMatch[1];
	}

	// Match: export default defineIsland(function ComponentName
	const exportDefaultMatch = source.match(
		/export\s+default\s+defineIsland\s*\(\s*function\s+([A-Z]\w*)/,
	);
	if (exportDefaultMatch) {
		return exportDefaultMatch[1];
	}

	// Match: export default defineIsland(ComponentName)
	// where ComponentName is a variable/const defined earlier
	const exportDefaultVarMatch = source.match(
		/export\s+default\s+defineIsland\s*\(\s*([A-Z]\w*)\s*\)/,
	);
	if (exportDefaultVarMatch) {
		return exportDefaultVarMatch[1];
	}

	return null;
}
