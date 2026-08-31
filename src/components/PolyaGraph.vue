<script setup lang="ts">
import { computed } from 'vue'
import { VNetworkGraph, defineConfigs } from 'v-network-graph'
import 'v-network-graph/lib/style.css'

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

const vertices = computed(() =>
  Array.from({ length: Math.max(0, Math.floor(props.n)) }, (_, i) => i + 1),
)

// Pares de K_n: só usados quando o chamador não fornece `arestas`.
const paresCompletos = computed(() => {
  const items = vertices.value
  const result: [number, number][] = []
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      result.push([items[i]!, items[j]!])
    }
  }
  return result
})

const pairs = computed(() => props.arestas ?? paresCompletos.value)

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

const configs = computed(() =>
  defineConfigs({
    node: {
      label: { visible: true },
    },
    edge: {
      // `gap` afasta as arestas que ligam o mesmo par: sem isto, a->b e b->a
      // ficariam sobrepostas e só se veria uma seta.
      gap: props.direcionado ? 12 : 0,
      marker: {
        target: props.direcionado
          ? { type: 'arrow', width: 4, height: 4 }
          : { type: 'none' },
      },
    },
  }),
)
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
  border: 1px solid #ccc;
  border-radius: 4px;
}

.graph {
  width: 100%;
}
</style>
