<script setup lang="ts">
import MathTex from '@/components/MathTex.vue'
import PolyaGraph from '@/components/PolyaGraph.vue'
import SubsetDisplay from './components/SubsetDisplay.vue'
import PartitionDisplay from './components/PartitionDisplay.vue'
import CollapsibleSection from '@/components/CollapsibleSection.vue'
import AcaoInduzida from './components/AcaoInduzida.vue'
import InducedPartitionDisplay from './components/InducedPartitionDisplay.vue'
import InventarioPolya from './components/InventarioPolya.vue'
import { computed, ref } from 'vue'
import { contarParticoes } from '@/combinatoria/contarParticoes'

const nVerticesInput = ref<HTMLInputElement | null>(null)
const N = ref(5)

// 4 arestas direcionadas: o ciclo 1 -> 2 -> 3 -> 4 -> 1.
const arestasDirigidas: [number, number][] = [
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 1],
]

// O campo não é controlado: N só muda ao aplicar, digitar não recalcula nada.
// Registros de cada secção, para o alerta de listas grandes do CollapsibleSection.
const totalDeArestas = computed(() => (N.value * (N.value - 1)) / 2)
const numeroDeParticoes = computed(() => contarParticoes(N.value))

const apply = () => {
  const raw = nVerticesInput.value?.value
  const parsed = raw === undefined || raw === '' ? NaN : Number(raw)
  if (!Number.isFinite(parsed) || parsed < 1) return
  N.value = Math.floor(parsed)
}
</script>

<template>
  <main class="pagina demo">
    <header class="cabecalho-pagina">
      <p class="sobretitulo">Passo 2 · Prática</p>
      <h1>Demonstração interativa</h1>
      <p class="lead">
        Considere o conjunto <MathTex :expr="`S = \\{1, 2, \\ldots, ${N}\\}`" />, formado pelos
        <MathTex :expr="String(N)" /> primeiros inteiros positivos. Os elementos de
        <MathTex expr="S" /> são os vértices dos grafos que vamos considerar.
      </p>
    </header>

    <form class="controle" @submit.prevent="apply">
      <label for="campo-n">Número de vértices <MathTex expr="N" /></label>
      <div class="controle-linha">
        <input
          id="campo-n"
          ref="nVerticesInput"
          type="number"
          min="1"
          step="1"
          :value="N"
          inputmode="numeric"
        />
        <button type="submit" class="botao botao-primario">Aplicar</button>
      </div>
      <p class="controle-dica">
        No passo 3, as permutações de cada partição só são geradas ao abri-la. A partir de
        <MathTex expr="N = 8" />, algumas partições têm milhares de grafos e demoram a abrir.
      </p>
    </form>

    <CollapsibleSection
      :numero="1"
      titulo="Pares de vértices"
      :dica="`S = {1 … ${N}}`"
      :registros="totalDeArestas"
    >
      <SubsetDisplay :N="N" />
    </CollapsibleSection>

    <CollapsibleSection :numero="2" titulo="Grafo direcionado" dica="1 → 2 → 3 → 4 → 1">
      <p class="explicacao-passo">
        Um ciclo de uma permutação desenha-se como um grafo direcionado: cada vértice aponta para a
        sua imagem. Aqui, o ciclo <MathTex expr="(1\,2\,3\,4)" />.
      </p>
      <PolyaGraph :n="N" direcionado :arestas="arestasDirigidas" />
    </CollapsibleSection>

    <CollapsibleSection
      :numero="3"
      titulo="Partições e tipos cíclicos"
      :dica="`de ${N}`"
      :registros="numeroDeParticoes"
    >
      <PartitionDisplay :N="N" />
    </CollapsibleSection>

    <CollapsibleSection
      :numero="4"
      titulo="Ação induzida σ* sobre as arestas"
      dica="σ*({i, j}) = {σ(i), σ(j)}"
      :registros="totalDeArestas"
    >
      <AcaoInduzida :N="N" />
    </CollapsibleSection>

    <CollapsibleSection
      :numero="5"
      titulo="Tipos cíclicos induzidos"
      :dica="`T(σ) ↦ T(σ*), de ${N}`"
      :registros="numeroDeParticoes"
    >
      <InducedPartitionDisplay :N="N" />
    </CollapsibleSection>

    <CollapsibleSection
      :numero="6"
      titulo="De Z(G) ao inventário p(c)"
      dica="X_i ↦ 1 + c^i"
      :registros="numeroDeParticoes"
    >
      <InventarioPolya :N="N" />
    </CollapsibleSection>
  </main>
</template>

<style scoped>
.controle {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 1.25rem 1.4rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface-sunken);
}

.controle label {
  font-size: 0.9rem;
  font-weight: 500;
}

.controle-linha {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.controle-linha input {
  width: 7rem;
}

.controle-dica {
  color: var(--muted);
  font-size: 0.85rem;
}

.explicacao-passo {
  max-width: var(--largura-texto);
  margin-bottom: 1rem;
  color: var(--ink-soft);
}
</style>
