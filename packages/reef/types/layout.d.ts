/**
 * Layout and frontmatter type definitions
 */

/**
 * Props passed to layout component functions
 */
export interface LayoutProps {
	/** Page title */
	title: string;
	/** Rendered HTML content from markdown */
	content: string;
	/** Array of script tag strings to inject */
	scripts: string[];
	/** Array of import map script tags */
	importMaps: string[];
	/** Additional properties from frontmatter are spread here */
	[key: string]: unknown;
}

/**
 * Frontmatter data parsed from markdown files
 */
export interface Frontmatter {
	/** Optional page title (overrides filename) */
	title?: string;
	/** Optional layout name (defaults to 'default') */
	layout?: string;
	/** Any other custom frontmatter fields */
	[key: string]: unknown;
}

/**
 * Layout component function type
 */
export type LayoutComponent = (props: LayoutProps) => unknown;
