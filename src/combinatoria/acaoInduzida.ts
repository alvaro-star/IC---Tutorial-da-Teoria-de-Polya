/**
 * A ação induzida de σ ∈ S_n sobre as arestas de K_n:
 *
 *   σ*({i, j}) = {σ(i), σ(j)}
 *
 * Como σ é bijetiva, σ* leva D_n² outra vez em D_n² — só troca as arestas de
 * lugar —, logo σ* é uma permutação das C(n, 2) arestas. Este módulo lê σ,
 * aplica-a a cada aresta e decompõe σ* em ciclos.
 */
import { decomporEmCiclos, mdc, mmc } from '@/combinatoria/comum/matematica'
import { interpretarCiclos, type Aresta, type Ciclo } from '@/combinatoria/grafoDoCiclo'
import { paresDe, verticesDe } from '@/combinatoria/pares'

/** σ como função: `sigma[i]` = σ(i) para i = 1..n (a posição 0 não é usada). */
export type Permutacao = number[]

/** Resultado de ler σ a partir do texto: a permutação, ou porque falhou. */
export type LeituraDePermutacao = { ok: true; sigma: Permutacao } | { ok: false; erro: string }

/**
 * Lê σ escrita em ciclos, ex. `"(1 2)(3 4 5)"`, como permutação de {1..n}.
 * Elementos que não aparecem são pontos fixos, por isso `"(1 2)"` em n = 4 é
 * `(1 2)(3)(4)`. Recusa números fora de 1..n, repetidos, ciclos vazios ou
 * texto fora de parênteses.
 */
export const lerPermutacao = (texto: string, n: number): LeituraDePermutacao => {
  const limpo = texto.trim()
  if (limpo === '') return { ok: false, erro: 'Escreva σ em ciclos, por exemplo (1 2)(3 4 5).' }
  if (!/^[\s\d()]*$/.test(limpo))
    return { ok: false, erro: 'Use só números, espaços e parênteses.' }
  if (limpo.replace(/\([^()]*\)/g, '').trim() !== '')
    return { ok: false, erro: 'Cada ciclo deve estar entre parênteses, como em (1 2)(3 4).' }

  const ciclos = interpretarCiclos(limpo)
  if (ciclos.some((ciclo) => ciclo.length === 0))
    return { ok: false, erro: 'Há um ciclo vazio: ().' }

  const vistos = new Set<number>()
  for (const elemento of ciclos.flat()) {
    if (!Number.isInteger(elemento) || elemento < 1 || elemento > n)
      return { ok: false, erro: `O ${elemento} não é um vértice: use números de 1 a ${n}.` }
    if (vistos.has(elemento))
      return { ok: false, erro: `O ${elemento} aparece mais de uma vez; os ciclos são disjuntos.` }
    vistos.add(elemento)
  }

  return { ok: true, sigma: permutacaoDosCiclos(ciclos, n) }
}

/** Monta σ como função a partir dos seus ciclos; o que faltar fica fixo. */
export const permutacaoDosCiclos = (ciclos: Ciclo[], n: number): Permutacao => {
  const sigma = Array.from({ length: n + 1 }, (_, i) => i)
  for (const ciclo of ciclos) {
    ciclo.forEach((elemento, i) => {
      sigma[elemento] = ciclo[(i + 1) % ciclo.length]!
    })
  }
  return sigma
}

/** A decomposição completa de σ em ciclos, incluindo os pontos fixos. */
export const ciclosDaPermutacao = (sigma: Permutacao, n: number): Ciclo[] =>
  decomporEmCiclos(
    verticesDe(n),
    (i) => sigma[i]!,
    (i) => String(i),
  )

/** Escreve um par como aresta, com o menor elemento primeiro: {3, 1} -> [1, 3]. */
const normalizar = ([a, b]: Aresta): Aresta => (a < b ? [a, b] : [b, a])

const chaveDaAresta = ([a, b]: Aresta) => `${a}-${b}`

/** σ*({i, j}) = {σ(i), σ(j)}, já com o menor elemento primeiro. */
export const aplicarNaAresta = (sigma: Permutacao, [i, j]: Aresta): Aresta =>
  normalizar([sigma[i]!, sigma[j]!])

/** Uma linha da tabela de σ*: a aresta, as imagens dos extremos e o resultado. */
export interface ImagemDaAresta {
  /** A aresta {i, j}, com i < j. */
  aresta: Aresta
  /** [σ(i), σ(j)], pela ordem dos extremos — pode ter o maior primeiro. */
  imagens: [number, number]
  /** σ*({i, j}), com o menor elemento primeiro. */
  imagem: Aresta
  /** σ*({i, j}) = {i, j}: a aresta não se move. */
  fixa: boolean
}

/** Aplica σ a cada aresta de D_n², pela ordem de `paresDe`. */
export const imagensDasArestas = (sigma: Permutacao, n: number): ImagemDaAresta[] =>
  paresDe(n).map((aresta) => {
    const [i, j] = aresta
    const imagem = aplicarNaAresta(sigma, aresta)
    return {
      aresta,
      imagens: [sigma[i]!, sigma[j]!],
      imagem,
      fixa: chaveDaAresta(imagem) === chaveDaAresta(aresta),
    }
  })

/** σ* decomposta em ciclos de arestas, incluindo as arestas fixas. */
export const ciclosDaAcaoInduzida = (sigma: Permutacao, n: number): Aresta[][] =>
  decomporEmCiclos(paresDe(n), (aresta) => aplicarNaAresta(sigma, aresta), chaveDaAresta)

/**
 * Uma classe de arestas, vista só a partir dos ciclos de σ: ou as arestas com
 * os dois extremos no mesmo ciclo (`interna`), ou as que ligam dois ciclos
 * distintos (`entre`). σ* leva cada classe nela mesma, por isso cada uma se
 * decompõe em ciclos de arestas por conta própria.
 */
export interface ClasseDeArestas {
  tipo: 'interna' | 'entre'
  /** O ciclo de σ (`interna`) ou os dois ciclos de σ (`entre`). */
  ciclos: Ciclo[]
  /** As arestas da classe, com o menor elemento primeiro. */
  arestas: Aresta[]
  /** σ* restrita à classe, em ciclos de arestas. */
  ciclosInduzidos: Aresta[][]
}

/**
 * Divide D_n² pelas classes de arestas dos ciclos de σ: primeiro as internas
 * de cada ciclo de comprimento ≥ 2, depois as de cada par de ciclos, pela
 * ordem dos ciclos. Juntas, as classes têm as C(n, 2) arestas, cada uma uma vez.
 */
export const classesDeArestas = (sigma: Permutacao, n: number): ClasseDeArestas[] => {
  const ciclos = ciclosDaPermutacao(sigma, n)
  const decompor = (arestas: Aresta[]) =>
    decomporEmCiclos(arestas, (aresta) => aplicarNaAresta(sigma, aresta), chaveDaAresta)

  const internas: ClasseDeArestas[] = ciclos
    .filter((ciclo) => ciclo.length >= 2)
    .map((ciclo) => {
      const ordenado = [...ciclo].sort((a, b) => a - b)
      const arestas: Aresta[] = []
      ordenado.forEach((a, i) => ordenado.slice(i + 1).forEach((b) => arestas.push([a, b])))
      return { tipo: 'interna', ciclos: [ciclo], arestas, ciclosInduzidos: decompor(arestas) }
    })

  const entre: ClasseDeArestas[] = []
  ciclos.forEach((primeiro, i) => {
    ciclos.slice(i + 1).forEach((segundo) => {
      const arestas: Aresta[] = []
      for (const a of primeiro) for (const b of segundo) arestas.push(normalizar([a, b]))
      arestas.sort(([a1, b1], [a2, b2]) => a1 - a2 || b1 - b2)
      entre.push({
        tipo: 'entre',
        ciclos: [primeiro, segundo],
        arestas,
        ciclosInduzidos: decompor(arestas),
      })
    })
  })

  return [...internas, ...entre]
}

/**
 * A contribuição que a teoria prevê para uma classe, sem olhar para as
 * arestas — só para os comprimentos dos ciclos de σ:
 *
 * - interna, comprimento j (Proposição 1 e Observação 1):
 *   j ímpar -> X_j^{(j-1)/2};  j par -> X_{j/2} · X_j^{(j-2)/2}  (j = 2 dá X_1);
 * - entre ciclos de comprimentos r e s (Proposição 2): X_{mmc(r,s)}^{mdc(r,s)}.
 *
 * Devolve o tipo cíclico como pares [comprimento, quantidade], crescente.
 */
export const contribuicaoPrevista = (classe: ClasseDeArestas): [number, number][] => {
  if (classe.tipo === 'entre') {
    const [r, s] = classe.ciclos.map((ciclo) => ciclo.length) as [number, number]
    return [[mmc(r, s), mdc(r, s)]]
  }
  const j = classe.ciclos[0]!.length
  if (j % 2 === 1) return [[j, (j - 1) / 2]]
  if (j === 2) return [[1, 1]]
  return [
    [j / 2, 1],
    [j, (j - 2) / 2],
  ]
}

/**
 * Uma contribuição para T(σ*) vista só pelos comprimentos dos ciclos de σ,
 * agrupada como nas Observações 2 e 3: os k_j ciclos de comprimento j dão a
 * mesma contribuição interna k_j vezes; dois comprimentos distintos r < s
 * repetem a contribuição entre ciclos k_r·k_s vezes; dois ciclos do mesmo
 * comprimento r, C(k_r, 2) vezes.
 */
export interface ContribuicaoPorComprimento {
  tipo: 'interna' | 'entre'
  /** [j] para `interna`; [r, s] (r ≤ s) para `entre`. */
  comprimentos: number[]
  /** Quantas vezes a contribuição se repete. */
  vezes: number
  /** A contribuição de uma ocorrência, como em `contribuicaoPrevista`. */
  contribuicao: [number, number][]
}

/**
 * T(σ*) a partir apenas do tipo cíclico de σ (`partes`, ex. [3, 1, 1]) — o
 * Teorema 1 com as Observações 2 e 3, sem construir nenhuma aresta. Devolve
 * as contribuições agrupadas e o tipo final.
 */
export const tipoInduzidoDoTipo = (
  partes: number[],
): { contribuicoes: ContribuicaoPorComprimento[]; tipo: [number, number][] } => {
  const multiplicidade = new Map<number, number>()
  for (const j of partes) multiplicidade.set(j, (multiplicidade.get(j) ?? 0) + 1)
  const comprimentos = [...multiplicidade.keys()].sort((a, b) => a - b)

  const contribuicoes: ContribuicaoPorComprimento[] = []

  for (const j of comprimentos) {
    if (j === 1) continue // pontos fixos não têm arestas internas
    const ciclo: ClasseDeArestas = {
      tipo: 'interna',
      ciclos: [Array.from({ length: j }, (_, i) => i + 1)],
      arestas: [],
      ciclosInduzidos: [],
    }
    contribuicoes.push({
      tipo: 'interna',
      comprimentos: [j],
      vezes: multiplicidade.get(j)!,
      contribuicao: contribuicaoPrevista(ciclo),
    })
  }

  comprimentos.forEach((r, i) => {
    comprimentos.slice(i).forEach((s) => {
      const kr = multiplicidade.get(r)!
      const vezes = r === s ? (kr * (kr - 1)) / 2 : kr * multiplicidade.get(s)!
      if (vezes === 0) return
      contribuicoes.push({
        tipo: 'entre',
        comprimentos: [r, s],
        vezes,
        contribuicao: [[mmc(r, s), mdc(r, s)]],
      })
    })
  })

  const total = new Map<number, number>()
  for (const { vezes, contribuicao } of contribuicoes) {
    for (const [comprimento, quantidade] of contribuicao) {
      total.set(comprimento, (total.get(comprimento) ?? 0) + quantidade * vezes)
    }
  }
  const tipo = [...total.entries()].sort(([a], [b]) => a - b)

  return { contribuicoes, tipo }
}
