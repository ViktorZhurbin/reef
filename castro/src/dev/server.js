/**
 * Development Server
 *
 * A simple dev server with:
 * - Static file serving
 * - File watching for auto-rebuild
 * - Live reload via Server-Sent Events (SSE)
 *
 * Live reload works by:
 * 1. Browser connects to /events and holds connection open
 * 2. Server watches files and rebuilds on change
 * 3. Server sends "reload" event through all open connections
 * 4. Browser receives event and reloads the page
 */

import { readFileSync } from "node:fs";
import { watch } from "node:fs/promises";
import { join } from "node:path";
import { styleText } from "node:util";
import polka from "polka";
import sirv from "sirv";
import { buildAll } from "../build/builder.js";
import { buildJSXPage } from "../build/page-jsx.js";
import { buildMarkdownPage } from "../build/page-markdown.js";
import {
	CONFIG_FILE,
	ISLANDS_DIR,
	LAYOUTS_DIR,
	OUTPUT_DIR,
	PAGES_DIR,
} from "../config.js";
import { layouts } from "../layouts/registry.js";
import { messages } from "../messages.js";

const PORT = 3000;

/**
 * Start the development server
 */
export async function startDevServer() {
	process.env.NODE_ENV = "development";

	console.info(messages.devServer.starting);

	// Initial build
	await buildAll();

	console.info(
		messages.devServer.ready(styleText("cyan", `http://localhost:${PORT}`)),
	);
	console.info(messages.devServer.watching);

	// Track SSE connections for live reload
	const connections = new Set();

	const server = polka()
		// SSE endpoint for live reload
		// Client opens EventSource("/events") and we keep the connection alive.
		// When files change, we write to all connections to trigger reload.
		.get("/events", (req, res) => {
			res.writeHead(200, {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
			});
			connections.add(res);
			req.on("close", () => connections.delete(res));
		})
		// Serve static files from dist
		.use(sirv(OUTPUT_DIR, { dev: true }))
		// !FIXME: this causes SSE "Not Found" error
		// 404 fallback - serve 404.html for missing pages
		.use((req, res) => {
			// Only serve 404.html for HTML requests (navigation, not assets)
			const acceptsHtml = req.headers.accept?.includes("text/html");
			if (acceptsHtml) {
				res.writeHead(404, { "Content-Type": "text/html" });
				res.end(readFileSync(join(OUTPUT_DIR, "404.html")));
			} else {
				// For missing assets, just send a plain 404
				res.writeHead(404);
				res.end("Not Found");
			}
		})
		.listen(PORT);

	server.server?.on("error", (err) => {
		console.error("Server error:", err.message);
		process.exit(1);
	});

	// Watch config file - restart on change
	(async () => {
		try {
			const watcher = watch(CONFIG_FILE);
			for await (const _event of watcher) {
				console.info(styleText("yellow", messages.config.changed));
				server.server?.close();
				process.exit(0);
			}
		} catch {
			// Config file doesn't exist, that's fine
		}
	})();

	// Watch pages directory
	(async () => {
		const watcher = watch(PAGES_DIR, { recursive: true });

		for await (const event of watcher) {
			if (event.filename) {
				const filePath = join(PAGES_DIR, event.filename);
				logFileChanged(filePath);
			}

			// Rebuild specific file type
			if (event.filename?.endsWith(".md")) {
				await buildMarkdownPage(event.filename, { logOnSuccess: true });
			} else if (event.filename?.match(/\.[jt]sx$/)) {
				await buildJSXPage(event.filename, { logOnSuccess: true });
			} else if (event.filename?.endsWith("castro.js")) {
				// Full rebuild when castro.js changes
				await buildAll({ verbose: true });
			}

			notifyReload();
		}
	})();

	// Watch layouts directory
	const watchDirs = [LAYOUTS_DIR, ISLANDS_DIR];

	for (const dir of watchDirs) {
		(async () => {
			try {
				const watcher = watch(dir, { recursive: true });
				for await (const event of watcher) {
					if (event.filename) {
						logFileChanged(`${dir}/${event.filename}`);

						if (dir === LAYOUTS_DIR) {
							await layouts.load();
						}

						await buildAll();
						notifyReload();
					}
				}
			} catch (e) {
				const err = /** @type {NodeJS.ErrnoException} */ (e);

				if (err.code !== "ENOENT") {
					console.warn(`Could not watch ${dir}:`, err.message);
				}
			}
		})();
	}

	function logFileChanged(/** @type {string} */ filePath) {
		console.info(styleText("gray", messages.files.changed(filePath)));
	}

	function notifyReload() {
		for (const res of connections) {
			try {
				res.write(`data: reload\n\n`);
			} catch {
				connections.delete(res);
			}
		}
	}
}
