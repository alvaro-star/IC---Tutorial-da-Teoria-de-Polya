import { fatorial } from '@/combinatoria/comum/matematica'
import type { Particao } from '@/combinatoria/gerarParticoesKPartes'

/**
 * Quantas permutações de {1..n} têm o tipo cíclico desta partição, pela
 * fórmula N(λ) = n! / ∏ j^{k_j} · k_j!, onde `j` percorre as partes distintas
 * (`alfa`) e `k_j` é a sua multiplicidade (`lamb`). Não gera nenhuma
 * permutação: é o que `gerarConfiguracoesUnicas(n, …).length` daria.
 *
 * Usa `bigint` porque n! deixa de ser exato em `number` a partir de n = 19.
 *
 * Ex.: `{ alfa: [2], lamb: [2] }` (tipo [2, 2], n = 4) -> 4! / (2² · 2!) = 3n.
 */
export const contarPermutacoesDoTipo = (particao: Particao): bigint => {
  const n = particao.alfa.reduce((soma, parte, i) => soma + parte * (particao.lamb[i] ?? 0), 0)
  const divisor = particao.alfa.reduce((produto, parte, i) => {
    const k = particao.lamb[i] ?? 0
    return produto * BigInt(parte) ** BigInt(k) * fatorial(k)
  }, 1n)
  return fatorial(n) / divisor
}
