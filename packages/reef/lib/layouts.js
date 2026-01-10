import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { styleText } from "node:util";
import tsPreset from "@babel/preset-typescript";
import * as esbuild from "esbuild";
import { LAYOUTS_DIR } from "../constants/dir.js";
import { createBabelPlugin } from "../utils/index.js";

/**
 * @import { LayoutComponent } from '../types/layout.js';
 */

const TEMP_DIR = path.join(os.tmpdir(), "reef-layouts");

/**
 * Babel plugin for Preact JSX compilation
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

/**
 * Compile a single layout JSX file to JS
 * @param {string} sourcePath - Path to layout JSX file
 * @param {string} outputPath - Path for compiled output
 */
async function compileLayout(sourcePath, outputPath) {
	const result = await esbuild.build({
		entryPoints: [sourcePath],
		bundle: true,
		format: "esm",
		target: "es2020",
		write: false,
		outfile: outputPath,
		plugins: [preactBabelPlugin],
		// Don't mark preact as external - bundle it so Node can import the compiled layout
		logLevel: "warning",
	});

	await fsPromises.mkdir(path.dirname(outputPath), { recursive: true });
	await fsPromises.writeFile(outputPath, result.outputFiles[0].text);
}

/**
 * Discover, compile, and load all JSX layouts
 * @returns {Promise<Map<string, LayoutComponent>>} Map of layout name to render function
 */
export async function loadLayouts() {
	/** @type {Map<string, LayoutComponent>} */
	const layouts = new Map();

	// Check if layouts directory exists
	try {
		await fsPromises.access(LAYOUTS_DIR);
	} catch (err) {
		if (err.code === "ENOENT") {
			throw new Error(
				`Layouts directory not found: ${LAYOUTS_DIR}\nCreate it and add at least default.jsx`,
			);
		}
		throw err;
	}

	// Discover layout files
	const files = await fsPromises.readdir(LAYOUTS_DIR);
	const layoutFiles = files.filter((f) => /\.[jt]sx$/.test(f));

	if (layoutFiles.length === 0) {
		throw new Error(
			`No layout files found in ${LAYOUTS_DIR}\nCreate at least default.jsx`,
		);
	}

	// Clean and recreate temp directory
	await fsPromises.rm(TEMP_DIR, { recursive: true, force: true });
	await fsPromises.mkdir(TEMP_DIR, { recursive: true });

	// Compile and load each layout
	for (const fileName of layoutFiles) {
		const layoutName = path.basename(fileName, path.extname(fileName));
		const sourcePath = path.join(LAYOUTS_DIR, fileName);
		const outputPath = path.join(TEMP_DIR, `${layoutName}.js`);

		try {
			// Compile layout
			await compileLayout(sourcePath, outputPath);

			// Import compiled module
			const moduleUrl = pathToFileURL(outputPath).href;
			const layoutModule = await import(`${moduleUrl}?t=${Date.now()}`);

			if (!layoutModule.default) {
				throw new Error(
					`Layout ${fileName} must have a default export function`,
				);
			}

			layouts.set(layoutName, layoutModule.default);
		} catch (err) {
			throw new Error(`Failed to load layout ${fileName}: ${err.message}`);
		}
	}

	console.info(
		styleText("green", "✓ Loaded layouts:"),
		Array.from(layouts.keys()).join(", "),
	);

	// Ensure default layout exists
	if (!layouts.has("default")) {
		throw new Error("Required layout 'default.jsx' not found in layouts/");
	}

	return layouts;
}
