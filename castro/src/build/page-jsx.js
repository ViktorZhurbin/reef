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
import { renderToString } from "preact-render-to-string";
import { islands } from "../islands/registry.js";
import { wrapIslandsInJSX } from "../islands/wrapper-jsx.js";
import { layouts } from "../layouts/registry.js";
import { resolveLayout } from "../layouts/resolver.js";
import { messages } from "../messages.js";
import { compileJSX } from "./compile-jsx.js";
import { buildPageShell } from "./page-shell.js";
import { writeHtmlPage } from "./page-writer.js";
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

		const allLayouts = layouts.getAll();

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

		/** @type { Asset[] } */
		let layoutCssAssets = [];

		const contentVNode = pageModule.default();

		// Wrap islands in JSX
		const islandVNode = wrapIslandsInJSX(contentVNode);

		let vnodeToRender;

		// Support layout: false or layout: "none" for pages that render full HTML themselves.
		// Useful for special pages like RSS feeds, sitemaps, or custom layouts.
		if (meta.layout === false || meta.layout === "none") {
			vnodeToRender = islandVNode;
		} else {
			const layoutName = await resolveLayout(sourceFilePath, meta);

			const layoutFn = allLayouts.get(layoutName);

			if (!layoutFn) {
				throw new Error(messages.errors.layoutNotFound(layoutName));
			}

			// Get CSS assets for this layout
			layoutCssAssets = layouts.getCssAssets(layoutName);

			const title = meta.title || sourceFileName.replace(/\.[jt]sx$/, "");
			const contentHtml = renderToString(islandVNode);

			vnodeToRender = layoutFn({
				title,
				content: contentHtml,
				...meta,
			});
		}

		const layoutHtml = renderToString(vnodeToRender);

		const { cssPaths } = islands.untrackPageIslands();

		// Add island CSS to page assets
		const islandCssAssets = cssPaths.filter(Boolean).map((href) => ({
			tag: "link",
			attrs: { rel: "stylesheet", href },
		}));

		// All CSS injected via unified path in page-writer
		await writeHtmlPage(layoutHtml, outputFilePath, {
			pageCssAssets: [...layoutCssAssets, ...pageCssAssets, ...islandCssAssets],
		});
	});
}
