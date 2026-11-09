<script setup lang="ts">
import { computed } from 'vue'
import MathTex from '@/components/MathTex.vue'
import { paresDe, paresPorMenorElemento, verticesDe } from '@/combinatoria/pares'

const props = defineProps<{ N: number }>()

const S = computed(() => verticesDe(props.N))

const subsetParVertices = computed(() => paresDe(props.N))

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

/*
 * D_N² escrito por extenso, uma linha por menor elemento: a linha i tem os
 * pares {i, j}, j > i. É uma tabela em escada — a coluna é o segundo
 * elemento (j = 2..N), por isso a linha i deixa vazias as colunas j ≤ i e
 * {1,j}, {2,j}, … ficam alinhados na vertical.
 */
const conjuntoDePares = computed(() => {
  const n = S.value.length
  const titulo = `D_{${n}}^{2} =`
  const linhas = paresPorMenorElemento(n)
  if (linhas.length === 0) return `${titulo} \\varnothing`

  const total = subsetParVertices.value.length
  let escritos = 0
  const corpo = linhas
    .map((linha) => {
      const i = linha[0]![0]
      // Colunas j = 2..i ficam vazias; depois vêm os pares desta linha.
      const vazias = Array.from({ length: i - 1 }, () => '')
      const celulas = linha.map(([a, b]) => {
        escritos++
        const virgula = escritos < total ? ',' : ''
        return `\\{${a},\\,${b}\\}${virgula}`
      })
      return [...vazias, ...celulas].join(' & ')
    })
    .join(' \\\\[3pt] ')

  return `${titulo} \\left\\{ \\begin{array}{${'l'.repeat(n - 1)}} ${corpo} \\end{array} \\right\\}`
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
        ou seja, o conjunto das arestas do grafo completo <MathTex expr="K_N" />. Observa-se que
        <MathTex :expr="'\\left| D_N^{2} \\right| = \\binom{N}{2}'" />; neste caso,
      </p>

      <p class="destaque"><MathTex :expr="cardinalidadeLatex" display /></p>

      <p>
        Escrito por extenso, com uma linha para cada vértice <MathTex expr="i" />: a linha
        <MathTex expr="i" /> tem os pares <MathTex expr="\{i, j\}" /> com <MathTex expr="j > i" />.
        Os pares com <MathTex expr="j < i" /> já apareceram numa linha anterior, por isso cada
        aresta é listada uma única vez.
      </p>
    </div>

    <div class="conjunto-pares">
      <MathTex :expr="conjuntoDePares" display />
    </div>
  </div>
</template>

<style scoped>
.summary {
  margin-bottom: 1rem;
}

.intro {
  max-width: var(--largura-texto);
  margin-bottom: 1rem;
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

/* Para N grande o conjunto é largo: o .katex-display (main.css) rola só na horizontal. */
.conjunto-pares {
  padding: 0.5rem 1rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}
</style>
