import { pathToFileURL } from "node:url";
import fsPromises from "node:fs/promises";

const CONFIG_FILE = "./bare.config.js";

/**
 * Load configuration file with plugins
 * @returns {Promise<Object|null>} Configuration object or null if file doesn't exist
 */
export async function loadConfig() {
	try {
		await fsPromises.access(CONFIG_FILE);
		const configUrl = pathToFileURL(CONFIG_FILE).href;
		const config = await import(configUrl);
		return config.default;
	} catch (err) {
		if (err.code === "ENOENT") return null; // No config file, that's fine
		throw new Error(`Failed to load config: ${err.message}`);
	}
}
