<script setup lang="ts">
import MathTex from '@/components/MathTex.vue'
import PolyaGraph from '@/components/PolyaGraph.vue'
import { grafoDoCiclo } from '@/combinatoria/grafoDoCiclo'

/**
 * Slides da Teoria: materiais e métodos, de vértices e arestas até aos Teoremas 1 e 2.
 * Desenha o slide cujo `id` recebe; para os outros ids não desenha nada.
 */
defineProps<{ id: string | undefined }>()
</script>

<template>
  <!-- ─────────────── Vértices e arestas ─────────────── -->
  <section v-if="id === 'vertices-arestas'" class="colunas">
    <div class="texto">
      <p>
        Seja <MathTex expr="m \geq 2" /> e <MathTex expr="S = \{1, 2, \ldots, m\}" /> o conjunto de
        vértices. O conjunto de arestas considerado é
      </p>
      <MathTex
        display
        expr="D_m^{2} = \left\{ \{i,j\} \;:\; 1 \leq i < j \leq m \right\}, \qquad |D_m^{2}| = \binom{m}{2},"
      />
      <p>ou seja, as arestas do grafo completo <MathTex expr="K_m" />.</p>
      <p>
        Qualquer grafo simples sobre <MathTex expr="S" /> é então um vetor binário de comprimento
        <MathTex expr="\binom{m}{2}" />: cada posição diz se a aresta correspondente está presente
        ou ausente.
      </p>
      <p>
        Cada permutação <MathTex expr="\sigma \in S_m" /> age sobre os vértices e induz uma
        permutação sobre <MathTex expr="D_m^{2}" /> — é essa ação que leva ao índice de ciclos e ao
        Teorema de Pólya.
      </p>
    </div>
    <figure>
      <PolyaGraph :n="5" :raio="110" altura="280px" />
      <figcaption>
        <MathTex expr="K_5" />: as <MathTex expr="\binom{5}{2} = 10" /> arestas de
        <MathTex expr="D_5^{2}" />.
      </figcaption>
    </figure>
  </section>

  <!-- ─────────────── Tipo cíclico ─────────────── -->
  <section v-else-if="id === 'tipo-ciclico'" class="colunas">
    <div class="texto">
      <p>
        Toda permutação escreve-se, de maneira única a menos da ordem dos fatores, como produto de
        <strong>ciclos disjuntos</strong>.
      </p>
      <p>
        Se a decomposição de <MathTex expr="\sigma" /> tem <MathTex expr="k_{\ell_i}" /> ciclos de
        comprimento <MathTex expr="\ell_i" /> (<MathTex expr="\ell_1 < \cdots < \ell_r" />), então
        <MathTex expr="\sum_{i=1}^{r} k_{\ell_i}\ell_i = m" />, e o <strong>tipo cíclico</strong> de
        <MathTex expr="\sigma" /> é o monômio
      </p>
      <MathTex
        display
        expr="T(\sigma) = x_{\ell_1}^{k_{\ell_1}}\, x_{\ell_2}^{k_{\ell_2}} \cdots x_{\ell_r}^{k_{\ell_r}}."
      />
      <p>
        Como os comprimentos somam <MathTex expr="m" />, cada tipo cíclico corresponde exatamente a
        uma <strong>partição de <MathTex expr="m" /></strong>. É esta correspondência que permite
        trocar as <MathTex expr="m!" /> permutações pelas partições de <MathTex expr="m" />.
      </p>
    </div>
    <figure>
      <PolyaGraph
        :n="5"
        direcionado
        :arestas="
          grafoDoCiclo([
            [1, 2],
            [3, 4, 5],
          ]).arestas
        "
        :raio="110"
        altura="280px"
      />
      <figcaption>
        <MathTex expr="\sigma = (1\,2)(3\,4\,5)" />, de tipo
        <MathTex expr="T(\sigma) = x_2\,x_3" /> — a partição <MathTex expr="5 = 3 + 2" />.
      </figcaption>
    </figure>
  </section>

  <!-- ─────────────── Abordagens ─────────────── -->
  <section v-else-if="id === 'abordagens'" class="texto">
    <p>
      Para construir o índice de ciclos é preciso saber quantas permutações têm cada tipo cíclico.
      Há duas abordagens:
    </p>
    <div class="cartoes">
      <div class="cartao">
        <h3>1) Abordagem direta</h3>
        <p>
          Listar as <MathTex expr="m!" /> permutações de <MathTex expr="S_m" />, decompor cada uma
          em ciclos e identificar o seu tipo. Conceitualmente simples, mas inviável quando
          <MathTex expr="m" /> cresce — o número de permutações cresce fatorialmente.
        </p>
      </div>
      <div class="cartao destaque">
        <h3>2) Abordagem via partições</h3>
        <p>
          Listar as partições <MathTex expr="m = k_1 + 2k_2 + \cdots + mk_m" />, onde
          <MathTex expr="k_i" /> é o número de ciclos de comprimento <MathTex expr="i" />. Para cada
          uma, o número de permutações é
        </p>
        <MathTex
          display
          expr="N(k_1,\ldots,k_m) = \frac{m!}{\displaystyle\prod_{i=1}^{m} i^{k_i}\,k_i!}."
        />
        <p>Não é preciso gerar nenhuma permutação explicitamente.</p>
      </div>
    </div>
  </section>

  <!-- ─────────────── Índice de ciclos de S_m ─────────────── -->
  <section v-else-if="id === 'indice-sm'" class="texto">
    <p>
      O índice de ciclos de <MathTex expr="S_m" /> é um polinômio nas variáveis
      <MathTex expr="X_1, X_2, \ldots, X_m" />, definido pela média dos tipos cíclicos:
    </p>
    <MathTex display expr="Z(S_m) = \frac{1}{m!} \sum_{\sigma \in S_m} T(\sigma)." />
    <p>
      Agrupando as permutações pelo tipo cíclico, a soma reorganiza-se sobre as partições
      <MathTex expr="\lambda \vdash m" />:
    </p>
    <MathTex
      display
      expr="Z(S_m) = \frac{1}{m!} \sum_{\lambda \vdash m} N(\lambda)\, T(\lambda)."
    />
    <p class="enfase">
      Uma soma sobre <MathTex expr="m!" /> elementos passa a ser uma soma sobre as partições de
      <MathTex expr="m" /> — o que torna a construção viável para valores bem maiores de
      <MathTex expr="m" />.
    </p>
  </section>

  <!-- ─────────────── Grupo induzido ─────────────── -->
  <section v-else-if="id === 'grupo-induzido'" class="texto">
    <p>
      Na enumeração de grafos, as cores são atribuídas às <strong>arestas</strong> de
      <MathTex expr="K_m" />, não aos vértices. Seja <MathTex expr="t = \binom{m}{2}" />. Cada
      <MathTex expr="\sigma \in S_m" /> induz
    </p>
    <MathTex
      display
      expr="\sigma^{*} : D_m^{2} \to D_m^{2}, \qquad \sigma^{*}(\{i,j\}) = \{\sigma(i), \sigma(j)\},"
    />
    <p>
      uma permutação das arestas, logo <MathTex expr="\sigma^{*} \in S_t" />. O grupo induzido
      <MathTex expr="G = \{\sigma^{*} : \sigma \in S_m\}" /> é subgrupo de <MathTex expr="S_t" />, e
      <MathTex expr="\varphi(\sigma) = \sigma^{*}" /> é um isomorfismo
      <MathTex expr="S_m \cong G" />, com <MathTex expr="|G| = m!" />. Os dois grupos são o mesmo,
      mas agem sobre conjuntos diferentes.
    </p>
    <MathTex
      display
      expr="Z(G) = \frac{1}{m!} \sum_{\sigma^{*} \in G} T(\sigma^{*}), \qquad T(\sigma^{*}) = X_1^{c_1(\sigma^{*})} \cdots X_t^{c_t(\sigma^{*})}."
    />
    <p>
      Basta, portanto, obter <MathTex expr="T(\sigma^{*})" /> a partir de
      <MathTex expr="T(\sigma)" />. As arestas dividem-se em duas classes: as que têm os dois
      extremos no <strong>mesmo ciclo</strong> de <MathTex expr="\sigma" /> e as que ligam
      <strong>ciclos distintos</strong>.
    </p>
  </section>

  <!-- ─────────────── Proposição 1 ─────────────── -->
  <section v-else-if="id === 'proposicao-1'" class="texto">
    <div class="enunciado">
      <p>
        <strong>Proposição 1.</strong> Se <MathTex expr="X_j" /> é fator de
        <MathTex expr="T(\sigma)" />, com <MathTex expr="j \geq 3" />, então no tipo cíclico de
        <MathTex expr="\sigma^{*}" />
      </p>
      <MathTex
        display
        expr="X_j \longmapsto \begin{cases} X_j^{\frac{j-1}{2}}, & j \text{ ímpar}, \\[4pt] X_{j/2}\, X_j^{\frac{j-2}{2}}, & j \text{ par}. \end{cases}"
      />
    </div>
    <div class="enunciado secundario">
      <p>
        <strong>Observação 1 (<MathTex expr="j = 2" />).</strong> Um ciclo de comprimento 2 tem uma
        única aresta interna, que fica fixa: <MathTex expr="X_2 \longmapsto X_1" />. É o que a
        fórmula par já dá: <MathTex expr="X_{2/2}\,X_2^{0} = X_1" />.
      </p>
    </div>
    <p>
      Um ciclo de comprimento 1 (ponto fixo) não tem arestas internas e não contribui para este
      caso.
    </p>
  </section>

  <!-- ─────────────── Proposição 2 ─────────────── -->
  <section v-else-if="id === 'proposicao-2'" class="colunas">
    <div class="texto">
      <p>
        Sejam <MathTex expr="C_r" /> e <MathTex expr="C_s" /> dois ciclos disjuntos de comprimentos
        <MathTex expr="r" /> e <MathTex expr="s" />. Cada aresta entre eles liga um vértice de
        <MathTex expr="C_r" /> a um de <MathTex expr="C_s" />.
      </p>
      <div class="enunciado">
        <p>
          <strong>Proposição 2.</strong> Cada uma dessas arestas pertence a uma órbita de
          comprimento <MathTex expr="\operatorname{mmc}(r,s)" />, e há
          <MathTex expr="\operatorname{mdc}(r,s)" /> órbitas. Assim, cada par de ciclos contribui
          com
        </p>
        <MathTex
          display
          expr="X_r X_s \longmapsto X_{\operatorname{mmc}(r,s)}^{\operatorname{mdc}(r,s)}."
        />
      </div>
      <p>
        Confere com a contagem: são <MathTex expr="rs" /> arestas e
        <MathTex expr="\operatorname{mmc}(r,s)\cdot\operatorname{mdc}(r,s) = rs" />.
      </p>
    </div>
    <figure>
      <PolyaGraph
        :n="5"
        direcionado
        :arestas="
          grafoDoCiclo([
            [1, 2],
            [3, 4, 5],
          ]).arestas
        "
        :raio="110"
        altura="280px"
      />
      <figcaption>
        Entre <MathTex expr="(1\,2)" /> e <MathTex expr="(3\,4\,5)" /> há
        <MathTex expr="2 \cdot 3 = 6" /> arestas, numa única órbita de comprimento
        <MathTex expr="\operatorname{mmc}(2,3) = 6" />: <MathTex expr="X_2X_3 \mapsto X_6" />.
      </figcaption>
    </figure>
  </section>

  <!-- ─────────────── Teorema 1 ─────────────── -->
  <section v-else-if="id === 'teorema-1'" class="texto">
    <div class="enunciado">
      <p>
        <strong>Teorema 1.</strong> Se
        <MathTex expr="T(\sigma) = X_1^{k_1} X_2^{k_2} \cdots X_m^{k_m}" />, o tipo cíclico de
        <MathTex expr="\sigma^{*}" /> obtém-se multiplicando
      </p>
      <ul>
        <li>a contribuição da Proposição 1 (ou da Observação 1) de <strong>cada ciclo</strong>;</li>
        <li>
          a contribuição
          <MathTex expr="X_{\operatorname{mmc}(r,s)}^{\operatorname{mdc}(r,s)}" /> da Proposição 2
          de <strong>cada par de ciclos</strong>.
        </li>
      </ul>
    </div>
    <p><strong>Observações 2 e 3 — multiplicidades.</strong></p>
    <ul>
      <li>
        um comprimento <MathTex expr="j" /> com multiplicidade <MathTex expr="k_j" /> dá
        <MathTex expr="k_j" /> vezes a contribuição interna;
      </li>
      <li>
        entre comprimentos distintos <MathTex expr="r \neq s" />, a contribuição repete-se
        <MathTex expr="k_r k_s" /> vezes;
      </li>
      <li>
        entre ciclos do mesmo comprimento <MathTex expr="r" />, repete-se
        <MathTex expr="\binom{k_r}{2}" /> vezes.
      </li>
    </ul>
    <p class="enfase">
      Na prática: listar explicitamente todos os pares de ciclos de
      <MathTex expr="\sigma" />, aplicar a Proposição 2 a cada um e multiplicar tudo.
    </p>
  </section>

  <!-- ─────────────── Teorema 2 ─────────────── -->
  <section v-else-if="id === 'teorema-2'" class="texto">
    <div class="enunciado">
      <p>
        <strong>Teorema 2.</strong> O índice de ciclos do grupo induzido
        <MathTex expr="G = S_m^{(2)}" /> é
      </p>
      <MathTex
        display
        expr="Z\!\left(S_m^{(2)}\right) = \frac{1}{m!} \sum_{\lambda \vdash m} N(\lambda)\, T(\sigma_\lambda^{*}),"
      />
      <p>
        onde <MathTex expr="\lambda = (1^{k_1} 2^{k_2} \cdots m^{k_m})" /> percorre as partições de
        <MathTex expr="m" />,
      </p>
      <MathTex display expr="N(\lambda) = \frac{m!}{\displaystyle\prod_{j=1}^{m} j^{k_j}\, k_j!}" />
      <p>
        é o número de permutações com esse tipo cíclico, e
        <MathTex expr="T(\sigma_\lambda^{*})" /> é o tipo induzido dado pelas Proposições 1 e 2.
      </p>
    </div>
  </section>
</template>
