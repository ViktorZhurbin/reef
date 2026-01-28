/// <reference path="./jsx.d.ts" />

/**
 * Castro Type Definitions
 */

import type { VNode } from "preact";

export type Asset = {
	tag: string;
	attrs?: Record<string, string | boolean>;
	content?: string;
};

export type AssetsMap = Map<string, Asset[]>;

export type ImportsMap = Record<string, string>;

export type CastroPlugin = {
	name: string;
	watchDirs?: string[];
	getAssets?: () => Asset[];
	getImportMap?: () => ImportsMap | null;
	onBuild?: (ctx: { outputDir: string; contentDir: string }) => Promise<void>;
	transform?: (ctx: {
		content: string;
	}) => Promise<{ html: string; assets: Asset[] }>;
};

export type IslandComponent = {
	name: string;
	sourcePath: string;
	publicJsPath: string;
	publicCssPath?: string;
	ssrCode?: string;
};

export type IslandsMap = Map<string, IslandComponent>;

export type PageMeta = {
	layout?: string | "none" | false;
	title?: string;
	[key: string]: unknown;
};

export type LayoutComponent = (props: {
	title: string;
	content: string;
	[key: string]: unknown;
}) => VNode;

export type LayoutsMap = Map<string, LayoutComponent>;

export type CastroConfig = {
	plugins?: CastroPlugin[];
};
