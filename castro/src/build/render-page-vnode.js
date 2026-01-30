/**
 * Shared Page Rendering Pipeline
 *
 * Unified rendering logic for both JSX and Markdown pages.
 * Handles island wrapping, layout application, CSS collection, and writing.
 */

import { renderToString } from "preact-render-to-string";
import { islandWrapper } from "../islands/wrapper-jsx.js";
import { layouts } from "../layouts/registry.js";
import { resolveLayout } from "../layouts/resolver.js";
import { messages } from "../messages.js";
import { writeHtmlPage } from "./page-writer.js";

/**
 * @import { VNode } from "preact"
 * @import { Asset, PageMeta } from "../types.d.ts"
 */

/**
 * Render a page VNode through the complete pipeline
 *
 * @param {{
 *   createContentVNode: () => VNode,
 *   sourceFilePath: string,
 *   outputFilePath: string,
 *   sourceFileName: string,
 *   meta: PageMeta,
 *   pageCssAssets?: Asset[]
 * }} params
 */
export async function renderPageVNode({
	// Passing the factory function ensures the hook is active exactly when the VNodes are created
	createContentVNode,
	sourceFilePath,
	outputFilePath,
	sourceFileName,
	meta,
	pageCssAssets = [],
}) {
	// Track island CSS used during this specific render
	const usedIslandCss = new Set();

	// Install hook to intercept islands during VNode creation
	// Hook remains active for both page content and layout rendering
	await islandWrapper.install(usedIslandCss);

	try {
		// Create content VNode with hook active (wraps any islands in content)
		const contentVNode = createContentVNode();

		// Support pages that render full HTML themselves (layout: false)
		let vnodeToRender;

		if (meta.layout === false || meta.layout === "none") {
			vnodeToRender = contentVNode;
		} else {
			// Resolve and apply layout
			const layoutName = await resolveLayout(sourceFilePath, meta);
			const layoutFn = layouts.getAll().get(layoutName);

			if (!layoutFn) {
				throw new Error(messages.errors.layoutNotFound(layoutName));
			}

			// Render content to HTML string for layout
			const contentHtml = renderToString(contentVNode);

			// Get layout CSS assets
			const layoutCssAssets = layouts.getCssAssets(layoutName);
			pageCssAssets = [...layoutCssAssets, ...pageCssAssets];

			// Apply layout
			const title = meta.title || sourceFileName.replace(/\.(md|[jt]sx)$/, "");

			// Layout VNode created with hook active (wraps any islands in layout)
			vnodeToRender = layoutFn({
				...meta,
				content: contentHtml,
				title,
			});
		}

		// Render final page
		const html = renderToString(vnodeToRender);

		// Collect island CSS from tracking set
		const islandCssAssets = Array.from(usedIslandCss).map((href) => ({
			tag: "link",
			attrs: { rel: "stylesheet", href },
		}));

		// Write HTML with all CSS assets
		await writeHtmlPage(html, outputFilePath, {
			pageCssAssets: [...pageCssAssets, ...islandCssAssets],
		});
	} finally {
		// Always uninstall hook after page is complete
		islandWrapper.uninstall();
	}
}
