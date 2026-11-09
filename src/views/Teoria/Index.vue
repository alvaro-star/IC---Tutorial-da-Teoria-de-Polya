<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SlideDeck from './components/SlideDeck.vue'
import SlidesAbertura from './components/SlidesAbertura.vue'
import SlidesFundamentacao from './components/SlidesFundamentacao.vue'
import SlidesResultados from './components/SlidesResultados.vue'
import SlidesImplementacao from './components/SlidesImplementacao.vue'
import { exemplosN5 } from './exemplosN5'

/**
 * Explicação científica do projecto em slides, a partir do relatório final de
 * IC (PIVIC-FC, UFGD). Esta página só guarda a lista de slides e o slide
 * atual; o `SlideDeck` trata da moldura e da navegação, e o conteúdo está
 * nos componentes `Slides*`, um por bloco (`grupo`) do relatório.
 */
type Grupo = 'abertura' | 'fundamentacao' | 'resultados' | 'implementacao'

interface SlideDaExplicacao {
  id: string
  secao: string
  titulo: string
  /** Qual componente `Slides*` desenha este slide. */
  grupo: Grupo
}

const FUNDAMENTACAO = 'Materiais e métodos'
const RESULTADOS = 'Resultados e discussões'

const slides: SlideDaExplicacao[] = [
  {
    id: 'capa',
    grupo: 'abertura',
    secao: '',
    titulo: 'Enumeração de grafos via teoria de Pólya sob um ponto de vista computacional',
  },
  {
    id: 'introducao',
    grupo: 'abertura',
    secao: 'Introdução',
    titulo: 'Contar estruturas a menos de simetria',
  },
  {
    id: 'objetivos',
    grupo: 'abertura',
    secao: 'Objetivos',
    titulo: 'Objetivo geral e objetivos específicos',
  },
  {
    id: 'vertices-arestas',
    grupo: 'fundamentacao',
    secao: FUNDAMENTACAO,
    titulo: 'Vértices, arestas e o grafo completo',
  },
  {
    id: 'tipo-ciclico',
    grupo: 'fundamentacao',
    secao: FUNDAMENTACAO,
    titulo: 'Ciclos disjuntos e tipo cíclico',
  },
  {
    id: 'abordagens',
    grupo: 'fundamentacao',
    secao: FUNDAMENTACAO,
    titulo: 'Quantas permutações têm um dado tipo?',
  },
  {
    id: 'indice-sm',
    grupo: 'fundamentacao',
    secao: FUNDAMENTACAO,
    titulo: 'O índice de ciclos do grupo simétrico',
  },
  {
    id: 'grupo-induzido',
    grupo: 'fundamentacao',
    secao: FUNDAMENTACAO,
    titulo: 'A ação induzida sobre as arestas',
  },
  {
    id: 'proposicao-1',
    grupo: 'fundamentacao',
    secao: FUNDAMENTACAO,
    titulo: 'Caso 1 — arestas dentro de um ciclo',
  },
  {
    id: 'proposicao-2',
    grupo: 'fundamentacao',
    secao: FUNDAMENTACAO,
    titulo: 'Caso 2 — arestas entre ciclos distintos',
  },
  {
    id: 'teorema-1',
    grupo: 'fundamentacao',
    secao: FUNDAMENTACAO,
    titulo: 'Teorema 1 — o tipo cíclico induzido',
  },
  {
    id: 'teorema-2',
    grupo: 'fundamentacao',
    secao: FUNDAMENTACAO,
    titulo: 'Teorema 2 — o índice de ciclos das arestas',
  },
  {
    id: 'algoritmo',
    grupo: 'resultados',
    secao: RESULTADOS,
    titulo: 'O algoritmo via partições de um inteiro',
  },
  {
    id: 'discussao',
    grupo: 'resultados',
    secao: RESULTADOS,
    titulo: 'Partições em vez de permutações',
  },
  {
    id: 'tabela-n5',
    grupo: 'resultados',
    secao: RESULTADOS,
    titulo: 'Tipos cíclicos induzidos para m = 5',
  },
  ...exemplosN5.map((exemplo) => ({
    id: `exemplo-${exemplo.particao}`,
    secao: `${RESULTADOS} · execução manual, m = 5`,
    titulo: `Partição ${exemplo.particao}`,
    grupo: 'resultados' as const,
  })),
  {
    id: 'indice-n5',
    grupo: 'resultados',
    secao: RESULTADOS,
    titulo: 'O índice de ciclos das arestas de K₅',
  },
  {
    id: 'inventario',
    grupo: 'resultados',
    secao: RESULTADOS,
    titulo: 'Do índice de ciclos ao inventário de Pólya',
  },
  {
    id: 'contagem',
    grupo: 'resultados',
    secao: RESULTADOS,
    titulo: '34 grafos simples não isomorfos com 5 vértices',
  },
  {
    id: 'implementacao',
    grupo: 'implementacao',
    secao: 'Implementação computacional',
    titulo: 'Tecnologias e organização do código',
  },
  {
    id: 'implementacao-algoritmos',
    grupo: 'implementacao',
    secao: 'Implementação computacional',
    titulo: 'Partições, tipos cíclicos e grafos de ciclo',
  },
  { id: 'referencias', grupo: 'implementacao', secao: 'Referências', titulo: 'Referências' },
]

// O slide atual vive na URL (?slide=3, 1-based): recarregar ou partilhar o
// link mantém a posição.
const route = useRoute()
const router = useRouter()

const atual = computed({
  get: () => {
    const indice = Number(route.query.slide) - 1
    return Number.isInteger(indice) && indice >= 0 && indice < slides.length ? indice : 0
  },
  set: (indice: number) => {
    router.replace({ query: { ...route.query, slide: String(indice + 1) } })
  },
})

const id = computed(() => slides[atual.value]?.id)

const grupo = computed(() => slides[atual.value]?.grupo)
</script>

<template>
  <main class="pagina teoria">
    <SlideDeck v-model="atual" :slides="slides">
      <SlidesAbertura v-if="grupo === 'abertura'" :id="id" />
      <SlidesFundamentacao v-else-if="grupo === 'fundamentacao'" :id="id" />
      <SlidesResultados v-else-if="grupo === 'resultados'" :id="id" />
      <SlidesImplementacao v-else :id="id" />
    </SlideDeck>
  </main>
</template>

<style src="./slides.css"></style>
