<script setup lang="ts">
import MathTex from '@/components/MathTex.vue'
import PolyaGraph from '@/components/PolyaGraph.vue'
import SubsetDisplay from '@/components/SubsetDisplay.vue'
import PartitionDisplay from '@/components/PartitionDisplay.vue'
import CollapsibleSection from '@/components/CollapsibleSection.vue'
import { ref } from 'vue'

const nVerticesInput = ref<HTMLInputElement | null>(null)
const N = ref(5)

// 4 arestas direcionadas: o ciclo 1 -> 2 -> 3 -> 4 -> 1.
const arestasDirigidas: [number, number][] = [
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 1],
]

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

    <div class="controls">
      <label>
        N (1 … N)
        <input ref="nVerticesInput" type="number" min="1" step="1" placeholder="ex.: 5" />
      </label>
      <button type="button" @click="apply">Aplicar</button>
    </div>

    <p class="intro">
      Considere o conjunto
      <MathTex :expr="`S = \\{1, 2, \\ldots, ${N}\\}`" />, formado pelos
      <MathTex :expr="String(N)" /> primeiros inteiros positivos. Ao longo deste
      texto, os elementos de <MathTex expr="S" /> são os vértices do grafo que
      iremos considerar.
    </p>

    <CollapsibleSection titulo="Subconjuntos de pares" :dica="`S = {1 … ${N}}`">
      <SubsetDisplay :N="N" />
    </CollapsibleSection>

    <CollapsibleSection titulo="Grafo direcionado" dica="4 arestas: 1 → 2 → 3 → 4 → 1">
      <PolyaGraph :n="N" direcionado :arestas="arestasDirigidas" />
    </CollapsibleSection>

    <CollapsibleSection titulo="Partições" :dica="`de ${N}`">
      <PartitionDisplay :N="N" />
    </CollapsibleSection>
  </main>
</template>

<style scoped>
/* A margem lateral vem do #app (main.css); aqui só o espaçamento vertical. */
.polia-demo {
  padding: 1rem 0;
}

.intro {
  max-width: 60ch;
  margin-bottom: 1.25rem;
  font-size: 0.95rem;
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
