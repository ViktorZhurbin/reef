import path from "node:path";

/**
 * Convert a file name to a custom element name
 * Removes the file extension and optionally adds a suffix
 *
 * @param {string} fileName - Source file name (e.g., 'counter.jsx', 'button.js')
 * @param {string} [suffix='-component'] - Suffix to add (default: '-component')
 * @returns {string} Custom element name with hyphen
 *
 * @example
 * getElementName('counter.jsx')
 * // Returns: 'counter-component'
 *
 * getElementName('my-button.jsx')
 * // Returns: 'my-button-component'
 *
 * getElementName('data-table.jsx', '-island')
 * // Returns: 'data-table-island'
 */
export function getElementName(fileName, suffix = "-component") {
	const ext = path.extname(fileName);
	const baseName = path.basename(fileName, ext);

	return `${baseName}${suffix}`;
}
