/**
 * The Ministry of Messages
 *
 * All themed output text in one place.
 * Communist satire wrapper around technical information.
 */

export const messages = {
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
			`❌ Ideological inconsistency detected.\n\n` +
			`   Two pages claim the same route:\n` +
			`   · ${file1}\n` +
			`   · ${file2}\n\n` +
			`   The revolution cannot serve two masters.\n` +
			`   Eliminate one to restore order.`,

		// Missing layouts
		layoutNotFound: (/** @type {string} */ layoutName) =>
			`❌ The Central Committee is missing!\n\n` +
			`   Layout '${layoutName}' not found in layouts/\n` +
			`   Every page needs leadership. Create the missing layout.`,

		missingDefaultLayout: () =>
			`❌ The State has no foundation!\n\n` +
			`   Required layout 'default.jsx' not found in layouts/\n` +
			`   The default layout is mandatory. Create it immediately.`,

		noLayoutsDir: (/** @type {string} */ layoutsDir) =>
			`❌ The Party headquarters do not exist!\n\n` +
			`   Layouts directory not found: ${layoutsDir}\n` +
			`   Create it and add at least default.jsx\n\n` +
			`   The revolution needs structure.`,

		islandNoExport: (/** @type {string} */ fileName) =>
			`⚠️  Defective export detected.\n\n` +
			`   ${fileName} must export a default function.\n` +
			`   The collective requires proper structure.`,

		// Page build errors
		pageBuildFailed: (
			/** @type {string} */ fileName,
			/** @type {string} */ errorMessage,
		) =>
			`❌ The Five-Year Plan has been sabotaged!\n\n` +
			`   Page: ${fileName}\n` +
			`   Error: ${errorMessage}\n\n` +
			`   Check your syntax for counter-revolutionary tendencies.`,

		jsxNoExport: (/** @type {string} */ fileName) =>
			`❌ Bourgeois individualism detected.\n\n` +
			`   JSX page ${fileName} must export a default function.\n` +
			`   Components serve the collective, not themselves.`,

		// Config errors
		configLoadFailed: (/** @type {string} */ errorMessage) =>
			`❌ The manifesto is corrupted!\n\n` +
			`   Error: ${errorMessage}\n\n` +
			`   Revise manifesto.js and eliminate errors.`,
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
