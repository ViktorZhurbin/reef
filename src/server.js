import { EventEmitter } from "node:events";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { styleText } from "node:util";
import {
	buildAll,
	buildSingle,
	CONTENT_DIR,
	OUTPUT_DIR,
} from "./lib/builder.js";

const LIVE_RELOAD_SCRIPT = "./src/live-reload.js";
const PORT = 3000;

// Event emitter for live reload notifications
const reloadEmitter = new EventEmitter();

// Read live reload script and wrap in <script> tag
let liveReloadJs;
try {
	liveReloadJs = fs.readFileSync(LIVE_RELOAD_SCRIPT, "utf-8");
} catch (err) {
	console.error(
		`Failed to read live reload script: ${LIVE_RELOAD_SCRIPT}`,
		err.message,
	);
	process.exit(1);
}
const liveReloadScript = `<script>\n${liveReloadJs}\n</script>`;

// Initial build
await buildAll({ injectScript: liveReloadScript });

console.info("Watching...");
console.info(`Server at ${styleText("cyan", `http://localhost:${PORT}`)}`);

(async () => {
	try {
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
				reloadEmitter.emit("reload");
			}
		}
	} catch (err) {
		console.warn(`Watch error: ${err.message}`);
	}
})();

const server = http.createServer(async (req, res) => {
	// Server-Sent Events endpoint for live reload
	if (req.url === "/events") {
		res.writeHead(200, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
		});

		const onReload = () => {
			try {
				res.write("data: reload\n\n");
			} catch {
				/* connection closed */
			}
		};
		reloadEmitter.on("reload", onReload);
		req.on("close", () => reloadEmitter.off("reload", onReload));
		return;
	}

	// Ignore browser metadata/hidden files
	if (req.url.startsWith("/.") || req.url === "/favicon.ico") {
		res.writeHead(404);
		res.end();
		return;
	}

	try {
		const filePathBase = req.url === "/" ? "/index.html" : req.url;
		const data = await fsPromises.readFile(path.join(OUTPUT_DIR, filePathBase));
		res.writeHead(200, { "Content-Type": "text/html" });
		res.end(data);
	} catch (err) {
		console.error(err.message);
		res.writeHead(404);
		res.end("404 Not Found");
	}
});

server.listen(PORT);

server.on("error", (err) => {
	console.warn(`Server error: ${err.message}`);
	process.exit(1);
});
