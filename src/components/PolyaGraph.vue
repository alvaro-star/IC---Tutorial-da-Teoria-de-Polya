<script setup lang="ts">
import { computed } from 'vue'
import { VNetworkGraph } from 'v-network-graph'
import 'v-network-graph/lib/style.css'

const props = defineProps<{ n: number }>()

const vertices = computed(() =>
  Array.from({ length: Math.max(0, Math.floor(props.n)) }, (_, i) => i + 1),
)

const pairs = computed(() => {
  const items = vertices.value
  const result: [number, number][] = []
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      result.push([items[i]!, items[j]!])
    }
  }
  return result
})

const nodes = computed(() => {
  const result: Record<string, { name: string }> = {}
  for (const v of vertices.value) {
    result[`v${v}`] = { name: String(v) }
  }
  return result
})

const edges = computed(() => {
  const result: Record<string, { source: string; target: string }> = {}
  pairs.value.forEach(([a, b], i) => {
    result[`e${i}`] = { source: `v${a}`, target: `v${b}` }
  })
  return result
})

const layouts = computed(() => {
  const count = vertices.value.length
  const radius = 150
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

const configs = {
  node: {
    label: { visible: true },
  },
}
</script>

<template>
  <div class="polya-graph">
    <VNetworkGraph :nodes="nodes" :edges="edges" :configs="configs" :layouts="layouts" class="graph" />
  </div>
</template>

<style scoped>
.polya-graph {
  border: 1px solid #ccc;
  border-radius: 4px;
}

.graph {
  width: 100%;
  height: 400px;
}
</style>
