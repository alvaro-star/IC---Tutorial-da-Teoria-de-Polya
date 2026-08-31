<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Texto do cabeçalho (ignorado se o slot `titulo` for usado). */
    titulo?: string
    /** Informação secundária à direita do título, ex.: "12 configurações". */
    dica?: string
    /** Estado inicial da secção. */
    aberta?: boolean
    /** Cabeçalho mais discreto, para linhas dentro de uma secção. */
    compacta?: boolean
  }>(),
  { aberta: true, compacta: false },
)

// O conteúdo é montado só quando aberto (v-if no template): listas de n!
// configurações não pagam render enquanto a linha está fechada.
const aberto = ref(props.aberta)

const alternar = () => {
  aberto.value = !aberto.value
}
</script>

<template>
  <section class="collapsible" :class="{ compacta }">
    <button
      type="button"
      class="cabecalho"
      :aria-expanded="aberto"
      @click="alternar"
    >
      <span class="seta" :class="{ aberto }" aria-hidden="true">▸</span>
      <span class="titulo">
        <slot name="titulo">{{ titulo }}</slot>
      </span>
      <span v-if="dica" class="dica">{{ dica }}</span>
    </button>

    <div v-if="aberto" class="conteudo">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.collapsible {
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 6px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.collapsible.compacta {
  border: none;
  border-bottom: 1px solid rgba(128, 128, 128, 0.25);
  border-radius: 0;
  margin-bottom: 0;
}

.cabecalho {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: none;
  background: rgba(128, 128, 128, 0.08);
  font: inherit;
  font-size: 1rem;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.compacta .cabecalho {
  background: none;
  padding: 0.4rem 0.2rem;
  font-size: 0.95rem;
}

.cabecalho:hover {
  background: rgba(128, 128, 128, 0.16);
}

.seta {
  display: inline-block;
  flex: none;
  transition: transform 0.15s ease;
  opacity: 0.7;
}

.seta.aberto {
  transform: rotate(90deg);
}

.titulo {
  flex: 1;
  min-width: 0;
}

.dica {
  flex: none;
  font-size: 0.8rem;
  opacity: 0.65;
}

.conteudo {
  padding: 0.25rem 0.8rem 0.6rem;
}

.compacta .conteudo {
  padding: 0.25rem 0 0.6rem 1.6rem;
}
</style>
