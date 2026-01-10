import fsPromises from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";
import matter from "gray-matter";
import { marked } from "marked";
import { CONTENT_DIR, OUTPUT_DIR, PUBLIC_DIR } from "../constants/dir.js";
import { preactIslands } from "../islands/preact/index.js";
import { solidIslands } from "../islands/solid/index.js";
import { loadConfig } from "./config-loader.js";
import { loadLayouts } from "./layouts.js";
import { resolveLayout } from "./reef-resolver.js";
import { renderLayout } from "./render-layout.js";

const formatMs = (ms) => `${Math.round(ms)}ms`;

// Load layouts once at module load
let layouts = await loadLayouts();

// Load config once at module load
const config = await loadConfig();

/**
 * Reload layouts (for dev mode when layout files change)
 */
export async function reloadLayouts() {
	layouts = await loadLayouts();
}

const defaultPlugins = [solidIslands(), preactIslands];

/**
 * @param {string} mdFileName
 * @param {{injectScript?: string, logOnSuccess?: boolean, logOnStart?: boolean, plugins?: Array}} [options]
 * @returns {Promise<boolean>}
 */
export async function buildSingle(mdFileName, options = {}) {
	const { injectScript = "", logOnSuccess, logOnStart, plugins = [] } = options;
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
		const allPlugins = [...defaultPlugins, ...plugins];

		// Get import maps from plugins (must come before module scripts)
		const importMaps = [];
		for (const plugin of allPlugins) {
			if (plugin.getImportMap) {
				const importMap = await plugin.getImportMap();
				if (importMap) importMaps.push(importMap);
			}
		}

		// Get per-page scripts from plugins
		const pluginScripts = [];
		for (const plugin of plugins) {
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

/**
 * @param {{injectScript?: string, verbose?: boolean, plugins?: Array}} [options]
 */
export async function buildAll(options = {}) {
	const { injectScript = "", verbose = false, plugins = [] } = options;
	const startTime = performance.now();

	// Clean up output directory and recreate it
	await fsPromises.rm(OUTPUT_DIR, { recursive: true, force: true });
	await fsPromises.mkdir(OUTPUT_DIR, { recursive: true });

	// Copy public directory to output if it exists
	try {
		await fsPromises.cp(PUBLIC_DIR, OUTPUT_DIR, { recursive: true });
	} catch (err) {
		// Silently skip if public directory doesn't exist
		if (err.code !== "ENOENT") {
			throw err;
		}
	}

	// Merge plugins from config and options
	const allPlugins = [...(config?.plugins || []), ...plugins];

	// Run plugin onBuild hooks (for file copying, etc.)
	for (const plugin of allPlugins) {
		if (plugin.onBuild) {
			await plugin.onBuild({ outputDir: OUTPUT_DIR, contentDir: CONTENT_DIR });
		}
	}

	// Read all .md files recursively and build them in parallel
	const buildPromises = await Array.fromAsync(
		fsPromises.glob(path.join(CONTENT_DIR, "**/*.md")),
		(filePath) => {
			// Convert absolute path to relative path from CONTENT_DIR
			const relativePath = path.relative(CONTENT_DIR, filePath);
			return buildSingle(relativePath, {
				injectScript,
				logOnStart: verbose,
				plugins: allPlugins,
			});
		},
	);

	if (buildPromises.length === 0) {
		console.warn(`No markdown files found in ${CONTENT_DIR}`);
		return;
	}

	const results = await Promise.all(buildPromises);

	const successCount = results.filter((r) => r === true).length;
	const failCount = buildPromises.length - successCount;

	const buildTime = formatMs(performance.now() - startTime);

	const successMessage = styleText(
		"green",
		`Wrote ${successCount} files in ${buildTime}`,
	);
	if (failCount > 0) {
		console.info(
			`${successMessage} ${styleText("yellow", `(${failCount} failed)`)}`,
		);
	} else {
		console.info(successMessage);
	}
}
