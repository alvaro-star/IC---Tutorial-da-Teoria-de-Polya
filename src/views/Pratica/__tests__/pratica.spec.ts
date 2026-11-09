import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AcaoInduzida from '../components/AcaoInduzida.vue'
import InducedPartitionDisplay from '../components/InducedPartitionDisplay.vue'
import InventarioPolya from '../components/InventarioPolya.vue'
import SubsetDisplay from '../components/SubsetDisplay.vue'

// `katex-error` é a classe que o KaTeX põe numa expressão que não conseguiu ler.

describe('SubsetDisplay', () => {
  it('renderiza o conjunto de pares sem erros de LaTeX', () => {
    for (const N of [1, 2, 5, 10]) {
      expect(mount(SubsetDisplay, { props: { N } }).html(), `N=${N}`).not.toContain('katex-error')
    }
  })
})

describe('AcaoInduzida', () => {
  it('renderiza para vários N e várias σ', async () => {
    for (const N of [1, 2, 3, 5, 8]) {
      expect(mount(AcaoInduzida, { props: { N } }).html(), `N=${N}`).not.toContain('katex-error')
    }
    const w = mount(AcaoInduzida, { props: { N: 6 } })
    for (const sigma of ['(1 2 3 4)', '(1 2 3 4 5 6)', '(1)', '(1 2)(3 4)(5 6)']) {
      await w.find('input').setValue(sigma)
      await w.find('form').trigger('submit')
      expect(w.html(), sigma).not.toContain('katex-error')
    }
  })

  it('mostra o erro de leitura de σ', async () => {
    const w = mount(AcaoInduzida, { props: { N: 5 } })
    await w.find('input').setValue('(1 9)')
    await w.find('form').trigger('submit')
    expect(w.find('[role=alert]').text()).toContain('1 a 5')
  })

  it('com p(N) > 600 tipos, o menu de exemplos espera pelo alerta', () => {
    const w = mount(AcaoInduzida, { props: { N: 20 } })
    expect(w.find('[role=alert]').text()).toContain('627')
    expect(w.find('select').exists()).toBe(false)
  })
})

describe('InducedPartitionDisplay', () => {
  it('abre todas as linhas de N = 5 com a explicação e os 120 grafos', async () => {
    const w = mount(InducedPartitionDisplay, { props: { N: 5 } })
    for (const botao of w.findAll('button.cabecalho')) await botao.trigger('click')
    expect(w.html()).not.toContain('katex-error')
    expect(w.findAll('.explicacao')).toHaveLength(7)
    expect(w.findAll('.configuracao')).toHaveLength(120)
  })

  it('cada permutação tem o grafo de σ e, ao lado, o grafo laranja de σ*', async () => {
    const w = mount(InducedPartitionDisplay, { props: { N: 5 } })
    for (const botao of w.findAll('button.cabecalho')) await botao.trigger('click')
    const pares = w.findAll('.par-de-grafos')
    expect(pares).toHaveLength(120)
    for (const par of pares) expect(par.findAll('.polya-graph')).toHaveLength(2)
    expect(w.findAll('.ponto.sigma-estrela')).toHaveLength(120)
  })

  it('os cabeçalhos não mostram ";" soltos (um \\; que perdeu a barra)', () => {
    const w = mount(InducedPartitionDisplay, { props: { N: 5 } })
    for (const cabecalho of w.findAll('button.cabecalho')) {
      expect(cabecalho.text()).not.toContain(';')
    }
  })

  it('acima de 600 permutações, mostra a explicação e espera pelo alerta para os grafos', async () => {
    const w = mount(InducedPartitionDisplay, { props: { N: 9 } })
    await w.findAll('button.cabecalho')[0]!.trigger('click') // o 9-ciclo: 8! = 40 320
    expect(w.find('.explicacao').exists()).toBe(true)
    expect(w.find('[role=alert]').text()).toContain('40.320')
    expect(w.findAll('.configuracao')).toHaveLength(0)
  })
})

describe('InventarioPolya', () => {
  it('renderiza Z(G) -> p(c) sem erros de LaTeX', () => {
    for (const N of [1, 2, 3, 5, 8]) {
      const w = mount(InventarioPolya, { props: { N } })
      expect(w.html(), `N=${N}`).not.toContain('katex-error')
    }
  })

  it('mostra os 34 grafos de N = 5, com uma barra por número de arestas', () => {
    const w = mount(InventarioPolya, { props: { N: 5 } })
    expect(w.findAll('.barras li')).toHaveLength(11)
    expect(w.findAll('.barra-valor').map((b) => b.text())).toEqual([
      '1',
      '1',
      '2',
      '4',
      '6',
      '6',
      '6',
      '4',
      '2',
      '1',
      '1',
    ])
    expect(w.find('.caixa').text()).toContain('34')
  })

  it('escreve o total grande com espaço fino entre os milhares', () => {
    const w = mount(InventarioPolya, { props: { N: 8 } })
    expect(w.find('.caixa').text()).toContain('12346')
    expect(w.find('.caixa').html()).not.toContain('katex-error')
  })
})
