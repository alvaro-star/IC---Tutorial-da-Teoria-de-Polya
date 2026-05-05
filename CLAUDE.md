# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mathematical demonstration app built with Vue 3 + TypeScript + Vite. Currently implements a Polya demonstration that generates all 2-element subsets (vertex pairs) from a set P = {1..N}. UI labels and comments are in Portuguese.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — type-check (via `vue-tsc`) then build for production
- `npm run test:unit` — run unit tests with Vitest (jsdom environment)
- `npm run type-check` — run `vue-tsc --build` only

Run a single test file: `npx vitest run src/components/__tests__/HelloWorld.spec.ts`

## Architecture

- **Vue 3 Composition API** with `<script setup lang="ts">` throughout
- **Pinia** for state management (composition-style stores in `src/stores/`)
- **Vue Router** with history mode; routes defined in `src/router/index.ts`; non-home views are lazy-loaded via dynamic `import()`
- **Path alias**: `@` maps to `src/` (configured in `vite.config.ts`)
- Views are in `src/views/`, reusable components in `src/components/`
- Tests live alongside components in `__tests__/` directories using Vitest + `@vue/test-utils`
- Requires Node ^20.19.0 or >=22.12.0

## Code Conventions

- **Functions** must be defined as arrow functions stored in `const`: `const foo = () => {}`. Never use `function` declarations.

## Key Route

`/polia-demonstration` — renders `PoliaDemonstration.vue`, the main feature view that builds combinatorial pair subsets from vertices 1..N.
