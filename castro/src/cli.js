/**
 * Castro CLI
 *
 * Entry point for the `castro` command.
 * Parses arguments and runs the appropriate action.
 *
 * Commands:
 * - castro (or castro dev) - Start development server
 * - castro build - Build for production
 * - castro purge - Clean output directory
 */

import { rm } from "node:fs/promises";
import { cleanupTempDir, OUTPUT_DIR, setupCleanupOnExit } from "./config.js";
import { messages } from "./messages.js";

// Set up cleanup handlers
setupCleanupOnExit();
cleanupTempDir();

// Parse command
const command = process.argv[2] || "dev";

switch (command) {
	case "dev": {
		// Start dev server
		const { startDevServer } = await import("./dev/server.js");
		await startDevServer();
		break;
	}

	case "build": {
		// Production build
		process.env.NODE_ENV = "production";
		const { buildAll } = await import("./build/builder.js");
		await buildAll({ verbose: true });
		break;
	}

	case "purge": {
		// Clean output directory
		await rm(OUTPUT_DIR, { recursive: true, force: true });
		console.info(messages.purge.success);
		break;
	}

	default: {
		console.error(messages.commands.unknown(command));
		console.info(messages.commands.usage);
		process.exit(1);
	}
}
