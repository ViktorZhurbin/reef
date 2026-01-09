import fsPromises from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { styleText } from "node:util";
import polka from "polka";
import sirv from "sirv";
import { buildAll, buildSingle, CONTENT_DIR, OUTPUT_DIR } from "./builder.js";
import { loadConfig } from "./config-loader.js";

const PORT = 3000;

// Read live reload script and wrap in <script> tag
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const liveReloadJs = await fsPromises.readFile(
	path.join(__dirname, "live-reload.js"),
	"utf-8",
);
const liveReloadScript = `<script>\n${liveReloadJs}\n</script>`;

// Load config to access plugins
const config = await loadConfig();

// Initial build
await buildAll({ injectScript: liveReloadScript });

console.info("Watching...");
console.info(`Server at ${styleText("cyan", `http://localhost:${PORT}`)}`);

// Track SSE connections
const connections = new Set();

// Collect all watch directories from plugins
const watchDirs = new Set([CONTENT_DIR]); // Always watch content directory

// TODO: can we avoid nested loop? create an array? flatMap?
for (const plugin of config?.plugins || []) {
	if (plugin.watchDirs) {
		for (const dir of plugin.watchDirs) {
			watchDirs.add(dir);
		}
	}
}

// Helper to notify all connections to reload
function notifyReload() {
	for (const res of connections) {
		try {
			res.write("data: reload\n\n");
		} catch {
			// Connection closed, will be cleaned up on 'close' event
			connections.delete(res);
		}
	}
}

// Watch content directory for markdown changes
(async () => {
	const watcher = fsPromises.watch(CONTENT_DIR);
	for await (const event of watcher) {
		if (event.filename?.endsWith(".md")) {
			console.info(
				`${styleText("gray", "File changed:")} ${CONTENT_DIR}/${event.filename}`,
			);
			await buildSingle(event.filename, {
				injectScript: liveReloadScript,
				logOnSuccess: true,
			});
			notifyReload();
		}
	}
})();

// Watch plugin directories (for components, islands, etc.)
// TODO: can it be combined with the above "Watch content directory for markdown changes"?
for (const dir of watchDirs) {
	if (dir === CONTENT_DIR) continue; // Already watching above

	(async () => {
		try {
			const watcher = fsPromises.watch(dir, { recursive: true });
			for await (const event of watcher) {
				if (event.filename) {
					console.info(
						`${styleText("gray", "File changed:")} ${dir}/${event.filename}`,
					);
					// Full rebuild when plugin files change
					// TODO: can we be smarter and rebuild only what's needed? Or it adds too much code and complexity?
					await buildAll({ injectScript: liveReloadScript });
					console.info(styleText("green", "Rebuild complete"));
					notifyReload();
				}
			}
		} catch (err) {
			// Directory doesn't exist yet, that's fine
			if (err.code !== "ENOENT") {
				console.warn(`Could not watch ${dir}:`, err.message);
			}
		}
	})();
}

const server = polka()
	.get("/events", (req, res) => {
		res.writeHead(200, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
		});
		connections.add(res);
		req.on("close", () => connections.delete(res));
	})
	.use(sirv(OUTPUT_DIR, { dev: true }))
	.listen(PORT);

server.server.on("error", (err) => {
	console.error("Server error:", err.message);
	process.exit(1);
});
