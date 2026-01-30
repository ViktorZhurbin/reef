# Roadmap

### Implement "getStaticPaths":

If I want to generate a blog from an API, I currently have to write a script to generate `.md` files. Allowing a page to export `export async function getPaths() { ... }` (like Next.js `getStaticPaths`) would be a massive level-up.

Steal the `getStaticPaths` concept from Next.js/Astro. Allow a single `.tsx` file to generate multiple `.html` pages based on data. This moves Castro from "Toy" to "CMS-capable."

May involve some routing changes.


### Support CSS modules

Maybe it already works, thanks to esbuild.

### npx castro create

- `npx castro create` CLI command to scaffold new projects

### Better error/warning/log messages
