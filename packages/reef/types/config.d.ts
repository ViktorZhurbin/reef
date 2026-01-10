/**
 * Configuration file type definitions
 */

import type { ReefPlugin } from "./plugin.js";

/**
 * Reef configuration object (reef.config.js)
 */
export interface ReefConfig {
	/** Plugins to apply during build and dev */
	plugins?: ReefPlugin[];
}
