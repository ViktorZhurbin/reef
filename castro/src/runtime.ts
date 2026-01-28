/**
 * Castro Runtime Utilities
 *
 * Functions used by island components at runtime and detected at build time.
 */

import type { ComponentType } from "preact";

/**
 * Define an island component for client-side hydration
 *
 * This is a no-op at runtime (just returns the component unchanged).
 * At build time, Castro detects this function call to identify islands.
 *
 * Usage in islands/:
 * ```tsx
 * import { defineIsland } from 'castro';
 *
 * export default defineIsland(function Counter(props) {
 *   return <button>...</button>;
 * });
 * ```
 *
 * Benefits:
 * - Explicit marking (no fragile import detection)
 * - Type-safe
 * - Clear intent in code
 * - Can add metadata/options in future
 *
 * @param component - The island component
 * @returns The component unchanged (identity function)
 */
export function defineIsland<T extends ComponentType<any>>(component: T): T {
	return component;
}
