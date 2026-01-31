/**
 * Satirical preset - Communist-themed messages
 * One joke maximum per error, prioritizes clarity
 */
export const satirical = {
	// CLI startup
	devServer: {
		starting: "📡 Consulting the Central Committee...",
		ready: (/** @type {string} */ url) => `🚩 The revolution is live at ${url}`,
		watching: "👁️  The State is watching for changes...",
	},

	build: {
		starting: "⚙️  Realizing the Five-Year Plan...",
		success: (/** @type {string} */ count, /** @type {string} */ time) =>
			`✅ The Five-Year Plan completed ahead of schedule!\n   Delivered ${count} pages to the people in ${time}`,
		noFiles: "⚠️  No files found. The collective is empty.",
	},

	// File operations
	files: {
		changed: (/** @type {string} */ path) => `📝 Revised: ${path}`,
		compiled: (/** @type {number} */ count) =>
			`✓ Compiled ${count} island${count === 1 ? "" : "s"}:`,
		layoutsLoaded: (/** @type {string} */ names) =>
			`✓ Loaded layouts: ${names}`,
	},

	// The Ministry of Errors
	errors: {
		// Route conflicts
		routeConflict: (/** @type {string} */ file1, /** @type {string} */ file2) =>
			`❌ Route conflict: Two pages claim the same route\n\n` +
			`   · ${file1}\n` +
			`   · ${file2}\n\n` +
			`   The revolution cannot serve two masters - eliminate one.`,

		// Missing layouts
		layoutNotFound: (/** @type {string} */ layoutName) =>
			`❌ Layout '${layoutName}' not found in layouts/\n` +
			`   Every page needs leadership - create the missing layout.`,

		missingDefaultLayout: () =>
			`❌ Required layout 'default.jsx' not found in layouts/\n` +
			`   The default layout is mandatory. Create it immediately.`,

		noLayoutsDir: (/** @type {string} */ layoutsDir) =>
			`❌ Layouts directory not found: ${layoutsDir}\n` +
			`   Create it and add at least default.jsx - the revolution needs structure.`,

		islandNoExport: (/** @type {string} */ fileName) =>
			`⚠️  ${fileName} must export a default function.\n` +
			`   The collective requires proper structure.`,

		// Page build errors
		pageBuildFailed: (
			/** @type {string} */ fileName,
			/** @type {string} */ errorMessage,
		) =>
			`❌ Build failed (sabotage detected)\n\n` +
			`   Page: ${fileName}\n` +
			`   Error: ${errorMessage}`,

		jsxNoExport: (/** @type {string} */ fileName) =>
			`❌ JSX page ${fileName} must export a default function.\n` +
			`   Components serve the collective, not themselves.`,

		// Config errors
		configLoadFailed: (/** @type {string} */ errorMessage) =>
			`❌ The manifesto is corrupted!\n\n` +
			`   Error: ${errorMessage}\n\n` +
			`   Revise manifesto.js and eliminate errors.`,

		invalidMeta: (
			/** @type {string} */ fileName,
			/** @type {string[]} */ issues,
		) =>
			`❌ The page 'meta' is incomplete.\n\n` +
			`   Page: ${fileName}\n` +
			`   Issues:\n` +
			issues.map((i) => `   - ${i}`).join("\n") +
			`\n\n   Correct the 'meta' export to satisfy the bureaucracy.`,
	},

	// Config
	config: {
		changed: "\n⚙️  Manifesto revised. The revolution must restart...",
		restarting: "Restarting...",
	},

	// Commands
	commands: {
		unknown: (/** @type {string} */ cmd) =>
			`❌ Unknown directive: ${cmd}\n   The Party recognizes only: dev, build`,
		usage: "Usage: castro [dev|build]",
	},

	purge: {
		success: "🧹 Counter-revolutionary artifacts eliminated.",
	},
};
