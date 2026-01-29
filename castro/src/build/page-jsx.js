/**
 * JSX Page Builder
 *
 * Builds a single JSX/TSX page to HTML.
 *
 * JSX pages are components that render at build time. They can:
 * - Export `meta` object with { title, layout, custom fields }
 * - Use islands for interactive parts
 * - Import other components
 * - Import CSS files (automatically extracted and linked)
 *
 * Example page structure:
 *   import "./index.css";
 *   export const meta = { title: "About", layout: "default" };
 *   export default function About() {
 *     return <div>Content here</div>;
 *   }
 */

import { dirname } from "node:path";
import { messages } from "../messages.js";
import { compileJSX } from "./compile-jsx.js";
import { buildPageShell } from "./page-shell.js";
import { renderPageVNode } from "./render-page-vnode.js";
import { writeCSSFiles } from "./write-css.js";

/** @import { Asset } from "../types.d.ts" */

/**
 * Build a single JSX page to HTML
 *
 * @param {string} sourceFileName - Relative path from pages/
 * @param {{ logOnSuccess?: boolean, logOnStart?: boolean }} [options]
 */
export async function buildJSXPage(sourceFileName, options = {}) {
	await buildPageShell(sourceFileName, /\.[jt]sx$/, options, async (ctx) => {
		const { sourceFilePath, outputFilePath } = ctx;

		// Compile and import the JSX page (also extracts CSS)
		const { module: pageModule, cssFiles } = await compileJSX(sourceFilePath);

		if (!pageModule.default || typeof pageModule.default !== "function") {
			throw new Error(messages.errors.jsxNoExport(sourceFileName));
		}

		// Write CSS files to output directory and collect assets
		const outputDir = dirname(outputFilePath);
		const pageCssAssets = await writeCSSFiles(cssFiles, outputDir);

		// Extract metadata (includes layout preference)
		const meta = pageModule.meta || {};

		const contentVNode = pageModule.default();

		// Use shared rendering pipeline
		await renderPageVNode({
			contentVNode,
			sourceFilePath,
			outputFilePath,
			sourceFileName,
			meta,
			pageCssAssets,
		});
	});
}
