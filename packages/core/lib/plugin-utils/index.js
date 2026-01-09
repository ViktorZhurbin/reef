/**
 * Core utilities for plugins
 *
 * These are optional helpers that plugins can use to simplify common tasks.
 * Plugins are free to implement their own versions if they need custom behavior.
 */

export { detectCustomElements } from "./detect-custom-elements.js";
export { getElementName } from "./get-element-name.js";
export { generateScriptTag } from "./generate-script-tag.js";
export { filterUsedComponents } from "./filter-used-components.js";
export { generateScriptsForUsedComponents } from "./generate-scripts-for-used-components.js";
export { processJSXIslands } from "./process-jsx-islands.js";
