import { styleText } from "node:util";
import matter from "gray-matter";
import { marked } from "marked";
import { renderToString } from "preact-render-to-string";
import { layouts } from "../layout/registry.js";
import { resolveLayout } from "../layout/resolver.js";
import { builderShell } from "./builder-shell.js";
import { writeHtmlPage } from "./write-html-page.js";

/**
 * Build a single markdown file to HTML
 * @param {string} sourceFileName
 * @param {object} [options] - Build options
 * @param {boolean} [options.logOnSuccess] - Log when build succeeds
 * @param {boolean} [options.logOnStart] - Log when build starts
 */
export async function buildMdPage(sourceFileName, options = {}) {
	await builderShell(sourceFileName, ".md", options, async (ctx) => {
		const { sourceFilePath, outputFilePath } = ctx;

		const allLayouts = layouts.getAll();

		const sourceFileContent = await Bun.file(sourceFilePath).text();
		const { data: meta, content: markdown } = matter(sourceFileContent);

		// Resolve which layout to use
		const layoutName = await resolveLayout(sourceFilePath, meta);

		const layoutFn = allLayouts.get(layoutName);

		if (!layoutFn) {
			throw new Error(
				`Layout '${styleText("magenta", layoutName)}' not found in layouts/`,
			);
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
