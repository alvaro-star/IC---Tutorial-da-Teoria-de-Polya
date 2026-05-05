<script setup lang="ts">
import PolyaGraph from '@/components/PolyaGraph.vue'
import SubsetDisplay from '@/components/SubsetDisplay.vue'
import { ref } from 'vue'

const nVerticesInput = ref<HTMLInputElement | null>(null)
const N = ref(5)

const apply = () => {
  const raw = nVerticesInput.value?.value
  const parsed = raw === undefined || raw === '' ? NaN : Number(raw)
  if (!Number.isFinite(parsed) || parsed < 1) return
  N.value = Math.floor(parsed)
}
</script>

<template>
  <main class="polia-demo">
    <h1>Polia — demonstração</h1>
    <SubsetDisplay :N="N" />
    <div class="controls">
      <label>
        N (1 … N)
        <input ref="nVerticesInput" type="number" min="1" step="1" placeholder="ex.: 5" />
      </label>
      <button type="button" @click="apply">Aplicar</button>
    </div>

    <PolyaGraph :n="N" />
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
