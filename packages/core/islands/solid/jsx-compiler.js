import fsPromises from "node:fs/promises";
import path from "node:path";
import tsPreset from "@babel/preset-typescript";
import solidPreset from "babel-preset-solid";
import * as esbuild from "esbuild";
import { createBabelPlugin, writeEsbuildOutput } from "../../lib/plugin-utils";

/**
 * A tiny esbuild plugin to handle Solid JSX via Babel
 */
const solidBabelPlugin = createBabelPlugin("solid-babel", () => ({
	presets: [[solidPreset, { generate: "dom", hydratable: false }], [tsPreset]],
}));

export async function compileJSXIsland({
	sourcePath,
	outputPath,
	elementName,
}) {
	/**
	 * Now the virtual entry is extremely clean.
	 * We just import the component normally; esbuild will use the
	 * plugin above to transform it during the "bundle" phase.
	 */
	const virtualEntry = `
    import { customElement, noShadowDOM } from 'solid-element';
    import Component from './${path.basename(sourcePath)}';

		const defaultPropsKeys = Object.keys(Component.defaultProps ?? {});
		const defaultProps = defaultPropsKeys.reduce((acc, curr) => {
			acc[curr] = undefined;
			return acc;
		}, {});

    customElement('${elementName}', defaultProps, (props) => {
    	noShadowDOM();

			return Component(props);
		});
  `.trim();

	const result = await esbuild.build({
		stdin: {
			contents: virtualEntry,
			resolveDir: path.dirname(sourcePath),
			loader: "js",
		},
		bundle: true,
		format: "esm",
		target: "es2020",
		write: false,
		outfile: outputPath, // Helper for CSS generation
		plugins: [solidBabelPlugin], // Let esbuild handle CSS natively
		external: ["solid-js", "solid-js/web", "solid-element"],
		logLevel: "warning",
	});

	await fsPromises.mkdir(path.dirname(outputPath), { recursive: true });
	return writeEsbuildOutput(result);
}
