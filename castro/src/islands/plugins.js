import { preactIslands } from "./preact-plugin.js";
import { castroIslandRuntime } from "./runtime-plugin.js";

/** Default plugins - the minimal set needed for islands to work */
export const defaultPlugins = [castroIslandRuntime(), preactIslands()];
