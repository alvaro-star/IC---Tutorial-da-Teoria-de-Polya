<script setup lang="ts">
import { computed } from 'vue'
import {
  gerarParticoesKPartes,
  expandirPartes,
  gerarConfiguracoesUnicas,
  formatarParticao,
  formatarParticaoLatex,
  formatarSomaLatex,
  contarPartes,
  type Particao,
} from '@/gerarParticoeskpartes'
import { grafoDoCiclo, type Aresta } from '@/grafoDoCiclo'
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

/** Uma linha da lista: uma partição de N com tudo o que o template desenha. */
interface LinhaDaParticao {
  /** Forma textual da partição, ex. "2^2 1^1" — serve de `:key`. */
  chave: string
  /** Cabeçalho em LaTeX: multiplicidades e soma, "2^{2} 1^{1} = 2 + 2 + 1". */
  titulo: string
  /** Quantas partes a partição tem (a soma das multiplicidades). */
  numeroDePartes: number
  /** Permutações distintas com este tipo cíclico, cada uma com o seu grafo. */
  configuracoes: Configuracao[]
}

const props = defineProps<{ N: number }>()

const n = computed(() => Math.max(0, Math.floor(props.N)))

// Sem restrição no número de partes: k = n gera todas as partições de n.
const particoes = computed(() => (n.value < 1 ? [] : gerarParticoesKPartes(n.value, n.value)))

/**
 * Traduz uma partição na linha correspondente. A partição expandida
 * (`ParicionExpanded`) é o tipo cíclico que gera as configurações.
 */
const construirLinha = (particao: Particao): LinhaDaParticao => {
  const tipoCiclico = expandirPartes(particao)

  return {
    chave: formatarParticao(particao),
    titulo: `${formatarParticaoLatex(particao)} \\;=\\; ${formatarSomaLatex(particao)}`,
    numeroDePartes: contarPartes(particao),
    configuracoes: gerarConfiguracoesUnicas(n.value, tipoCiclico).map((texto) => ({
      texto,
      arestas: grafoDoCiclo(texto).arestas,
    })),
  }
}

const linhas = computed(() => particoes.value.map(construirLinha))
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
      :dica="`${linha.numeroDePartes} partes · ${linha.configuracoes.length} configurações`"
    >
      <template #titulo>
        <MathTex :expr="linha.titulo" />
      </template>

      <ul class="configuracoes">
        <li
          v-for="configuracao in linha.configuracoes"
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
