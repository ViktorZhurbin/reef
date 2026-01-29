/**
 * Shared Page Rendering Pipeline
 *
 * Unified rendering logic for both JSX and Markdown pages.
 * Handles island wrapping, layout application, CSS collection, and writing.
 */

import { renderToString } from "preact-render-to-string";
import { islands } from "../islands/registry.js";
import { wrapIslandsInJSX } from "../islands/wrapper-jsx.js";
import { layouts } from "../layouts/registry.js";
import { resolveLayout } from "../layouts/resolver.js";
import { messages } from "../messages.js";
import { writeHtmlPage } from "./page-writer.js";

/**
 * @import { VNode } from "preact"
 * @import { Asset } from "../types.d.ts"
 */

/**
 * Render a page VNode through the complete pipeline
 *
 * @param {{
 *   contentVNode: VNode,
 *   sourceFilePath: string,
 *   outputFilePath: string,
 *   sourceFileName: string,
 *   meta: Record<string, any>,
 *   pageCssAssets?: Asset[]
 * }} params
 */
export async function renderPageVNode({
	contentVNode,
	sourceFilePath,
	outputFilePath,
	sourceFileName,
	meta,
	pageCssAssets = [],
}) {
	// Clear page state for island CSS tracking
	islands.clearPageState();

	// Pass through island wrapping pipeline
	const wrappedVNode = wrapIslandsInJSX(contentVNode);

	// Support pages that render full HTML themselves (layout: false)
	let vnodeToRender;

	if (meta.layout === false || meta.layout === "none") {
		vnodeToRender = wrappedVNode;
	} else {
		// Resolve and apply layout
		const layoutName = await resolveLayout(sourceFilePath, meta);
		const layoutFn = layouts.getAll().get(layoutName);

		if (!layoutFn) {
			throw new Error(messages.errors.layoutNotFound(layoutName));
		}

		// Render wrapped content to HTML string for layout
		const contentHtml = renderToString(wrappedVNode);

		// Get layout CSS assets
		const layoutCssAssets = layouts.getCssAssets(layoutName);
		pageCssAssets = [...layoutCssAssets, ...pageCssAssets];

		// Apply layout
		const title = meta.title || sourceFileName.replace(/\.(md|[jt]sx)$/, "");

		vnodeToRender = layoutFn({
			title,
			content: contentHtml,
			...meta,
		});
	}

	// Render final page
	const html = renderToString(vnodeToRender);

	// Collect island CSS
	const { cssPaths } = islands.getPageAssets();
	const islandCssAssets = cssPaths.filter(Boolean).map((href) => ({
		tag: "link",
		attrs: { rel: "stylesheet", href },
	}));

	// Write HTML with all CSS assets
	await writeHtmlPage(html, outputFilePath, {
		pageCssAssets: [...pageCssAssets, ...islandCssAssets],
	});
}
