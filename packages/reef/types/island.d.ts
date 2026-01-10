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
}
