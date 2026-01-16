import tsPreset from "@babel/preset-typescript";
import solidPreset from "babel-preset-solid";

/**
 * A tiny plugin to handle Solid JSX via Babel
 * @type { (ssr?: boolean) => import("bun").BunPlugin }
 */
export const getSolidBabelPlugin = (ssr) => ({
	name: "solid-babel",
	setup(build) {
		build.onLoad({ filter: /\.[jt]sx$/ }, async (args) => {
			const source = await Bun.file(args.path).text();

			const { code } = await import("@babel/core").then((babel) =>
				babel.transformAsync(source, {
					filename: args.path,
					presets: [
						[
							solidPreset,
							ssr
								? { generate: "ssr", hydratable: true }
								: { generate: "dom", hydratable: false },
						],
						[tsPreset],
					],
				}),
			);

			return { contents: code, loader: "js" };
		});
	},
});
