<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'

/**
 * Moldura de apresentação: cabeçalho do slide atual, barra de progresso,
 * navegação (botões, sumário e teclado). O conteúdo de cada slide vem pelo
 * slot — quem usa o deck decide o que desenhar para o índice em `v-model`.
 */
const props = defineProps<{
  /** Secção e título de cada slide, na ordem de apresentação. */
  slides: { secao: string; titulo: string }[]
}>()

/** Índice (0-based) do slide visível. */
const atual = defineModel<number>({ required: true })

const total = computed(() => props.slides.length)
const slide = computed(() => props.slides[atual.value])
const progresso = computed(() => (total.value === 0 ? 0 : ((atual.value + 1) / total.value) * 100))

const irPara = (indice: number) => {
  atual.value = Math.min(Math.max(indice, 0), total.value - 1)
}

const anterior = () => irPara(atual.value - 1)
const seguinte = () => irPara(atual.value + 1)

// Setas / PageUp / PageDown / Home / End. Ignora teclas digitadas em campos,
// para não roubar a navegação do <select> do sumário.
const aoTeclar = (evento: KeyboardEvent) => {
  const alvo = evento.target as HTMLElement | null
  if (alvo?.closest('input, select, textarea')) return

  const acoes: Record<string, () => void> = {
    ArrowRight: seguinte,
    PageDown: seguinte,
    ArrowLeft: anterior,
    PageUp: anterior,
    Home: () => irPara(0),
    End: () => irPara(total.value - 1),
  }
  const acao = acoes[evento.key]
  if (acao === undefined) return
  evento.preventDefault()
  acao()
}

onMounted(() => window.addEventListener('keydown', aoTeclar))
onBeforeUnmount(() => window.removeEventListener('keydown', aoTeclar))
</script>

<template>
  <div class="slide-deck">
    <div class="progresso" aria-hidden="true">
      <div class="progresso-barra" :style="{ width: `${progresso}%` }"></div>
    </div>

    <article class="slide" :aria-label="slide?.titulo">
      <header v-if="slide" class="slide-cabecalho">
        <p v-if="slide.secao" class="secao">{{ slide.secao }}</p>
        <h2>{{ slide.titulo }}</h2>
      </header>

      <div class="slide-corpo">
        <slot />
      </div>
    </article>

    <nav class="controles" aria-label="Navegação dos slides">
      <button type="button" class="botao" :disabled="atual === 0" @click="anterior">
        ← Anterior
      </button>

      <label class="sumario">
        <span class="contador">{{ atual + 1 }} / {{ total }}</span>
        <select
          :value="atual"
          aria-label="Ir para o slide"
          @change="irPara(Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="(s, i) in slides" :key="i" :value="i">{{ i + 1 }}. {{ s.titulo }}</option>
        </select>
      </label>

      <button
        type="button"
        class="botao botao-primario"
        :disabled="atual === total - 1"
        @click="seguinte"
      >
        Seguinte →
      </button>
    </nav>
  </div>
</template>

<style scoped>
.slide-deck {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 64rem;
  margin: 0 auto;
}

.progresso {
  height: 3px;
  border-radius: 2px;
  background: var(--line);
  overflow: hidden;
}

.progresso-barra {
  height: 100%;
  background: var(--accent);
  transition: width 0.25s ease;
}

.slide {
  min-height: 32rem;
  padding: 2.5rem 3rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow);
}

.slide-cabecalho {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.75rem;
}

.secao {
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.slide-cabecalho h2 {
  font-size: clamp(1.4rem, 2.6vw, 1.9rem);
}

.controles {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.sumario {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-width: 0;
}

.contador {
  flex: none;
  color: var(--muted);
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
}

.sumario select {
  min-width: 0;
  max-width: 22rem;
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .slide {
    min-height: 0;
    padding: 1.5rem 1.1rem;
  }

  .controles {
    justify-content: center;
  }

  .sumario {
    order: -1;
    flex-basis: 100%;
  }
}
</style>
