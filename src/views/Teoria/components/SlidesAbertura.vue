<script setup lang="ts">
/**
 * Slides da Teoria: capa, introdução e objetivos.
 * Desenha o slide cujo `id` recebe; para os outros ids não desenha nada.
 */
defineProps<{ id: string | undefined }>()
</script>

<template>
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
      ferramentas principais estão as <strong>funções geradoras</strong>, introduzidas por Abraham
      de Moivre e desenvolvidas por Leonhard Euler na teoria das partições.
    </p>
    <p>
      No século XX, o <strong>Teorema de Enumeração de Pólya</strong> passou a combinar funções
      geradoras e grupos de permutação para contar objetos equivalentes por simetria — grafos,
      moléculas e outras estruturas combinatórias.
    </p>
    <p>
      Este trabalho estuda a construção do <strong>índice de ciclos</strong> do grupo simétrico e a
      sua aplicação ao Teorema de Pólya para enumerar grafos não isomorfos, e implementa um
      algoritmo que automatiza essa construção com custo muito menor do que a enumeração direta das
      permutações.
    </p>
  </section>

  <!-- ─────────────── Objetivos ─────────────── -->
  <section v-else-if="id === 'objetivos'" class="texto">
    <p>
      <strong>Objetivo geral:</strong> desenvolver os fundamentos matemáticos da teoria de Pólya e
      implementar algoritmos computacionais para a enumeração de grafos não isomorfos.
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
</template>
