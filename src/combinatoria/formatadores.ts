/**
 * Formatadores: funções que só transformam valores já calculados em texto
 * (para o ecrã, para `:key` do Vue ou para LaTeX). Nenhuma delas gera
 * partições ou permutações — isso fica em `gerarParticoesKPartes.ts` e
 * `mathForms.ts`.
 *
 * Só depende de tipos, para que o gerador possa usar `formatarBlocos` sem
 * criar um import circular.
 */
import type { Particao } from '@/combinatoria/gerarParticoesKPartes'

/**
 * Formata uma partição na notação `X_comprimento^repeticoes`
 * (ex.: "X_6^2 X_3^1 X_2^4 X_1^1"): o índice inferior é o comprimento da parte
 * e o expoente é o número de vezes que ela se repete.
 */
export const formatarParticao = (particao: Particao): string =>
  particao.alfa.map((parte, i) => `X_${parte}^${particao.lamb[i]}`).join(' ')

/**
 * Mesma partição em LaTeX, na notação `X_{comprimento}^{repeticoes}`. Índice e
 * expoente vão entre chaves para que valores de dois ou mais dígitos fiquem
 * inteiros no sítio certo.
 *
 * Ex.: `{ alfa: [6, 3], lamb: [2, 10] }` -> `"X_{6}^{2}\\,X_{3}^{10}"`.
 */
export const formatarParticaoLatex = (particao: Particao): string =>
  particao.alfa.map((parte, i) => `X_{${parte}}^{${particao.lamb[i]}}`).join('\\,')

/**
 * A partição escrita como soma das suas partes, em LaTeX.
 *
 * Ex.: `{ alfa: [3, 1], lamb: [1, 2] }` -> `"3 + 1 + 1"`.
 */
export const formatarSomaLatex = (particao: Particao): string =>
  particao.alfa
    .flatMap((parte, i) => Array.from({ length: particao.lamb[i] ?? 0 }, () => parte))
    .join(' + ')

/** Formata ciclos como "(1 2)(3 4)". */
export const formatarBlocos = (blocos: number[][]): string =>
  blocos.map((bloco) => `(${bloco.join(' ')})`).join('')

/** Uma aresta (ou um par qualquer) em LaTeX: [1, 3] -> `\{1,\,3\}`. */
export const formatarArestaLatex = ([a, b]: readonly [number, number]): string =>
  String.raw`\{${a},\,${b}\}`

/** Um ciclo de arestas em LaTeX: `(\{1,\,2\}\;\{2,\,3\})`. */
export const formatarCicloDeArestasLatex = (ciclo: [number, number][]): string =>
  `(${ciclo.map(formatarArestaLatex).join(String.raw`\;`)})`

/**
 * Um tipo cíclico como monómio, na notação de `exemplosN5.ts` e dos slides:
 * comprimentos por ordem crescente, expoente omitido quando é 1, índice entre
 * chaves só quando tem mais de um dígito. Sem ciclos (menos de 2 vértices,
 * logo nenhuma aresta), dá 1.
 *
 * Ex.: [[1, 1], [3, 3]] -> `"X_1X_3^{3}"`; [[10, 1]] -> `"X_{10}"`.
 */
export const formatarTipoCiclicoLatex = (tipo: [number, number][]): string => {
  if (tipo.length === 0) return '1'
  return tipo
    .map(([comprimento, quantidade]) => {
      const x = comprimento < 10 ? `X_${comprimento}` : `X_{${comprimento}}`
      return quantidade === 1 ? x : `${x}^{${quantidade}}`
    })
    .join('')
}

/**
 * σ na notação de duas linhas: em cima 1..n, em baixo σ(1)..σ(n).
 * `sigma[i]` = σ(i), como em `acaoInduzida.ts`.
 */
export const formatarDuasLinhasLatex = (sigma: number[], n: number): string => {
  const de = Array.from({ length: n }, (_, i) => i + 1)
  const para = de.map((i) => sigma[i])
  return String.raw`\begin{pmatrix} ${de.join(' & ')} \\ ${para.join(' & ')} \end{pmatrix}`
}

/** Um ciclo de σ em LaTeX: [1, 2, 3] -> `(1\,2\,3)`. */
export const formatarCicloLatex = (ciclo: number[]): string => `(${ciclo.join(String.raw`\,`)})`

/**
 * Um conjunto de arestas em LaTeX, com pontos de quebra entre os elementos
 * para que listas longas possam mudar de linha no texto.
 */
export const formatarConjuntoDeArestasLatex = (arestas: [number, number][]): string =>
  String.raw`\{${arestas.map(formatarArestaLatex).join(String.raw`,\allowbreak\ `)}\}`

/** Um produto de monómios: `["X_1", "X_3"]` -> `"X_1 \cdot X_3"`. */
export const formatarProdutoLatex = (fatores: string[]): string => fatores.join(String.raw` \cdot `)
