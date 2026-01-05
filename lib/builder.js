import fsPromises from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";
import { marked } from "marked";

// Shared constants
export const CONTENT_DIR = "./content";
export const OUTPUT_DIR = "./dist";
export const TEMPLATE_FILE = "./template.html";

const formatMs = (ms) => `${Math.round(ms)}ms`;

// Read template once at module load
const template = await fsPromises.readFile(TEMPLATE_FILE, "utf-8");

/**
 * @param {string} title
 * @param {string} content
 * @param {string} [injectScript]
 */
function generateHtml(title, content, injectScript = "") {
	let html = template
		.replace("{{title}}", title)
		.replace("{{content}}", content);

	if (injectScript) {
		html = html.replace("</head>", `${injectScript}\n</head>`);
	}

	return html;
}

/**
 * @param {string} mdFileName
 * @param {{injectScript?: string, logOnSuccess?: boolean, logOnStart?: boolean}} [options]
 * @returns {Promise<boolean>}
 */
export async function buildSingle(mdFileName, options = {}) {
	const { injectScript = "", logOnSuccess, logOnStart } = options;
	const startTime = performance.now();

	const title = mdFileName.replace(".md", "");
	const htmlFileName = `${title}.html`;

	try {
		if (logOnStart) {
			console.info(
				`Writing ${OUTPUT_DIR}/${htmlFileName} ${styleText("gray", `from ${CONTENT_DIR}/${mdFileName}`)}`,
			);
		}

		const markdown = await fsPromises.readFile(
			path.join(CONTENT_DIR, mdFileName),
			"utf-8",
		);
		const contentHtml = marked(markdown);
		const pageHtml = generateHtml(title, contentHtml, injectScript);

		const htmlFilePath = path.join(OUTPUT_DIR, htmlFileName);
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
 * @param {{injectScript?: string, verbose?: boolean}} [options]
 */
export async function buildAll(options = {}) {
	const { injectScript = "", verbose = false } = options;
	const startTime = performance.now();

	// Create output directory if it doesn't exist
	await fsPromises.mkdir(OUTPUT_DIR, { recursive: true });

	// Read all .md files and build them in parallel
	const buildPromises = await Array.fromAsync(
		fsPromises.glob(path.join(CONTENT_DIR, "*.md")),
		(filePath) =>
			buildSingle(path.basename(filePath), {
				injectScript,
				logOnStart: verbose,
			}),
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
