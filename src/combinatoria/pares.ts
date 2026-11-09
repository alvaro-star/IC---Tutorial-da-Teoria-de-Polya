/**
 * Vértices e arestas do grafo completo K_n sobre S = {1..n}.
 */
import type { Aresta } from '@/combinatoria/grafoDoCiclo'

/** Os vértices {1..n}; um `n` negativo ou fracionário é truncado. */
export const verticesDe = (n: number): number[] =>
  Array.from({ length: Math.max(0, Math.floor(n)) }, (_, i) => i + 1)

/**
 * Todos os pares {i, j} com 1 ≤ i < j ≤ n — o conjunto D_n² das arestas de
 * K_n —, ordenados por `i` e depois por `j`. São C(n, 2) pares.
 */
export const paresDe = (n: number): Aresta[] => {
  const vertices = verticesDe(n)
  const pares: Aresta[] = []
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      pares.push([vertices[i]!, vertices[j]!])
    }
  }
  return pares
}

/**
 * Os mesmos pares de `paresDe`, agrupados pelo menor elemento: a linha `i - 1`
 * tem os pares {i, j} com j > i. Cada aresta aparece numa única linha — {1, 2}
 * está na linha do 1, não volta a aparecer na do 2. São n - 1 linhas, de
 * tamanhos n - 1, n - 2, …, 1.
 *
 * Ex.: n = 4 -> [[[1,2],[1,3],[1,4]], [[2,3],[2,4]], [[3,4]]].
 */
export const paresPorMenorElemento = (n: number): Aresta[][] => {
  const linhas: Aresta[][] = []
  for (const par of paresDe(n)) {
    const indice = par[0] - 1
    const linha = linhas[indice] ?? []
    linha.push(par)
    linhas[indice] = linha
  }
  return linhas
}
