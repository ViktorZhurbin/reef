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
 * Context passed to plugin transform hook
 */
export interface PluginTransformContext {
	/** HTML content to transform */
	content: string;
	/** Output file path (for debugging) */
	filePath: string;
}

/**
 * Asset (script or link) to inject into page
 */
export interface Asset {
	/** Tag name (script or link) */
	tag: "script" | "link";
	/** Tag attributes */
	attrs: Record<string, string>;
	/** Inline content (for script tags) */
	content?: string;
}

/**
 * Import map configuration object
 */
export interface ImportMapConfig {
	/** Import mappings */
	imports: Record<string, string>;
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
	 * Hook: Returns import map configuration for runtime dependencies
	 * Should return null if plugin has no components to load
	 */
	getImportMap?(): Promise<ImportMapConfig | null>;

	/**
	 * Hook: Returns assets (scripts/links) to inject into pages
	 * Use context.pageContent to determine which assets are needed
	 */
	getAssets?(context: PluginScriptContext): Promise<Asset[]>;

	/**
	 * Hook: Transform HTML before writing to disk
	 * Allows plugins to modify HTML markup (e.g., wrapping components)
	 */
	transform?(context: PluginTransformContext): Promise<string>;
}

/**
 * Configuration options for island plugins (Preact, Solid)
 */
export interface IslandPluginOptions {
	/** Directory containing JSX island files */
	islandsDir?: string;
}
