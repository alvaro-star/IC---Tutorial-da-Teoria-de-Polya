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
  }>(),
  { arestas: undefined, direcionado: false, raio: 150, altura: '400px' },
)

const vertices = computed(() => verticesDe(props.n))

// Pares de K_n: só calculados quando o chamador não fornece `arestas`.
const pairs = computed(() => props.arestas ?? paresDe(props.n))

const nodes = computed(() => {
  const result: Record<string, { name: string }> = {}
  for (const v of vertices.value) {
    result[`v${v}`] = { name: String(v) }
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
const COR_VERTICE = '#3b63d6'
const COR_ARESTA = '#9097a3'

const configs = computed(() => {
  const pequeno = props.raio < 80
  return defineConfigs({
    // Sem zoom/pan: a roda do rato deve rolar a página, não o grafo.
    view: { panEnabled: false, zoomEnabled: false },
    node: {
      normal: { radius: pequeno ? 10 : 15, color: COR_VERTICE },
      hover: { radius: pequeno ? 11 : 16, color: COR_VERTICE },
      label: {
        visible: true,
        direction: 'center',
        color: '#ffffff',
        fontSize: pequeno ? 10 : 13,
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
