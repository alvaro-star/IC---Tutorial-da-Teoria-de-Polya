/**
 * Polinómios numa variável com coeficientes inteiros exatos: `p[k]` é o
 * coeficiente de c^k. Sem zeros à direita (o polinómio nulo é `[]`).
 */
export type Polinomio = bigint[]

const aparar = (p: Polinomio): Polinomio => {
  let fim = p.length
  while (fim > 0 && p[fim - 1] === 0n) fim--
  return p.slice(0, fim)
}

export const somar = (a: Polinomio, b: Polinomio): Polinomio =>
  aparar(
    Array.from({ length: Math.max(a.length, b.length) }, (_, k) => (a[k] ?? 0n) + (b[k] ?? 0n)),
  )

export const multiplicar = (a: Polinomio, b: Polinomio): Polinomio => {
  if (a.length === 0 || b.length === 0) return []
  const r: Polinomio = Array.from({ length: a.length + b.length - 1 }, () => 0n)
  a.forEach((x, i) => b.forEach((y, j) => (r[i + j] = r[i + j]! + x * y)))
  return aparar(r)
}

export const potencia = (p: Polinomio, e: number): Polinomio => {
  let r: Polinomio = [1n]
  for (let i = 0; i < e; i++) r = multiplicar(r, p)
  return r
}

export const escalar = (p: Polinomio, fator: bigint): Polinomio => aparar(p.map((x) => x * fator))

/** Divide cada coeficiente por `d`; lança erro se alguma divisão não for exata. */
export const dividirExato = (p: Polinomio, d: bigint): Polinomio =>
  p.map((x, k) => {
    if (x % d !== 0n) throw new RangeError(`coeficiente de c^${k} (${x}) não é múltiplo de ${d}`)
    return x / d
  })

/** O valor do polinómio em c = 1: a soma dos coeficientes. */
export const somaDosCoeficientes = (p: Polinomio): bigint => p.reduce((t, x) => t + x, 0n)
