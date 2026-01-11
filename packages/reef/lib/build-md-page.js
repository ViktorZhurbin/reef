import { resolveLayout } from "./reef-resolver.js";
import { renderLayout } from "./render-layout.js";
import matter from "gray-matter";
import { marked } from "marked";
import fsPromises from "node:fs/promises";
import { styleText } from "node:util";
import path from "node:path";
import { CONTENT_DIR, OUTPUT_DIR } from "../constants/dir.js";

/**
 * @import { BuildMdPageOptions } from '../types/build.js';
 */

/**
 * Build a single markdown file to HTML
 * @param {string} mdFileName - Markdown file name (relative to content directory)
 * @param {BuildMdPageOptions} [options] - Build options
 * @returns {Promise<boolean>} - True if build succeeded, false otherwise
 */
export async function buildMdPage(mdFileName, options = {}) {
	const {
		injectScript = "",
		logOnSuccess,
		logOnStart,
		plugins = [],
		layouts,
	} = options;

	if (!layouts) {
		throw new Error("layouts is required in options");
	}
	const startTime = performance.now();

	const htmlFileName = mdFileName.replace(".md", ".html");
	const mdFilePath = path.join(CONTENT_DIR, mdFileName);

	try {
		if (logOnStart) {
			console.info(
				`Writing ${OUTPUT_DIR}/${htmlFileName} ${styleText(
					"gray",
					`from ${mdFilePath}`,
				)}`,
			);
		}

		// Read file and parse frontmatter
		const fileContent = await fsPromises.readFile(mdFilePath, "utf-8");
		const { data: frontmatter, content: markdown } = matter(fileContent);

		// Use frontmatter title or derive from filename
		const title = frontmatter.title || mdFileName.replace(".md", "");

		// Render markdown to HTML
		const contentHtml = marked(markdown);

		// Get import maps and per-page scripts from plugins
		const importMaps = [];
		const pluginScripts = []; // per-page scripts from plugins
		for (const plugin of plugins) {
			if (plugin.getImportMap) {
				const importMap = await plugin.getImportMap();
				if (importMap) importMaps.push(importMap);
			}

			if (plugin.getScripts) {
				const scripts = await plugin.getScripts({ pageContent: markdown });
				pluginScripts.push(...scripts);
			}
		}

		// Combine all scripts
		const allScripts = [...pluginScripts, injectScript].filter(Boolean);

		// Resolve which layout to use
		const layoutName = await resolveLayout(mdFilePath, frontmatter);

		const layoutFn = layouts.get(layoutName);

		if (!layoutFn) {
			throw new Error(`Layout '${layoutName}' not found in layouts/`);
		}

		// Render layout with props
		const pageHtml = renderLayout(layoutFn, {
			title,
			content: contentHtml,
			scripts: allScripts,
			importMaps,
			...frontmatter,
		});

		const htmlFilePath = path.join(OUTPUT_DIR, htmlFileName);
		// Ensure directory exists for nested files (e.g., blog/post.html)
		await fsPromises.mkdir(path.dirname(htmlFilePath), { recursive: true });
		await fsPromises.writeFile(htmlFilePath, pageHtml);

		if (logOnSuccess) {
			const buildTime = formatMs(performance.now() - startTime);
			console.info(styleText("green", `Wrote ${htmlFileName} in ${buildTime}`));
		}
		return true;
	} catch (err) {
		console.error(
			`${styleText("gray", "Failed to build")} ${mdFileName}`,
			err.message,
		);
		return false;
	}
}
