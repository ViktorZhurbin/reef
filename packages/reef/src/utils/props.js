import { castValue } from "./castValue.js";

export function getPropsFromAttributes(attributes) {
	const props = {};

	for (const attr of attributes) {
		const propName = stripDataPrefix(attr.name);

		props[propName] = castValue(attr.value);
	}

	return props;
}

export function stripDataPrefix(attrName) {
	const DATA_PREFIX = "data-";

	return attrName.startsWith(DATA_PREFIX)
		? attrName.slice(DATA_PREFIX.length)
		: attrName;
}

export function toCamelCase(str) {
	return str.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
}
