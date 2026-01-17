import { isLandCore } from "./islands/is-land-core.js";
import { preactIslands } from "./islands/preact/index.js";
import { solidIslands } from "./islands/solid/index.js";

export const defaultPlugins = [
	isLandCore(), // Load is-land library first
	solidIslands(),
	preactIslands(),
];
