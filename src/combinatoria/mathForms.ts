/**
 * Tipos cíclicos a partir de partições: contagem de partes, a forma
 * expandida de uma partição e a geração das permutações de um tipo cíclico
 * (`permsDoTipo`), sem enumerar as n!.
 *
 * As partições em si vêm de `gerarParticoesKPartes.ts`; a contagem das
 * permutações de um tipo pela fórmula, de `contarPermutacoesDoTipo.ts`.
 */

import { formatarBlocos } from '@/combinatoria/formatadores'
import type { Particao } from '@/combinatoria/gerarParticoesKPartes'

/** Número total de partes da partição (a soma das multiplicidades). */
export const contarPartes = (particao: Particao): number =>
  particao.lamb.reduce((total, multiplicidade) => total + multiplicidade, 0)

/**
 * Uma partição na sua forma **expandida**: a lista plana com o tamanho de cada
 * parte, em ordem decrescente, uma entrada por parte (ao contrário de
 * `Particao`, que agrupa as partes iguais numa multiplicidade).
 *
 * Ex.: a partição "2^2 1^1" de 5 — ou seja `{ alfa: [2, 1], lamb: [2, 1] }` —
 * expande para `[2, 2, 1]`.
 *
 * É esta a forma que descreve um **tipo cíclico**: cada número é o comprimento
 * de um ciclo, e a soma de todos é o `n` sobre o qual as permutações são
 * geradas. Produzida por `expandirPartes`, consumida por `permsDoTipo` e
 * `gerarConfiguracoesUnicas`.
 */
export type ParicionExpanded = number[]

/**
 * Expande a representação de multiplicidade numa `ParicionExpanded`.
 *
 * Ex.: `{ alfa: [2, 1], lamb: [2, 1] }` (ou seja, "2^2 1^1") -> `[2, 2, 1]`.
 */
export const expandirPartes = (particao: Particao): ParicionExpanded => {
  const partes: ParicionExpanded = []
  particao.alfa.forEach((parte, i) => {
    const repeticoes = particao.lamb[i] ?? 0
    for (let j = 0; j < repeticoes; j++) partes.push(parte)
  })
  return partes
}

/**
 * Arranjos de tamanho `r`: todas as sequências ordenadas de `r` elementos
 * distintos de `arr`. Equivale a `itertools.permutations(arr, r)` do Python —
 * combina o "escolher subconjunto" e o "ordenar" num passo só.
 *
 * Geradores não podem ser arrow functions; daí a expressão `function*`.
 */
export const permutacoesR = function* (arr: number[], r: number): Generator<number[]> {
  if (r === 0) {
    yield []
    return
  }
  for (let i = 0; i < arr.length; i++) {
    const resto = arr.slice(0, i).concat(arr.slice(i + 1))
    for (const cauda of permutacoesR(resto, r - 1)) yield [arr[i]!, ...cauda]
  }
}

/**
 * Todas as permutações DISTINTAS de {1..n} com o tipo cíclico dado.
 *
 * @param n    tamanho do conjunto base
 * @param tipo o tipo cíclico como `ParicionExpanded`, ex. `[2, 2]` ou
 *             `[3, 1]`. Precisa somar exatamente `n`.
 * @yields     a permutação como lista de ciclos
 *
 * Duas regras eliminam toda a redundância, sem precisar deduplicar depois:
 *  (a) o MENOR elemento livre sempre inicia o próximo ciclo e fica fixo na
 *      primeira posição -> mata rotações, `(1 3 2) === (3 2 1)`;
 *  (b) percorre-se apenas os comprimentos DISTINTOS que restam em `sizes`
 *      -> mata reordenação de ciclos, `(1 2)(3 4) === (3 4)(1 2)`.
 *
 * Como `sum(sizes) === livres.length` é invariante, todo ramo chega a uma
 * folha: nenhum trabalho desperdiçado. O total gerado é
 * `n! / prod(k^j_k * j_k!)`.
 */
export const permsDoTipo = function* (n: number, tipo: ParicionExpanded): Generator<number[][]> {
  const soma = tipo.reduce((a, b) => a + b, 0)
  if (soma !== n) throw new RangeError(`tipo [${tipo}] soma ${soma}, esperado ${n}`)
  if (tipo.some((k) => !Number.isInteger(k) || k < 1))
    throw new RangeError(`tipo [${tipo}] deve conter inteiros >= 1`)

  const rec = function* (
    livres: number[],
    sizes: number[],
    path: number[][],
  ): Generator<number[][]> {
    if (sizes.length === 0) {
      yield path.map((ciclo) => [...ciclo])
      return
    }

    const menor = livres[0]!
    const outros = livres.slice(1)

    for (const k of [...new Set(sizes)].sort((a, b) => a - b)) {
      const resto = sizes.slice()
      resto.splice(resto.indexOf(k), 1) // consome UMA cópia de k

      for (const ordem of permutacoesR(outros, k - 1)) {
        const usados = new Set(ordem)
        const sobra = outros.filter((v) => !usados.has(v))

        path.push([menor, ...ordem]) // push/pop em vez de concat:
        yield* rec(sobra, resto, path) // custo O(m) por saída, não O(m^2)
        path.pop()
      }
    }
  }

  yield* rec(
    Array.from({ length: n }, (_, i) => i + 1),
    tipo.slice(),
    [],
  )
}

/**
 * Configurações distintas de 1..n para o tipo cíclico em `partes`, já
 * formatadas: `["(1 2)(3 4)", "(1 3)(2 4)", "(1 4)(2 3)"]`.
 *
 * Casca fina sobre `permsDoTipo` — ver lá as duas regras que garantem que cada
 * permutação sai exatamente uma vez, sem deduplicação posterior.
 */
export const gerarConfiguracoesUnicas = (n: number, partes: ParicionExpanded): string[] => {
  if (n < 1 || partes.length === 0) return []

  const configuracoes: string[] = []
  for (const ciclos of permsDoTipo(n, partes)) {
    configuracoes.push(formatarBlocos(ciclos))
  }
  return configuracoes
}

/**
 * Uma permutação representante do tipo cíclico `partes`: a primeira que
 * `permsDoTipo` produz, sem gerar as outras. Os ciclos saem do mais curto
 * para o mais longo, com os menores números primeiro.
 *
 * Ex.: n = 5, partes [3, 2] -> [[1, 2], [3, 4, 5]].
 */
export const representanteDoTipo = (n: number, partes: ParicionExpanded): number[][] => {
  if (n < 1 || partes.length === 0) return []
  return permsDoTipo(n, partes).next().value ?? []
}
