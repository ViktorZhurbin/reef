/**
 * User Configuration Loading
 *
 * Handles loading and parsing the user's manifesto.js config file.
 * This is an optional user-facing configuration step.
 */

import { access } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { CONFIG_FILE } from "./constants.js";
import { messages } from "./messages/index.js";

/**
 * @import { CastroConfig } from './types.d.ts'
 */

/**
 * Load user configuration file
 *
 * Reads the optional manifesto.js config file from the project root.
 * If the file doesn't exist, returns null (not an error).
 *
 * @returns {Promise<CastroConfig | null>} Configuration object or null if file doesn't exist
 */
export async function loadConfig() {
	try {
		await access(CONFIG_FILE);
		const configUrl = pathToFileURL(CONFIG_FILE).href;
		const config = await import(configUrl);
		return config.default;
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		if (err.code === "ENOENT") return null;
		throw new Error(messages.errors.configLoadFailed(err.message));
	}
}
