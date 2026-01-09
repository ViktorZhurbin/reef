import fsPromises from "node:fs/promises";
import path from "node:path";
import * as esbuild from "esbuild";

/**
 * Compile a Solid JSX file into a self-registering Web Component island.
 * Uses a virtual entry point to avoid fragile regex or AST parsing for component names.
 *
 * @param {Object} options - Compilation options
 * @param {string} options.sourcePath - Path to source JSX file (e.g., './islands/Counter.jsx')
 * @param {string} options.outputPath - Path to output JS file (e.g., './dist/counter-island.js')
 * @param {string} options.elementName - Custom element name (e.g., 'counter-component')
 */
export async function compileJSXIsland({
	sourcePath,
	outputPath,
	elementName,
}) {
	// Resolve absolute path for the source so esbuild's virtual entry can find it
	const absoluteSourcePath = path.resolve(sourcePath);
	const sourceDir = path.dirname(absoluteSourcePath);
	const sourceFileName = path.basename(absoluteSourcePath);

	/**
	 * VIRTUAL ENTRY POINT
	 * We import the default export from your JSX file and immediately
	 * pass it to solid-element. This makes the component name irrelevant.
	 */
	const virtualEntry = `
    import { customElement, noShadowDOM } from 'solid-element';
    import Component from '${absoluteSourcePath}';

		const observedAttributes = Component.defaultProps
      ? Object.keys(Component.defaultProps)
      : ['initial'];

		console.log({ observedAttributes, defaultProps: Component.defaultProps })

    customElement(
      '${elementName}',
      observedAttributes.reduce((acc, curr) => ({ ...acc, [curr]: undefined }), {}),
      (props, { element }) => {
        noShadowDOM();
        return Component(props);
      }
    );
  `.trim();

	const result = await esbuild.build({
		// Using 'stdin' allows us to pass the virtual entry string directly
		stdin: {
			contents: virtualEntry,
			resolveDir: sourceDir,
			loader: "js",
		},
		bundle: true,
		format: "esm",
		jsx: "automatic",
		jsxImportSource: "solid-js/h",
		target: "es2020",
		write: false,
		// Don't bundle - use CDN via import maps
		external: ["solid-js", "solid-js/web", "solid-js/h/*", "solid-element"],
		logLevel: "warning",
	});

	if (!result.outputFiles || result.outputFiles.length === 0) {
		throw new Error(`esbuild produced no output for ${sourcePath}`);
	}

	const finalCode = result.outputFiles[0].text;

	// Ensure output directory exists and write the file
	await fsPromises.mkdir(path.dirname(outputPath), { recursive: true });
	await fsPromises.writeFile(outputPath, finalCode);
}
