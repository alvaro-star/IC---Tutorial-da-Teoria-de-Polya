<script setup lang="ts">
import MathTex from '@/components/MathTex.vue'
import PolyaGraph from '@/components/PolyaGraph.vue'
import { grafoDoCiclo } from '@/combinatoria/grafoDoCiclo'
import { gerarConfiguracoesUnicas } from '@/combinatoria/mathForms'

/**
 * Slides da Teoria: implementação computacional e referências.
 * Desenha o slide cujo `id` recebe; para os outros ids não desenha nada.
 */
defineProps<{ id: string | undefined }>()

// Exemplo ao vivo do gerador: o tipo [2, 2] em {1, 2, 3, 4}.
const configuracoes22 = gerarConfiguracoesUnicas(4, [2, 2]).map((texto) => ({
  texto,
  arestas: grafoDoCiclo(texto).arestas,
}))
</script>

<template>
  <!-- ─────────────── Implementação ─────────────── -->
  <section v-if="id === 'implementacao'" class="texto">
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
        <strong>v-network-graph</strong> — desenho dos grafos, com os vértices dispostos em círculo;
      </li>
      <li>
        <strong>KaTeX</strong> — as expressões matemáticas, num único componente
        <code>MathTex.vue</code>.
      </li>
    </ul>
    <p><strong>Organização (<code>src/</code>):</strong></p>
    <ul class="arquivos">
      <li>
        <code>views/</code> — uma pasta por página, cada uma com o seu <code>Index.vue</code> e os
        seus próprios <code>components/</code>: <code>Inicio</code>, <code>Teoria</code> (estes
        slides), <code>Pratica</code> (a demonstração interativa) e <code>Sobre</code>;
      </li>
      <li>
        <code>views/Pratica/components/</code> — os pares de <MathTex expr="S = \{1,\ldots,N\}" />,
        as partições de <MathTex expr="N" /> com as suas configurações e grafos, a ação induzida
        <MathTex expr="\sigma^{*}" /> e os tipos cíclicos induzidos;
      </li>
      <li>
        <code>components/</code> — o que várias páginas partilham:
        <code>PolyaGraph.vue</code> (grafo genérico, <MathTex expr="K_N" /> ou arestas explícitas),
        <code>MathTex.vue</code>, <code>CollapsibleSection.vue</code> e
        <code>AlertaAviso.vue</code>;
      </li>
      <li>
        <code>combinatoria/</code> — os cálculos, separados da interface:
        <code>gerarParticoesKPartes.ts</code> (partições), <code>mathForms.ts</code> (tipos
        cíclicos), <code>contarPermutacoesDoTipo.ts</code> (<MathTex expr="N(\lambda)" />),
        <code>acaoInduzida.ts</code> (<MathTex expr="\sigma^{*}" />),
        <code>formatadores.ts</code> (texto e LaTeX), <code>grafoDoCiclo.ts</code> e
        <code>pares.ts</code>.
      </li>
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
        STANLEY, R. P. <em>Enumerative Combinatorics: Volume 2</em>. Cambridge: Cambridge University
        Press, 1999.
      </li>
      <li>
        STANLEY, R. P. <em>Enumerative Combinatorics: Volume 2</em>. Cambridge: Cambridge University
        Press, 2001.
      </li>
      <li>
        PÓLYA, G. Kombinatorische Anzahlbestimmungen für Gruppen, Graphen und chemische
        Verbindungen. <em>Acta Mathematica</em>, v. 68, n. 1, p. 145–254, 1937.
        <a href="https://doi.org/10.1007/BF02546665" target="_blank" rel="noopener"
          >doi:10.1007/BF02546665</a
        >.
      </li>
      <li>STANTON, D.; WHITE, D. <em>Constructive Combinatorics</em>. New York: Springer, 1986.</li>
      <li>
        KREHER, D. L.; STINSON, D. R.
        <em>Combinatorial Algorithms: Generation, Enumeration, and Search</em>. Boca Raton: CRC
        Press, 1998.
      </li>
    </ul>
  </section>
</template>
