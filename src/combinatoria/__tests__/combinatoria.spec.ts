import { describe, expect, it } from 'vitest'
import { fatorial as fatorialExato } from '@/combinatoria/comum/matematica'
import { gerarParticoesKPartes } from '@/combinatoria/gerarParticoesKPartes'
import { expandirPartes, gerarConfiguracoesUnicas } from '@/combinatoria/mathForms'
import { contarPermutacoesDoTipo } from '@/combinatoria/contarPermutacoesDoTipo'
import { contarParticoes } from '@/combinatoria/contarParticoes'
import {
  formatarBlocos,
  formatarImagensDaArestaLatex,
  formatarParticao,
  formatarParticaoLatex,
  formatarSomaLatex,
} from '@/combinatoria/formatadores'
import { grafoDoCiclo } from '@/combinatoria/grafoDoCiclo'
import { paresDe, paresPorMenorElemento, verticesDe } from '@/combinatoria/pares'

const fatorial = (m: number): number => (m <= 1 ? 1 : m * fatorial(m - 1))

// p(n) para n = 1..10.
const NUMERO_DE_PARTICOES = [1, 2, 3, 5, 7, 11, 15, 22, 30, 42]

describe('fatorial', () => {
  it('é exato, inclusive acima do limite de `number`', () => {
    expect(fatorialExato(0)).toBe(1n)
    expect(fatorialExato(1)).toBe(1n)
    expect(fatorialExato(5)).toBe(120n)
    expect(fatorialExato(20)).toBe(2432902008176640000n)
  })
})

describe('gerarParticoesKPartes', () => {
  it('gera p(n) partições quando k = n', () => {
    NUMERO_DE_PARTICOES.forEach((esperado, i) => {
      const n = i + 1
      expect(gerarParticoesKPartes(n, n)).toHaveLength(esperado)
    })
  })
})

describe('contarParticoes', () => {
  it('conta p(n) sem gerar as partições', () => {
    NUMERO_DE_PARTICOES.forEach((esperado, i) => {
      expect(contarParticoes(i + 1)).toBe(BigInt(esperado))
    })
    expect(contarParticoes(0)).toBe(1n)
    expect(contarParticoes(20)).toBe(627n)
    expect(contarParticoes(100)).toBe(190569292n)
  })

  it('coincide com o tamanho da lista gerada', () => {
    for (let n = 1; n <= 15; n++) {
      expect(contarParticoes(n)).toBe(BigInt(gerarParticoesKPartes(n, n).length))
    }
  })
})

describe('contarPermutacoesDoTipo', () => {
  it('coincide com o número de configurações geradas, para n ≤ 7', () => {
    for (let n = 1; n <= 7; n++) {
      for (const particao of gerarParticoesKPartes(n, n)) {
        const geradas = gerarConfiguracoesUnicas(n, expandirPartes(particao))
        expect(contarPermutacoesDoTipo(particao)).toBe(BigInt(geradas.length))
      }
    }
  })

  it('somada sobre as partições de n dá n!', () => {
    for (let n = 1; n <= 10; n++) {
      const soma = gerarParticoesKPartes(n, n).reduce(
        (total, particao) => total + contarPermutacoesDoTipo(particao),
        0n,
      )
      expect(soma).toBe(BigInt(fatorial(n)))
    }
  })

  it('é exata acima do limite de `number` (o 20-ciclo tem 19! permutações)', () => {
    expect(contarPermutacoesDoTipo({ alfa: [20], lamb: [1] })).toBe(121645100408832000n)
  })
})

describe('gerarConfiguracoesUnicas', () => {
  it('não repete configurações', () => {
    for (const particao of gerarParticoesKPartes(6, 6)) {
      const geradas = gerarConfiguracoesUnicas(6, expandirPartes(particao))
      expect(new Set(geradas).size).toBe(geradas.length)
    }
  })
})

describe('formatadores', () => {
  const particao = { alfa: [6, 3, 1], lamb: [2, 10, 1] }

  it('formatam partições em texto e em LaTeX', () => {
    expect(formatarParticao(particao)).toBe('X_6^2 X_3^10 X_1^1')
    expect(formatarParticaoLatex(particao)).toBe(String.raw`X_{6}^{2}\,X_{3}^{10}\,X_{1}^{1}`)
    expect(formatarSomaLatex({ alfa: [3, 1], lamb: [1, 2] })).toBe('3 + 1 + 1')
  })

  it('formatarSomaLatex coincide com expandirPartes', () => {
    for (const p of gerarParticoesKPartes(8, 8)) {
      expect(formatarSomaLatex(p)).toBe(expandirPartes(p).join(' + '))
    }
  })

  it('escrevem a aplicação de σ aos extremos com a notação σ(i)', () => {
    expect(formatarImagensDaArestaLatex([1, 3], [2, 4])).toBe(
      String.raw`\{\sigma(1),\,\sigma(3)\} = \{2,\,4\}`,
    )
  })

  it('formatam ciclos sem separador', () => {
    expect(formatarBlocos([[1, 3], [2, 4], [5]])).toBe('(1 3)(2 4)(5)')
  })
})

describe('grafoDoCiclo', () => {
  it('aceita a forma textual e a forma crua, sem laços nos pontos fixos', () => {
    const esperado = {
      vertices: [1, 2, 3, 4, 5],
      arestas: [
        [1, 2],
        [2, 1],
        [3, 4],
        [4, 5],
        [5, 3],
      ],
      isolados: [],
    }
    expect(grafoDoCiclo('(1 2)(3 4 5)')).toEqual(esperado)
    expect(
      grafoDoCiclo([
        [1, 2],
        [3, 4, 5],
      ]),
    ).toEqual(esperado)
    expect(grafoDoCiclo('(1)(2 3)').isolados).toEqual([1])
  })
})

describe('pares', () => {
  it('gera os C(n, 2) pares i < j', () => {
    expect(verticesDe(4)).toEqual([1, 2, 3, 4])
    expect(paresDe(4)).toEqual([
      [1, 2],
      [1, 3],
      [1, 4],
      [2, 3],
      [2, 4],
      [3, 4],
    ])
    expect(paresDe(10)).toHaveLength(45)
    expect(paresDe(0)).toEqual([])
  })

  it('agrupa os pares pelo menor elemento, sem repetir nenhum', () => {
    expect(paresPorMenorElemento(4)).toEqual([
      [
        [1, 2],
        [1, 3],
        [1, 4],
      ],
      [
        [2, 3],
        [2, 4],
      ],
      [[3, 4]],
    ])
    expect(paresPorMenorElemento(10).flat()).toEqual(paresDe(10))
    expect(paresPorMenorElemento(1)).toEqual([])
  })
})
