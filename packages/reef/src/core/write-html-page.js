import { collectAssets } from "../assets/collect.js";
import { injectAssets } from "../assets/inject.js";
import { defaultPlugins } from "../plugins/defaultPlugins.js";

/**
 * Collect assets, inject them into HTML, and write to file.
 *
 * @param {string} html - HTML content to process
 * @param {string} outputPath - Absolute path to output file
 */
export async function writeHtmlPage(html, outputPath) {
	// 1. Run transform hooks before asset collection
	let processedHtml = html;
	for (const plugin of defaultPlugins) {
		if (plugin.transform) {
			processedHtml = await plugin.transform({
				content: processedHtml,
			});
		}
	}

	// 2. Collect assets from transformed HTML
	const { assets, mergedImportMap } = await collectAssets();

	// 3. Inject assets and ensure DOCTYPE
	const finalHtml = injectAssets(processedHtml, { assets, mergedImportMap });

	await Bun.write(outputPath, finalHtml);
}
