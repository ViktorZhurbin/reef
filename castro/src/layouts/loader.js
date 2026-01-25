/**
 * Layout Loader
 *
 * Discovers and compiles layout components from the layouts/ directory.
 *
 * Layouts are JSX components that wrap page content. They typically
 * define the HTML shell (<html>, <head>, <body>) and common elements
 * like headers, footers, and navigation.
 *
 * Example layout:
 *   export default ({ title, content }) => (
 *     <html>
 *       <head><title>{title}</title></head>
 *       <body dangerouslySetInnerHTML={{ __html: content }} />
 *     </html>
 *   );
 */

import { rmSync } from "node:fs";
import { access, glob } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { styleText } from "node:util";
import { compileJSX } from "../build/compile-jsx.js";
import { LAYOUTS_DIR, resolveTempDir } from "../config.js";
import { messages } from "../messages.js";

/**
 * @import { LayoutComponent } from '../types.d.ts'
 */

/**
 * Discover, compile, and load all JSX layouts
 *
 * @returns {Promise<Map<string, LayoutComponent>>} Map of layout name to render function
 */
export async function loadLayouts() {
	/** @type {Map<string, LayoutComponent>} */
	const layouts = new Map();

	// Check if layouts directory exists
	try {
		await access(LAYOUTS_DIR);
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		if (err.code === "ENOENT") {
			throw new Error(messages.errors.noLayoutsDir(LAYOUTS_DIR));
		}
		throw err;
	}

	// Clean temp dir to ensure fresh compilation.
	// In dev mode, stale cached layouts can cause issues when files change.
	const tempDirPath = resolveTempDir(LAYOUTS_DIR);
	rmSync(tempDirPath, { recursive: true, force: true });

	// Process layouts
	await Array.fromAsync(
		glob(join(LAYOUTS_DIR, "**/*.{jsx,tsx}")),
		async (sourceFilePath) => {
			const fileName = basename(sourceFilePath);
			const layoutName = basename(fileName, extname(fileName));

			try {
				const { module: layoutModule } = await compileJSX(sourceFilePath);

				if (!layoutModule.default) {
					throw new Error(messages.errors.islandNoExport(fileName));
				}

				layouts.set(layoutName, layoutModule.default);
			} catch (e) {
				const err = /** @type {NodeJS.ErrnoException} */ (e);

				throw new Error(messages.errors.pageBuildFailed(fileName, err.message));
			}
		},
	);

	// Validate
	if (layouts.size === 0) {
		throw new Error(
			`No layout files found in ${LAYOUTS_DIR}\nCreate at least default.jsx`,
		);
	}

	const layoutNames = Array.from(layouts.keys()).join(", ");
	console.info(styleText("green", messages.files.layoutsLoaded(layoutNames)));

	if (!layouts.has("default")) {
		throw new Error(messages.errors.missingDefaultLayout());
	}

	return layouts;
}
