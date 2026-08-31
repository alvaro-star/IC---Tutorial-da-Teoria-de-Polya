<script setup lang="ts">
import { computed } from 'vue'
import katex from 'katex'

const props = withDefaults(
  defineProps<{
    /** Expressão em LaTeX, ex.: "6^{2} 3^{1} 2^{4}" */
    expr: string
    /** true = bloco centralizado; false = dentro da linha de texto */
    display?: boolean
  }>(),
  { display: false },
)

const html = computed(() =>
  katex.renderToString(props.expr, {
    displayMode: props.display,
    throwOnError: false,
    output: 'html',
  }),
)
</script>

<template>
  <span class="math-tex" v-html="html"></span>
</template>

<style scoped>
.math-tex {
  display: inline-block;
}
</style>
