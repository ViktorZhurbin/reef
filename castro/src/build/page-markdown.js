/**
 * Markdown Page Builder
 *
 * Builds a single markdown file to HTML.
 *
 * Process:
 * 1. Parse frontmatter (YAML between --- delimiters) for metadata
 * 2. Convert markdown body to HTML using marked
 * 3. Resolve which layout to use (from frontmatter or directory config)
 * 4. Wrap HTML in layout component
 *
 * Example markdown file:
 *   ---
 *   title: My Post
 *   layout: blog
 *   ---
 *   # Heading
 *   Content here...
 */

import { readFile } from "node:fs/promises";
import matter from "gray-matter";
import { marked } from "marked";
import { renderToString } from "preact-render-to-string";
import { layouts } from "../layouts/registry.js";
import { resolveLayout } from "../layouts/resolver.js";
import { messages } from "../messages.js";
import { buildPageShell } from "./page-shell.js";
import { writeHtmlPage } from "./page-writer.js";

/**
 * Build a single markdown file to HTML
 *
 * @param {string} sourceFileName - Relative path from pages/
 * @param {{ logOnSuccess?: boolean, logOnStart?: boolean }} [options]
 */
export async function buildMarkdownPage(sourceFileName, options = {}) {
	await buildPageShell(sourceFileName, ".md", options, async (ctx) => {
		const { sourceFilePath, outputFilePath } = ctx;

		const allLayouts = layouts.getAll();

		// Read and parse markdown with frontmatter
		const sourceFileContent = await readFile(sourceFilePath, "utf-8");
		const { data: meta, content: markdown } = matter(sourceFileContent);

		// Resolve which layout to use
		const layoutName = await resolveLayout(sourceFilePath, meta);

		const layoutFn = allLayouts.get(layoutName);

		if (!layoutFn) {
			throw new Error(messages.errors.layoutNotFound(layoutName));
		}

		const title = meta.title || sourceFileName.replace(".md", "");
		const contentHtml = await marked(markdown);

		const layoutVNode = layoutFn({
			title,
			content: contentHtml,
			...meta,
		});

		const layoutHtml = renderToString(layoutVNode);

		await writeHtmlPage(layoutHtml, outputFilePath);
	});
}
