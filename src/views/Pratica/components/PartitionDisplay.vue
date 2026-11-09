<script setup lang="ts">
import { computed, watch } from 'vue'
import { gerarParticoesKPartes, type Particao } from '@/combinatoria/gerarParticoesKPartes'
import { expandirPartes, gerarConfiguracoesUnicas, contarPartes } from '@/combinatoria/mathForms'
import { contarPermutacoesDoTipo } from '@/combinatoria/contarPermutacoesDoTipo'
import {
  formatarParticao,
  formatarParticaoLatex,
  formatarSomaLatex,
} from '@/combinatoria/formatadores'
import { grafoDoCiclo, type Aresta } from '@/combinatoria/grafoDoCiclo'
import MathTex from '@/components/MathTex.vue'
import CollapsibleSection from '@/components/CollapsibleSection.vue'
import PolyaGraph from '@/components/PolyaGraph.vue'

/** Uma configuração: a forma escrita do ciclo e o grafo que ela representa. */
interface Configuracao {
  /** O ciclo em texto, ex. "(1 3)(2 4)". */
  texto: string
  /** As arestas direcionadas correspondentes; pontos fixos ficam isolados. */
  arestas: Aresta[]
}

/** Uma linha da lista: só o que o cabeçalho mostra — nada de permutações. */
interface LinhaDaParticao {
  /** Forma textual da partição, ex. "X_2^2 X_1^1" — serve de `:key` e de chave da cache. */
  chave: string
  /** Cabeçalho em LaTeX: multiplicidades e soma. */
  titulo: string
  /** Quantas partes a partição tem (a soma das multiplicidades). */
  numeroDePartes: number
  /** Quantas permutações têm este tipo cíclico, pela fórmula (sem gerá-las). */
  quantidade: bigint
  /** O tipo cíclico, ex. [2, 2, 1] — o que gera as configurações ao abrir. */
  tipoCiclico: number[]
}

const props = defineProps<{ N: number }>()

const n = computed(() => Math.max(0, Math.floor(props.N)))

// Sem restrição no número de partes: k = n gera todas as partições de n.
const particoes = computed(() => (n.value < 1 ? [] : gerarParticoesKPartes(n.value, n.value)))

const construirLinha = (particao: Particao): LinhaDaParticao => ({
  chave: formatarParticao(particao),
  titulo: `${formatarParticaoLatex(particao)} \\;=\\; ${formatarSomaLatex(particao)}`,
  numeroDePartes: contarPartes(particao),
  quantidade: contarPermutacoesDoTipo(particao),
  tipoCiclico: expandirPartes(particao),
})

// Barato: só as p(n) partições e uma fórmula por linha.
const linhas = computed(() => particoes.value.map(construirLinha))

/*
 * As configurações (permutações + arestas) só são geradas quando a linha é
 * aberta: o slot do CollapsibleSection só é avaliado com a linha aberta, e é
 * aí que `configuracoesDe` é chamada. A cache evita regerar ao fechar e
 * reabrir; não é reativa de propósito (escrever nela durante o render não
 * pode disparar outro render) e é esvaziada quando N muda.
 */
const cache = new Map<string, Configuracao[]>()
watch(n, () => cache.clear())

const configuracoesDe = (linha: LinhaDaParticao): Configuracao[] => {
  let configuracoes = cache.get(linha.chave)
  if (configuracoes === undefined) {
    configuracoes = gerarConfiguracoesUnicas(n.value, linha.tipoCiclico).map((texto) => ({
      texto,
      arestas: grafoDoCiclo(texto).arestas,
    }))
    cache.set(linha.chave, configuracoes)
  }
  return configuracoes
}

const rotuloQuantidade = (quantidade: bigint) =>
  `${quantidade.toLocaleString('pt-BR')} ${quantidade === 1n ? 'configuração' : 'configurações'}`
</script>

<template>
  <div class="partition-display">
    <p class="summary">
      Partições de <MathTex :expr="String(n)" /> —
      <MathTex :expr="`p(${n}) = ${particoes.length}`" />
    </p>

    <CollapsibleSection
      v-for="linha in linhas"
      :key="linha.chave"
      compacta
      :aberta="false"
      :dica="`${linha.numeroDePartes} partes · ${rotuloQuantidade(linha.quantidade)}`"
      :registros="linha.quantidade"
    >
      <template #titulo>
        <MathTex :expr="linha.titulo" />
      </template>

      <ul class="configuracoes">
        <li
          v-for="configuracao in configuracoesDe(linha)"
          :key="configuracao.texto"
          class="configuracao"
        >
          <p class="titulo-ciclo">{{ configuracao.texto }}</p>
          <PolyaGraph
            :n="n"
            direcionado
            :arestas="configuracao.arestas"
            :raio="52"
            altura="150px"
          />
        </li>
      </ul>
    </CollapsibleSection>
  </div>
</template>

<style scoped>
.summary {
  margin-bottom: 0.75rem;
  color: var(--ink-soft);
}

.configuracoes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.configuracao {
  padding: 0.6rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface-sunken);
}

.configuracao :deep(.polya-graph) {
  border: none;
  background: none;
}

.titulo-ciclo {
  margin-bottom: 0.25rem;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  text-align: center;
}
</style>
