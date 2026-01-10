import render from "preact-render-to-string";

/**
 * @import { LayoutComponent, LayoutProps } from '../types/layout.js';
 */

/**
 * Render a layout component to HTML string
 * @param {LayoutComponent} layoutFn - Layout component function
 * @param {LayoutProps} props - Props to pass to layout
 * @returns {string} Rendered HTML
 */
export function renderLayout(layoutFn, props) {
	const vnode = layoutFn(props);
	const html = render(vnode);

	// Ensure proper DOCTYPE
	if (!html.startsWith("<!DOCTYPE")) {
		return `<!DOCTYPE html>\n${html}`;
	}
	return html;
}
