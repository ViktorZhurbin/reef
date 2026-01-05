import { EventEmitter } from "events";
import fs from "fs";
import http from "http";
import path from "path";
import {
	buildAll,
	buildSingle,
	CONTENT_DIR,
	OUTPUT_DIR,
} from "./lib/builder.js";
import { ColorLog } from "./lib/colorLog.js";

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
console.info(`Server at ${ColorLog.cyan(`http://localhost:${PORT}`)}`);

// NOTE: No defensive error handling - fails fast if CONTENT_DIR missing
const watcher = fs.watch(CONTENT_DIR, async (_, filename) => {
	if (filename?.endsWith(".md")) {
		console.info(`${ColorLog.dim("File changed:")} ${CONTENT_DIR}/${filename}`);
		await buildSingle(filename, {
			injectScript: liveReloadScript,
			logOnSuccess: true,
		});
		reloadEmitter.emit("reload");
	}
});

watcher.on("error", (err) => {
	console.warn(`Watch error: ${err.message}`);
});

const server = http.createServer((req, res) => {
	// Server-Sent Events endpoint for live reload
	if (req.url === "/events") {
		res.writeHead(200, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
		});

		// Listen for reload events and notify client
		const onReload = () => {
			try {
				res.write("data: reload\n\n");
			} catch {
				// Connection closed, cleanup handled by 'close' event
			}
		};
		reloadEmitter.on("reload", onReload);

		// Cleanup on client disconnect
		req.on("close", () => {
			reloadEmitter.off("reload", onReload);
		});

		return;
	}

	// Serve HTML files
	let filePath = req.url === "/" ? "/index.html" : req.url;
	filePath = path.join(OUTPUT_DIR, filePath);

	fs.readFile(filePath, (err, data) => {
		if (err) {
			res.writeHead(404);
			res.end("404 Not Found");
			return;
		}
		res.writeHead(200, { "Content-Type": "text/html" });
		res.end(data);
	});
});

// NOTE: Minimal error handling - let failures be visible
server.listen(PORT);

server.on("error", (err) => {
	console.warn(`Server error: ${err.message}`);
	process.exit(1);
});
