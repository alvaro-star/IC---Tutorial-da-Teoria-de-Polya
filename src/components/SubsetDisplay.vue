<script setup lang="ts">
import { computed } from 'vue'
import MathTex from '@/components/MathTex.vue'
import CollapsibleSection from '@/components/CollapsibleSection.vue'

const props = defineProps<{ N: number }>()

const S = computed(() => Array.from({ length: Math.max(0, Math.floor(props.N)) }, (_, i) => i + 1))

const subsetParVertices = computed(() => {
  const items = S.value
  const pairs: [number, number][] = []
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      pairs.push([items[i]!, items[j]!])
    }
  }
  return pairs
})

// S = {1, 2, ..., N} em LaTeX.
const conjuntoLatex = computed(() => `S = \\{${S.value.join(',\\; ')}\\}`)

// Definição do conjunto de arestas sobre os N vértices de S.
const definicaoArestasLatex =
  'D_N^{2} = \\left\\{ \\{i,j\\} \\;:\\; 1 \\leq i < j \\leq N \\right\\}'

// A mesma definição instanciada no N atual, com a cardinalidade concreta.
const cardinalidadeLatex = computed(
  () =>
    `\\left| D_{${S.value.length}}^{2} \\right| = \\binom{${S.value.length}}{2} = ${subsetParVertices.value.length}`,
)

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
    <p class="summary"><MathTex :expr="conjuntoLatex" /></p>

    <div class="intro">
      <p>
        O conjunto de arestas que iremos considerar, formado pelos
        <MathTex expr="N" /> vértices (onde <MathTex expr="N" /> é o valor da input — neste caso,
        <MathTex :expr="String(S.length)" />), é
      </p>

      <p class="destaque"><MathTex :expr="definicaoArestasLatex" display /></p>

      <p>
        ou seja, o conjunto das arestas do grafo completo
        <MathTex expr="K_N" />. Observa-se que
        <MathTex :expr="'\\left| D_N^{2} \\right| = \\binom{N}{2}'" />. Cada par listado abaixo é,
        portanto, um elemento de <MathTex expr="D_N^{2}" />:
      </p>

      <p class="destaque"><MathTex :expr="cardinalidadeLatex" display /></p>
    </div>

    <div class="pairs-grid">
      <CollapsibleSection
        v-for="[first, pairs] in pairsByFirstElement"
        :key="first"
        class="pairs-col"
        compacta
        :dica="`${pairs.length}`"
      >
        <template #titulo>
          <MathTex :expr="String(first)" />
        </template>
        <ul>
          <li v-for="([a, b], i) in pairs" :key="i">
            <MathTex :expr="`\\{${a},\\, ${b}\\}`" />
          </li>
        </ul>
      </CollapsibleSection>
    </div>
  </div>
</template>

<style scoped>
.summary {
  margin-bottom: 1rem;
}

.intro {
  max-width: var(--largura-texto);
  margin-bottom: 1.5rem;
  color: var(--ink-soft);
}

.intro p {
  margin-bottom: 0.5rem;
}

.destaque {
  margin: 0.75rem 0;
  padding: 0.25rem 1rem;
  border-radius: var(--radius);
  background: var(--surface-sunken);
  color: var(--ink);
}

.pairs-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0 1.5rem;
}

.pairs-col {
  min-width: 6rem;
}

.pairs-col ul {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.92rem;
}
</style>
