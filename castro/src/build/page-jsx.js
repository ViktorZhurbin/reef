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

import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import { renderToString } from "preact-render-to-string";
import { OUTPUT_DIR } from "../config.js";
import { layouts } from "../layouts/registry.js";
import { resolveLayout } from "../layouts/resolver.js";
import { messages } from "../messages.js";
import { compileJSX } from "./compile-jsx.js";
import { buildPageShell } from "./page-shell.js";
import { writeHtmlPage } from "./page-writer.js";

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

		const allLayouts = layouts.getAll();

		// Compile and import the JSX page (also extracts CSS)
		const { module: pageModule, cssFiles } = await compileJSX(sourceFilePath);

		if (!pageModule.default || typeof pageModule.default !== "function") {
			throw new Error(messages.errors.jsxNoExport(sourceFileName));
		}

		// Write CSS files to output directory and collect assets
		const pageCssAssets = await writeCSSFiles(cssFiles, outputFilePath);

		// Extract metadata (includes layout preference)
		const meta = pageModule.meta || {};

		let layoutVNode;

		// Support layout: false or layout: "none" for pages that render full HTML themselves.
		// Useful for special pages like RSS feeds, sitemaps, or custom layouts.
		if (meta.layout === false || meta.layout === "none") {
			layoutVNode = pageModule.default();
		} else {
			const contentVNode = pageModule.default();
			const layoutName = await resolveLayout(sourceFilePath, meta);

			const layoutFn = allLayouts.get(layoutName);

			if (!layoutFn) {
				throw new Error(messages.errors.layoutNotFound(layoutName));
			}

			const title = meta.title || sourceFileName.replace(/\.[jt]sx$/, "");
			const contentHtml = renderToString(contentVNode);

			layoutVNode = layoutFn({
				title,
				content: contentHtml,
				...meta,
			});
		}

		const layoutHtml = renderToString(layoutVNode);

		// All CSS injected via unified path in page-writer
		await writeHtmlPage(layoutHtml, outputFilePath, {
			pageCssAssets,
		});
	});
}

/**
 * Write CSS files to the output directory
 *
 * CSS files are written alongside their corresponding HTML files.
 * For example: pages/index.jsx → dist/index.html + dist/index.css
 *
 * @param {{ path: string, text: string }[]} cssFiles - CSS output from esbuild
 * @param {string} htmlOutputPath - Where the HTML will be written
 * @returns {Promise<Asset[]>} CSS assets for injection
 */
async function writeCSSFiles(cssFiles, htmlOutputPath) {
	if (cssFiles.length === 0) return [];

	const cssAssets = [];

	for (const cssFile of cssFiles) {
		// Determine CSS output path based on HTML output path
		const htmlDir = dirname(htmlOutputPath);
		const htmlBaseName = basename(htmlOutputPath, ".html");

		// If there's only one CSS file, name it after the page
		// If multiple, use the original CSS file name
		const cssFileName =
			cssFiles.length === 1 ? `${htmlBaseName}.css` : basename(cssFile.path);

		const cssOutputPath = join(htmlDir, cssFileName);

		// Ensure directory exists before writing
		await mkdir(dirname(cssOutputPath), { recursive: true });

		// Write CSS to disk
		await writeFile(cssOutputPath, cssFile.text);

		// Calculate public path (relative to output root)
		const cssPublicPath = `/${relative(OUTPUT_DIR, cssOutputPath)}`;

		// Create Asset object for unified injection
		cssAssets.push({
			tag: "link",
			attrs: { rel: "stylesheet", href: cssPublicPath },
		});
	}

	return cssAssets;
}
