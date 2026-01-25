/**
 * JSX Page Builder
 *
 * Builds a single JSX/TSX page to HTML.
 *
 * JSX pages are components that render at build time. They can:
 * - Export `meta` object with { title, layout, custom fields }
 * - Use islands for interactive parts
 * - Import other components
 *
 * Example page structure:
 *   export const meta = { title: "About", layout: "default" };
 *   export default function About() {
 *     return <div>Content here</div>;
 *   }
 */

import { renderToString } from "preact-render-to-string";
import { layouts } from "../layouts/registry.js";
import { resolveLayout } from "../layouts/resolver.js";
import { messages } from "../messages.js";
import { compileJSX } from "./compile-jsx.js";
import { buildPageShell } from "./page-shell.js";
import { writeHtmlPage } from "./page-writer.js";

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

		// Compile and import the JSX page
		const pageModule = await compileJSX(sourceFilePath);

		if (!pageModule.default || typeof pageModule.default !== "function") {
			throw new Error(messages.errors.jsxNoExport(sourceFileName));
		}

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

		await writeHtmlPage(layoutHtml, outputFilePath);
	});
}
