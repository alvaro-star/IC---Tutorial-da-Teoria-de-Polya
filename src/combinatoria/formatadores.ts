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

/**
 * A aplicação de σ aos dois extremos de uma aresta, com o resultado:
 * ([1, 3], [2, 4]) -> `\{\sigma(1),\,\sigma(3)\} = \{2,\,4\}`. A notação σ(i)
 * deixa claro que cada número da direita é a imagem do extremo por σ.
 */
export const formatarImagensDaArestaLatex = (
  [i, j]: readonly [number, number],
  imagens: readonly [number, number],
): string => String.raw`\{\sigma(${i}),\,\sigma(${j})\} = ${formatarArestaLatex(imagens)}`

/**
 * Um termo de Z(G): N(λ) seguido de T(σ*), sem o 1 quando N(λ) = 1.
 * Ex.: (24n, [[5, 2]]) -> `"24X_5^{2}"`; (1n, [[1, 10]]) -> `"X_1^{10}"`.
 */
export const formatarTermoDoIndiceLatex = (
  quantidade: bigint,
  tipo: [number, number][],
): string => {
  const monomio = formatarTipoCiclicoLatex(tipo)
  if (monomio === '1') return quantidade.toString()
  return `${quantidade === 1n ? '' : quantidade}${monomio}`
}

/**
 * O mesmo termo depois da substituição de Pólya X_i -> 1 + c^i.
 * Ex.: (24n, [[5, 2]]) -> `"24(1+c^{5})^{2}"`; (10n, [[1, 4], [2, 3]]) ->
 * `"10(1+c)^{4}(1+c^{2})^{3}"`.
 */
export const formatarSubstituicaoLatex = (quantidade: bigint, tipo: [number, number][]): string => {
  const fatores = tipo
    .map(([comprimento, vezes]) => {
      const base = comprimento === 1 ? '(1+c)' : `(1+c^{${comprimento}})`
      return vezes === 1 ? base : `${base}^{${vezes}}`
    })
    .join('')
  if (fatores === '') return quantidade.toString()
  return `${quantidade === 1n ? '' : quantidade}${fatores}`
}

/** Os termos não nulos de um polinómio em c: [1n, 0n, 2n] -> ["1", "2c^{2}"]. */
export const termosDoPolinomioLatex = (coeficientes: readonly bigint[]): string[] =>
  coeficientes.flatMap((coeficiente, k) => {
    if (coeficiente === 0n) return []
    const potencia = k === 0 ? '' : k === 1 ? 'c' : `c^{${k}}`
    const numero = coeficiente === 1n && k > 0 ? '' : coeficiente.toString()
    return [`${numero}${potencia}`]
  })

/**
 * Uma soma longa em várias linhas alinhadas (`aligned` do KaTeX), com
 * `porLinha` parcelas em cada uma: `inicio` vem antes da primeira e `fim`
 * depois da última. Sem parcelas, escreve 0.
 */
export const formatarSomaEmLinhasLatex = (
  inicio: string,
  parcelas: string[],
  porLinha: number,
  fim = '',
): string => {
  if (parcelas.length === 0) return `${inicio} 0${fim}`
  const linhas: string[] = []
  for (let i = 0; i < parcelas.length; i += porLinha) {
    linhas.push(parcelas.slice(i, i + porLinha).join(' + '))
  }
  return String.raw`\begin{aligned} ${inicio} &${linhas.join(String.raw` \\ &+ `)}${fim} \end{aligned}`
}
