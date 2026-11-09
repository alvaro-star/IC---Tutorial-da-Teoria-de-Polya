# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mathematical demonstration app built with Vue 3 + TypeScript + Vite. Implements a Polya demonstration around a set S = {1..N}: it lists all 2-element subsets (vertex pairs), draws them as a complete graph, and enumerates the integer partitions of N together with the distinct block configurations each partition induces on the n! permutations, each drawn as its own directed cycle graph. A second view, `/explicacao`, presents the underlying research report as navigable slides. UI labels, identifiers, and comments are in Portuguese.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — type-check (`vue-tsc`) and build for production in parallel (`npm-run-all2`)
- `npm run test:unit` — run unit tests with Vitest (jsdom environment)
- `npm run type-check` — run `vue-tsc --build` only
- `npm run lint` / `npm run lint:fix` — ESLint 9 flat config (`eslint.config.ts`: `eslint-plugin-vue` + `@vue/eslint-config-typescript`)
- `npm run format` / `npm run format:check` — Prettier over `src/` (`.prettierrc.json`: no semicolons, single quotes, width 100, trailing commas)
- `npm run check` — format check + lint + type-check in sequence; run this before declaring a change done

`test:unit` starts Vitest in **watch** mode; use `npx vitest run` for a single non-watching pass, e.g. `npx vitest run src/components/__tests__/HelloWorld.spec.ts`.

### Code entry gates

- **ESLint does quality, Prettier does formatting** (`skip-formatting` turns off ESLint's style rules), so a formatting diff is never a lint error.
- The arrow-function convention (see Code Conventions) is **enforced by lint**: `func-style: expression` bans `function foo() {}`, and a `no-restricted-syntax` rule bans `const foo = function () {}` while still allowing `function*` generators.
- `vue/attribute-hyphenation` ignores `N` on purpose (`:N` is a real prop name; `:n` would bind a different prop). `MathTex.vue` has the one allowed `v-html` (KaTeX output).
- **husky** hooks (installed by the `prepare` script on `npm install`): `pre-commit` runs `lint-staged` (Prettier + `eslint --fix` on staged files, config in `package.json`); `commit-msg` runs **commitlint** with Conventional Commits (`feat: …`, `fix: …`, `docs: …`, `chore: …`; subject case and body line length are not checked, so Portuguese bodies are fine).
- `@vitest/eslint-plugin` is not installed: its current version requires TypeScript 6 and the project pins `~5.9`.

The only test file is the scaffold's `HelloWorld.spec.ts` — nothing in the Polya feature or `gerarParticoeskpartes.ts` is covered, and the module has no self-check either, so changes to the partition or cycle-type algorithms are verified by hand.

## Architecture

- **Vue 3 Composition API** with `<script setup lang="ts">` throughout
- **Pinia** for state management (composition-style stores in `src/stores/`)
- **Vue Router** with history mode; routes in `src/router/index.ts`; non-home views are lazy-loaded via dynamic `import()`
- **Path alias**: `@` maps to `src/` (configured in `vite.config.ts`)
- Views in `src/views/`, reusable components in `src/components/`
- Tests live alongside components in `__tests__/` directories using Vitest + `@vue/test-utils`
- Requires Node ^20.19.0 or >=22.12.0

### Polya feature composition

`PoliaDemonstration.vue` (route `/polia-demonstration`) owns the reactive `N` (default 5) and updates it from an _uncontrolled_ `<input>` only when the form is submitted ("Aplicar" or Enter; the value is read through a template ref, so typing doesn't recompute anything — `:value="N"` only seeds it). It wraps each of the three presentational children in a `CollapsibleSection`:

- **`SubsetDisplay.vue`** (`:N`) — all 2-element subsets of S = {1..N}, grouped into one collapsible column per first element, plus the LaTeX definition of `D_N^2` and its cardinality.
- **`PolyaGraph.vue`** — the graph over {1..n} via **`v-network-graph`**. Nodes are laid out on a circle (`layouts` computed from angle/`raio`). Props: `n`, optional `arestas` (explicit `[origem, destino]` list; when omitted it falls back to _all_ pairs of K_n, the original behaviour), `direcionado` (arrow markers + `edge.gap = 12` so `a→b` and `b→a` don't overlap), `raio`, `altura`. Edge keys embed the orientation (`e{a}-{b}`), so antiparallel edges stay distinct. Import `v-network-graph/lib/style.css` alongside the component.
- **`PartitionDisplay.vue`** (`:N`) — one collapsible row per integer partition of N, showing `alfa^lamb = sum` in LaTeX plus every distinct block configuration for that partition, each rendered both as text (`"(1 3)(2 4)"`) and as a small directed `PolyaGraph` built through `grafoDoCiclo`.

`CollapsibleSection.vue` takes `titulo` (or a `#titulo` slot, used by `PartitionDisplay` to put LaTeX in the header), `dica`, `aberta` (initial state) and `compacta` (discreet header for nested rows). Its slot is mounted with `v-if`, so a closed row renders nothing.

The demo section "Grafo direcionado" in `PoliaDemonstration.vue` feeds `PolyaGraph` a hard-coded 4-edge cycle (`arestasDirigidas`); it is a showcase of the directed mode, not derived from `N`.

`SubsetDisplay` and `PolyaGraph` each derive vertices and pairs with the same nested-loop pattern (`i < j`) — there is no shared pair-generation utility yet.

**Cost warning:** `PartitionDisplay`'s `linhas` computed calls `gerarConfiguracoesUnicas` (and then `grafoDoCiclo` per configuration) for _every_ partition eagerly, before anything is expanded. The per-partition counts sum to n!, so the whole computed is O(n!) work and O(n!) strings/edge arrays held in memory; N ≈ 8 and above is where this bites. A closed row doesn't render its `v-network-graph` instances — but its configurations were already built. Making the generation itself lazy (per row, on open) is the obvious optimization and has not been done.

### Explanation slides — `ExplicacaoView.vue` (route `/explicacao`)

A slide presentation of the IC final report (PIVIC-FC, UFGD), built from two pieces:

- **`SlideDeck.vue`** is only the frame: progress bar, current slide's `secao`/`titulo` header, prev/next buttons, a `<select>` table of contents and keyboard navigation (arrows, PageUp/PageDown, Home/End — ignored while focus is in an `input`/`select`/`textarea`). Props: `slides: { secao, titulo }[]`; the visible index is a required `v-model` (0-based). The slide body comes through the default slot.
- **`ExplicacaoView.vue`** owns the `slides` array (each with an `id`) and renders the body as one big `v-if`/`v-else-if` chain on `id` inside the slot. To add a slide: add an entry to `slides` _and_ a matching `<section v-else-if="id === '...'">`. The current slide lives in the URL as `?slide=N` (**1-based**), via a computed getter/setter over `route.query` with `router.replace` — so reload/share keeps the position.

**`src/exemplosN5.ts`** holds the hand-worked m = 5 case (report §4.3): one `ExemploCalculo` per partition of 5 with its representative `sigma`, the Proposition 1/2 steps (LaTeX strings), and the induced type `resultado`. It is the _single source_ for the m = 5 table slide, the per-example slides (generated from it as `exemplo-${particao}` ids), and the assembled `Z(G)` — edit the data there, not in the template. Invariants to preserve: `quantidade` sums to 5! = 120, and the derived graph counts are `1,1,2,4,6,6,6,4,2,1,1` (34 graphs; that array is hard-coded in the view as `grafosPorArestas`).

Some slides call the real app code live (the `m!` vs `p(m)` growth table via `gerarParticoesKPartes`, the `[2,2]` example via `gerarConfiguracoesUnicas` + `grafoDoCiclo`), so changes to those modules show up in the slides too.

### Cycle → graph — `src/grafoDoCiclo.ts`

Turns a cycle type into the directed graph it represents, which is what `PolyaGraph` consumes.

- `grafoDoCiclo(ciclos)` accepts either the raw form `[[1,3],[2,4]]` (what `permsDoTipo` produces) or the textual form `"(1 3)(2 4)"` (what the screen shows), and returns `{ vertices, arestas, isolados }` with `vertices`/`isolados` sorted ascending and `arestas` in the order the cycles produce them.
- `arestasDoCiclo(ciclo)` — a cycle of length `m >= 2` gives exactly `m` edges (each element points to the next, the last closes back). **Fixed points (length 1) produce no edge and no self-loop** — the vertex is simply isolated.
- `interpretarCiclos(texto)` is the text→`Ciclo[]` bridge (regex over `(...)` groups).

### Partition generation — `src/gerarParticoeskpartes.ts`

Generates integer partitions of `n` in the **multiplicity representation** (Algorithm 7): a `Particao` is `{ alfa, lamb }`, where `alfa` holds the distinct parts in decreasing order and `lamb` their multiplicities (e.g. `alfa = [6,3,2,1]`, `lamb = [2,1,4,1]`).

Generation:

- `gerarParticoesKPartes(n, k)` — the module's only partition generator. Direct-rule approach: skips partitions that would exceed `k` parts instead of filtering afterwards. Terminates when the pivot walks off the left end (`pivo < 0`). Callers that want _all_ partitions pass `k = n`; that is the idiom for "no limit on the number of parts".

Formatting / derivation:

- `formatarParticao` → `"X_6^2 X_3^1"` (plain text, also used as a Vue `:key`); `formatarParticaoLatex` → `"X_{6}^{2}\,X_{3}^{1}"`. Both use the notation `X_{comprimento}^{repeticoes}` — subscript = part size, exponent = multiplicity — with braces so multi-digit values stay in place; `formatarSomaLatex` → `"6 + 6 + 3"`; `contarPartes` → sum of `lamb`; `expandirPartes` → flat decreasing list of part sizes.

Block configurations — **generate-unique, never deduplicate**. `gerarConfiguracoesUnicas(n, partes)` returns the distinct `"(1 2)(3 4)"` strings for the cycle type in `partes` (a partition of `n`); it is a thin shell over `permsDoTipo`, with `formatarBlocos` doing the formatting (cycles joined with no separator).

`permsDoTipo(n, tipo)` yields every permutation of {1..n} with the given cycle type, as a list of cycles. It never enumerates n! and filters — two rules make each permutation come out exactly once:

- **(a)** the smallest free element always starts the next cycle and is pinned to its first position, killing rotations (`(1 3 2) === (3 2 1)`);
- **(b)** only the _distinct_ remaining cycle lengths are iterated, killing cycle reordering (`(1 2)(3 4) === (3 4)(1 2)`).

Break either and duplicates reappear. `sum(sizes) === livres.length` is invariant, so every branch reaches a leaf — no wasted work. It throws `RangeError` when `tipo` doesn't sum to `n` or holds a non-integer/`< 1` entry. Cycles come out in the order the recursion consumes lengths, _not_ sorted by size, so a `[3,1]` type yields both `(1)(2 3 4)`-shaped and `(1 2 3)(4)`-shaped output.

`permutacoesR(arr, r)` is the helper: size-`r` ordered arrangements of distinct elements (Python's `itertools.permutations(arr, r)`), choosing and ordering in one step.

The count per type is `n! / prod(k^j_k * j_k!)`; summed over all partitions of n it is n!.

`permutacoesR`, `permsDoTipo`, and its inner `rec` are `function*` expressions: generators cannot be arrow functions (see Code Conventions).

The module was ported from a Python reference (`gerarParticoeskpartes.py`, removed from the tree; still in git history at commit `9356a2e`). Unlike that original, none of these read stdin or print; they return arrays.

### Visual design

Minimalist "textbook" look. **All colours, fonts, radii and widths are tokens in `src/assets/base.css`** (`--bg`, `--surface`, `--surface-sunken`, `--ink`, `--ink-soft`, `--muted`, `--line`, `--line-strong`, `--accent`, `--accent-soft`, …), redefined under `prefers-color-scheme: dark`; components must not hard-code colours. The old scaffold names (`--color-border`, …) survive as aliases. Shared primitives live in `src/assets/main.css`: `.pagina` (centred page container — every view's `<main>` uses it), `.pagina-estreita`, `.cabecalho-pagina`, `.sobretitulo`, `.lead`, `.botao` / `.botao-primario`, form fields. Headings use Source Serif 4, body Inter (both self-hosted via `@fontsource-variable/*`, imported in `main.ts`).

Exception: `PolyaGraph` passes literal hex colours (`COR_VERTICE`, `COR_ARESTA`) to `v-network-graph`, because its SVG config can't read CSS variables; they were picked to work in both themes, with labels drawn inside the vertex in white. Pan/zoom are disabled so the mouse wheel scrolls the page.

The tutorial path is Início (`/`) → 1 Teoria (`/explicacao`) → 2 Prática (`/polia-demonstration`), plus Sobre (`/about`, project credits). The steps in `App.vue`'s nav and `HomeView`'s cards are plain arrays in those files. `CollapsibleSection` takes an optional `numero` for the step badge.

### Rendering math

`MathTex.vue` is the single entry point for math: it wraps **KaTeX** `renderToString` (`throwOnError: false`, `output: 'html'`) behind `<MathTex :expr="..." :display="..." />`. `katex/dist/katex.min.css` is imported globally in `src/main.ts`. Pass LaTeX source through `expr` rather than reaching for KaTeX directly in a component. (`vue-mathjax-next` is still in `package.json` but is not used anywhere.)

## Code Conventions

- **Functions** must be defined as arrow functions stored in `const`: `const foo = () => {}`. Never use `function` declarations. The only exception is generators, which the syntax forbids as arrows — write them as `const g = function* () {}`, still bound to a `const`.
- Domain names, props, comments, and UI copy are in Portuguese; follow the surrounding file.
