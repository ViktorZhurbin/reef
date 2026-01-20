import { basename } from "node:path";
import { castValue } from "../../../utils/castValue.js";
import {
	getPropsFromAttributes,
	stripDataPrefix,
} from "../../../utils/props.js";
import { FrameworkConfig } from "../framework-config.js";
/**
 * @import { SupportedFramework } from "../../../types/island.js"
 */

/**
 * Creates mounting function wrapper for framework components
 * @param {string} sourcePath - Path to the component file
 * @param {SupportedFramework} framework
 */
export function createMountingEntry(sourcePath, framework) {
	const config = FrameworkConfig[framework];
	const componentImport = `import Component from './${basename(sourcePath)}';`;

	const hydrateFn = `
		export default async (container) => {
			const props = getPropsFromAttributes(container.attributes);
			${config.hydrateFnString}
		}
	`;

	return [
		componentImport,
		hydrateFn,
		getPropsFromAttributes.toString(),
		castValue.toString(),
		stripDataPrefix.toString(),
	]
		.map((item) => item.trim())
		.join("\n");
}
