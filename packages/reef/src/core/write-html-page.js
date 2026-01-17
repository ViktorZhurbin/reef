import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { collectAssets } from "../assets/collect.js";
import { injectAssets } from "../assets/inject.js";
import { defaultPlugins } from "../plugins/defaultPlugins.js";

/**
 * @import { ReefPlugin } from '../types/plugin.js';
 */

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
				filePath: outputPath,
			});
		}
	}

	// 2. Collect assets from transformed HTML
	const { assets, importMapConfigs } = await collectAssets({
		pageContent: processedHtml,
	});

	// 3. Inject assets and ensure DOCTYPE
	const finalHtml = injectAssets(processedHtml, { assets, importMapConfigs });

	// 4. Write to disk
	await mkdir(dirname(outputPath), { recursive: true });
	await writeFile(outputPath, finalHtml);
}
