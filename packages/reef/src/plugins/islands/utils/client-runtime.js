export function getPropsFromAttributes(attributes) {
	const props = {};

	const DATA_PREFIX = "data-";
	for (const attr of attributes) {
		if (attr.name.startsWith(DATA_PREFIX)) {
			const propName = attr.name.slice(DATA_PREFIX.length);

			props[propName] = castValue(attr.value);
		}
	}

	return props;
}

export function toCamelCase(str) {
	return str.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
}

/**
 * Casts a string attribute value to its proper JS type.
 */
export function castValue(val) {
	// covers "empty" attributes, like <my-tag data-active>
	if (val === "true" || val === "" || val === null) return true;

	if (val === "false") return false;

	// Attempt to parse as Number
	const num = Number(val);
	if (val.trim() !== "" && !Number.isNaN(num)) return num;

	// Attempt to parse as JSON (for arrays/objects)
	if (val.startsWith("{") || val.startsWith("[")) {
		try {
			return JSON.parse(val);
		} catch {
			return undefined;
		}
	}

	return val;
}
