/**
 * JSX Island Wrapper
 *
 * Detects island components in JSX via imports and wraps them for hydration.
 *
 * How island detection works:
 * 1. Parse the page's source code using esbuild transform
 * 2. Find imports from islands/ directory (default imports only)
 * 3. Build map: importPath → importedName
 *    Example: "../islands/counter.tsx" → "Counter"
 * 4. Walk the rendered VNode tree looking for components
 * 5. When a component matches an imported name, look it up in registry
 * 6. Wrap the island in <castro-island> for client-side hydration
 */

import { h } from "preact";
import { renderToString } from "preact-render-to-string";
import { parseIslandImports } from "./imports.js";
import { islands } from "./registry.js";

/**
 * @import { VNode } from 'preact'
 * @import { IslandResolver } from './registry.js'
 */

const DIRECTIVES = ["lenin:awake", "comrade:visible", "no:pasaran"];
const DEFAULT_DIRECTIVE = "comrade:visible";

/**
 * Transform a page's VNode tree by wrapping island components
 *
 * @param {string} sourcePath - Path to JSX page file
 * @param {VNode} contentVNode - Rendered VNode tree from page
 * @returns {Promise<{vnode: VNode, cssFiles: string[]}>}
 */
export async function wrapIslandsInJSX(sourcePath, contentVNode) {
	const allIslands = islands.getAll();

	if (!allIslands || allIslands.size === 0) {
		return { vnode: contentVNode, cssFiles: [] };
	}

	// Parse imports: Map { importPath => importedName }
	// Example: Map { "../islands/counter.tsx" => "Counter" }
	const importedIslands = await parseIslandImports(sourcePath);

	if (importedIslands.size === 0) {
		return { vnode: contentVNode, cssFiles: [] };
	}

	// Create island resolver using the registry
	const resolver = islands.createResolver(importedIslands);

	// Transform VNode tree, wrapping islands as we go
	const wrappedVNode = transformVNodeTree(contentVNode, resolver);

	// Return transformed tree and collected CSS files
	return {
		vnode: wrappedVNode,
		cssFiles: resolver.getCollectedCSS(),
	};
}

/**
 * Recursively walk VNode tree and wrap island components
 *
 * @param {any} vnode - VNode, array, or primitive
 * @param {IslandResolver} resolver - Island resolver for lookups
 * @returns {any} Transformed vnode
 */
function transformVNodeTree(vnode, resolver) {
	// Base cases
	if (isPrimitive(vnode)) return vnode;
	if (Array.isArray(vnode)) {
		return vnode.map((child) => transformVNodeTree(child, resolver));
	}

	const vnodeType = vnode.type;

	// Handle native elements (div, span, etc.) and Fragments
	if (typeof vnodeType !== "function") {
		return transformChildren(vnode, resolver);
	}

	// Check if this is an island component
	const componentName = vnodeType.name;
	if (componentName && resolver.isIsland(componentName)) {
		return wrapIslandComponent(vnode, componentName, resolver);
	}

	// Regular component (non-island) - just transform children
	return transformChildren(vnode, resolver);
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
 * @param {IslandResolver} resolver
 * @returns {any}
 */
function transformChildren(vnode, resolver) {
	if (!vnode.props?.children) return vnode;

	const transformedChildren = transformVNodeTree(
		vnode.props.children,
		resolver,
	);

	return {
		...vnode,
		props: {
			...vnode.props,
			children: transformedChildren,
		},
	};
}

/**
 * Wrap an island component for hydration
 *
 * @param {any} vnode - The VNode to wrap
 * @param {string} componentName - Component function name
 * @param {IslandResolver} resolver - Island resolver
 * @returns {any} Wrapped VNode
 */
function wrapIslandComponent(vnode, componentName, resolver) {
	const island = resolver.getIsland(componentName);
	if (!island) {
		throw new Error(`Island "${componentName}" not found in resolver`);
	}

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
		import: island.outputPath,
		"data-props": JSON.stringify(cleanProps),
		dangerouslySetInnerHTML: { __html: staticHtml },
	});
}

/**
 * Extract and validate directive from props
 *
 * @param {Record<string, any> | undefined} props
 * @returns {string} Directive name
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
