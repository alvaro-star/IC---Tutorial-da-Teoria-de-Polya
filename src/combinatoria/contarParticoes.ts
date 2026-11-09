/**
 * p(n): o número de partições de n, sem as gerar. Programação dinâmica
 * "do troco": para cada parte k = 1..n, as partições de m que usam partes
 * ≤ k são as que usam partes ≤ k - 1 mais as que têm pelo menos uma parte k.
 * O(n²) somas — p(100) sai instantâneo, enquanto gerar as 190 569 292
 * partições de 100 não é viável.
 *
 * Usa `bigint` porque p(n) deixa de ser exato em `number` por volta de n = 400.
 *
 * Ex.: `contarParticoes(5)` -> `7n`.
 */
export const contarParticoes = (n: number): bigint => {
  if (n < 0) return 0n
  const p = Array.from({ length: n + 1 }, (_, m): bigint => (m === 0 ? 1n : 0n))
  for (let k = 1; k <= n; k++) {
    for (let m = k; m <= n; m++) p[m] = p[m]! + p[m - k]!
  }
  return p[n]!
}
