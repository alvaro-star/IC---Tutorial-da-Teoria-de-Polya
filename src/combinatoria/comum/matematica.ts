/**
 * Funções matemáticas comuns, sem relação direta com partições ou grafos,
 * partilhadas pelos módulos de `combinatoria/`.
 */

/**
 * m!, exato, como `bigint` (em `number`, m! deixa de ser exato a partir de
 * m = 19). Para m ≤ 1 dá 1.
 *
 * Ex.: `fatorial(5)` -> `120n`.
 */
export const fatorial = (m: number): bigint => {
  let resultado = 1n
  for (let i = 2n; i <= BigInt(m); i++) resultado *= i
  return resultado
}

/**
 * Decompõe em ciclos disjuntos uma permutação de um conjunto finito
 * qualquer — vértices, arestas, … —, dada pela função `aplicar`.
 *
 * Percorre `elementos` pela ordem dada: cada elemento ainda não visitado
 * abre um ciclo, que segue `aplicar` até voltar ao início. Pontos fixos
 * aparecem como ciclos de comprimento 1. `chave` identifica os elementos
 * (precisa de ser igual para valores iguais, ex.: "1-2" para o par {1, 2}).
 *
 * Ex.: elementos [1..5], aplicar = σ de (1 2)(3 4 5) -> [[1, 2], [3, 4, 5]].
 */
export const decomporEmCiclos = <T>(
  elementos: T[],
  aplicar: (elemento: T) => T,
  chave: (elemento: T) => string,
): T[][] => {
  const visitados = new Set<string>()
  const ciclos: T[][] = []

  for (const inicio of elementos) {
    if (visitados.has(chave(inicio))) continue

    const ciclo: T[] = []
    let atual = inicio
    while (!visitados.has(chave(atual))) {
      visitados.add(chave(atual))
      ciclo.push(atual)
      atual = aplicar(atual)
    }
    ciclos.push(ciclo)
  }
  return ciclos
}

/**
 * O tipo cíclico de uma decomposição: quantos ciclos há de cada
 * comprimento, por ordem crescente de comprimento.
 *
 * Ex.: [[1, 2], [3, 4, 5], [6, 7]] -> [[2, 2], [3, 1]] (dois de comprimento 2,
 * um de comprimento 3).
 */
export const tipoCiclico = (ciclos: unknown[][]): [comprimento: number, quantidade: number][] => {
  const contagem = new Map<number, number>()
  for (const ciclo of ciclos) {
    contagem.set(ciclo.length, (contagem.get(ciclo.length) ?? 0) + 1)
  }
  return [...contagem.entries()].sort(([a], [b]) => a - b)
}

/** Máximo divisor comum, pelo algoritmo de Euclides. Ex.: `mdc(4, 6)` -> 2. */
export const mdc = (a: number, b: number): number => (b === 0 ? Math.abs(a) : mdc(b, a % b))

/** Mínimo múltiplo comum. Ex.: `mmc(4, 6)` -> 12. */
export const mmc = (a: number, b: number): number => (a === 0 || b === 0 ? 0 : (a / mdc(a, b)) * b)
