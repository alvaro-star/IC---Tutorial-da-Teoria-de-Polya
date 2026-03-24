<script setup lang="ts">
import { onMounted, ref } from 'vue'

/** Referência ao input nativo (valor não está em nenhum ref reativo). */
const nInputEl = ref<HTMLInputElement | null>(null)

/** Vértices: 1 .. n após clicar em aplicar. */
const P = ref<number[]>([1, 2, 3, 4])

const subsetParVertices = ref<[number, number][]>([])

function buildSubsetParVertices() {
  const items = P.value
  const pairs: [number, number][] = []
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i]!
      const b = items[j]!
      pairs.push([a, b])
    }
  }
  subsetParVertices.value = pairs
}

function applyNAndRebuild() {
  const raw = nInputEl.value?.value
  const n = raw === undefined || raw === '' ? NaN : Number(raw)
  if (!Number.isFinite(n) || n < 1) return
  const max = Math.floor(n)
  P.value = Array.from({ length: max }, (_, i) => i + 1)
  buildSubsetParVertices()
}

onMounted(() => {
  buildSubsetParVertices()
})
</script>

<template>
  <main class="polia-demo">
    <h1>Polia — demonstração</h1>
    <div class="controls">
      <label>
        N (1 … N)
        <input
          ref="nInputEl"
          type="number"
          min="1"
          step="1"
          placeholder="ex.: 5"
        />
      </label>
      <button type="button" @click="applyNAndRebuild">Aplicar</button>
    </div>
    <p>P = {{ P }}</p>
    <p>Subconjuntos (pares): {{ subsetParVertices }}</p>
  </main>
</template>

<style scoped>
.polia-demo {
  padding: 1rem;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.controls label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}

.controls input {
  min-width: 6rem;
}
</style>
