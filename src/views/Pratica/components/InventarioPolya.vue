<script setup lang="ts">
import { computed } from 'vue'
import MathTex from '@/components/MathTex.vue'
import { somaDosCoeficientes } from '@/combinatoria/comum/polinomios'
import {
  formatarSomaEmLinhasLatex,
  formatarSomaLatex,
  formatarSubstituicaoLatex,
  formatarTermoDoIndiceLatex,
  formatarTipoCiclicoLatex,
  termosDoPolinomioLatex,
} from '@/combinatoria/formatadores'
import { inventarioDeGrafos } from '@/combinatoria/inventario'

/**
 * Passo a passo de Z(G) até p(c), para o N escolhido: o índice de ciclos das
 * arestas, a substituição de Pólya X_i -> 1 + c^i, a expansão de cada termo e
 * o resultado — quantos grafos simples não isomorfos há com k arestas.
 */
const props = defineProps<{ N: number }>()

const n = computed(() => Math.max(0, Math.floor(props.N)))
const totalDeArestas = computed(() => (n.value * (n.value - 1)) / 2)

const inventario = computed(() => inventarioDeGrafos(n.value))

const denominador = computed(() => inventario.value.denominador.toString())

const linhas = computed(() =>
  inventario.value.termos.map((termo) => ({
    chave: formatarSomaLatex(termo.particao),
    quantidade: termo.quantidade.toLocaleString('pt-BR'),
    tipoInduzido: formatarTipoCiclicoLatex(termo.tipoInduzido),
    termo: formatarTermoDoIndiceLatex(termo.quantidade, termo.tipoInduzido),
    substituicao: formatarSubstituicaoLatex(termo.quantidade, termo.tipoInduzido),
    expandido: termosDoPolinomioLatex(termo.polinomio).join(' + '),
  })),
)

const indice = computed(() =>
  formatarSomaEmLinhasLatex(
    String.raw`Z(G) = \frac{1}{${denominador.value}}\Big(`,
    linhas.value.map((linha) => linha.termo),
    3,
    String.raw`\Big)`,
  ),
)

const substituido = computed(() =>
  formatarSomaEmLinhasLatex(
    String.raw`p(c) = \frac{1}{${denominador.value}}\Big[`,
    linhas.value.map((linha) => linha.substituicao),
    2,
    String.raw`\Big]`,
  ),
)

const soma = computed(() =>
  formatarSomaEmLinhasLatex(
    String.raw`\text{soma} =`,
    termosDoPolinomioLatex(inventario.value.soma),
    6,
  ),
)

const resultado = computed(() =>
  formatarSomaEmLinhasLatex('p(c) =', termosDoPolinomioLatex(inventario.value.resultado), 8),
)

const coeficientes = computed(() => inventario.value.resultado)
const total = computed(() => somaDosCoeficientes(coeficientes.value))
// 12005168 -> 12\,005\,168: espaço fino entre os milhares, em LaTeX.
const totalLatex = computed(() =>
  total.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, String.raw`\,`),
)
const maior = computed(() => coeficientes.value.reduce((m, x) => (x > m ? x : m), 1n))

/** Altura de cada barra, proporcional ao maior coeficiente. */
const altura = (coeficiente: bigint) =>
  `${Math.max(2, (Number(coeficiente) / Number(maior.value)) * 100)}%`
</script>

<template>
  <div class="inventario">
    <p class="intro">
      O objetivo de todo o percurso é contar os grafos simples com
      <MathTex :expr="`N = ${n}`" /> vértices a menos de isomorfismo. O índice de ciclos das arestas
      <MathTex expr="Z(G)" /> já tem essa informação; o Teorema de Pólya ensina a lê-la.
    </p>

    <h3>1) O índice de ciclos das arestas</h3>
    <p>
      Pelo Teorema 2, cada partição <MathTex expr="\lambda" /> de
      <MathTex :expr="String(n)" /> contribui com <MathTex expr="N(\lambda)\,T(\sigma^{*})" /> — o
      número de permutações do tipo vezes o tipo induzido da secção 5 — e divide-se tudo por
      <MathTex :expr="`${n}! = ${denominador}`" />:
    </p>
    <div class="tabela-rolagem">
      <table class="tabela">
        <thead>
          <tr>
            <th>partição <MathTex expr="\lambda" /></th>
            <th><MathTex expr="N(\lambda)" /></th>
            <th><MathTex expr="T(\sigma^{*})" /></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="linha in linhas" :key="linha.chave">
            <td><MathTex :expr="linha.chave" /></td>
            <td>{{ linha.quantidade }}</td>
            <td><MathTex :expr="linha.tipoInduzido" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="destaque"><MathTex :expr="indice" display /></p>

    <h3>2) A substituição de Pólya</h3>
    <p>
      Cada aresta recebe uma de duas cores: <strong>0</strong> (ausente) ou
      <strong>1</strong> (presente), com pesos <MathTex expr="\omega(0) = 1" /> e
      <MathTex expr="\omega(1) = c" />. Um grafo que não muda sob <MathTex expr="\sigma^{*}" /> tem
      de dar a mesma cor a todas as arestas de cada ciclo; um ciclo de <MathTex expr="i" /> arestas
      fica então todo ausente (peso <MathTex expr="1" />) ou todo presente (peso
      <MathTex expr="c^{i}" />). Por isso, no Teorema de Pólya, troca-se cada variável por
    </p>
    <p class="destaque"><MathTex expr="X_i \;\longmapsto\; 1 + c^{i}" display /></p>
    <p>Aplicado a <MathTex expr="Z(G)" />:</p>
    <p class="destaque"><MathTex :expr="substituido" display /></p>

    <h3>3) Expandir cada termo e somar</h3>
    <p>
      Desenvolvendo cada produto de binómios, cada termo vira um polinómio em
      <MathTex expr="c" />:
    </p>
    <div class="tabela-rolagem">
      <table class="tabela expansao">
        <thead>
          <tr>
            <th>termo</th>
            <th>expandido</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="linha in linhas" :key="linha.chave">
            <td><MathTex :expr="linha.substituicao" /></td>
            <td><MathTex :expr="linha.expandido" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>Somando as linhas, coeficiente a coeficiente:</p>
    <p class="destaque"><MathTex :expr="soma" display /></p>

    <h3>4) O resultado: <MathTex expr="p(c)" /></h3>
    <p>
      Dividindo cada coeficiente da soma por <MathTex :expr="denominador" /> — a divisão é sempre
      exata — obtém-se o inventário:
    </p>
    <p class="destaque"><MathTex :expr="resultado" display /></p>
    <p>
      O coeficiente de <MathTex expr="c^{k}" /> é o número de grafos simples não isomorfos com
      <MathTex :expr="String(n)" /> vértices e exatamente <MathTex expr="k" /> arestas:
    </p>

    <ul class="barras" aria-label="Grafos por número de arestas">
      <li v-for="(quantos, k) in coeficientes" :key="k">
        <span class="barra-valor">{{ quantos.toLocaleString('pt-BR') }}</span>
        <span class="barra-trilho"
          ><span class="barra" :style="{ height: altura(quantos) }"></span
        ></span>
        <span class="barra-rotulo">{{ k }}</span>
      </li>
    </ul>
    <p class="legenda-barras">número de arestas <MathTex expr="k" /></p>

    <p class="resultado">
      <span class="caixa">
        <MathTex :expr="`p(1) = ${totalLatex}`" />
      </span>
      grafos simples não isomorfos com <MathTex :expr="String(n)" /> vértices.
    </p>
    <p v-if="totalDeArestas > 0" class="nota">
      A distribuição é simétrica (<MathTex :expr="`k \\leftrightarrow ${totalDeArestas} - k`" />):
      trocar um grafo pelo seu complementar preserva o isomorfismo.
    </p>
  </div>
</template>

<style scoped>
.inventario {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.intro {
  max-width: var(--largura-texto);
  color: var(--ink-soft);
}

h3 {
  margin-top: 0.75rem;
  font-size: 1.1rem;
}

.destaque {
  margin: 0.25rem 0;
  padding: 0.25rem 1rem;
  border-radius: var(--radius);
  background: var(--surface-sunken);
  color: var(--ink);
}

/* Só rola na horizontal: a altura acompanha o conteúdo. */
.tabela-rolagem {
  overflow-x: auto;
  overflow-y: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.tabela {
  width: 100%;
  border-collapse: collapse;
}

.tabela th,
.tabela td {
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--line);
  text-align: center;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.tabela th {
  color: var(--ink-soft);
  font-size: 0.9rem;
  font-weight: 600;
}

.tabela tbody tr:last-child td {
  border-bottom: none;
}

.expansao td:last-child {
  text-align: left;
}

.barras {
  display: flex;
  align-items: stretch;
  gap: 0.3rem;
  height: 13rem;
  margin: 0.5rem 0 0;
  padding: 0;
  list-style: none;
  overflow-x: auto;
  overflow-y: hidden;
}

.barras li {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  min-width: 1.6rem;
}

.barra-trilho {
  display: flex;
  flex: 1;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
}

.barra {
  width: 100%;
  max-width: 2.5rem;
  border-radius: 4px 4px 0 0;
  background: var(--accent);
}

.barra-valor,
.barra-rotulo {
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}

.barra-valor {
  color: var(--ink-soft);
}

.legenda-barras {
  color: var(--muted);
  font-size: 0.85rem;
  text-align: center;
}

.resultado {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
}

.caixa {
  display: inline-block;
  padding: 0.4rem 0.9rem;
  border: 1.5px solid var(--accent);
  border-radius: var(--radius-sm);
  background: var(--accent-soft);
  font-size: 1.1rem;
}

.nota {
  color: var(--muted);
  font-size: 0.85rem;
}
</style>
