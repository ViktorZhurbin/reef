import type { BuildConfig } from "bun";

export type SupportedFramework = "solid" | "preact";

/**
 * Represents a compiled island component
 */
export interface IslandComponent {
	/** Custom element name (e.g., 'counter-preact') */
	elementName: string;
	/** Path to compiled JS file (e.g., '/components/counter-preact.js') */
	outputPath: string;
	/** Optional path to CSS file (e.g., '/components/counter-preact.css') */
	cssPath?: string;
	framework: SupportedFramework;
	/** Compiled SSR code (ESM string for Node.js execution) */
	ssrCode?: string | null;
}

export type IslandCompilerConfig = {
	framework: SupportedFramework;
	getBuildConfig: (ssr?: boolean) => Partial<BuildConfig>;
};

export type ImportMap = Record<string, string>;

/**
 * Asset (script or link) to inject into page
 */
export type Asset =
	| string
	| {
			/** Tag name */
			tag: "script" | "link";
			/** Tag attributes */
			attrs: Record<string, string | undefined>;
			/** Inline content (for script tags) */
			content?: string;
	  };

export type IslandPluginConfig = {
	framework: SupportedFramework;
	defaultDir: string;
	elementSuffix: string;
	getBuildConfig: (ssr?: boolean) => Partial<BuildConfig>;
	assets?: Asset[];
	importMap: ImportMap;
	hydrateFnString: string;
	renderSSR: (
		Component: unknown,
		props: Record<string, unknown>,
	) => Promise<string>;
};

/**
 * Configuration options for island plugins (Preact, Solid)
 */
export interface IslandPluginOptions {
	/** Directory containing JSX island files */
	sourceDir?: string;
}
