# Roadmap


## Configuration

- Make paths configurable via reef.config.js
  - `contentDir`, `pagesDir`, `layoutsDir`, `outputDir`
  - Currently hardcoded in constants/dir.js

## Hashing 

Implement the Manifest pattern.

- Configure esbuild to output hashed files (entryNames: '[dir]/[name]-[hash]').
- Have esbuild generate a metafile.json.
- Update your registry.js to look up the final filename from that manifest before injecting script tags.

## 👨‍💻 Developer Experience

### CLI

- npx castro create CLI command to scaffold new projects

### Better error/warning/log messages


