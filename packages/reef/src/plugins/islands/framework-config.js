/**
 * @import { SupportedFramework, IslandPluginConfig } from "../../types/island.js";
 */

import { generateHydrationScript } from "solid-js/web";
import { getSolidBabelPlugin } from "./solid/babel-plugin.js";

/**
 * @type {Record<SupportedFramework, IslandPluginConfig>}
 */
export const FrameworkConfig = {
	solid: {
		framework: "solid",
		defaultDir: "islands-solid",
		elementSuffix: "-solid",

		getBuildConfig: (ssr) => ({
			plugins: [getSolidBabelPlugin(ssr)],
			external: ["solid-js", "solid-js/web"],
		}),
		assets: [generateHydrationScript()],
		importMap: {
			"solid-js": "https://esm.sh/solid-js",
			"solid-js/web": "https://esm.sh/solid-js/web",
		},

		hydrateFnString: `
			const { hydrate } = await import("solid-js/web");
			hydrate(() => Component(props), container);
		`,

		renderSSR: async (Component, props) => {
			const { renderToString } = await import("solid-js/web");

			// @ts-expect-error: type later, maybe
			return renderToString(() => Component(props));
		},
	},

	preact: {
		framework: "preact",
		defaultDir: "islands-preact",
		elementSuffix: "-preact",

		getBuildConfig: () => ({
			jsx: "automatic",
			jsxImportSource: "preact",
			external: ["preact", "preact/hooks", "preact/jsx-runtime"],
		}),
		importMap: {
			preact: "https://esm.sh/preact",
			"preact/hooks": "https://esm.sh/preact/hooks",
			"preact/jsx-runtime": "https://esm.sh/preact/jsx-runtime",
		},

		hydrateFnString: `
			const { h, hydrate } = await import("preact");
			hydrate(h(Component, props), container);
		`,

		renderSSR: async (Component, props) => {
			const { h } = await import("preact");
			const { render } = await import("preact-render-to-string");

			// @ts-expect-error: type later, maybe
			return render(h(Component, props));
		},
	},
};
