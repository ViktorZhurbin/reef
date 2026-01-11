/**
 * Build function type definitions
 */

import type { ReefPlugin } from "./plugin.js";

/**
 * Options for building a single markdown file
 */
export interface BuildMdPageOptions {
	/** Optional script to inject into the page */
	injectScript?: string;
	/** Whether to log on successful build */
	logOnSuccess?: boolean;
	/** Whether to log when starting the build */
	logOnStart?: boolean;
	/** Plugins to apply during build */
	plugins?: ReefPlugin[];
	layouts?: string[];
}

/**
 * Options for building all markdown files
 */
export interface BuildAllOptions {
	/** Optional script to inject into all pages */
	injectScript?: string;
	/** Whether to enable verbose logging */
	verbose?: boolean;
	/** Plugins to apply during build */
	plugins?: ReefPlugin[];
}
