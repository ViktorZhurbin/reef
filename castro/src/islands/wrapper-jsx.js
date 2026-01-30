/**
 * JSX Island Wrapper
 *
 * Wraps island components for client-side hydration using Preact's options.vnode hook.
 *
 * How island detection works:
 * 1. Islands are detected at build time and registered
 * 2. During page render, we intercept VNode creation via options.vnode hook
 * 3. When an island component is encountered, we replace it with a wrapper
 * 4. The wrapper renders static HTML and wraps it in <castro-island> for hydration
 */

import { join } from "node:path";
import { h, options } from "preact";
import { renderToString } from "preact-render-to-string";
import { compileJSX } from "../build/compile-jsx.js";
import { islands } from "./registry.js";

/**
 * @import { Directive } from '../types.d.ts'
 */

/**
 * Island wrapper that uses Preact's options.vnode hook to intercept
 * and wrap island components during VNode creation.
 */
class IslandWrapper {
	/** @type {Directive[]} */
	static DIRECTIVES = ["lenin:awake", "comrade:visible", "no:pasaran"];
	/** @type {Directive} */
	static DEFAULT_DIRECTIVE = "comrade:visible";

	/** Store original vnode hook to restore after rendering */
	#originalHook = options.vnode;
	/** Track whether the hook is currently installed */
	#hookInstalled = false;
	/** Track whether we're rendering static HTML (prevents infinite recursion) */
	#renderingStatic = false;
	/** @type {Set<string> | null} Set to collect used island CSS paths during render */
	#trackedCss = null;
	/** @type {any} Cached compiled error fallback component */
	#ErrorComponent = null;

	/**
	 * Install the island detection hook
	 *
	 * @param {Set<string>} [trackedCss] - Set to collect used island CSS paths
	 */
	async install(trackedCss) {
		// Prevent double-installation
		if (this.#hookInstalled) return;
		this.#hookInstalled = true;
		this.#trackedCss = trackedCss || null;

		// Compile the error fallback component on first use
		if (!this.#ErrorComponent) {
			const fallbackPath = join(import.meta.dirname, "error-fallback.tsx");
			const { module } = await compileJSX(fallbackPath);
			this.#ErrorComponent = module.default;
		}

		// Install our island detection hook
		options.vnode = (vnode) => {
			// Skip wrapping if we're currently rendering static HTML
			// (prevents infinite recursion when the wrapper renders the island)
			if (this.#renderingStatic) {
				if (this.#originalHook) this.#originalHook(vnode);
				return;
			}

			// Check if this VNode is a component (function) and if it's a known island
			if (typeof vnode.type !== "function") {
				if (this.#originalHook) this.#originalHook(vnode);
				return;
			}

			const componentName = vnode.type.name;

			if (islands.isIsland(componentName)) {
				// Capture the original component before we replace it
				const OriginalComponent = vnode.type;

				// Replace the component type with a wrapper HOC
				// This wrapper will be called by Preact when rendering this VNode
				vnode.type = (props) => {
					const island = islands.getIsland(componentName);

					if (!island) {
						throw new Error(`Island "${componentName}" not found in registry`);
					}

					// Track CSS for this island into the provided context
					if (this.#trackedCss && island.publicCssPath) {
						this.#trackedCss.add(island.publicCssPath);
					}

					// Extract directives and clean props
					const directive = this.#extractDirective(props);
					const cleanProps = this.#stripDirectives(props);

					// Render the original component to static HTML
					/** @type {string} */
					let staticHtml;

					// Set flag to prevent the hook from wrapping this render
					this.#renderingStatic = true;

					try {
						staticHtml = renderToString(h(OriginalComponent, cleanProps));
					} catch (e) {
						const err = /** @type {Error} */ (e);

						// Log the error for developer visibility, but don't crash the build
						console.error(
							`\n❌ Failed to render island "${componentName}": ${err.message}`,
						);

						// Render the compiled error fallback component
						return h(this.#ErrorComponent, {
							componentName,
							error: err,
						});
					} finally {
						this.#renderingStatic = false;
					}

					// Handle no:pasaran - static only, no hydration wrapper
					if (directive === "no:pasaran") {
						return h("div", {
							dangerouslySetInnerHTML: { __html: staticHtml },
						});
					}

					// Return the custom element wrapper for client-side hydration
					return h("castro-island", {
						directive,
						import: island.publicJsPath,
						"data-props": JSON.stringify(cleanProps),
						dangerouslySetInnerHTML: { __html: staticHtml },
					});
				};
			}

			// Chain the previous hook if it existed
			if (this.#originalHook) this.#originalHook(vnode);
		};
	}

	/**
	 * Uninstall the island detection hook
	 *
	 * Restores the original vnode hook (if any) that was present
	 * before we installed ours.
	 */
	uninstall() {
		if (!this.#hookInstalled) return;
		this.#hookInstalled = false;
		this.#trackedCss = null;
		options.vnode = this.#originalHook;
	}

	/**
	 * Extract and validate directive from props
	 *
	 * @param {Record<string, any> | undefined} props
	 * @returns {Directive}
	 */
	#extractDirective(props) {
		if (!props) return IslandWrapper.DEFAULT_DIRECTIVE;

		const foundDirectives = IslandWrapper.DIRECTIVES.filter(
			(d) => props[d] !== undefined,
		);

		if (foundDirectives.length > 1) {
			throw new Error(
				`Multiple directives on same component: ${foundDirectives.join(", ")}. Use only one.`,
			);
		}

		return foundDirectives[0] || IslandWrapper.DEFAULT_DIRECTIVE;
	}

	/**
	 * Remove directive props before passing to component
	 *
	 * Directives are metadata for Castro, not component props.
	 *
	 * @param {Record<string, any> | undefined} props
	 * @returns {Record<string, any>}
	 */
	#stripDirectives(props) {
		if (!props) return {};

		const clean = { ...props };
		for (const directive of IslandWrapper.DIRECTIVES) {
			delete clean[directive];
		}
		return clean;
	}
}

// Export singleton instance
export const islandWrapper = new IslandWrapper();
