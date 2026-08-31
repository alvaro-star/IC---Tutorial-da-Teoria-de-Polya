/**
 * Converte um tipo cíclico (uma permutação escrita em ciclos) no grafo
 * direcionado que ela representa.
 *
 * Cada ciclo `(a b c)` significa "a aponta para b, b aponta para c e c fecha de
 * volta em a". Ciclos de comprimento 1 são pontos fixos: o vértice não recebe
 * nenhuma aresta e fica **isolado** no grafo, sem laço sobre si mesmo.
 *
 * Ex.: `(1 3)(2 4)` -> 1->3, 3->1, 2->4, 4->2
 *      `(1 4 3)(2)` -> 1->4, 4->3, 3->1, e o vértice 2 isolado
 */

/** Uma aresta direcionada: `[origem, destino]`, lida como origem -> destino. */
export type Aresta = [number, number]

/** Um ciclo: os elementos pela ordem em que se apontam uns aos outros. */
export type Ciclo = number[]

/** O grafo de um tipo cíclico, pronto a alimentar o `PolyaGraph`. */
export interface GrafoDoCiclo {
  /** Todos os vértices que aparecem nos ciclos, por ordem crescente. */
  vertices: number[]
  /** As arestas direcionadas, na ordem em que os ciclos as produzem. */
  arestas: Aresta[]
  /** Os vértices de ciclos de comprimento 1 — desenhados sem arestas. */
  isolados: number[]
}

/**
 * As arestas de um único ciclo.
 *
 * Um ciclo de comprimento `m >= 2` gera exatamente `m` arestas: cada elemento
 * aponta para o seguinte e o último fecha no primeiro. Um ciclo de comprimento
 * 1 gera zero arestas — o ponto fixo fica isolado, não ganha um laço.
 */
export const arestasDoCiclo = (ciclo: Ciclo): Aresta[] => {
  if (ciclo.length < 2) return []

  return ciclo.map((elemento, i) => [elemento, ciclo[(i + 1) % ciclo.length]!])
}

/**
 * Lê a forma textual `"(1 3)(2 4)"` e devolve `[[1, 3], [2, 4]]`.
 *
 * É o formato que o `gerarConfiguracoesUnicas` produz, portanto serve de ponte
 * entre a lista mostrada no ecrã e o grafo.
 */
export const interpretarCiclos = (texto: string): Ciclo[] => {
  const grupos = texto.match(/\(([^)]*)\)/g)
  if (grupos === null) return []

  return grupos.map((grupo) =>
    grupo
      .slice(1, -1)
      .trim()
      .split(/\s+/)
      .filter((parte) => parte !== '')
      .map(Number),
  )
}

/**
 * Monta o grafo direcionado de um tipo cíclico.
 *
 * Aceita tanto a forma crua (`[[1, 3], [2, 4]]`, o que o `permsDoTipo` produz)
 * como a textual (`"(1 3)(2 4)"`, o que a lista do ecrã mostra).
 */
export const grafoDoCiclo = (ciclos: Ciclo[] | string): GrafoDoCiclo => {
  const decomposicao =
    typeof ciclos === 'string' ? interpretarCiclos(ciclos) : ciclos

  const vertices: number[] = []
  const arestas: Aresta[] = []
  const isolados: number[] = []

  decomposicao.forEach((ciclo) => {
    vertices.push(...ciclo)
    arestas.push(...arestasDoCiclo(ciclo))
    if (ciclo.length === 1) isolados.push(ciclo[0]!)
  })

  vertices.sort((a, b) => a - b)
  isolados.sort((a, b) => a - b)

  return { vertices, arestas, isolados }
}
