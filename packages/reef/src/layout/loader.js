import { basename, extname, resolve } from "node:path";
import { styleText } from "node:util";
import { LAYOUTS_DIR } from "../constants/dir.js";

/**
 * @import { LayoutComponent } from '../types/layout.js';
 */

/**
 * Discover and load all JSX layouts
 * @returns {Promise<Map<string, LayoutComponent>>} Map of layout name to render function
 */
export async function loadLayouts() {
	/** @type {Map<string, LayoutComponent>} */
	const layouts = new Map();

	const glob = new Bun.Glob("*.{jsx,tsx}");
	const layoutFiles = [];

	try {
		for await (const fileName of glob.scan(LAYOUTS_DIR)) {
			layoutFiles.push(fileName);
		}
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		if (err.code === "ENOENT") {
			throw new Error(
				`Layouts directory not found: ${LAYOUTS_DIR}\nCreate it and add at least default.jsx`,
			);
		}
		throw err;
	}

	// Error if no layout files found
	if (layoutFiles.length === 0) {
		throw new Error(
			`No layout files found in ${LAYOUTS_DIR}\nCreate at least default.jsx`,
		);
	}

	// Load each layout
	for (const fileName of layoutFiles) {
		const layoutName = basename(fileName, extname(fileName));
		try {
			const layoutPath = resolve(LAYOUTS_DIR, fileName);
			const layoutModule = await import(layoutPath);

			if (!layoutModule.default) {
				throw new Error(
					`Layout ${fileName} must have a default export function`,
				);
			}

			layouts.set(layoutName, layoutModule.default);
		} catch (e) {
			const err = /** @type {NodeJS.ErrnoException} */ (e);

			throw new Error(`Failed to load layout ${fileName}: ${err.message}`);
		}
	}

	console.info(
		styleText("green", "✓ Loaded layouts:"),
		Array.from(layouts.keys()).join(", "),
	);

	// Ensure default layout exists
	if (!layouts.has("default")) {
		throw new Error("Required layout 'default.jsx' not found in layouts/");
	}

	return layouts;
}
