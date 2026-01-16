import { pathToFileURL } from "node:url";
import { CONFIG_FILE } from "../constants/config.js";

/**
 * @import { ReefConfig } from '../types/config.js';
 */

/**
 * Load configuration file with plugins
 * @returns {Promise<ReefConfig|null>} Configuration object or null if file doesn't exist
 */
export async function loadConfig() {
	// Use Bun's fast synchronous file check
	const configExists = await Bun.file(CONFIG_FILE).exists();
	if (!configExists) return null;

	try {
		const configUrl = pathToFileURL(CONFIG_FILE).href;
		const config = await import(configUrl);
		return config.default;
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		throw new Error(`Failed to load config: ${err.message}`);
	}
}
