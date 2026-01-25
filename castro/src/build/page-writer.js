/**
 * HTML Page Writer
 *
 * Final step in page building - unified asset injection:
 * 1. Collect static assets from plugins (scripts, import maps)
 * 2. Run transform hooks (islands wrapped, island CSS returned as assets)
 * 3. Inject ALL assets (page CSS + island CSS + scripts) into <head>
 * 4. Write to disk
 *
 * Both page CSS and island CSS flow through the same unified injection path.
 * Page CSS comes from writeCSSFiles() in page-jsx.js as Asset objects.
 * Island CSS comes from plugin.transform() as Asset objects.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { collectAssets, injectAssets } from "../html/inject-assets.js";
import { defaultPlugins } from "../islands/plugins.js";

/**
 * @import { Asset } from "../types.d.ts";
 */

/**
 * Process HTML and write to file
 *
 * @param {string} html - HTML content to process
 * @param {string} outputPath - Absolute path to output file
 * @param {{ pageCssAssets?: Asset[] }} [options] - Optional page CSS assets
 */
export async function writeHtmlPage(html, outputPath, options = {}) {
	const { pageCssAssets = [] } = options;

	// 1. Collect static assets from plugins (scripts, runtime CSS)
	const { assets: staticAssets, mergedImportMap } = await collectAssets();

	const allAssets = [...pageCssAssets, ...staticAssets];

	// 2. Run transform hooks (island wrapping, CSS collection, etc.)
	let processedHtml = html;

	for (const plugin of defaultPlugins) {
		if (plugin.transform) {
			const transformResult = await plugin.transform({
				// Chain: pass output of previous transform
				content: processedHtml,
			});

			processedHtml = transformResult.html;
			allAssets.push(...transformResult.assets);
		}
	}

	// 3. Inject ALL assets (page CSS, island CSS, scripts) - unified path
	const finalHtml = injectAssets(processedHtml, {
		assets: allAssets,
		mergedImportMap,
	});

	// 4. Write to disk
	await mkdir(dirname(outputPath), { recursive: true });
	await writeFile(outputPath, finalHtml);
}
