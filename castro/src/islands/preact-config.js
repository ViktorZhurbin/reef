/**
 * Preact Framework Configuration
 *
 * All Preact-specific settings for island compilation.
 *
 * To support a framework, we need to configure:
 * 1. How to compile components (esbuild JSX settings)
 * 2. How to hydrate on the client (framework-specific code)
 * 3. How to render on the server (SSR function)
 * 4. Where to load the framework from (import map CDN URLs)
 */

/**
 * @import * as preact from "preact"
 * @import * as esbuild from "esbuild"
 * @import { ImportsMap } from "../types.d.ts"
 */

/**
 * @type {{
 * 	framework: "preact";
 * 	getBuildConfig: (ssr?: boolean) => esbuild.BuildOptions;
 * 	importMap: ImportsMap;
 * 	hydrateFnString: string;
 * 	renderSSR: (Component: preact.ComponentType, props: Record<string, unknown>) => Promise<string>;
 * }}
 */
export const PreactConfig = {
	framework: "preact",

	/**
	 * esbuild configuration for compiling Preact components
	 * Uses automatic JSX transform (no need to import h)
	 */
	getBuildConfig: () => ({
		jsx: "automatic",
		jsxImportSource: "preact",
		external: ["preact", "preact/hooks", "preact/jsx-runtime"],
	}),

	/**
	 * Import map tells the browser where to load Preact from
	 * Using esm.sh CDN for zero-config module loading
	 */
	importMap: {
		preact: "https://esm.sh/preact",
		"preact/hooks": "https://esm.sh/preact/hooks",
		"preact/jsx-runtime": "https://esm.sh/preact/jsx-runtime",
	},

	/**
	 * Client-side hydration code
	 *
	 * This code string gets injected into the compiled island bundle.
	 * It runs in the browser when the island loads.
	 *
	 * What it does:
	 * 1. Dynamically imports Preact runtime (resolved via import map)
	 * 2. Calls hydrate() which attaches event listeners to existing HTML
	 *    without re-rendering (the HTML came from SSR)
	 * 3. Component becomes interactive
	 *
	 * Variables available when this runs:
	 * - Component: the imported component function
	 * - props: extracted from data-* attributes
	 * - container: the DOM element to hydrate
	 */
	hydrateFnString: `
		const { h, hydrate } = await import("preact");
		hydrate(h(Component, props), container);
	`,

	/**
	 * Server-side rendering function
	 * Runs at build time to generate static HTML
	 */
	renderSSR: async (Component, props) => {
		const { h } = await import("preact");
		const { render } = await import("preact-render-to-string");

		return render(h(Component, props));
	},
};
