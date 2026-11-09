import { describe, expect, it } from 'vitest'
import {
  dividirExato,
  multiplicar,
  potencia,
  somaDosCoeficientes,
  somar,
} from '@/combinatoria/comum/polinomios'
import {
  formatarSomaEmLinhasLatex,
  formatarSubstituicaoLatex,
  formatarTermoDoIndiceLatex,
  termosDoPolinomioLatex,
} from '@/combinatoria/formatadores'
import { inventarioDeGrafos, substituirNoTipo } from '@/combinatoria/inventario'

describe('polinómios', () => {
  it('somam, multiplicam e elevam', () => {
    expect(somar([1n, 2n], [3n])).toEqual([4n, 2n])
    expect(somar([1n, 2n], [0n, -2n])).toEqual([1n])
    expect(multiplicar([1n, 1n], [1n, 1n])).toEqual([1n, 2n, 1n])
    expect(potencia([1n, 1n], 3)).toEqual([1n, 3n, 3n, 1n])
    expect(potencia([1n, 1n], 0)).toEqual([1n])
  })

  it('só dividem quando a divisão é exata', () => {
    expect(dividirExato([4n, 6n], 2n)).toEqual([2n, 3n])
    expect(() => dividirExato([3n], 2n)).toThrow(RangeError)
  })
})

describe('substituirNoTipo', () => {
  it('troca cada X_i por 1 + c^i', () => {
    // X_1 X_2 -> (1 + c)(1 + c^2) = 1 + c + c^2 + c^3
    expect(
      substituirNoTipo([
        [1, 1],
        [2, 1],
      ]),
    ).toEqual([1n, 1n, 1n, 1n])
    expect(substituirNoTipo([])).toEqual([1n])
  })
})

describe('inventarioDeGrafos', () => {
  it('reproduz p(c) de m = 5 do relatório: 34 grafos', () => {
    const { resultado, denominador, termos } = inventarioDeGrafos(5)
    expect(denominador).toBe(120n)
    expect(termos).toHaveLength(7)
    expect(resultado).toEqual([1n, 1n, 2n, 4n, 6n, 6n, 6n, 4n, 2n, 1n, 1n])
  })

  it('dá o número conhecido de grafos simples não isomorfos (OEIS A000088)', () => {
    const conhecidos = [1n, 2n, 4n, 11n, 34n, 156n, 1044n, 12346n, 274668n, 12005168n]
    conhecidos.forEach((total, i) => {
      const { resultado } = inventarioDeGrafos(i + 1)
      expect(somaDosCoeficientes(resultado), `n = ${i + 1}`).toBe(total)
    })
  })

  it('é simétrico: um grafo e o seu complementar têm k e C(n,2) − k arestas', () => {
    for (let n = 2; n <= 9; n++) {
      const { resultado } = inventarioDeGrafos(n)
      expect(resultado).toHaveLength((n * (n - 1)) / 2 + 1)
      expect([...resultado].reverse()).toEqual(resultado)
    }
  })
})

describe('formatadores do inventário', () => {
  it('escrevem os termos de Z(G) e a substituição', () => {
    expect(formatarTermoDoIndiceLatex(24n, [[5, 2]])).toBe('24X_5^{2}')
    expect(formatarTermoDoIndiceLatex(1n, [[1, 10]])).toBe('X_1^{10}')
    expect(formatarTermoDoIndiceLatex(1n, [])).toBe('1')
    expect(
      formatarSubstituicaoLatex(10n, [
        [1, 4],
        [2, 3],
      ]),
    ).toBe('10(1+c)^{4}(1+c^{2})^{3}')
    expect(formatarSubstituicaoLatex(24n, [[5, 2]])).toBe('24(1+c^{5})^{2}')
  })

  it('escrevem polinómios e somas em linhas', () => {
    expect(termosDoPolinomioLatex([1n, 1n, 2n, 0n, 1n])).toEqual(['1', 'c', '2c^{2}', 'c^{4}'])
    expect(formatarSomaEmLinhasLatex('S =', ['a', 'b', 'c'], 2)).toBe(
      String.raw`\begin{aligned} S = &a + b \\ &+ c \end{aligned}`,
    )
  })
})
