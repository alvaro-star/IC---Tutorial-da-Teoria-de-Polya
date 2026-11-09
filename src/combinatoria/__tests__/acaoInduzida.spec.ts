import { describe, expect, it } from 'vitest'
import {
  ciclosDaAcaoInduzida,
  classesDeArestas,
  contribuicaoPrevista,
  grafoDaAcaoInduzida,
  tipoInduzidoDoTipo,
  ciclosDaPermutacao,
  imagensDasArestas,
  lerPermutacao,
  permutacaoDosCiclos,
} from '@/combinatoria/acaoInduzida'
import { decomporEmCiclos, mdc, mmc, tipoCiclico } from '@/combinatoria/comum/matematica'
import { formatarTipoCiclicoLatex } from '@/combinatoria/formatadores'
import { gerarParticoesKPartes } from '@/combinatoria/gerarParticoesKPartes'
import { expandirPartes, representanteDoTipo } from '@/combinatoria/mathForms'
import { exemplosN5 } from '@/views/Teoria/exemplosN5'

const sigmaDe = (texto: string, n: number) => {
  const leitura = lerPermutacao(texto, n)
  if (!leitura.ok) throw new Error(leitura.erro)
  return leitura.sigma
}

describe('lerPermutacao', () => {
  it('lê ciclos e completa os pontos fixos', () => {
    expect(sigmaDe('(1 2)(3 4 5)', 5)).toEqual([0, 2, 1, 4, 5, 3])
    expect(sigmaDe('(1 3)', 4)).toEqual([0, 3, 2, 1, 4])
    expect(sigmaDe('  (2)  ', 3)).toEqual([0, 1, 2, 3])
  })

  it('recusa entradas inválidas', () => {
    for (const texto of ['', '1 2', '(1 2', '(1 a)', '()', '(1 2)(2 3)', '(1 6)', '(0 1)']) {
      expect(lerPermutacao(texto, 5).ok).toBe(false)
    }
  })
})

describe('decomporEmCiclos e tipoCiclico', () => {
  it('decompõem uma permutação qualquer', () => {
    const sigma = permutacaoDosCiclos(
      [
        [1, 2],
        [3, 4, 5],
      ],
      6,
    )
    expect(ciclosDaPermutacao(sigma, 6)).toEqual([[1, 2], [3, 4, 5], [6]])
    expect(tipoCiclico(ciclosDaPermutacao(sigma, 6))).toEqual([
      [1, 1],
      [2, 1],
      [3, 1],
    ])
    expect(
      decomporEmCiclos(
        ['a', 'b', 'c'],
        (x) => ({ a: 'b', b: 'a', c: 'c' })[x]!,
        (x) => x,
      ),
    ).toEqual([['a', 'b'], ['c']])
  })
})

describe('ação induzida σ*', () => {
  it('aplica σ a cada aresta: σ*({i,j}) = {σ(i), σ(j)}', () => {
    const linhas = imagensDasArestas(sigmaDe('(1 2)(3 4 5)', 5), 5)
    expect(linhas).toHaveLength(10)
    expect(linhas[0]).toEqual({ aresta: [1, 2], imagens: [2, 1], imagem: [1, 2], fixa: true })
    expect(linhas.find((l) => l.aresta[0] === 1 && l.aresta[1] === 3)).toEqual({
      aresta: [1, 3],
      imagens: [2, 4],
      imagem: [2, 4],
      fixa: false,
    })
  })

  it('reproduz T(σ*) dos sete casos de m = 5 calculados à mão', () => {
    for (const exemplo of exemplosN5) {
      const sigma = permutacaoDosCiclos(exemplo.sigma, 5)
      const tipo = tipoCiclico(ciclosDaAcaoInduzida(sigma, 5))
      expect(formatarTipoCiclicoLatex(tipo), exemplo.particao).toBe(exemplo.resultado)
    }
  })

  it('é uma permutação das C(n, 2) arestas, para todo tipo de n = 6', () => {
    for (const particao of gerarParticoesKPartes(6, 6)) {
      const sigma = permutacaoDosCiclos(representanteDoTipo(6, expandirPartes(particao)), 6)
      const imagens = imagensDasArestas(sigma, 6).map((l) => l.imagem.join('-'))
      expect(new Set(imagens).size).toBe(15)
      expect(ciclosDaAcaoInduzida(sigma, 6).flat()).toHaveLength(15)
    }
  })

  it('sem arestas (n = 1), T(σ*) é 1', () => {
    expect(formatarTipoCiclicoLatex(tipoCiclico(ciclosDaAcaoInduzida([0, 1], 1)))).toBe('1')
  })
})

describe('representanteDoTipo', () => {
  it('dá a primeira permutação do tipo', () => {
    expect(representanteDoTipo(5, [3, 2])).toEqual([
      [1, 2],
      [3, 4, 5],
    ])
    expect(representanteDoTipo(4, [1, 1, 1, 1])).toEqual([[1], [2], [3], [4]])
  })
})

describe('mdc e mmc', () => {
  it('calculam divisor e múltiplo comuns', () => {
    expect([mdc(4, 6), mmc(4, 6)]).toEqual([2, 12])
    expect([mdc(2, 3), mmc(2, 3)]).toEqual([1, 6])
    expect([mdc(5, 5), mmc(5, 5)]).toEqual([5, 5])
    expect([mdc(1, 7), mmc(1, 7)]).toEqual([1, 7])
  })
})

describe('classes de arestas (só a partir dos ciclos de σ)', () => {
  it('dividem (1 2)(3 4 5) como no relatório', () => {
    const classes = classesDeArestas(sigmaDe('(1 2)(3 4 5)', 5), 5)
    expect(classes.map((c) => [c.tipo, c.arestas.length])).toEqual([
      ['interna', 1],
      ['interna', 3],
      ['entre', 6],
    ])
    expect(classes.map((c) => formatarTipoCiclicoLatex(contribuicaoPrevista(c)))).toEqual([
      'X_1',
      'X_3',
      'X_6',
    ])
  })

  it('a fórmula das Proposições 1 e 2 coincide com os ciclos reais, para todo tipo de n ≤ 8', () => {
    for (let n = 1; n <= 8; n++) {
      for (const particao of gerarParticoesKPartes(n, n)) {
        const sigma = permutacaoDosCiclos(representanteDoTipo(n, expandirPartes(particao)), n)
        const classes = classesDeArestas(sigma, n)

        // As classes cobrem cada aresta exatamente uma vez.
        const todas = classes.flatMap((c) => c.arestas.map((a) => a.join('-')))
        expect(todas).toHaveLength((n * (n - 1)) / 2)
        expect(new Set(todas).size).toBe(todas.length)

        for (const classe of classes) {
          expect(tipoCiclico(classe.ciclosInduzidos)).toEqual(contribuicaoPrevista(classe))
        }

        // O produto das contribuições é T(σ*).
        expect(tipoCiclico(classes.flatMap((c) => c.ciclosInduzidos))).toEqual(
          tipoCiclico(ciclosDaAcaoInduzida(sigma, n)),
        )
      }
    }
  })
})

describe('tipoInduzidoDoTipo (só os comprimentos)', () => {
  it('agrupa as contribuições pelas Observações 2 e 3', () => {
    const { contribuicoes, tipo } = tipoInduzidoDoTipo([3, 1, 1])
    expect(contribuicoes.map((c) => [c.tipo, c.comprimentos, c.vezes])).toEqual([
      ['interna', [3], 1],
      ['entre', [1, 1], 1],
      ['entre', [1, 3], 2],
    ])
    expect(formatarTipoCiclicoLatex(tipo)).toBe('X_1X_3^{3}')
  })

  it('coincide com σ* calculada aresta a aresta, para todo tipo de n ≤ 9', () => {
    for (let n = 1; n <= 9; n++) {
      for (const particao of gerarParticoesKPartes(n, n)) {
        const partes = expandirPartes(particao)
        const sigma = permutacaoDosCiclos(representanteDoTipo(n, partes), n)
        expect(tipoInduzidoDoTipo(partes).tipo).toEqual(tipoCiclico(ciclosDaAcaoInduzida(sigma, n)))
      }
    }
  })
})

describe('grafoDaAcaoInduzida', () => {
  it('tem um vértice por aresta de K_n e uma seta por aresta que se move', () => {
    const grafo = grafoDaAcaoInduzida(sigmaDe('(1 2)', 3), 3)
    expect(grafo.vertices).toBe(3)
    expect(grafo.rotulos).toEqual(['1,2', '1,3', '2,3'])
    // {1,3} (2.º) <-> {2,3} (3.º); {1,2} (1.º) fica fixa, sem laço.
    expect(grafo.arestas).toEqual([
      [2, 3],
      [3, 2],
    ])
  })

  it('os ciclos do grafo são os ciclos de σ*, para todo tipo de n = 6', () => {
    for (const particao of gerarParticoesKPartes(6, 6)) {
      const sigma = permutacaoDosCiclos(representanteDoTipo(6, expandirPartes(particao)), 6)
      const grafo = grafoDaAcaoInduzida(sigma, 6)
      const destino = new Map(grafo.arestas.map(([de, para]) => [de, para]))
      const vertices = Array.from({ length: grafo.vertices }, (_, k) => k + 1)
      const ciclos = decomporEmCiclos(
        vertices,
        (v) => destino.get(v) ?? v,
        (v) => String(v),
      )
      expect(tipoCiclico(ciclos)).toEqual(tipoCiclico(ciclosDaAcaoInduzida(sigma, 6)))
    }
  })
})
