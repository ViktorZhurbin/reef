/**
 * Plugin API type definitions
 */

/**
 * Context passed to plugin onBuild hook
 */
export interface PluginBuildContext {
	/** The output directory path */
	outputDir: string;
	/** The content directory path */
	contentDir: string;
}

/**
 * Context passed to plugin getScripts hook
 */
export interface PluginScriptContext {
	/** The markdown content of the current page */
	pageContent: string;
}

/**
 * Reef plugin interface
 */
export interface ReefPlugin {
	/** Plugin name */
	name: string;

	/** Optional directories to watch for changes in dev mode */
	watchDirs?: string[];

	/**
	 * Hook: Called during build to discover, compile, and copy components
	 * Use this for file operations, asset processing, etc.
	 */
	onBuild?(context: PluginBuildContext): Promise<void>;

	/**
	 * Hook: Returns import map script tag for runtime dependencies
	 * Should return null if plugin has no components to load
	 */
	getImportMap?(): Promise<string | null>;

	/**
	 * Hook: Returns script tags to inject into pages
	 * Use context.pageContent to determine which scripts are needed
	 */
	getScripts?(context: PluginScriptContext): Promise<string[]>;
}

/**
 * Configuration options for island plugins (Preact, Solid)
 */
export interface IslandPluginOptions {
	/** Directory containing JSX island files */
	islandsDir?: string;
}
