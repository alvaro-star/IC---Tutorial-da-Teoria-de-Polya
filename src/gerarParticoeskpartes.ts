/**
 * Adaptação em TypeScript de `gerarParticoeskpartes.py`.
 *
 * Gera partições inteiras de `n` usando a representação de multiplicidade
 * (Algoritmo 7):
 *   - alfa: partes distintas da partição, em ordem decrescente (ex.: [6, 3, 2, 1])
 *   - lamb: multiplicidade de cada parte correspondente (ex.: [2, 1, 4, 1])
 *
 * Diferente da versão Python, estas funções não leem do stdin nem imprimem:
 * retornam a lista de partições para uso na aplicação.
 */

/** Uma partição na forma alfa^lamb: partes distintas e suas multiplicidades. */
export interface Particao {
  /** Partes distintas, em ordem decrescente. */
  alfa: number[]
  /** Multiplicidade de cada parte correspondente em `alfa`. */
  lamb: number[]
}

/**
 * Captura o estado atual (`alfa`, `lamb`) das `r` primeiras entradas de
 * `p`/`m` como uma nova partição imutável.
 */
const registrarParticao = (
  p: number[],
  m: number[],
  r: number,
): Particao => {
  const alfa: number[] = []
  const lamb: number[] = []
  for (let i = 0; i < r; i++) {
    lamb.push(m[i]!)
    alfa.push(p[i]!)
  }
  return { alfa, lamb }
}

/**
 * Abordagem "com regra": gera diretamente todas as partições de `n` com no
 * máximo `k` partes, pulando as que excederiam `k` em vez de filtrá-las depois.
 */
export const gerarParticoesKPartes = (n: number, k: number): Particao[] => {
  const particoes: Particao[] = []

  const p = new Array<number>(k + 1).fill(0)
  const m = new Array<number>(k + 1).fill(0)

  p[0] = n
  m[0] = 1
  let r = 1

  let numParts = 1

  // pivo = posição da menor parte maior que 1
  // s    = soma do valor do pivo com tudo que for menor que ele
  // w    = maior número menor que o valor do pivo
  // u    = multiplicidade de w (quantas vezes cabe em s)
  // v    = resto da divisão de s por w
  while (true) {
    particoes.push(registrarParticao(p, m, r))

    let pivo: number
    if (p[r - 1] === 1) {
      // Se a partição contém 1
      pivo = r - 2
    } else {
      // Se não contém 1
      pivo = r - 1
    }

    let s = 0

    if ((p[r - 2] === 2 || p[r - 1] !== 1) && numParts + 1 > k) {
      // Realiza o "pulo": joga o pivo para o próximo menor número
      pivo -= 1
      if (p[pivo] === p[pivo + 1]! + 1 && p[r - 1]! > 1) {
        pivo -= 1
      }
    }

    if (pivo < 0) break

    const w = p[pivo]! - 1

    // Soma o pivo com todos os números menores que ele
    s += p[pivo]! * 1
    for (let i = pivo + 1; i < r; i++) {
      s += p[i]! * m[i]!
      numParts -= m[i]!
    }

    const u = Math.floor(s / w) // quanto de 'w' cabe em 's'
    const v = s % w // resto de 's' por 'w'

    m[pivo] = m[pivo]! - 1 // Subtrai uma unidade do pivo
    numParts -= 1

    // Posição onde serão escritas as novas partes
    const pivo1 = m[pivo] === 0 ? pivo : pivo + 1

    p[pivo1] = w
    m[pivo1] = u
    numParts += u

    if (v === 0) {
      r = pivo1 + 1
    } else {
      p[pivo1 + 1] = v
      m[pivo1 + 1] = 1
      numParts += 1
      r = pivo1 + 2
    }
  }

  return particoes
}

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
  particao.alfa
    .map((parte, i) => `X_{${parte}}^{${particao.lamb[i]}}`)
    .join('\\,')

/**
 * A partição escrita como soma das suas partes, em LaTeX.
 *
 * Ex.: `{ alfa: [3, 1], lamb: [1, 2] }` -> `"3 + 1 + 1"`.
 */
export const formatarSomaLatex = (particao: Particao): string =>
  expandirPartes(particao).join(' + ')

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
export const permutacoesR = function* (
  arr: number[],
  r: number,
): Generator<number[]> {
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
export const permsDoTipo = function* (
  n: number,
  tipo: ParicionExpanded,
): Generator<number[][]> {
  const soma = tipo.reduce((a, b) => a + b, 0)
  if (soma !== n)
    throw new RangeError(`tipo [${tipo}] soma ${soma}, esperado ${n}`)
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

  yield* rec(Array.from({ length: n }, (_, i) => i + 1), tipo.slice(), [])
}

/** Formata ciclos como "(1 2)(3 4)". */
export const formatarBlocos = (blocos: number[][]): string =>
  blocos.map((bloco) => `(${bloco.join(' ')})`).join('')

/**
 * Configurações distintas de 1..n para o tipo cíclico em `partes`, já
 * formatadas: `["(1 2)(3 4)", "(1 3)(2 4)", "(1 4)(2 3)"]`.
 *
 * Casca fina sobre `permsDoTipo` — ver lá as duas regras que garantem que cada
 * permutação sai exatamente uma vez, sem deduplicação posterior.
 */
export const gerarConfiguracoesUnicas = (
  n: number,
  partes: ParicionExpanded,
): string[] => {
  if (n < 1 || partes.length === 0) return []

  const configuracoes: string[] = []
  for (const ciclos of permsDoTipo(n, partes)) {
    configuracoes.push(formatarBlocos(ciclos))
  }
  return configuracoes
}
