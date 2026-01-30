# Roadmap

## 👨‍💻 Developer Experience

### CLI

- `npx castro create` CLI command to scaffold new projects

### Better error/warning/log messages


## Consider

### Schema validation for meta

meta export in `.tsx` files is untyped. Adding a simple schema validator would prevent "The manifesto is corrupted" errors when a user forgets a title.

### Implement "getStaticPaths" (High Value):

If I want to generate a blog from an API, I currently have to write a script to generate `.md` files. Allowing a page to export `export async function getPaths() { ... }` (like Next.js `getStaticPaths`) would be a massive level-up.

Steal the `getStaticPaths` concept from Next.js/Astro. Allow a single `.tsx` file to generate multiple `.html` pages based on data. This moves Castro from "Toy" to "CMS-capable."

### Improve Error Boundaries:

Fresh has a very nice "Error Overlay" in development. If an island crashes, the whole page doesn't die. You could implement an `ErrorBoundary` in your `wrapper-jsx.js` to catch render failures and show a "Redacted" box instead of crashing the build.

In `wrapper-jsx.js`, wrap the island rendering in a `try/catch`. If it fails, render a fallback UI (e.g., "⚠️ Counter-revolutionary logic detected") rather than crashing the build process.

### Support CSS modules

Maybe it already works, thanks to esbuild.

