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

const PORT = 3000;

// Read live reload script and wrap in <script> tag
const liveReloadJs = await fsPromises.readFile("./src/live-reload.js", "utf-8");
const liveReloadScript = `<script>\n${liveReloadJs}\n</script>`;

// Initial build
await buildAll({ injectScript: liveReloadScript });

console.info("Watching...");
console.info(`Server at ${styleText("cyan", `http://localhost:${PORT}`)}`);

// Track SSE connections
const connections = new Set();

// File watcher
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
			// Notify all connections
			for (const stream of connections) {
				stream.write("data: reload\n\n");
			}
		}
	}
})();

const server = http.createServer(async (req, res) => {
	// SSE endpoint
	if (req.url === "/events") {
		res.writeHead(200, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
		});
		connections.add(res);
		return req.on("close", () => connections.delete(res));
	}

	if (req.url.startsWith("/.") || req.url === "/favicon.ico") {
		return res.writeHead(404).end();
	}

	try {
		const filePathBase = req.url === "/" ? "/index.html" : req.url;
		const data = await fsPromises.readFile(path.join(OUTPUT_DIR, filePathBase));
		res.writeHead(200, { "Content-Type": "text/html" }).end(data);
	} catch (err) {
		console.error(err.message);
		res.writeHead(404).end("404 Not Found");
	}
});

server.listen(PORT).on("error", (err) => {
	console.warn(`Server error: ${err.message}`);
	process.exit(1);
});
