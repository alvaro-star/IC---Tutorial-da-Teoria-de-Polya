<script setup lang="ts">
import { computed } from 'vue'
import { VNetworkGraph, defineConfigs } from 'v-network-graph'
import 'v-network-graph/lib/style.css'
import { paresDe, verticesDe } from '@/combinatoria/pares'

/**
 * Grafo sobre os vértices {1..n}.
 *
 * Sem `arestas`, desenha o grafo completo K_n (todos os pares i < j) — o
 * comportamento original. Com `arestas`, desenha exatamente as que forem
 * passadas; nesse caso, com `direcionado`, cada par `[a, b]` é lido como a
 * aresta orientada a -> b e ganha uma seta na ponta.
 *
 * `rotulos` troca os números 1..n por outro texto (o grafo de σ* usa "1,2",
 * "1,3", … porque os seus vértices são arestas de K_n); `cor` distingue os
 * dois grafos: azul para σ sobre os vértices, laranja para σ* sobre as arestas.
 */
const props = withDefaults(
  defineProps<{
    n: number
    /** Arestas explícitas; se omitido, usa todos os pares de K_n. */
    arestas?: [number, number][]
    /** Desenha setas e separa arestas antiparalelas (a->b e b->a). */
    direcionado?: boolean
    /** Raio do círculo onde os vértices são dispostos. */
    raio?: number
    /** Altura da caixa do grafo, em CSS. */
    altura?: string
    /** Rótulo de cada vértice (o vértice v usa `rotulos[v - 1]`); por omissão, o número. */
    rotulos?: string[]
    /** `azul` (σ, por omissão) ou `laranja` (σ*). */
    cor?: 'azul' | 'laranja'
  }>(),
  {
    arestas: undefined,
    direcionado: false,
    raio: 150,
    altura: '400px',
    rotulos: undefined,
    cor: 'azul',
  },
)

const vertices = computed(() => verticesDe(props.n))

// Pares de K_n: só calculados quando o chamador não fornece `arestas`.
const pairs = computed(() => props.arestas ?? paresDe(props.n))

const nodes = computed(() => {
  const result: Record<string, { name: string }> = {}
  for (const v of vertices.value) {
    result[`v${v}`] = { name: props.rotulos?.[v - 1] ?? String(v) }
  }
  return result
})

// A chave inclui a orientação: num grafo direcionado a->b e b->a são arestas
// distintas e precisam de entradas separadas.
const edges = computed(() => {
  const result: Record<string, { source: string; target: string }> = {}
  pairs.value.forEach(([a, b]) => {
    result[`e${a}-${b}`] = { source: `v${a}`, target: `v${b}` }
  })
  return result
})

const layouts = computed(() => {
  const count = vertices.value.length
  const radius = props.raio
  const nodes: Record<string, { x: number; y: number }> = {}
  vertices.value.forEach((v, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2
    nodes[`v${v}`] = {
      x: Math.round(radius * Math.cos(angle)),
      y: Math.round(radius * Math.sin(angle)),
    }
  })
  return { nodes }
})

// Cores fixas (o SVG do v-network-graph não lê variáveis CSS): escolhidas
// para funcionar tanto no tema claro como no escuro. O rótulo fica dentro do
// vértice, em branco, para não depender da cor de fundo.
const CORES = {
  azul: { vertice: '#3b63d6', aresta: '#9097a3' },
  laranja: { vertice: '#e8590c', aresta: '#e3a27a' },
} as const

const configs = computed(() => {
  const pequeno = props.raio < 80
  const { vertice: COR_VERTICE, aresta: COR_ARESTA } = CORES[props.cor]
  // Rótulos com mais de 2 caracteres ("1,2") precisam de vértices maiores e letra menor.
  const longo = (props.rotulos ?? []).some((rotulo) => rotulo.length > 2)
  const raioDoVertice = longo ? (pequeno ? 13 : 18) : pequeno ? 10 : 15
  const tamanhoDaLetra = longo ? (pequeno ? 8 : 11) : pequeno ? 10 : 13
  return defineConfigs({
    // Sem zoom/pan: a roda do rato deve rolar a página, não o grafo.
    view: { panEnabled: false, zoomEnabled: false },
    node: {
      normal: { radius: raioDoVertice, color: COR_VERTICE },
      hover: { radius: raioDoVertice + 1, color: COR_VERTICE },
      label: {
        visible: true,
        direction: 'center',
        color: '#ffffff',
        fontSize: tamanhoDaLetra,
        fontFamily: 'Inter Variable, Inter, sans-serif',
      },
    },
    edge: {
      normal: { color: COR_ARESTA, width: pequeno ? 1.5 : 2 },
      hover: { color: COR_VERTICE, width: pequeno ? 1.5 : 2 },
      // `gap` afasta as arestas que ligam o mesmo par: sem isto, a->b e b->a
      // ficariam sobrepostas e só se veria uma seta.
      gap: props.direcionado ? 12 : 0,
      marker: {
        target: props.direcionado ? { type: 'arrow', width: 4, height: 4 } : { type: 'none' },
      },
    },
  })
})
</script>

<template>
  <div class="polya-graph">
    <VNetworkGraph
      :nodes="nodes"
      :edges="edges"
      :configs="configs"
      :layouts="layouts"
      class="graph"
      :style="{ height: altura }"
    />
  </div>
</template>

<style scoped>
.polya-graph {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
}

.graph {
  width: 100%;
}
</style>
