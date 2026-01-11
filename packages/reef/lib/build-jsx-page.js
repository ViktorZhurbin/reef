import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { styleText } from "node:util";
import render from "preact-render-to-string";
import { OUTPUT_DIR, PAGES_DIR } from "../constants/dir.js";
import { compileAndLoadJSX } from "../utils/index.js";

const TEMP_DIR = path.join(os.tmpdir(), "reef-pages");

/**
 * Build a single JSX page to HTML
 * Compiles JSX → renders to HTML → detects islands → injects scripts → writes output
 *
 * @param {string} jsxFileName - JSX file name (relative to pages directory)
 * @param {object} [options] - Build options
 * @param {string} [options.injectScript] - Script to inject (e.g., live reload)
 * @param {boolean} [options.logOnStart] - Log when build starts
 * @param {Array} [options.plugins] - Plugin instances
 * @returns {Promise<boolean>} - True if build succeeded, false otherwise
 */
export async function buildJSXPage(jsxFileName, options = {}) {
	const { injectScript = "", logOnStart, plugins = [] } = options;

	const htmlFileName = jsxFileName.replace(/\.[jt]sx$/, ".html");
	const jsxFilePath = path.join(PAGES_DIR, jsxFileName);

	try {
		if (logOnStart) {
			console.info(
				`Writing ${OUTPUT_DIR}/${htmlFileName} ${styleText(
					"gray",
					`from ${jsxFilePath}`,
				)}`,
			);
		}

		// Compile JSX and load module
		await fsPromises.mkdir(TEMP_DIR, { recursive: true });
		// Use timestamp in filename to avoid module cache issues in dev mode
		const timestamp = Date.now();
		const tempFileName =
			path.basename(jsxFileName, path.extname(jsxFileName)) +
			`.${timestamp}.js`;
		const tempPath = path.join(TEMP_DIR, tempFileName);

		// Compile and import in one step
		const pageModule = await compileAndLoadJSX(jsxFilePath, tempPath);

		if (!pageModule.default) {
			throw new Error(`JSX page ${jsxFileName} must have default export`);
		}

		// Render component to HTML
		const vnode = pageModule.default();
		let htmlOutput = render(vnode);

		// Get import maps and scripts from plugins
		const importMaps = [];
		const pluginScripts = [];

		for (const plugin of plugins) {
			if (plugin.getImportMap) {
				const importMap = await plugin.getImportMap();
				if (importMap) importMaps.push(importMap);
			}

			if (plugin.getScripts) {
				// CRITICAL: Pass rendered HTML, not JSX source
				const scripts = await plugin.getScripts({ pageContent: htmlOutput });
				pluginScripts.push(...scripts);
			}
		}

		// Inject scripts/import maps into HTML
		const allScripts = [...pluginScripts, injectScript].filter(Boolean);

		if (importMaps.length > 0 || allScripts.length > 0) {
			const headCloseIndex = htmlOutput.indexOf("</head>");
			const bodyCloseIndex = htmlOutput.indexOf("</body>");

			const scriptsHtml = [...importMaps, ...allScripts].join("\n    ");

			if (headCloseIndex !== -1) {
				htmlOutput =
					htmlOutput.slice(0, headCloseIndex) +
					`    ${scriptsHtml}\n  ` +
					htmlOutput.slice(headCloseIndex);
			} else if (bodyCloseIndex !== -1) {
				htmlOutput =
					htmlOutput.slice(0, bodyCloseIndex) +
					`    ${scriptsHtml}\n  ` +
					htmlOutput.slice(bodyCloseIndex);
			}
		}

		// Ensure DOCTYPE
		const finalHtml = !htmlOutput.startsWith("<!DOCTYPE")
			? `<!DOCTYPE html>\n${htmlOutput}`
			: htmlOutput;

		// Write to output
		const htmlFilePath = path.join(OUTPUT_DIR, htmlFileName);
		await fsPromises.mkdir(path.dirname(htmlFilePath), { recursive: true });
		await fsPromises.writeFile(htmlFilePath, finalHtml);

		return true;
	} catch (err) {
		console.error(
			`${styleText("gray", "Failed to build JSX page")} ${jsxFileName}`,
			err.message,
		);
		return false;
	}
}
