import fsPromises from "node:fs/promises";
import { styleText } from "node:util";
import polka from "polka";
import sirv from "sirv";
import {
	buildAll,
	buildSingle,
	CONTENT_DIR,
	OUTPUT_DIR,
} from "./lib/builder.js";

const PORT = 3000;

// Read live reload script and wrap in <script> tag
let liveReloadJs;
try {
	liveReloadJs = await fsPromises.readFile("./src/live-reload.js", "utf-8");
} catch (err) {
	console.error("Failed to read live reload script:", err.message);
	process.exit(1);
}
const liveReloadScript = `<script>\n${liveReloadJs}\n</script>`;

// Initial build
await buildAll({ injectScript: liveReloadScript });

console.info("Watching...");
console.info(`Server at ${styleText("cyan", `http://localhost:${PORT}`)}`);

// Track SSE connections
const connections = new Set();

// File watcher
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
				// Notify all connections
				for (const res of connections) {
					try {
						res.write("data: reload\n\n");
					} catch {
						// Connection closed, will be cleaned up on 'close' event
						connections.delete(res);
					}
				}
			}
		}
	} catch (err) {
		console.error("File watcher error:", err.message);
		process.exit(1);
	}
})();

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
