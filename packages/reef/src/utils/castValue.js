/**
 * Casts a string attribute value to its proper JS type.
 */
export function castValue(val) {
	if (val === "true") return true;
	if (val === "false") return false;
	if (val === "" || val === null) return true; // Boolean attribute shorthand: data-is-active

	// Attempt to parse as Number
	if (val !== "" && !Number.isNaN(val)) return Number(val);

	// Attempt to parse as JSON (for arrays/objects)
	if (val.startsWith("{") || val.startsWith("[")) {
		try {
			return JSON.parse(val);
		} catch {
			return val;
		}
	}

	return val;
}
