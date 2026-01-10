import fsPromises from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { styleText } from "node:util";
import polka from "polka";
import sirv from "sirv";
import { CONFIG_FILE } from "../constants/config.js";
import { CONTENT_DIR, LAYOUTS_DIR, OUTPUT_DIR } from "../constants/dir.js";
import { buildAll, buildSingle, reloadLayouts } from "./builder.js";
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

// Watch config file for changes
(async () => {
	try {
		const watcher = fsPromises.watch(CONFIG_FILE);
		for await (const _event of watcher) {
			console.info(styleText("yellow", "\n⚙️  Config changed, restarting..."));
			server.server.close();
			process.exit(0);
		}
	} catch {
		// Config file doesn't exist, that's fine (optional)
	}
})();

// Watch content directory for markdown and reef.js changes
(async () => {
	const watcher = fsPromises.watch(CONTENT_DIR, { recursive: true });

	for await (const event of watcher) {
		const filePath = path.join(CONTENT_DIR, event.filename);

		if (event.filename?.endsWith(".md")) {
			logFileChanged(filePath);

			await buildSingle(event.filename, {
				injectScript: liveReloadScript,
				logOnSuccess: true,
			});

			notifyReload();
		} else if (event.filename?.endsWith("reef.js")) {
			logFileChanged(filePath);

			// Full rebuild when reef.js changes (layout config changed)
			await buildAll({ injectScript: liveReloadScript });
			notifyReload();
		}
	}
})();

// Collect all watch directories
const watchDirs = new Set([
	LAYOUTS_DIR,
	...(config?.plugins || []).flatMap((p) => p.watchDirs || []),
]);

// Watch plugin directories (for components, islands, etc.)
// Separate watcher from CONTENT_DIR because behavior differs: incremental vs full rebuild
for (const dir of watchDirs) {
	(async () => {
		try {
			const watcher = fsPromises.watch(dir, { recursive: true });
			for await (const event of watcher) {
				if (event.filename) {
					logFileChanged(`${dir}/${event.filename}`);

					// Reload layouts if layout files changed
					if (dir === LAYOUTS_DIR) {
						await reloadLayouts();
					}

					// Full rebuild when plugin/layout files change
					await buildAll({ injectScript: liveReloadScript });
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

function logFileChanged(filePath) {
	console.info(`${styleText("gray", "File changed:")} ${filePath}`);
}
