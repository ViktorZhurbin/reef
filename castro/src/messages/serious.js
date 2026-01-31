/**
 * Serious preset - Straightforward technical messages
 * No satire, just clear information
 */

export const serious = {
	// CLI startup
	devServer: {
		starting: "Starting dev server...",
		ready: (/** @type {string} */ url) => `Dev server running at ${url}`,
		watching: "Watching for file changes...",
	},

	build: {
		starting: "Building site...",
		success: (/** @type {string} */ count, /** @type {string} */ time) =>
			`✓ Build complete: ${count} pages in ${time}`,
		noFiles: "⚠️  No files found to build.",
	},

	// File operations
	files: {
		changed: (/** @type {string} */ path) => `Changed: ${path}`,
		compiled: (/** @type {number} */ count) =>
			`✓ Compiled ${count} island${count === 1 ? "" : "s"}:`,
		layoutsLoaded: (/** @type {string} */ names) =>
			`✓ Loaded layouts: ${names}`,
	},

	// Errors
	errors: {
		// Route conflicts
		routeConflict: (/** @type {string} */ file1, /** @type {string} */ file2) =>
			`❌ Route conflict: Multiple pages map to the same URL\n\n` +
			`   · ${file1}\n` +
			`   · ${file2}\n\n` +
			`   Remove or rename one of these files.`,

		// Missing layouts
		layoutNotFound: (/** @type {string} */ layoutName) =>
			`❌ Layout '${layoutName}' not found in layouts/ directory.\n` +
			`   Create the missing layout file.`,

		missingDefaultLayout: () =>
			`❌ Required layout 'default.jsx' not found in layouts/ directory.\n` +
			`   Create layouts/default.jsx to continue.`,

		noLayoutsDir: (/** @type {string} */ layoutsDir) =>
			`❌ Layouts directory not found: ${layoutsDir}\n` +
			`   Create the directory and add at least default.jsx`,

		islandNoExport: (/** @type {string} */ fileName) =>
			`⚠️  ${fileName} must export a default function.\n` +
			`   Island components require a default export.`,

		// Page build errors
		pageBuildFailed: (
			/** @type {string} */ fileName,
			/** @type {string} */ errorMessage,
		) =>
			`❌ Failed to build page\n\n` +
			`   Page: ${fileName}\n` +
			`   Error: ${errorMessage}`,

		jsxNoExport: (/** @type {string} */ fileName) =>
			`❌ JSX page ${fileName} must export a default function.\n` +
			`   Pages require a default export.`,

		// Config errors
		configLoadFailed: (/** @type {string} */ errorMessage) =>
			`❌ Failed to load configuration\n\n` +
			`   Error: ${errorMessage}\n\n` +
			`   Check manifesto.js for syntax errors.`,

		invalidMeta: (
			/** @type {string} */ fileName,
			/** @type {string[]} */ issues,
		) =>
			`❌ The page 'meta' is incomplete.\n\n` +
			`   Page: ${fileName}\n` +
			`   Issues:\n` +
			issues.map((i) => `   - ${i}`).join("\n") +
			`\n\n   Check the page 'meta' export.`,
	},

	// Config
	config: {
		changed: "\n⚙️  Configuration changed. Restarting...",
		restarting: "Restarting...",
	},

	// Commands
	commands: {
		unknown: (/** @type {string} */ cmd) =>
			`❌ Unknown command: ${cmd}\n   Available commands: dev, build`,
		usage: "Usage: castro [dev|build]",
	},

	purge: {
		success: "✓ Build directory cleaned.",
	},
};
