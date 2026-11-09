/**
 * Adaptação em TypeScript de `gerarParticoeskpartes.py` (a referência Python,
 * já removida do projeto; continua no histórico do git, commit 9356a2e).
 *
 * Gera partições inteiras de `n` usando a representação de multiplicidade
 * (Algoritmo 7):
 *   - alfa: partes distintas da partição, em ordem decrescente (ex.: [6, 3, 2, 1])
 *   - lamb: multiplicidade de cada parte correspondente (ex.: [2, 1, 4, 1])
 *
 * Diferente da versão Python, estas funções não leem do stdin nem imprimem:
 * retornam a lista de partições para uso na aplicação. A formatação em texto
 * e LaTeX fica em `formatadores.ts`; os tipos cíclicos e as permutações, em
 * `mathForms.ts`.
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
const registrarParticao = (p: number[], m: number[], r: number): Particao => {
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
