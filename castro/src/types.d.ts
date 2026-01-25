/**
 * Castro Type Definitions
 */

import type { VNode } from "preact";

export type Asset = {
	tag: string;
	attrs?: Record<string, string | boolean>;
	content?: string;
};

export type ImportMap = Record<string, string>;

export type CastroPlugin = {
	name: string;
	watchDirs?: string[];
	getAssets?: () => Asset[];
	getImportMap?: () => ImportMap | null;
	onBuild?: (ctx: { outputDir: string; contentDir: string }) => Promise<void>;
	transform?: (ctx: {
		content: string;
	}) => Promise<{ html: string; assets: Asset[] }>;
};

export type IslandComponent = {
	elementName: string;
	outputPath: string;
	cssPath?: string;
	ssrCode: string | null;
};

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

export type CastroConfig = {
	plugins?: CastroPlugin[];
};

export type ComponentsMap = Map<string, IslandComponent>;
