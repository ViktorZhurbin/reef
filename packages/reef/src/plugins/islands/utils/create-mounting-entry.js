import { basename } from "node:path";
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
			const props = getDataAttributes(container.attributes);
			${config.hydrateFnString}
		}
	`;

	return [componentImport, hydrateFn, getDataAttributes.toString()]
		.map((item) => item.trim())
		.join("\n");
}

// Extract props from data-* attributes
function getDataAttributes(attributes) {
	const props = {};

	const DATA_PREFIX = "data-";
	for (const attr of attributes) {
		if (attr.name.startsWith(DATA_PREFIX)) {
			const propName = attr.name.slice(DATA_PREFIX.length);
			props[propName] = attr.value;
		}
	}

	return props;
}
