# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mathematical demonstration app built with Vue 3 + TypeScript + Vite. Implements a Polya demonstration around a set S = {1..N}: it lists all 2-element subsets (vertex pairs), draws them as a complete graph, and enumerates the integer partitions of N together with the distinct block configurations each partition induces on the n! permutations, each drawn as its own directed cycle graph. UI labels, identifiers, and comments are in Portuguese.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — type-check (`vue-tsc`) and build for production in parallel (`npm-run-all2`)
- `npm run test:unit` — run unit tests with Vitest (jsdom environment)
- `npm run type-check` — run `vue-tsc --build` only

`test:unit` starts Vitest in **watch** mode; use `npx vitest run` for a single non-watching pass, e.g. `npx vitest run src/components/__tests__/HelloWorld.spec.ts`.

There is no lint script in this project. The only test file is the scaffold's `HelloWorld.spec.ts` — nothing in the Polya feature or `gerarParticoeskpartes.ts` is covered, and the module has no self-check either, so changes to the partition or cycle-type algorithms are verified by hand.

## Architecture

- **Vue 3 Composition API** with `<script setup lang="ts">` throughout
- **Pinia** for state management (composition-style stores in `src/stores/`)
- **Vue Router** with history mode; routes in `src/router/index.ts`; non-home views are lazy-loaded via dynamic `import()`
- **Path alias**: `@` maps to `src/` (configured in `vite.config.ts`)
- Views in `src/views/`, reusable components in `src/components/`
- Tests live alongside components in `__tests__/` directories using Vitest + `@vue/test-utils`
- Requires Node ^20.19.0 or >=22.12.0

### Polya feature composition

`PoliaDemonstration.vue` (route `/polia-demonstration`) owns the reactive `N` (default 5) and updates it from an *uncontrolled* `<input>` only on "Aplicar" (read through a template ref, so typing doesn't recompute anything). It wraps each of the three presentational children in a `CollapsibleSection`:

- **`SubsetDisplay.vue`** (`:N`) — all 2-element subsets of S = {1..N}, grouped into one collapsible column per first element, plus the LaTeX definition of `D_N^2` and its cardinality.
- **`PolyaGraph.vue`** — the graph over {1..n} via **`v-network-graph`**. Nodes are laid out on a circle (`layouts` computed from angle/`raio`). Props: `n`, optional `arestas` (explicit `[origem, destino]` list; when omitted it falls back to *all* pairs of K_n, the original behaviour), `direcionado` (arrow markers + `edge.gap = 12` so `a→b` and `b→a` don't overlap), `raio`, `altura`. Edge keys embed the orientation (`e{a}-{b}`), so antiparallel edges stay distinct. Import `v-network-graph/lib/style.css` alongside the component.
- **`PartitionDisplay.vue`** (`:N`) — one collapsible row per integer partition of N, showing `alfa^lamb = sum` in LaTeX plus every distinct block configuration for that partition, each rendered both as text (`"(1 3)(2 4)"`) and as a small directed `PolyaGraph` built through `grafoDoCiclo`.

`CollapsibleSection.vue` takes `titulo` (or a `#titulo` slot, used by `PartitionDisplay` to put LaTeX in the header), `dica`, `aberta` (initial state) and `compacta` (discreet header for nested rows). Its slot is mounted with `v-if`, so a closed row renders nothing.

The demo section "Grafo direcionado" in `PoliaDemonstration.vue` feeds `PolyaGraph` a hard-coded 4-edge cycle (`arestasDirigidas`); it is a showcase of the directed mode, not derived from `N`.

`SubsetDisplay` and `PolyaGraph` each derive vertices and pairs with the same nested-loop pattern (`i < j`) — there is no shared pair-generation utility yet.

**Cost warning:** `PartitionDisplay`'s `linhas` computed calls `gerarConfiguracoesUnicas` (and then `grafoDoCiclo` per configuration) for *every* partition eagerly, before anything is expanded. The per-partition counts sum to n!, so the whole computed is O(n!) work and O(n!) strings/edge arrays held in memory; N ≈ 8 and above is where this bites. A closed row doesn't render its `v-network-graph` instances — but its configurations were already built. Making the generation itself lazy (per row, on open) is the obvious optimization and has not been done.

### Cycle → graph — `src/grafoDoCiclo.ts`

Turns a cycle type into the directed graph it represents, which is what `PolyaGraph` consumes.

- `grafoDoCiclo(ciclos)` accepts either the raw form `[[1,3],[2,4]]` (what `permsDoTipo` produces) or the textual form `"(1 3)(2 4)"` (what the screen shows), and returns `{ vertices, arestas, isolados }` with `vertices`/`isolados` sorted ascending and `arestas` in the order the cycles produce them.
- `arestasDoCiclo(ciclo)` — a cycle of length `m >= 2` gives exactly `m` edges (each element points to the next, the last closes back). **Fixed points (length 1) produce no edge and no self-loop** — the vertex is simply isolated.
- `interpretarCiclos(texto)` is the text→`Ciclo[]` bridge (regex over `(...)` groups).

### Partition generation — `src/gerarParticoeskpartes.ts`

Generates integer partitions of `n` in the **multiplicity representation** (Algorithm 7): a `Particao` is `{ alfa, lamb }`, where `alfa` holds the distinct parts in decreasing order and `lamb` their multiplicities (e.g. `alfa = [6,3,2,1]`, `lamb = [2,1,4,1]`).

Generation:
- `gerarParticoesKPartes(n, k)` — the module's only partition generator. Direct-rule approach: skips partitions that would exceed `k` parts instead of filtering afterwards. Terminates when the pivot walks off the left end (`pivo < 0`). Callers that want *all* partitions pass `k = n`; that is the idiom for "no limit on the number of parts".

Formatting / derivation:
- `formatarParticao` → `"X_6^2 X_3^1"` (plain text, also used as a Vue `:key`); `formatarParticaoLatex` → `"X_{6}^{2}\,X_{3}^{1}"`. Both use the notation `X_{comprimento}^{repeticoes}` — subscript = part size, exponent = multiplicity — with braces so multi-digit values stay in place; `formatarSomaLatex` → `"6 + 6 + 3"`; `contarPartes` → sum of `lamb`; `expandirPartes` → flat decreasing list of part sizes.

Block configurations — **generate-unique, never deduplicate**. `gerarConfiguracoesUnicas(n, partes)` returns the distinct `"(1 2)(3 4)"` strings for the cycle type in `partes` (a partition of `n`); it is a thin shell over `permsDoTipo`, with `formatarBlocos` doing the formatting (cycles joined with no separator).

`permsDoTipo(n, tipo)` yields every permutation of {1..n} with the given cycle type, as a list of cycles. It never enumerates n! and filters — two rules make each permutation come out exactly once:
- **(a)** the smallest free element always starts the next cycle and is pinned to its first position, killing rotations (`(1 3 2) === (3 2 1)`);
- **(b)** only the *distinct* remaining cycle lengths are iterated, killing cycle reordering (`(1 2)(3 4) === (3 4)(1 2)`).

Break either and duplicates reappear. `sum(sizes) === livres.length` is invariant, so every branch reaches a leaf — no wasted work. It throws `RangeError` when `tipo` doesn't sum to `n` or holds a non-integer/`< 1` entry. Cycles come out in the order the recursion consumes lengths, *not* sorted by size, so a `[3,1]` type yields both `(1)(2 3 4)`-shaped and `(1 2 3)(4)`-shaped output.

`permutacoesR(arr, r)` is the helper: size-`r` ordered arrangements of distinct elements (Python's `itertools.permutations(arr, r)`), choosing and ordering in one step.

The count per type is `n! / prod(k^j_k * j_k!)`; summed over all partitions of n it is n!.

`permutacoesR`, `permsDoTipo`, and its inner `rec` are `function*` expressions: generators cannot be arrow functions (see Code Conventions).

Unlike the Python original, none of these read stdin or print; they return arrays.

### Rendering math

`MathTex.vue` is the single entry point for math: it wraps **KaTeX** `renderToString` (`throwOnError: false`, `output: 'html'`) behind `<MathTex :expr="..." :display="..." />`. `katex/dist/katex.min.css` is imported globally in `src/main.ts`. Pass LaTeX source through `expr` rather than reaching for KaTeX directly in a component. (`vue-mathjax-next` is still in `package.json` but is not used anywhere.)

### Algorithm reference (not part of the app build)

`src/gerarParticoeskpartes.py` is the standalone Python reference the TypeScript module was ported from: `generate_integer_partitions` (filter approach) and `generate_integer_partitions_k_parts` (direct-rule approach), plus a harness that cross-checks the two and benchmarks them. It is research material — not imported by the Vue app, not covered by the build or tests. Only the direct-rule approach survives in the `.ts` port (the filter variant and the cross-check harness were dropped as dead code), so the two files are deliberately no longer one-to-one.

## Code Conventions

- **Functions** must be defined as arrow functions stored in `const`: `const foo = () => {}`. Never use `function` declarations. The only exception is generators, which the syntax forbids as arrows — write them as `const g = function* () {}`, still bound to a `const`.
- Domain names, props, comments, and UI copy are in Portuguese; follow the surrounding file.
