# Castro Development Guide

Read @PLAN.md, @README.md for more context.

## Build & Dev Commands
- **Dev Server**: `pnpm dev` (starts website playground)
- **Build Website**: `pnpm build`
- **Lint/Format**: `pnpm format` (uses Biome)
- **Type Check**: `pnpm type-check`
- **Metrics**: `pnpm loc` (count core lines of code)

## Code Style & Patterns
- **Language**: Use ES Modules (import/export) and Node.js 24+.
- **Formatting**: Strictly follow Biome defaults (tabs, double quotes) via `pnpm format`.
- **Documentation**: Use JSDoc for all types and function intent. Use .d.ts files only for reusable types.
- **Errors**: Prefer loud startup failures (native errors) over defensive programming. Use `styleText` from `node:util` for colored terminal logs.
- **Dependencies**: Prioritize built-in Node.js APIs over external packages to keep the footprint small.

## Project Structure & Context
- **Educational**: Code is serious and well-commented; satire is in CLI output, error messages, and docs only.
- **Monorepo**: `castro/` is the core engine; `website/` is the demo playground.
- **Architecture**: Minimalist SSG with "islands" architecture using Web Components as hydration boundaries.
- **Output**: `website/dist/` is ephemeral and cleaned automatically on build.

## This project is comparable to:
- **Fresh** (architecture)
- **Marko** (compiler philosophy)
- **Qwik** (tree analysis, though much heavier)
- early **Astro** (pre-marketplace era)
- **Eleventy** + is-land
