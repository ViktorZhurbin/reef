import { styleText } from "node:util";
import { compileIslandClient } from "./compile-island-client.js";
import { compileIslandSSR } from "./compile-island-ssr.js";

/**
 * @import { SupportedFramework } from '../../../types/island.js';
 */

/**
 * Compiles client and SSR versions of an island
 *
 * @param {Object} params
 * @param {string} params.sourcePath
 * @param {string} params.outputPath
 * @param {SupportedFramework} params.framework
 */
export async function compileIsland({ sourcePath, outputPath, framework }) {
	try {
		// Compile client version
		const clientBuildResult = await compileIslandClient({
			sourcePath,
			outputPath,
			framework,
		});

		// Compile SSR version (pure component for Node.js)
		const ssrCode = await compileIslandSSR({ sourcePath, framework });

		const cssOutputPath = clientBuildResult.outputs.find((output) =>
			output.path.endsWith(".css"),
		)?.path;

		return {
			ssrCode,
			cssOutputPath,
		};
	} catch (err) {
		console.info(styleText("red", "Island build failed: "), err);
	}
}
