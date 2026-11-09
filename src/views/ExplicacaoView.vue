<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MathTex from '@/components/MathTex.vue'
import PolyaGraph from '@/components/PolyaGraph.vue'
import SlideDeck from '@/components/SlideDeck.vue'
import { exemplosN5 } from '@/exemplosN5'
import { grafoDoCiclo } from '@/grafoDoCiclo'
import {
  formatarBlocos,
  gerarConfiguracoesUnicas,
  gerarParticoesKPartes,
} from '@/gerarParticoeskpartes'

/**
 * Explicação científica do projecto em slides, a partir do relatório final de
 * IC (PIVIC-FC, UFGD). O conteúdo de cada slide está no template, escolhido
 * pelo `id`; o `SlideDeck` só trata da moldura e da navegação.
 */
interface SlideDaExplicacao {
  id: string
  secao: string
  titulo: string
}

const FUNDAMENTACAO = 'Materiais e métodos'
const RESULTADOS = 'Resultados e discussões'

const slides: SlideDaExplicacao[] = [
  {
    id: 'capa',
    secao: '',
    titulo: 'Enumeração de grafos via teoria de Pólya sob um ponto de vista computacional',
  },
  { id: 'introducao', secao: 'Introdução', titulo: 'Contar estruturas a menos de simetria' },
  { id: 'objetivos', secao: 'Objetivos', titulo: 'Objetivo geral e objetivos específicos' },
  { id: 'vertices-arestas', secao: FUNDAMENTACAO, titulo: 'Vértices, arestas e o grafo completo' },
  { id: 'tipo-ciclico', secao: FUNDAMENTACAO, titulo: 'Ciclos disjuntos e tipo cíclico' },
  { id: 'abordagens', secao: FUNDAMENTACAO, titulo: 'Quantas permutações têm um dado tipo?' },
  { id: 'indice-sm', secao: FUNDAMENTACAO, titulo: 'O índice de ciclos do grupo simétrico' },
  { id: 'grupo-induzido', secao: FUNDAMENTACAO, titulo: 'A ação induzida sobre as arestas' },
  { id: 'proposicao-1', secao: FUNDAMENTACAO, titulo: 'Caso 1 — arestas dentro de um ciclo' },
  { id: 'proposicao-2', secao: FUNDAMENTACAO, titulo: 'Caso 2 — arestas entre ciclos distintos' },
  { id: 'teorema-1', secao: FUNDAMENTACAO, titulo: 'Teorema 1 — o tipo cíclico induzido' },
  { id: 'teorema-2', secao: FUNDAMENTACAO, titulo: 'Teorema 2 — o índice de ciclos das arestas' },
  { id: 'algoritmo', secao: RESULTADOS, titulo: 'O algoritmo via partições de um inteiro' },
  { id: 'discussao', secao: RESULTADOS, titulo: 'Partições em vez de permutações' },
  { id: 'tabela-n5', secao: RESULTADOS, titulo: 'Tipos cíclicos induzidos para m = 5' },
  ...exemplosN5.map((exemplo) => ({
    id: `exemplo-${exemplo.particao}`,
    secao: `${RESULTADOS} · execução manual, m = 5`,
    titulo: `Partição ${exemplo.particao}`,
  })),
  { id: 'indice-n5', secao: RESULTADOS, titulo: 'O índice de ciclos das arestas de K₅' },
  { id: 'inventario', secao: RESULTADOS, titulo: 'Do índice de ciclos ao inventário de Pólya' },
  { id: 'contagem', secao: RESULTADOS, titulo: '34 grafos simples não isomorfos com 5 vértices' },
  {
    id: 'implementacao',
    secao: 'Implementação computacional',
    titulo: 'Tecnologias e organização do código',
  },
  {
    id: 'implementacao-algoritmos',
    secao: 'Implementação computacional',
    titulo: 'Partições, tipos cíclicos e grafos de ciclo',
  },
  { id: 'referencias', secao: 'Referências', titulo: 'Referências' },
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

const exemplo = computed(() => exemplosN5.find((e) => `exemplo-${e.particao}` === id.value))

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

// Exemplo ao vivo do gerador: o tipo [2, 2] em {1, 2, 3, 4}.
const configuracoes22 = gerarConfiguracoesUnicas(4, [2, 2]).map((texto) => ({
  texto,
  arestas: grafoDoCiclo(texto).arestas,
}))
</script>

<template>
  <main class="pagina explicacao">
    <SlideDeck v-model="atual" :slides="slides">
      <!-- ─────────────── Capa ─────────────── -->
      <section v-if="id === 'capa'" class="capa">
        <p class="instituicao">
          Iniciação Científica CNPq/UFGD 2024–2025 · PROPP / DINIC<br />
          Voluntário de Iniciação Científica Fluxo Contínuo (PIVIC-FC)
        </p>

        <dl class="ficha">
          <dt>Orientadora</dt>
          <dd>Irene Magalhães Craveiro — FACET</dd>
          <dt>Acadêmico</dt>
          <dd>Alvaro Vargaz Alvarez — FACET</dd>
          <dt>Vigência</dt>
          <dd>01/10/2025 a 30/09/2026</dd>
        </dl>

        <p class="dica-navegacao">
          Use as setas ← → do teclado, os botões ou o sumário abaixo para navegar.
        </p>
      </section>

      <!-- ─────────────── Introdução ─────────────── -->
      <section v-else-if="id === 'introducao'" class="texto">
        <p>
          A enumeração de estruturas discretas é um tema central da Matemática Discreta e da
          Combinatória, com aplicações em Estatística, Física, Biologia e Química. Entre as suas
          ferramentas principais estão as <strong>funções geradoras</strong>, introduzidas por
          Abraham de Moivre e desenvolvidas por Leonhard Euler na teoria das partições.
        </p>
        <p>
          No século XX, o <strong>Teorema de Enumeração de Pólya</strong> passou a combinar funções
          geradoras e grupos de permutação para contar objetos equivalentes por simetria — grafos,
          moléculas e outras estruturas combinatórias.
        </p>
        <p>
          Este trabalho estuda a construção do <strong>índice de ciclos</strong> do grupo simétrico
          e a sua aplicação ao Teorema de Pólya para enumerar grafos não isomorfos, e implementa um
          algoritmo que automatiza essa construção com custo muito menor do que a enumeração direta
          das permutações.
        </p>
      </section>

      <!-- ─────────────── Objetivos ─────────────── -->
      <section v-else-if="id === 'objetivos'" class="texto">
        <p>
          <strong>Objetivo geral:</strong> desenvolver os fundamentos matemáticos da teoria de Pólya
          e implementar algoritmos computacionais para a enumeração de grafos não isomorfos.
        </p>
        <p><strong>Objetivos específicos:</strong></p>
        <ul>
          <li>estudar funções geradoras e o Teorema de Pólya;</li>
          <li>desenvolver a construção do índice de ciclos do grupo simétrico;</li>
          <li>determinar o índice de ciclos do grupo induzido sobre as arestas;</li>
          <li>implementar algoritmos para automatizar a construção do índice de ciclos;</li>
          <li>aplicar o algoritmo à enumeração de grafos simples;</li>
          <li>analisar a redução do custo computacional obtida pela abordagem via partições.</li>
        </ul>
      </section>

      <!-- ─────────────── Vértices e arestas ─────────────── -->
      <section v-else-if="id === 'vertices-arestas'" class="colunas">
        <div class="texto">
          <p>
            Seja <MathTex expr="m \geq 2" /> e <MathTex expr="S = \{1, 2, \ldots, m\}" /> o conjunto
            de vértices. O conjunto de arestas considerado é
          </p>
          <MathTex
            display
            expr="D_m^{2} = \left\{ \{i,j\} \;:\; 1 \leq i < j \leq m \right\}, \qquad |D_m^{2}| = \binom{m}{2},"
          />
          <p>ou seja, as arestas do grafo completo <MathTex expr="K_m" />.</p>
          <p>
            Qualquer grafo simples sobre <MathTex expr="S" /> é então um vetor binário de
            comprimento <MathTex expr="\binom{m}{2}" />: cada posição diz se a aresta correspondente
            está presente ou ausente.
          </p>
          <p>
            Cada permutação <MathTex expr="\sigma \in S_m" /> age sobre os vértices e induz uma
            permutação sobre <MathTex expr="D_m^{2}" /> — é essa ação que leva ao índice de ciclos e
            ao Teorema de Pólya.
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
            Toda permutação escreve-se, de maneira única a menos da ordem dos fatores, como produto
            de <strong>ciclos disjuntos</strong>.
          </p>
          <p>
            Se a decomposição de <MathTex expr="\sigma" /> tem <MathTex expr="k_{\ell_i}" /> ciclos
            de comprimento <MathTex expr="\ell_i" /> (<MathTex expr="\ell_1 < \cdots < \ell_r" />),
            então <MathTex expr="\sum_{i=1}^{r} k_{\ell_i}\ell_i = m" />, e o
            <strong>tipo cíclico</strong> de <MathTex expr="\sigma" /> é o monômio
          </p>
          <MathTex
            display
            expr="T(\sigma) = x_{\ell_1}^{k_{\ell_1}}\, x_{\ell_2}^{k_{\ell_2}} \cdots x_{\ell_r}^{k_{\ell_r}}."
          />
          <p>
            Como os comprimentos somam <MathTex expr="m" />, cada tipo cíclico corresponde
            exatamente a uma <strong>partição de <MathTex expr="m" /></strong>. É esta
            correspondência que permite trocar as <MathTex expr="m!" /> permutações pelas partições
            de <MathTex expr="m" />.
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
          Para construir o índice de ciclos é preciso saber quantas permutações têm cada tipo
          cíclico. Há duas abordagens:
        </p>
        <div class="cartoes">
          <div class="cartao">
            <h3>1) Abordagem direta</h3>
            <p>
              Listar as <MathTex expr="m!" /> permutações de <MathTex expr="S_m" />, decompor cada
              uma em ciclos e identificar o seu tipo. Conceitualmente simples, mas inviável quando
              <MathTex expr="m" /> cresce — o número de permutações cresce fatorialmente.
            </p>
          </div>
          <div class="cartao destaque">
            <h3>2) Abordagem via partições</h3>
            <p>
              Listar as partições <MathTex expr="m = k_1 + 2k_2 + \cdots + mk_m" />, onde
              <MathTex expr="k_i" /> é o número de ciclos de comprimento <MathTex expr="i" />. Para
              cada uma, o número de permutações é
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
          <MathTex expr="G = \{\sigma^{*} : \sigma \in S_m\}" /> é subgrupo de
          <MathTex expr="S_t" />, e <MathTex expr="\varphi(\sigma) = \sigma^{*}" /> é um isomorfismo
          <MathTex expr="S_m \cong G" />, com <MathTex expr="|G| = m!" />. Os dois grupos são o
          mesmo, mas agem sobre conjuntos diferentes.
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
            <strong>Observação 1 (<MathTex expr="j = 2" />).</strong> Um ciclo de comprimento 2 tem
            uma única aresta interna, que fica fixa: <MathTex expr="X_2 \longmapsto X_1" />. É o que
            a fórmula par já dá: <MathTex expr="X_{2/2}\,X_2^{0} = X_1" />.
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
            Sejam <MathTex expr="C_r" /> e <MathTex expr="C_s" /> dois ciclos disjuntos de
            comprimentos <MathTex expr="r" /> e <MathTex expr="s" />. Cada aresta entre eles liga um
            vértice de <MathTex expr="C_r" /> a um de <MathTex expr="C_s" />.
          </p>
          <div class="enunciado">
            <p>
              <strong>Proposição 2.</strong> Cada uma dessas arestas pertence a uma órbita de
              comprimento <MathTex expr="\operatorname{mmc}(r,s)" />, e há
              <MathTex expr="\operatorname{mdc}(r,s)" /> órbitas. Assim, cada par de ciclos
              contribui com
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
            <li>
              a contribuição da Proposição 1 (ou da Observação 1) de <strong>cada ciclo</strong>;
            </li>
            <li>
              a contribuição
              <MathTex expr="X_{\operatorname{mmc}(r,s)}^{\operatorname{mdc}(r,s)}" /> da Proposição
              2 de <strong>cada par de ciclos</strong>.
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
            onde <MathTex expr="\lambda = (1^{k_1} 2^{k_2} \cdots m^{k_m})" /> percorre as partições
            de <MathTex expr="m" />,
          </p>
          <MathTex
            display
            expr="N(\lambda) = \frac{m!}{\displaystyle\prod_{j=1}^{m} j^{k_j}\, k_j!}"
          />
          <p>
            é o número de permutações com esse tipo cíclico, e
            <MathTex expr="T(\sigma_\lambda^{*})" /> é o tipo induzido dado pelas Proposições 1 e 2.
          </p>
        </div>
      </section>

      <!-- ─────────────── Algoritmo ─────────────── -->
      <section v-else-if="id === 'algoritmo'" class="texto">
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
              <li>
                atualize <MathTex expr="Z \leftarrow Z + N(k_1,\ldots,k_m)\, T(\sigma^{*})" />.
              </li>
            </ol>
          </li>
          <li>Calcule <MathTex expr="Z(G) = Z / m!" />.</li>
          <li>
            <strong>Saída:</strong> o índice de ciclos do grupo induzido <MathTex expr="G" />.
          </li>
        </ol>
      </section>

      <!-- ─────────────── Discussão ─────────────── -->
      <section v-else-if="id === 'discussao'" class="colunas">
        <div class="texto">
          <p>
            Todas as permutações com o mesmo tipo cíclico dão a mesma contribuição ao índice de
            ciclos do grupo induzido. Em vez de gerar as <MathTex expr="m!" /> permutações e
            decompor cada uma, o algoritmo percorre só as partições de <MathTex expr="m" />: calcula
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
            <MathTex :expr="`\\sigma = ${formatarBlocos(exemplo.sigma).replace(/ /g, '\\,')}`" />,
            de tipo <MathTex :expr="`T(\\sigma) = ${exemplo.tipo}`" />.
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
          Multiplicando cada <MathTex expr="T(\sigma^{*})" /> pelo número de permutações do seu tipo
          e dividindo por <MathTex expr="5! = 120" />:
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
          A distribuição é simétrica (<MathTex expr="k \leftrightarrow 10 - k" />): trocar um grafo
          pelo seu complementar preserva o isomorfismo.
        </p>
      </section>

      <!-- ─────────────── Implementação ─────────────── -->
      <section v-else-if="id === 'implementacao'" class="texto">
        <p>
          Aplicação em <strong>TypeScript</strong> sobre <strong>Vue 3</strong> — repositório
          <a
            href="https://github.com/alvaro-star/IC---Tutorial-da-Teoria-de-Polya"
            target="_blank"
            rel="noopener"
            >alvaro-star/IC---Tutorial-da-Teoria-de-Polya</a
          >.
        </p>
        <ul>
          <li>
            <strong>Vue 3</strong> — interface reativa, componentes <code>.vue</code> de
            responsabilidade única;
          </li>
          <li>
            <strong>v-network-graph</strong> — desenho dos grafos, com os vértices dispostos em
            círculo;
          </li>
          <li>
            <strong>KaTeX</strong> — as expressões matemáticas, num único componente
            <code>MathTex.vue</code>.
          </li>
        </ul>
        <p><strong>Organização (<code>src/</code>):</strong></p>
        <ul class="arquivos">
          <li>
            <code>views/PoliaDemonstration.vue</code> — a demonstração; guarda
            <MathTex expr="N" /> (atualizado em “Aplicar”) e compõe os blocos;
          </li>
          <li>
            <code>components/SubsetDisplay.vue</code> — os pares de
            <MathTex expr="S = \{1,\ldots,N\}" />, agrupados pelo primeiro elemento;
          </li>
          <li>
            <code>components/PolyaGraph.vue</code> — grafo genérico: <MathTex expr="K_N" /> ou
            arestas explícitas, direcionado ou não;
          </li>
          <li>
            <code>components/PartitionDisplay.vue</code> — cada partição de <MathTex expr="N" /> com
            todas as suas configurações, em texto e em grafo;
          </li>
          <li><code>gerarParticoeskpartes.ts</code> — partições e tipos cíclicos;</li>
          <li><code>grafoDoCiclo.ts</code> — tipo cíclico → grafo direcionado.</li>
        </ul>
      </section>

      <!-- ─────────────── Implementação: algoritmos ─────────────── -->
      <section v-else-if="id === 'implementacao-algoritmos'" class="texto">
        <p>
          <strong>Partições:</strong> <code>gerarParticoesKPartes(n, k)</code> gera as partições na
          representação de multiplicidade <MathTex expr="\alpha^{\lambda}" /> (Algoritmo 7, “com
          regra”): o pivô salta as partições que excederiam <MathTex expr="k" /> partes em vez de
          filtrá-las depois. Com <MathTex expr="k = n" /> obtêm-se todas.
        </p>
        <p>
          <strong>Permutações de um tipo:</strong> <code>permsDoTipo(n, tipo)</code> gera cada
          permutação exatamente uma vez, sem enumerar as <MathTex expr="n!" /> e filtrar:
        </p>
        <ol>
          <li>
            o menor elemento livre inicia sempre o próximo ciclo — elimina rotações,
            <MathTex expr="(1\,3\,2) \equiv (3\,2\,1)" />;
          </li>
          <li>
            só se percorrem os comprimentos <em>distintos</em> que restam — elimina reordenações,
            <MathTex expr="(1\,2)(3\,4) \equiv (3\,4)(1\,2)" />.
          </li>
        </ol>
        <p>
          <strong>Grafo do ciclo:</strong> <code>grafoDoCiclo</code> dá a cada ciclo de comprimento
          <MathTex expr="\geq 2" /> uma aresta de cada elemento para o seguinte; pontos fixos ficam
          isolados. Abaixo, ao vivo, o tipo <MathTex expr="[2,2]" /> em
          <MathTex expr="\{1,2,3,4\}" />
          —
          <MathTex :expr="`\\frac{4!}{2^2\\cdot 2!} = ${configuracoes22.length}`" /> configurações:
        </p>
        <ul class="mini-grafos">
          <li v-for="c in configuracoes22" :key="c.texto">
            <p class="titulo-ciclo">{{ c.texto }}</p>
            <PolyaGraph :n="4" direcionado :arestas="c.arestas" :raio="45" altura="130px" />
          </li>
        </ul>
      </section>

      <!-- ─────────────── Referências ─────────────── -->
      <section v-else-if="id === 'referencias'" class="texto referencias">
        <ul>
          <li>
            STANLEY, R. P. <em>Enumerative Combinatorics: Volume 2</em>. Cambridge: Cambridge
            University Press, 1999.
          </li>
          <li>
            STANLEY, R. P. <em>Enumerative Combinatorics: Volume 2</em>. Cambridge: Cambridge
            University Press, 2001.
          </li>
          <li>
            PÓLYA, G. Kombinatorische Anzahlbestimmungen für Gruppen, Graphen und chemische
            Verbindungen. <em>Acta Mathematica</em>, v. 68, n. 1, p. 145–254, 1937.
            <a href="https://doi.org/10.1007/BF02546665" target="_blank" rel="noopener"
              >doi:10.1007/BF02546665</a
            >.
          </li>
          <li>
            STANTON, D.; WHITE, D. <em>Constructive Combinatorics</em>. New York: Springer, 1986.
          </li>
          <li>
            KREHER, D. L.; STINSON, D. R.
            <em>Combinatorial Algorithms: Generation, Enumeration, and Search</em>. Boca Raton: CRC
            Press, 1998.
          </li>
        </ul>
      </section>
    </SlideDeck>
  </main>
</template>

<style scoped>
.texto {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  font-size: 1.02rem;
  line-height: 1.7;
}

.texto ul,
.texto ol {
  padding-left: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.texto h3 {
  margin-top: 0.5rem;
  font-size: 1.05rem;
}

.texto > .math-tex {
  display: block;
}

.colunas {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: 2rem;
  align-items: start;
}

figure {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

figcaption {
  color: var(--muted);
  font-size: 0.85rem;
}

.enfase {
  padding: 0.8rem 1.1rem;
  border-left: 3px solid var(--accent);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  background: var(--accent-soft);
}

.nota {
  color: var(--muted);
  font-size: 0.88rem;
}

/* Enunciados (proposições, teoremas): caixa de livro-texto. */
.enunciado {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--line);
  border-left: 3px solid var(--ink);
  border-radius: 0 var(--radius) var(--radius) 0;
  background: var(--surface-sunken);
}

.enunciado.secundario {
  border-left-color: var(--line-strong);
  background: none;
}

.cartoes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
}

.cartao {
  padding: 1.1rem 1.25rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.cartao.destaque {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.cartao h3 {
  margin: 0 0 0.4rem;
}

.tabela {
  border-collapse: collapse;
  width: 100%;
  font-variant-numeric: tabular-nums;
}

.tabela th,
.tabela td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--line);
  text-align: center;
}

.tabela th {
  border-bottom-color: var(--line-strong);
  color: var(--ink-soft);
  font-size: 0.9rem;
  font-weight: 600;
}

.tabela tfoot td {
  font-weight: 600;
  border-bottom: none;
}

.algoritmo ol {
  margin-top: 0.3rem;
}

.passos {
  list-style: none;
  padding-left: 0 !important;
}

.passos li {
  overflow-x: auto;
}

.subtotal {
  font-size: 0.95rem;
}

.resultado {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.caixa {
  padding: 0.35rem 0.8rem;
  border: 1.5px solid var(--accent);
  border-radius: var(--radius-sm);
  background: var(--accent-soft);
}

.capa {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.instituicao {
  color: var(--ink-soft);
}

.ficha {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.4rem 1.25rem;
}

.ficha dt {
  color: var(--muted);
}

.dica-navegacao {
  color: var(--muted);
  font-size: 0.85rem;
}

.barras {
  list-style: none;
  padding: 0 !important;
  display: flex !important;
  flex-direction: row !important;
  align-items: flex-end;
  gap: 0.5rem !important;
  height: 12rem;
}

.barras li {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.barra {
  width: 100%;
  max-width: 2.5rem;
  border-radius: 4px 4px 0 0;
  background: var(--accent);
}

.barra-valor,
.barra-rotulo {
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}

.legenda-barras {
  color: var(--muted);
  font-size: 0.85rem;
  text-align: center;
}

.mini-grafos {
  list-style: none;
  padding: 0 !important;
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem !important;
}

.titulo-ciclo {
  margin-bottom: 0.3rem;
  font-family: var(--font-mono);
  font-size: 0.85rem;
}

.referencias li {
  font-size: 0.9rem;
}

@media (max-width: 760px) {
  .colunas {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
