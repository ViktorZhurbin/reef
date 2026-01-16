import { basename, dirname, resolve } from "node:path";
import { FrameworkConfig } from "../framework-config.js";
import { CLIENT_RUNTIME_ALIAS } from "../reef-island/plugin.js";
import { createMountingEntry } from "./create-mounting-entry.js";

/**
 * @import { BuildOutput } from "bun"
 * @import { SupportedFramework } from "../../../types/island.js"
 */

/**
 * @param {Object} params
 * @param {string} params.sourcePath
 * @param {string} params.outputPath
 * @param {SupportedFramework} params.framework
 *
 * @returns {Promise<BuildOutput>}
 */
export async function compileIslandClient({
	sourcePath,
	outputPath,
	framework,
}) {
	const config = FrameworkConfig[framework];
	const absoluteSourceDir = resolve(dirname(sourcePath));
	const absoluteSourcePath = resolve(sourcePath);
	const virtualEntryPath = resolve(absoluteSourceDir, basename(outputPath));
	const virtualEntryContent = createMountingEntry(
		absoluteSourcePath,
		framework,
	);
	const pluginConfig = config.getBuildConfig();

	const result = await Bun.build({
		entrypoints: [virtualEntryPath],
		files: {
			[virtualEntryPath]: virtualEntryContent,
		},
		root: absoluteSourceDir,
		outdir: dirname(resolve(outputPath)),
		format: "esm",
		target: "browser",
		minify: false,
		packages: "external",
		...pluginConfig,
		external: [...(pluginConfig.external ?? []), CLIENT_RUNTIME_ALIAS],
	});

	if (!result.success) {
		const errorDetails = result.logs
			.map((log) => `${log.level}: ${log.message}`)
			.join("\n");
		throw new Error(`Island build failed:\n${errorDetails}`);
	}

	return result;
}
