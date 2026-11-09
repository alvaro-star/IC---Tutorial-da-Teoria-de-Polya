<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { gerarParticoesKPartes, type Particao } from '@/combinatoria/gerarParticoesKPartes'
import { expandirPartes, gerarConfiguracoesUnicas, contarPartes } from '@/combinatoria/mathForms'
import { contarPermutacoesDoTipo } from '@/combinatoria/contarPermutacoesDoTipo'
import {
  grafoDaAcaoInduzida,
  permutacaoDosCiclos,
  tipoInduzidoDoTipo,
  type GrafoDaAcaoInduzida,
} from '@/combinatoria/acaoInduzida'
import {
  formatarParticao,
  formatarParticaoLatex,
  formatarSomaLatex,
  formatarTipoCiclicoLatex,
} from '@/combinatoria/formatadores'
import { grafoDoCiclo, interpretarCiclos, type Aresta } from '@/combinatoria/grafoDoCiclo'
import { LIMITE_DE_REGISTROS } from '@/limites'
import MathTex from '@/components/MathTex.vue'
import AlertaAviso from '@/components/AlertaAviso.vue'
import ExplicacaoTipoInduzido from './ExplicacaoTipoInduzido.vue'
import CollapsibleSection from '@/components/CollapsibleSection.vue'
import PolyaGraph from '@/components/PolyaGraph.vue'

/*
 * Cópia do PartitionDisplay para o tipo cíclico **induzido**: cada linha é
 * uma partição de N (um tipo cíclico de σ) e mostra também T(σ*), o tipo
 * cíclico de σ* sobre as arestas. Ao abrir, a linha explica como σ* se
 * define e como T(σ*) se calcula só a partir de T(σ) (Teorema 1), antes da
 * lista de permutações com os seus grafos.
 */

/** Uma configuração: a forma escrita do ciclo e o grafo que ela representa. */
interface Configuracao {
  /** O ciclo em texto, ex. "(1 3)(2 4)". */
  texto: string
  /** As arestas direcionadas correspondentes; pontos fixos ficam isolados. */
  arestas: Aresta[]
  /** O grafo de σ*: vértices = arestas de K_n, setas = {i,j} -> {σ(i),σ(j)}. */
  induzido: GrafoDaAcaoInduzida
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
  /** T(σ*) em LaTeX, calculado só pelos comprimentos (barato). */
  tipoInduzido: string
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
  tipoInduzido: formatarTipoCiclicoLatex(tipoInduzidoDoTipo(expandirPartes(particao)).tipo),
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
      induzido: grafoDaAcaoInduzida(
        permutacaoDosCiclos(interpretarCiclos(texto), n.value),
        n.value,
      ),
    }))
    cache.set(linha.chave, configuracoes)
  }
  return configuracoes
}

// Linhas cuja lista grande já foi liberada pelo utilizador; esvazia com N.
const liberadas = ref(new Set<string>())
watch(n, () => {
  liberadas.value = new Set()
})

const liberar = (chave: string) => {
  liberadas.value = new Set(liberadas.value).add(chave)
}

const rotuloQuantidade = (quantidade: bigint) =>
  `${quantidade.toLocaleString('pt-BR')} ${quantidade === 1n ? 'configuração' : 'configurações'}`
</script>

<template>
  <div class="partition-display">
    <p class="summary">
      Cada partição de <MathTex :expr="String(n)" /> é um tipo cíclico <MathTex expr="T(\sigma)" />;
      à direita, o tipo cíclico induzido <MathTex expr="T(\sigma^{*})" /> sobre as
      <MathTex :expr="`\\binom{${n}}{2} = ${(n * (n - 1)) / 2}`" /> arestas. Abra uma linha para ver
      como ele se define e se calcula.
    </p>
    <p class="summary">
      Cada permutação aparece com dois grafos: à esquerda, <strong class="sigma">σ</strong> sobre os
      vértices; à direita, <strong class="sigma-estrela">σ*</strong>, em que cada vértice é uma
      aresta <MathTex expr="\{i,j\}" /> do grafo inicial e cada seta é a aplicação
      <MathTex expr="\{i,j\} \mapsto \{\sigma(i), \sigma(j)\}" />. As arestas que não se movem ficam
      isoladas.
    </p>

    <CollapsibleSection
      v-for="linha in linhas"
      :key="linha.chave"
      compacta
      :aberta="false"
      :dica="rotuloQuantidade(linha.quantidade)"
    >
      <template #titulo>
        <MathTex
          :expr="`${linha.titulo} \\;\\longmapsto\\; T(\\sigma^{*}) = ${linha.tipoInduzido}`"
        />
      </template>

      <ExplicacaoTipoInduzido
        :n="n"
        :tipo-ciclico="linha.tipoCiclico"
        :quantidade="linha.quantidade"
        :tipo-induzido="linha.tipoInduzido"
      />

      <AlertaAviso
        v-if="linha.quantidade > LIMITE_DE_REGISTROS && !liberadas.has(linha.chave)"
        titulo="Lista muito grande"
      >
        Este tipo tem {{ linha.quantidade.toLocaleString('pt-BR') }} permutações. Desenhar todas com
        os seus grafos pode deixar a sua máquina lenta.
        <template #acoes>
          <button type="button" class="botao" @click="liberar(linha.chave)">
            Mostrar mesmo assim
          </button>
        </template>
      </AlertaAviso>
      <ul v-else class="configuracoes">
        <li
          v-for="configuracao in configuracoesDe(linha)"
          :key="configuracao.texto"
          class="configuracao"
        >
          <p class="titulo-ciclo">{{ configuracao.texto }}</p>
          <div class="par-de-grafos">
            <figure>
              <PolyaGraph
                :n="n"
                direcionado
                :arestas="configuracao.arestas"
                :raio="52"
                altura="190px"
              />
              <figcaption><span class="ponto sigma"></span>σ · vértices</figcaption>
            </figure>
            <figure>
              <PolyaGraph
                :n="configuracao.induzido.vertices"
                direcionado
                cor="laranja"
                :arestas="configuracao.induzido.arestas"
                :rotulos="configuracao.induzido.rotulos"
                :raio="70"
                altura="190px"
              />
              <figcaption><span class="ponto sigma-estrela"></span>σ* · arestas</figcaption>
            </figure>
          </div>
        </li>
      </ul>
    </CollapsibleSection>
  </div>
</template>

<style scoped>
.summary {
  max-width: var(--largura-texto);
  margin-bottom: 0.75rem;
  color: var(--ink-soft);
}

.configuracoes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 380px), 1fr));
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

.par-de-grafos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.par-de-grafos figure {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.par-de-grafos figcaption {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  color: var(--muted);
  font-size: 0.78rem;
}

.ponto {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
}

.ponto.sigma {
  background: var(--cor-sigma);
}

.ponto.sigma-estrela {
  background: var(--cor-sigma-estrela);
}

strong.sigma {
  color: var(--cor-sigma);
}

strong.sigma-estrela {
  color: var(--cor-sigma-estrela);
}

.titulo-ciclo {
  margin-bottom: 0.25rem;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  text-align: center;
}
</style>
