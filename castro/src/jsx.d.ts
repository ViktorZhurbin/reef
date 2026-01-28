/**
 * Castro Type Declarations
 *
 * Declares island hydration directives as valid props on all Preact components.
 */

declare module "preact" {
	namespace JSX {
		interface IntrinsicAttributes {
			/**
			 * Immediate hydration - loads JavaScript immediately on page load.
			 * Use for critical interactive elements like navigation or search.
			 *
			 * @example
			 * ```tsx
			 * import Counter from "../islands/counter.tsx";
			 * <Counter initial={5} lenin:awake />
			 * ```
			 */
			"lenin:awake"?: boolean;

			/**
			 * Lazy hydration - loads JavaScript when component scrolls into viewport.
			 * This is the DEFAULT behavior if no directive is specified.
			 *
			 * Uses IntersectionObserver for efficient viewport detection.
			 * Best for below-the-fold interactive content.
			 *
			 * @example
			 * ```tsx
			 * import Counter from "../islands/counter.tsx";
			 * // Explicit:
			 * <Counter initial={5} comrade:visible />
			 * // Or implicit (same result):
			 * <Counter initial={5} />
			 * ```
			 */
			"comrade:visible"?: boolean;

			/**
			 * Static only - component renders at build time, no JavaScript shipped.
			 * Use for components that appear interactive but don't need client-side behavior.
			 *
			 * Perfect for demo/preview purposes or truly static decorative elements.
			 *
			 * @example
			 * ```tsx
			 * import Counter from "../islands/counter.tsx";
			 * <Counter initial={5} no:pasaran />
			 * ```
			 */
			"no:pasaran"?: boolean;
		}
	}
}

export {};
