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

`src/combinatoria/__tests__/combinatoria.spec.ts` covers the math: p(n) counts, `contarPermutacoesDoTipo` against the actual number of generated configurations (n ≤ 7) and against n! (n ≤ 10), uniqueness of generated configurations, `grafoDoCiclo` and `paresDe`. Run it after touching anything in `src/combinatoria/`. `src/components/__tests__/componentes.spec.ts` mounts the newer components (alert gating, LaTeX rendering checked by asserting no `katex-error` in the HTML, section 5 rows). A LaTeX string that KaTeX cannot parse renders silently as `katex-error` (`throwOnError: false`), so that assertion is the cheap way to catch a lost backslash.

## Architecture

- **Vue 3 Composition API** with `<script setup lang="ts">` throughout
- **Pinia** for state management (composition-style stores in `src/stores/`)
- **Vue Router** with history mode; routes in `src/router/index.ts`; non-home views are lazy-loaded via dynamic `import()`
- **Path alias**: `@` maps to `src/` (configured in `vite.config.ts`)
- **One folder per page** in `src/views/`, each with an `Index.vue`, its own `components/` and its own `__tests__/`: `Inicio/` (`/`), `Teoria/` (`/explicacao`), `Pratica/` (`/polia-demonstration`), `Sobre/` (`/about`). The URLs kept their old names so existing links still work. A component used by a single page lives inside that page; only what several pages share stays in `src/components/` (`MathTex`, `PolyaGraph`, `CollapsibleSection`, `AlertaAviso`). Inside a page, imports are relative (`./components/X.vue`); shared ones use `@/components/`. `HelloWorld`, `TheWelcome`, `WelcomeItem` and `components/icons/` are unused scaffold leftovers.
- Tests live alongside components in `__tests__/` directories using Vitest + `@vue/test-utils`
- Requires Node ^20.19.0 or >=22.12.0

### Math vs. UI — `src/combinatoria/`

All computation lives in `src/combinatoria/` and is pure TypeScript with no Vue imports. Components only call into it, and new calculation code belongs there, not inside a `.vue` file:

- `gerarParticoesKPartes.ts`: the partition generator, its private helper `registrarParticao`, and the `Particao` type. Nothing else; it imports nothing.
- `contarPermutacoesDoTipo.ts`: `contarPermutacoesDoTipo(particao): bigint`, the formula n! / ∏ j^k_j · k_j!. Depends only on `fatorial` and the `Particao` type.
- `mathForms.ts`: everything about cycle types built on top of a partition: `contarPartes`, `expandirPartes`, `permutacoesR`, `permsDoTipo`, `gerarConfiguracoesUnicas`. It takes the `Particao` type from `gerarParticoesKPartes.ts`. The function is **not** called `mathForms`: only the file has that name.
- `formatadores.ts`: functions that _only_ turn already-computed values into text or LaTeX (`formatarParticao`, `formatarParticaoLatex`, `formatarSomaLatex`, `formatarBlocos`). It imports nothing but the `Particao` _type_, so `mathForms.ts` can import `formatarBlocos` from it without a runtime import cycle. Keep it that way: `formatarSomaLatex` reads `alfa`/`lamb` directly instead of calling `expandirPartes` for that reason.
- `grafoDoCiclo.ts`: cycle → directed graph.
- `pares.ts`: vertices and pairs of K_n (`verticesDe`, `paresDe`, `paresPorMenorElemento`).
- `contarParticoes.ts`: `contarParticoes(n): bigint`, p(n) without generating anything.
- `acaoInduzida.ts`: the induced action σ*({i,j}) = {σ(i), σ(j)} on the edges. `lerPermutacao(texto, n)` parses and validates σ in cycle notation (missing elements are fixed points) and returns `{ ok, sigma }` or `{ ok: false, erro }`. A `Permutacao` is a function array: `sigma[i]` = σ(i), index 0 unused. Also has `imagensDasArestas` (one table row per edge), `ciclosDaAcaoInduzida`, `classesDeArestas` (edges split into within-a-cycle and between-two-cycles classes, each closed under σ*), `contribuicaoPrevista` (Proposition 1 / Observation 1 / Proposition 2 for one class) and `tipoInduzidoDoTipo(partes)` (T(σ*) from the cycle lengths alone, without building any edge) and `grafoDaAcaoInduzida(sigma, n)` (the graph of σ*, for `PolyaGraph`). The tests check the formulas against the edge-by-edge computation for every cycle type up to n = 8–9.
- `inventario.ts`: Z(G) → p(c). `inventarioDeGrafos(n)` builds one term per partition (N(λ), T(σ\*), and N(λ)·∏(1 + c^ℓ)^k expanded), the sum, n! and `resultado` = p(c), whose coefficient of c^k is the number of non-isomorphic simple graphs with n vertices and k edges. `substituirNoTipo` does the Pólya substitution X_i ↦ 1 + c^i. Tested against OEIS A000088 for n = 1..10 and for symmetry.
- `comum/polinomios.ts`: `Polinomio = bigint[]` (`p[k]` = coefficient of c^k, no trailing zeros) with `somar`, `multiplicar`, `potencia`, `escalar`, `dividirExato` (throws if a division is not exact) and `somaDosCoeficientes`.
- `comum/matematica.ts`: general math helpers with no partition or graph meaning: `fatorial(m): bigint` (exact), `mdc`, `mmc`, `decomporEmCiclos(elementos, aplicar, chave)` (cycle decomposition of a permutation of _any_ finite set, used for both σ and σ*) and `tipoCiclico(ciclos)` (`[comprimento, quantidade]` pairs, ascending).

`formatarTipoCiclicoLatex` writes a cycle type in the exact notation of `exemplosN5.ts` (`X_1X_3^{3}`). `__tests__/acaoInduzida.spec.ts` relies on that: it recomputes T(σ*) for the seven hand-worked m = 5 cases and compares strings.

`src/views/Teoria/exemplosN5.ts` is static data for the slides, not computation, so it lives with the Teoria page. `SlidesResultados.vue` and the test file each keep their own small `number` factorial (the test's copy is deliberately independent, as an oracle).

### Polya feature composition

`views/Pratica/Index.vue` (route `/polia-demonstration`) owns the reactive `N` (default 5) and updates it from an _uncontrolled_ `<input>` only when the form is submitted ("Aplicar" or Enter; the value is read through a template ref, so typing doesn't recompute anything — `:value="N"` only seeds it). It wraps each of the three presentational children in a `CollapsibleSection`:

- **`SubsetDisplay.vue`** (`:N`) — the LaTeX definition of `D_N^2` and its cardinality, then the whole set written out as one LaTeX `array`, one row per smaller element: row _i_ holds the pairs {i, j} with j > i (from `paresPorMenorElemento`), so every edge appears once. It is a staircase: the column is the second element j, so row i leaves columns j ≤ i empty and {1,j}, {2,j}, … line up vertically. Large N scrolls horizontally inside its box.
- **`PolyaGraph.vue`** — the graph over {1..n} via **`v-network-graph`**. Nodes are laid out on a circle (`layouts` computed from angle/`raio`). Props: `n`, optional `arestas` (explicit `[origem, destino]` list; when omitted it falls back to _all_ pairs of K_n, the original behaviour), `direcionado` (arrow markers + `edge.gap = 12` so `a→b` and `b→a` don't overlap), `raio`, `altura`, `rotulos` (custom vertex labels, `rotulos[v-1]`; labels longer than 2 characters get bigger vertices and a smaller font), `cor` (`azul` for σ, the default, or `laranja` for σ\*). Edge keys embed the orientation (`e{a}-{b}`), so antiparallel edges stay distinct. Import `v-network-graph/lib/style.css` alongside the component.
- **`PartitionDisplay.vue`** (`:N`) — one collapsible row per integer partition of N, showing `alfa^lamb = sum` in LaTeX plus every distinct block configuration for that partition, each rendered both as text (`"(1 3)(2 4)"`) and as a small directed `PolyaGraph` built through `grafoDoCiclo`.

- **`AcaoInduzida.vue`** (`:N`, section 4) — σ chosen by typing cycles (applied on submit) or from a select with one representative per cycle type (`representanteDoTipo` in `mathForms.ts`, the first output of `permsDoTipo`). It then shows σ in two-row notation, a table applying σ to every edge (fixed edges highlighted), σ* as cycles of edges, and T(σ*). The default σ is (1 2)(3 … N); a change of N resets it.

- **`InducedPartitionDisplay.vue`** (`:N`, section 5) — a copy of `PartitionDisplay` for the _induced_ cycle type: each row's header adds `↦ T(σ*)` (from `tipoInduzidoDoTipo`, lengths only, cheap), and opening a row mounts **`ExplicacaoTipoInduzido.vue`** (how σ* is defined and how T(σ*) is computed from T(σ) by Theorem 1, grouped by Observations 2 and 3) above the configuration list. Each configuration card shows **two graphs side by side**: σ on the vertices (blue) and σ\* on the edges (orange, from `grafoDaAcaoInduzida`): one vertex per edge of K_n labelled `i,j`, one arrow {i,j} → {σ(i),σ(j)}, fixed edges isolated with no self-loop. The two components are deliberate duplicates, so a change to the configuration list must be made in both. Here the >600 alert covers _only_ the graph list (handled inside the component), not the whole row, so the explanation is always visible.

- **`InventarioPolya.vue`** (`:N`, section 6) — Z(G) → p(c) step by step, for the chosen N: the table of N(λ) and T(σ\*), Z(G), the substitution X_i ↦ 1 + c^i (with the two-colour intuition), each term expanded, the sum, the division by N!, and p(c) with one bar per number of edges and the total p(1). Long sums are laid out with `formatarSomaEmLinhasLatex` (an `aligned` block, a fixed number of terms per line).

**Large lists:** `LIMITE_DE_REGISTROS` (600) lives in `src/limites.ts`. `CollapsibleSection` takes an optional `registros` (number or bigint). Above the limit, opening it shows an **`AlertaAviso.vue`** with "Mostrar mesmo assim" _instead of_ mounting the slot, so nothing is computed until the user confirms; a new `registros` value asks again. The row counts come from formulas, never from generating the lists: `contarPermutacoesDoTipo` for partition rows, and `contarParticoes(n)` (`src/combinatoria/contarParticoes.ts`, an O(n²) bigint DP) for p(N). Section 4's example `<select>` is gated the same way, inside `AcaoInduzida`. `AlertaAviso` takes `titulo`, `tipo` (`aviso` | `info`) and an `acoes` slot; its colours are the `--aviso*` tokens.

`CollapsibleSection.vue` is the app's single dropdown component (every expandable row and section uses it). It takes `titulo` (or a `#titulo` slot, used by `PartitionDisplay` to put LaTeX in the header), `dica`, `aberta` (initial state) and `compacta` (discreet header for nested rows). Its slot is mounted with `v-if`, so a closed row renders nothing.

The demo section "Grafo direcionado" in `views/Pratica/Index.vue` feeds `PolyaGraph` a hard-coded 4-edge cycle (`arestasDirigidas`); it is a showcase of the directed mode, not derived from `N`.

`SubsetDisplay` and `PolyaGraph` both get vertices and pairs from `combinatoria/pares.ts` (`verticesDe`, `paresDe`).

**Lazy generation in `PartitionDisplay`:** the `linhas` computed is cheap — only the p(n) partitions, with each header count from `contarPermutacoesDoTipo` (the formula, no permutations generated). The configurations (`gerarConfiguracoesUnicas` + `grafoDoCiclo`) are built by `configuracoesDe(linha)`, which is called from _inside_ the `CollapsibleSection` slot. Slots are lazy render functions and that slot sits under `v-if`, so the call only happens when a row is opened. Results go into a plain, **non-reactive** `Map` cache keyed by `linha.chave`; it must stay non-reactive because it is written during render. `watch(n)` clears it. Opening a large row is still O(its count): the n-cycle row has (n−1)! graphs.

### Theory slides — `views/Teoria/` (route `/explicacao`)

A slide presentation of the IC final report (PIVIC-FC, UFGD), built from two pieces:

- **`SlideDeck.vue`** is only the frame: progress bar, current slide's `secao`/`titulo` header, prev/next buttons, a `<select>` table of contents and keyboard navigation (arrows, PageUp/PageDown, Home/End — ignored while focus is in an `input`/`select`/`textarea`). Props: `slides: { secao, titulo }[]`; the visible index is a required `v-model` (0-based). The slide body comes through the default slot.
- **`Teoria/Index.vue`** owns the `slides` array (each entry has an `id` and a `grupo`) and the current index. The slide bodies live in four components in `Teoria/components/`, one per block of the report: `SlidesAbertura`, `SlidesFundamentacao`, `SlidesResultados`, `SlidesImplementacao`. `Index.vue` picks the component by `grupo` and passes `id`; each component is a `v-if`/`v-else-if` chain on `id`. To add a slide: add an entry (with `grupo`) to `slides` _and_ a matching `<section v-else-if="id === '...'">` in that group's component. The styles for every slide are in `Teoria/slides.css`, **not scoped** (the content is spread over several components), so each rule there must stay under `.teoria`, the page's `<main>` class. The current slide lives in the URL as `?slide=N` (**1-based**), via a computed getter/setter over `route.query` with `router.replace`, so reload/share keeps the position. `Teoria/__tests__/teoria.spec.ts` walks all 28 slides and fails if one renders no `<section>` or has a `katex-error`.

**`views/Teoria/exemplosN5.ts`** holds the hand-worked m = 5 case (report §4.3): one `ExemploCalculo` per partition of 5 with its representative `sigma`, the Proposition 1/2 steps (LaTeX strings), and the induced type `resultado`. It is the _single source_ for the m = 5 table slide, the per-example slides (generated from it as `exemplo-${particao}` ids), and the assembled `Z(G)` — edit the data there, not in the template. Invariants to preserve: `quantidade` sums to 5! = 120, and the derived graph counts are `1,1,2,4,6,6,6,4,2,1,1` (34 graphs; that array is hard-coded in the view as `grafosPorArestas`).

Some slides call the real app code live (the `m!` vs `p(m)` growth table via `gerarParticoesKPartes`, the `[2,2]` example via `gerarConfiguracoesUnicas` + `grafoDoCiclo`), so changes to those modules show up in the slides too.

### Cycle → graph — `src/combinatoria/grafoDoCiclo.ts`

Turns a cycle type into the directed graph it represents, which is what `PolyaGraph` consumes.

- `grafoDoCiclo(ciclos)` accepts either the raw form `[[1,3],[2,4]]` (what `permsDoTipo` produces) or the textual form `"(1 3)(2 4)"` (what the screen shows), and returns `{ vertices, arestas, isolados }` with `vertices`/`isolados` sorted ascending and `arestas` in the order the cycles produce them.
- `arestasDoCiclo(ciclo)` — a cycle of length `m >= 2` gives exactly `m` edges (each element points to the next, the last closes back). **Fixed points (length 1) produce no edge and no self-loop** — the vertex is simply isolated.
- `interpretarCiclos(texto)` is the text→`Ciclo[]` bridge (regex over `(...)` groups).

### Partitions and cycle types — `src/combinatoria/gerarParticoesKPartes.ts` + `mathForms.ts`

Generates integer partitions of `n` in the **multiplicity representation** (Algorithm 7): a `Particao` is `{ alfa, lamb }`, where `alfa` holds the distinct parts in decreasing order and `lamb` their multiplicities (e.g. `alfa = [6,3,2,1]`, `lamb = [2,1,4,1]`).

Generation:

- `gerarParticoesKPartes(n, k)` (in `gerarParticoesKPartes.ts`) — the project's only partition generator. Direct-rule approach: skips partitions that would exceed `k` parts instead of filtering afterwards. Terminates when the pivot walks off the left end (`pivo < 0`). Callers that want _all_ partitions pass `k = n`; that is the idiom for "no limit on the number of parts".

Formatting (in `formatadores.ts`) / derivation:

- `formatarParticao` → `"X_6^2 X_3^1"` (plain text, also used as a Vue `:key`); `formatarParticaoLatex` → `"X_{6}^{2}\,X_{3}^{1}"`. Both use the notation `X_{comprimento}^{repeticoes}` — subscript = part size, exponent = multiplicity — with braces so multi-digit values stay in place; `formatarSomaLatex` → `"6 + 6 + 3"`; `contarPartes` → sum of `lamb`; `expandirPartes` → flat decreasing list of part sizes.

Block configurations (in `mathForms.ts`) — **generate-unique, never deduplicate**. `gerarConfiguracoesUnicas(n, partes)` returns the distinct `"(1 2)(3 4)"` strings for the cycle type in `partes` (a partition of `n`); it is a thin shell over `permsDoTipo`, with `formatarBlocos` (from `formatadores.ts`) doing the formatting (cycles joined with no separator).

`permsDoTipo(n, tipo)` yields every permutation of {1..n} with the given cycle type, as a list of cycles. It never enumerates n! and filters — two rules make each permutation come out exactly once:

- **(a)** the smallest free element always starts the next cycle and is pinned to its first position, killing rotations (`(1 3 2) === (3 2 1)`);
- **(b)** only the _distinct_ remaining cycle lengths are iterated, killing cycle reordering (`(1 2)(3 4) === (3 4)(1 2)`).

Break either and duplicates reappear. `sum(sizes) === livres.length` is invariant, so every branch reaches a leaf — no wasted work. It throws `RangeError` when `tipo` doesn't sum to `n` or holds a non-integer/`< 1` entry. Cycles come out in the order the recursion consumes lengths, _not_ sorted by size, so a `[3,1]` type yields both `(1)(2 3 4)`-shaped and `(1 2 3)(4)`-shaped output.

`permutacoesR(arr, r)` is the helper: size-`r` ordered arrangements of distinct elements (Python's `itertools.permutations(arr, r)`), choosing and ordering in one step.

The count per type is `n! / prod(j^k_j * k_j!)`; summed over all partitions of n it is n!. `contarPermutacoesDoTipo(particao)` (its own file, `contarPermutacoesDoTipo.ts`) computes it directly from `{ alfa, lamb }` as a `bigint` (n! stops being exact in `number` at n = 19), so callers that only need the count never have to call `gerarConfiguracoesUnicas`.

`permutacoesR`, `permsDoTipo`, and its inner `rec` are `function*` expressions: generators cannot be arrow functions (see Code Conventions).

The partition generator was ported from a Python reference (`gerarParticoeskpartes.py`, removed from the tree; still in git history at commit `9356a2e`). Unlike that original, none of these read stdin or print; they return arrays.

### Visual design

Minimalist "textbook" look. **All colours, fonts, radii and widths are tokens in `src/assets/base.css`** (`--bg`, `--surface`, `--surface-sunken`, `--ink`, `--ink-soft`, `--muted`, `--line`, `--line-strong`, `--accent`, `--accent-soft`, …), redefined under `prefers-color-scheme: dark`; components must not hard-code colours. The old scaffold names (`--color-border`, …) survive as aliases. Shared primitives live in `src/assets/main.css`: `.pagina` (centred page container — every view's `<main>` uses it), `.pagina-estreita`, `.cabecalho-pagina`, `.sobretitulo`, `.lead`, `.botao` / `.botao-primario`, form fields. Headings use Source Serif 4, body Inter (both self-hosted via `@fontsource-variable/*`, imported in `main.ts`).

Exception: `PolyaGraph` passes literal hex colours (the `CORES` table, blue and orange) to `v-network-graph`, because its SVG config can't read CSS variables; they were picked to work in both themes, with labels drawn inside the vertex in white. `--cor-sigma` / `--cor-sigma-estrela` in `base.css` repeat the two vertex colours for legends and must be kept in sync with that table. Pan/zoom are disabled so the mouse wheel scrolls the page.

The tutorial path is Início (`/`) → 1 Teoria (`/explicacao`) → 2 Prática (`/polia-demonstration`), plus Sobre (`/about`, project credits). The steps in `App.vue`'s nav and `Inicio/Index.vue`'s cards are plain arrays in those files. `CollapsibleSection` takes an optional `numero` for the step badge.

### Rendering math

`MathTex.vue` is the single entry point for math: it wraps **KaTeX** `renderToString` (`throwOnError: false`, `output: 'html'`) behind `<MathTex :expr="..." :display="..." />`. `katex/dist/katex.min.css` is imported globally in `src/main.ts`. Pass LaTeX source through `expr` rather than reaching for KaTeX directly in a component. (`vue-mathjax-next` is still in `package.json` but is not used anywhere.)

## Code Conventions

- **Functions** must be defined as arrow functions stored in `const`: `const foo = () => {}`. Never use `function` declarations. The only exception is generators, which the syntax forbids as arrows — write them as `const g = function* () {}`, still bound to a `const`.
- Domain names, props, comments, and UI copy are in Portuguese; follow the surrounding file.
