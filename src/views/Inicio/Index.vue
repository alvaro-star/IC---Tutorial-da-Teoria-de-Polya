<script setup lang="ts">
import { RouterLink } from 'vue-router'
import MathTex from '@/components/MathTex.vue'
import PolyaGraph from '@/components/PolyaGraph.vue'

const etapas = [
  {
    passo: 1,
    para: '/explicacao',
    titulo: 'Teoria',
    texto:
      'Do tipo cíclico de uma permutação ao índice de ciclos e ao Teorema de Pólya, ' +
      'com o caso de cinco vértices resolvido à mão, slide a slide.',
    acao: 'Abrir os slides',
  },
  {
    passo: 2,
    para: '/polia-demonstration',
    titulo: 'Prática',
    texto:
      'Escolha N e explore os pares de vértices, as partições de N e o grafo de cada ' +
      'permutação gerada pelo algoritmo.',
    acao: 'Abrir a demonstração',
  },
]
</script>

<template>
  <main class="pagina inicio">
    <section class="heroi">
      <div class="heroi-texto">
        <p class="sobretitulo">Tutorial · Combinatória enumerativa</p>
        <h1>Contar grafos a menos de simetria</h1>
        <p class="lead">
          Quantos grafos simples diferentes existem com cinco vértices? Se dois grafos que só
          diferem pelos nomes dos vértices contam como um só, a resposta é
          <MathTex expr="34" />. Este tutorial mostra como chegar lá com a teoria de Pólya — e como
          um algoritmo sobre partições de inteiros evita percorrer as
          <MathTex expr="m!" /> permutações.
        </p>
        <div class="heroi-acoes">
          <RouterLink to="/explicacao" class="botao botao-primario">Começar pela teoria</RouterLink>
          <RouterLink to="/polia-demonstration" class="botao">Ir para a prática</RouterLink>
        </div>
      </div>

      <figure class="heroi-figura">
        <PolyaGraph :n="5" :raio="110" altura="280px" />
        <figcaption>
          <MathTex expr="K_5" />, o grafo completo: todo o grafo com 5 vértices é um subconjunto das
          suas <MathTex expr="\binom{5}{2} = 10" /> arestas.
        </figcaption>
      </figure>
    </section>

    <section class="percurso" aria-labelledby="titulo-percurso">
      <h2 id="titulo-percurso">O percurso</h2>
      <ol class="etapas">
        <li v-for="etapa in etapas" :key="etapa.passo">
          <RouterLink :to="etapa.para" class="etapa">
            <span class="etapa-numero" aria-hidden="true">{{ etapa.passo }}</span>
            <span class="etapa-corpo">
              <span class="etapa-titulo">{{ etapa.titulo }}</span>
              <span class="etapa-texto">{{ etapa.texto }}</span>
              <span class="etapa-acao">{{ etapa.acao }} →</span>
            </span>
          </RouterLink>
        </li>
      </ol>
    </section>

    <section class="prerequisitos">
      <h3>Antes de começar</h3>
      <p>
        Ajuda conhecer permutações e a sua escrita em ciclos, por exemplo
        <MathTex expr="\sigma = (1\,2)(3\,4\,5)" />, e a noção de grafo como um conjunto de vértices
        ligados por arestas. O resto é construído ao longo do caminho.
      </p>
    </section>
  </main>
</template>

<style scoped>
.inicio {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.heroi {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: 3rem;
  align-items: center;
  padding-top: 1.5rem;
}

.heroi-texto {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.heroi-acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.heroi-figura {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

figcaption {
  color: var(--muted);
  font-size: 0.88rem;
}

.percurso {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.etapas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: 1rem;
  padding: 0;
  list-style: none;
}

.etapa {
  display: flex;
  gap: 1rem;
  height: 100%;
  padding: 1.5rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.15s ease;
}

.etapa:hover {
  border-color: var(--accent);
}

.etapa-numero {
  display: grid;
  flex: none;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
  font-family: var(--font-serif);
  font-size: 1.1rem;
  font-weight: 600;
}

.etapa-corpo {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.etapa-titulo {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-weight: 600;
}

.etapa-texto {
  color: var(--ink-soft);
  font-size: 0.95rem;
}

.etapa-acao {
  margin-top: auto;
  padding-top: 0.5rem;
  color: var(--accent);
  font-size: 0.92rem;
  font-weight: 500;
}

.prerequisitos {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: var(--largura-texto);
  padding-left: 1.25rem;
  border-left: 2px solid var(--line-strong);
  color: var(--ink-soft);
}

@media (max-width: 820px) {
  .heroi {
    grid-template-columns: minmax(0, 1fr);
    gap: 2rem;
  }
}
</style>
