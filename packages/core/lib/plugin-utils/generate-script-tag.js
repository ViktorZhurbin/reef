/**
 * Generate a script tag for ES module imports
 *
 * @param {string} src - Script source path
 * @param {object} [options] - Additional options
 * @param {boolean} [options.module=true] - Use type="module"
 * @param {boolean} [options.defer=false] - Add defer attribute
 * @returns {string} Script tag HTML
 *
 * @example
 * generateScriptTag('/components/solid-counter.js')
 * // Returns: '<script type="module" src="/components/solid-counter.js"></script>'
 */
export function generateScriptTag(src, options = {}) {
	const { module = true, defer = false } = options;

	const attrs = [];
	if (module) attrs.push('type="module"');
	if (defer) attrs.push("defer");
	attrs.push(`src="${src}"`);

	return `<script ${attrs.join(" ")}></script>`;
}
