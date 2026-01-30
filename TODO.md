# Roadmap

## Configuration

### Make paths configurable via reef.config.js

- `contentDir`, `pagesDir`, `layoutsDir`, `outputDir`, etc.
- Currently hardcoded in constants/dir.js

## Opportunities

### Schema validation for meta

meta export in `.tsx` files is untyped. Adding a simple schema validator would prevent "The manifesto is corrupted" errors when a user forgets a title.


## Hashing

Implement the Manifest pattern.

- Configure esbuild to output hashed files (entryNames: `'[dir]/[name]-[hash]'`).
- Have esbuild generate a `metafile.json`.
- Update your `registry.js` to look up the final filename from that manifest before injecting script tags.

## Replace 'read from file' "hack"

Risk: Writing to `node_modules/.castro-temp` to load modules is fragile. It works, but it causes I/O overhead and can get messy with file permissions or parallel builds.

Consider libraries like `jiti` (used by Nuxt) or `tsx` which allow importing TypeScript/ESM directly into Node without writing physical temp files.

Investigate replacing `config.js`'s file writing with a memory-based loader or `jiti` to make the tool feel snappier and less "disk-heavy."

## 👨‍💻 Developer Experience

### CLI

- `npx castro create` CLI command to scaffold new projects

### Better error/warning/log messages


## Consider

### Implement "getStaticPaths" (High Value):

If I want to generate a blog from an API, I currently have to write a script to generate `.md` files. Allowing a page to export `export async function getPaths() { ... }` (like Next.js `getStaticPaths`) would be a massive level-up.

Steal the `getStaticPaths` concept from Next.js/Astro. Allow a single `.tsx` file to generate multiple `.html` pages based on data. This moves Castro from "Toy" to "CMS-capable."

### Improve Error Boundaries:

Fresh has a very nice "Error Overlay" in development. If an island crashes, the whole page doesn't die. You could implement an `ErrorBoundary` in your `wrapper-jsx.js` to catch render failures and show a "Redacted" box instead of crashing the build.

In `wrapper-jsx.js`, wrap the island rendering in a `try/catch`. If it fails, render a fallback UI (e.g., "⚠️ Counter-revolutionary logic detected") rather than crashing the build process.

### Support CSS modules

Maybe it already works, thanks to esbuild.

