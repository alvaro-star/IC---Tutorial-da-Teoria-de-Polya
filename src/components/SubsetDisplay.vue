<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ N: number }>()

const P = computed(() =>
  Array.from({ length: Math.max(0, Math.floor(props.N)) }, (_, i) => i + 1),
)

const subsetParVertices = computed(() => {
  const items = P.value
  const pairs: [number, number][] = []
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      pairs.push([items[i]!, items[j]!])
    }
  }
  return pairs
})

const pairsByFirstElement = computed(() => {
  const groups = new Map<number, [number, number][]>()
  for (const pair of subsetParVertices.value) {
    const key = pair[0]
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(pair)
  }
  return [...groups.entries()].sort(([a], [b]) => a - b)
})
</script>

<template>
  <div class="subset-display">
    <p class="summary">P = {{ P }}</p>

    <div class="pairs-grid">
      <div v-for="[first, pairs] in pairsByFirstElement" :key="first" class="pairs-col">
        <h3 class="col-title">{{ first }}</h3>
        <ul>
          <li v-for="([a, b], i) in pairs" :key="i">({{ a }}, {{ b }})</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.subset-display {
  padding: 1rem;
}

.summary {
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.pairs-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.pairs-col {
  min-width: 4rem;
}

.col-title {
  margin: 0 0 0.4rem;
  font-size: 0.9rem;
  color: #555;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.2rem;
}

.pairs-col ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-family: monospace;
  font-size: 0.9rem;
}
</style>
