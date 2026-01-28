/**
 * JSX Island Wrapper
 *
 * Wraps island components for client-side hydration.
 *
 * How island detection works:
 * 1. Islands are explicitly marked with defineIsland() in their source
 * 2. Component names are extracted and stored in the registry at build time
 * 3. Walk the rendered VNode tree looking for components
 * 4. Match component function names against registered island names
 * 5. Wrap matched islands in <castro-island> for client-side hydration
 *
 * No import parsing, no regex - just direct name comparison.
 */

import { h } from "preact";
import { renderToString } from "preact-render-to-string";
import { islands } from "./registry.js";

/**
 * @import { VNode } from 'preact'
 *
 * @typedef {"lenin:awake" | "comrade:visible" | "no:pasaran"} Directive
 */

/** @type {Directive[]} */
const DIRECTIVES = ["lenin:awake", "comrade:visible", "no:pasaran"];
/** @type {Directive} */
const DEFAULT_DIRECTIVE = "comrade:visible";

/**
 * Transform a page's VNode tree by wrapping island components
 *
 * Tracks CSS from islands used on this page and returns it.
 *
 * @param {VNode} contentVNode - Rendered VNode tree from page
 * @returns {VNode}
 */
export function wrapIslandsInJSX(contentVNode) {
	const allIslands = islands.getAll();

	if (!allIslands || allIslands.size === 0) {
		return contentVNode;
	}

	// Transform VNode tree, wrapping islands as we go
	/** @type {VNode} */
	const wrappedVNode = transformVNodeTree(contentVNode);

	// Return transformed tree and collected CSS
	return wrappedVNode;
}

/**
 * Wrap an island component for hydration
 *
 * @param {any} vnode - The VNode to wrap
 * @param {string} componentName - Component function name
 * @returns {VNode} Wrapped VNode
 */
function wrapIslandComponent(vnode, componentName) {
	const island = islands.getIsland(componentName);

	if (!island) {
		throw new Error(`Island "${componentName}" not found in registry`);
	}

	// Track assets for this island
	islands.trackIsland(componentName);

	const directive = extractDirective(vnode.props);
	const cleanProps = stripDirectives(vnode.props);

	// Render component to static HTML
	const staticHtml = renderToString(h(vnode.type, cleanProps));

	// Handle no:pasaran - static only, no hydration wrapper
	if (directive === "no:pasaran") {
		return h("div", { dangerouslySetInnerHTML: { __html: staticHtml } });
	}

	// Wrap in <castro-island> for client-side hydration
	return h("castro-island", {
		directive,
		import: island.publicJsPath,
		"data-props": JSON.stringify(cleanProps),
		dangerouslySetInnerHTML: { __html: staticHtml },
	});
}

/**
 * Recursively walk VNode tree and wrap island components
 *
 * @param {any} vnode - VNode, array, or primitive
 * @returns {any} Transformed vnode
 */
function transformVNodeTree(vnode) {
	// Base cases
	if (isPrimitive(vnode)) return vnode;
	if (Array.isArray(vnode)) {
		return vnode.map((child) => transformVNodeTree(child));
	}

	const vnodeType = vnode.type;

	// Handle native elements (div, span, etc.) and Fragments
	if (typeof vnodeType !== "function") {
		return transformChildren(vnode);
	}

	// Check if this is an island component
	const componentName = vnodeType.name;
	if (componentName && islands.isIsland(componentName)) {
		return wrapIslandComponent(vnode, componentName);
	}

	// Regular component (non-island) - just transform children
	return transformChildren(vnode);
}

/**
 * Check if value is a primitive (not an object or array)
 * @param {any} value
 * @returns {boolean}
 */
function isPrimitive(value) {
	return !value || typeof value !== "object";
}

/**
 * Transform a VNode's children
 * @param {any} vnode
 * @returns {VNode}
 */
function transformChildren(vnode) {
	if (!vnode.props?.children) return vnode;

	const transformedChildren = transformVNodeTree(vnode.props.children);

	return {
		...vnode,
		props: {
			...vnode.props,
			children: transformedChildren,
		},
	};
}

/**
 * Extract and validate directive from props
 *
 * @param {Record<string, any> | undefined} props
 * @returns {Directive}
 */
function extractDirective(props) {
	if (!props) return DEFAULT_DIRECTIVE;

	const foundDirectives = DIRECTIVES.filter((d) => props[d] !== undefined);

	if (foundDirectives.length > 1) {
		throw new Error(
			`Multiple directives on same component: ${foundDirectives.join(", ")}. Use only one.`,
		);
	}

	return foundDirectives[0] || DEFAULT_DIRECTIVE;
}

/**
 * Remove directive props before passing to component
 *
 * Directives are metadata for Castro, not component props.
 *
 * @param {Record<string, any> | undefined} props
 * @returns {Record<string, any>}
 */
function stripDirectives(props) {
	if (!props) return {};

	const clean = { ...props };
	for (const directive of DIRECTIVES) {
		delete clean[directive];
	}
	return clean;
}
