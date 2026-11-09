/**
 * Do índice de ciclos das arestas Z(G) ao inventário de Pólya p(c).
 *
 *   Z(G) = 1/n! · Σ_λ N(λ) · T(σ*_λ)
 *
 * percorre as partições λ de n (os tipos cíclicos de σ). Com duas cores por
 * aresta — 0 (ausente, peso 1) e 1 (presente, peso c) —, o Teorema de Pólya
 * diz que trocar cada X_i por 1 + c^i em Z(G) dá p(c): o coeficiente de c^k
 * é o número de grafos simples não isomorfos com n vértices e k arestas.
 */
import { contarPermutacoesDoTipo } from '@/combinatoria/contarPermutacoesDoTipo'
import { tipoInduzidoDoTipo } from '@/combinatoria/acaoInduzida'
import { fatorial } from '@/combinatoria/comum/matematica'
import {
  dividirExato,
  escalar,
  multiplicar,
  potencia,
  somar,
  type Polinomio,
} from '@/combinatoria/comum/polinomios'
import { gerarParticoesKPartes, type Particao } from '@/combinatoria/gerarParticoesKPartes'
import { expandirPartes } from '@/combinatoria/mathForms'

/** Um termo de Z(G): um tipo cíclico de σ, quantas permutações o têm e T(σ*). */
export interface TermoDoIndice {
  particao: Particao
  /** N(λ). */
  quantidade: bigint
  /** T(σ*), como pares [comprimento, quantidade]. */
  tipoInduzido: [number, number][]
  /** N(λ) · T(σ*) com cada X_i trocado por 1 + c^i, já expandido. */
  polinomio: Polinomio
}

export interface InventarioDeGrafos {
  termos: TermoDoIndice[]
  /** n!, o denominador de Z(G). */
  denominador: bigint
  /** Σ N(λ) · ∏ (1 + c^i)^k, antes de dividir por n!. */
  soma: Polinomio
  /** p(c) = soma / n!. */
  resultado: Polinomio
}

/** ∏ (1 + c^ℓ)^k para um tipo cíclico [[ℓ, k], …]. Sem ciclos, dá 1. */
export const substituirNoTipo = (tipo: [number, number][]): Polinomio =>
  tipo.reduce<Polinomio>(
    (produto, [comprimento, quantidade]) => {
      const umMaisC: Polinomio = Array.from({ length: comprimento + 1 }, (_, k) =>
        k === 0 || k === comprimento ? 1n : 0n,
      )
      return multiplicar(produto, potencia(umMaisC, quantidade))
    },
    [1n],
  )

/** Z(G) e p(c) para os grafos simples com n vértices. */
export const inventarioDeGrafos = (n: number): InventarioDeGrafos => {
  const particoes = n < 1 ? [] : gerarParticoesKPartes(n, n)
  const termos = particoes.map((particao): TermoDoIndice => {
    const quantidade = contarPermutacoesDoTipo(particao)
    const tipoInduzido = tipoInduzidoDoTipo(expandirPartes(particao)).tipo
    return {
      particao,
      quantidade,
      tipoInduzido,
      polinomio: escalar(substituirNoTipo(tipoInduzido), quantidade),
    }
  })
  const denominador = fatorial(n)
  const soma = termos.reduce<Polinomio>((total, termo) => somar(total, termo.polinomio), [])
  return { termos, denominador, soma, resultado: dividirExato(soma, denominador) }
}
