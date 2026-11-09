<script setup lang="ts">
import { computed } from 'vue'
import MathTex from '@/components/MathTex.vue'
import PolyaGraph from '@/components/PolyaGraph.vue'
import { exemplosN5 } from '../exemplosN5'
import { grafoDoCiclo } from '@/combinatoria/grafoDoCiclo'
import { gerarParticoesKPartes } from '@/combinatoria/gerarParticoesKPartes'
import { formatarBlocos } from '@/combinatoria/formatadores'

/**
 * Slides da Teoria: resultados e discussões: o algoritmo, o caso m = 5 resolvido à mão, Z(G), o
 * inventário e a contagem de grafos.
 * Desenha o slide cujo `id` recebe; para os outros ids não desenha nada.
 */
const props = defineProps<{ id: string | undefined }>()

const exemplo = computed(() => exemplosN5.find((e) => `exemplo-${e.particao}` === props.id))

// m!, p(m) para m = 2..10 — calculados pelo gerador da aplicação.
const fatorial = (m: number): number => (m <= 1 ? 1 : m * fatorial(m - 1))

const crescimento = Array.from({ length: 9 }, (_, i) => {
  const m = i + 2
  return { m, permutacoes: fatorial(m), particoes: gerarParticoesKPartes(m, m).length }
})

const formatarMilhares = (valor: number) => valor.toLocaleString('pt-BR')

// Z(G) para m = 5, montado a partir dos mesmos dados da tabela e dos exemplos.
const indiceN5 = computed(() => {
  const termos = exemplosN5.map((e) => `${e.quantidade === 1 ? '' : e.quantidade}${e.resultado}`)
  const meio = Math.ceil(termos.length / 2)
  return String.raw`\begin{aligned} Z(G) = \frac{1}{120}\Big( &${termos.slice(0, meio).join(' + ')} \\ &+ ${termos.slice(meio).join(' + ')} \Big) \end{aligned}`
})

const somaQuantidades = exemplosN5.reduce((total, e) => total + e.quantidade, 0)

// Coeficientes de p(c): número de grafos com k arestas, k = 0..10.
const grafosPorArestas = [1, 1, 2, 4, 6, 6, 6, 4, 2, 1, 1]
const totalDeGrafos = grafosPorArestas.reduce((a, b) => a + b, 0)
</script>

<template>
  <!-- ─────────────── Algoritmo ─────────────── -->
  <section v-if="id === 'algoritmo'" class="texto">
    <p>
      <strong>Construção do índice de ciclos de <MathTex expr="G = S_m^{(2)}" /></strong>
    </p>
    <ol class="algoritmo">
      <li><strong>Entrada:</strong> um natural <MathTex expr="m \geq 2" />.</li>
      <li>Gere todas as partições de <MathTex expr="m" />.</li>
      <li>Inicialize <MathTex expr="Z \leftarrow 0" />.</li>
      <li>
        Para cada partição <MathTex expr="m = k_1 + 2k_2 + \cdots + mk_m" />:
        <ol type="a">
          <li>
            calcule
            <MathTex expr="N(k_1,\ldots,k_m) = \frac{m!}{\prod_{i} i^{k_i} k_i!}" />;
          </li>
          <li>construa <MathTex expr="T(\sigma) = X_1^{k_1} X_2^{k_2} \cdots X_m^{k_m}" />;</li>
          <li>determine <MathTex expr="T(\sigma^{*})" /> pelas Proposições 1 e 2;</li>
          <li>atualize <MathTex expr="Z \leftarrow Z + N(k_1,\ldots,k_m)\, T(\sigma^{*})" />.</li>
        </ol>
      </li>
      <li>Calcule <MathTex expr="Z(G) = Z / m!" />.</li>
      <li><strong>Saída:</strong> o índice de ciclos do grupo induzido <MathTex expr="G" />.</li>
    </ol>
  </section>

  <!-- ─────────────── Discussão ─────────────── -->
  <section v-else-if="id === 'discussao'" class="colunas">
    <div class="texto">
      <p>
        Todas as permutações com o mesmo tipo cíclico dão a mesma contribuição ao índice de ciclos
        do grupo induzido. Em vez de gerar as <MathTex expr="m!" /> permutações e decompor cada uma,
        o algoritmo percorre só as partições de <MathTex expr="m" />: calcula
        <MathTex expr="T(\sigma^{*})" /> uma única vez por partição e multiplica-o por
        <MathTex expr="N(k_1,\ldots,k_m)" />.
      </p>
      <p class="enfase">
        Para <MathTex expr="m = 10" />: <MathTex expr="10! = 3\,628\,800" /> permutações contra
        apenas <MathTex expr="42" /> partições — uma por tipo cíclico.
      </p>
      <p class="nota">
        Tabela calculada nesta página pelo gerador da aplicação
        (<code>gerarParticoesKPartes</code>).
      </p>
    </div>
    <table class="tabela">
      <thead>
        <tr>
          <th><MathTex expr="m" /></th>
          <th>permutações <MathTex expr="m!" /></th>
          <th>partições <MathTex expr="p(m)" /></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="linha in crescimento" :key="linha.m">
          <td>{{ linha.m }}</td>
          <td>{{ formatarMilhares(linha.permutacoes) }}</td>
          <td>{{ linha.particoes }}</td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- ─────────────── Tabela m = 5 ─────────────── -->
  <section v-else-if="id === 'tabela-n5'" class="texto">
    <p>
      As partições de 5 são todos os tipos cíclicos de <MathTex expr="S_5" />. Aplicando as
      Proposições 1 e 2 a cada um obtém-se o tipo induzido sobre as 10 arestas de
      <MathTex expr="K_5" />:
    </p>
    <table class="tabela">
      <thead>
        <tr>
          <th>Partição</th>
          <th><MathTex expr="T(\sigma)" /></th>
          <th><MathTex expr="T(\sigma^{*})" /></th>
          <th><MathTex expr="N(\lambda)" /></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="e in exemplosN5" :key="e.particao">
          <td><MathTex :expr="e.particao" /></td>
          <td><MathTex :expr="e.tipo" /></td>
          <td><MathTex :expr="e.resultado" /></td>
          <td>{{ e.quantidade }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3">Total</td>
          <td>{{ somaQuantidades }} = 5!</td>
        </tr>
      </tfoot>
    </table>
    <p class="nota">Os próximos slides detalham o cálculo de cada linha.</p>
  </section>

  <!-- ─────────────── Exemplos m = 5 ─────────────── -->
  <section v-else-if="exemplo" class="colunas exemplo">
    <div class="texto">
      <p>
        <MathTex :expr="`\\sigma = ${formatarBlocos(exemplo.sigma).replace(/ /g, '\\,')}`" />, de
        tipo <MathTex :expr="`T(\\sigma) = ${exemplo.tipo}`" />.
      </p>

      <h3>1) Arestas internas — Proposição 1</h3>
      <ul class="passos">
        <li v-for="(passo, i) in exemplo.internas" :key="i"><MathTex :expr="passo" /></li>
      </ul>
      <p class="subtotal">
        Contribuição:
        <MathTex v-if="exemplo.internasTotal" :expr="exemplo.internasTotal" />
        <template v-else>nenhuma</template>
      </p>

      <h3>2) Arestas entre ciclos distintos — Proposição 2</h3>
      <ul v-if="exemplo.pares.length" class="passos">
        <li v-for="(passo, i) in exemplo.pares" :key="i"><MathTex :expr="passo" /></li>
      </ul>
      <p class="subtotal">
        Contribuição:
        <MathTex v-if="exemplo.paresTotal" :expr="exemplo.paresTotal" />
        <template v-else>nenhuma — há um único ciclo</template>
      </p>

      <h3>3) Produto das contribuições</h3>
      <p class="resultado">
        <MathTex :expr="exemplo.produto" />
        <span class="caixa"><MathTex :expr="`T(\\sigma^{*}) = ${exemplo.resultado}`" /></span>
      </p>

      <p v-if="exemplo.nota" class="nota">{{ exemplo.nota }}</p>
    </div>
    <figure>
      <PolyaGraph
        :n="5"
        direcionado
        :arestas="grafoDoCiclo(exemplo.sigma).arestas"
        :raio="100"
        altura="260px"
      />
      <figcaption>
        <MathTex :expr="`\\sigma = ${formatarBlocos(exemplo.sigma).replace(/ /g, '\\,')}`" />
        sobre os vértices; <MathTex :expr="`N(\\lambda) = ${exemplo.quantidade}`" />
        permutações têm este tipo.
      </figcaption>
    </figure>
  </section>

  <!-- ─────────────── Z(G) m = 5 ─────────────── -->
  <section v-else-if="id === 'indice-n5'" class="texto">
    <p>
      Multiplicando cada <MathTex expr="T(\sigma^{*})" /> pelo número de permutações do seu tipo e
      dividindo por <MathTex expr="5! = 120" />:
    </p>
    <MathTex display :expr="indiceN5" />
    <p>
      Este é o índice de ciclos do grupo induzido sobre as arestas do grafo completo com cinco
      vértices.
    </p>
  </section>

  <!-- ─────────────── Inventário ─────────────── -->
  <section v-else-if="id === 'inventario'" class="texto">
    <p>
      Cada aresta recebe uma de duas cores: <strong>0</strong> (ausente) ou
      <strong>1</strong> (presente), com pesos
    </p>
    <MathTex
      display
      expr="\omega : \{0,1\} \to \mathbb{R}, \qquad \omega(0) = 1, \quad \omega(1) = c."
    />
    <p>
      Pelo Teorema de Pólya, substituindo cada <MathTex expr="X_i" /> por
      <MathTex expr="1 + c^{i}" /> em <MathTex expr="Z(G)" /> obtém-se o inventário dos grafos
      simples com cinco vértices:
    </p>
    <MathTex
      display
      expr="\begin{aligned} p(c) = \frac{1}{120}\Big[ &(1+c)^{10} + 10(1+c)^4(1+c^2)^3 + 20(1+c)(1+c^3)^3 \\ &+ 15(1+c)^2(1+c^2)^4 + 30(1+c^2)(1+c^4)^2 \\ &+ 20(1+c)(1+c^3)(1+c^6) + 24(1+c^5)^2 \Big] \end{aligned}"
    />
    <MathTex
      display
      expr="p(c) = 1 + c + 2c^2 + 4c^3 + 6c^4 + 6c^5 + 6c^6 + 4c^7 + 2c^8 + c^9 + c^{10}."
    />
  </section>

  <!-- ─────────────── Contagem ─────────────── -->
  <section v-else-if="id === 'contagem'" class="texto">
    <p>
      O coeficiente de <MathTex expr="c^{k}" /> em <MathTex expr="p(c)" /> é o número de grafos
      simples não isomorfos com cinco vértices e exatamente <MathTex expr="k" /> arestas.
    </p>
    <ul class="barras" aria-label="Grafos por número de arestas">
      <li v-for="(quantos, k) in grafosPorArestas" :key="k">
        <span class="barra-valor">{{ quantos }}</span>
        <span class="barra" :style="{ height: `${quantos * 1.6}rem` }"></span>
        <span class="barra-rotulo">{{ k }}</span>
      </li>
    </ul>
    <p class="legenda-barras">número de arestas <MathTex expr="k" /></p>
    <p class="enfase">
      A soma dos coeficientes,
      <MathTex :expr="`p(1) = ${grafosPorArestas.join('+')} = ${totalDeGrafos}`" />, é o número
      total de grafos simples não isomorfos com cinco vértices.
    </p>
    <p class="nota">
      A distribuição é simétrica (<MathTex expr="k \leftrightarrow 10 - k" />): trocar um grafo pelo
      seu complementar preserva o isomorfismo.
    </p>
  </section>
</template>
