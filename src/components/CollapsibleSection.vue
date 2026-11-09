<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AlertaAviso from '@/components/AlertaAviso.vue'
import { LIMITE_DE_REGISTROS } from '@/limites'

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
    /** Número do passo, mostrado num círculo antes do título. */
    numero?: number
    /**
     * Quantos registros o conteúdo vai mostrar. Acima de `LIMITE_DE_REGISTROS` (600), abrir a secção
     * mostra primeiro um alerta, e o conteúdo só é montado (e calculado)
     * depois de o utilizador confirmar.
     */
    registros?: number | bigint
  }>(),
  {
    titulo: undefined,
    dica: undefined,
    aberta: true,
    compacta: false,
    numero: undefined,
    registros: undefined,
  },
)

// O conteúdo é montado só quando aberto (v-if no template): listas de n!
// configurações não pagam render enquanto a linha está fechada.
const aberto = ref(props.aberta)

const alternar = () => {
  aberto.value = !aberto.value
}

const pesada = computed(
  () => props.registros !== undefined && props.registros > LIMITE_DE_REGISTROS,
)

// A confirmação vale para esta quantidade: se mudar (outro N), pergunta-se de novo.
const confirmada = ref(false)
watch(
  () => props.registros,
  () => {
    confirmada.value = false
  },
)

const registrosFormatados = computed(() => props.registros?.toLocaleString('pt-BR') ?? '')
</script>

<template>
  <section class="collapsible" :class="{ compacta, aberto }">
    <button type="button" class="cabecalho" :aria-expanded="aberto" @click="alternar">
      <span v-if="numero !== undefined" class="numero" aria-hidden="true">{{ numero }}</span>
      <span class="titulo">
        <slot name="titulo">{{ titulo }}</slot>
      </span>
      <span v-if="dica" class="dica">{{ dica }}</span>
      <svg class="seta" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <path
          d="M6 4l4 4-4 4"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <div v-if="aberto" class="conteudo">
      <AlertaAviso v-if="pesada && !confirmada" titulo="Lista muito grande">
        Esta lista tem {{ registrosFormatados }} registros. Mostrá-los todos pode deixar a sua
        máquina lenta, ou até travar a página por alguns instantes.
        <template #acoes>
          <button type="button" class="botao" @click="confirmada = true">
            Mostrar mesmo assim
          </button>
          <button type="button" class="botao" @click="alternar">Fechar</button>
        </template>
      </AlertaAviso>
      <slot v-else />
    </div>
  </section>
</template>

<style scoped>
.collapsible {
  margin-bottom: 1.25rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow);
}

.collapsible.compacta {
  margin-bottom: 0;
  border: none;
  border-bottom: 1px solid var(--line);
  border-radius: 0;
  background: none;
  box-shadow: none;
}

.cabecalho {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
  padding: 1.1rem 1.4rem;
  border: none;
  border-radius: var(--radius-lg);
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.compacta .cabecalho {
  gap: 0.6rem;
  padding: 0.65rem 0.25rem;
  border-radius: 0;
}

.cabecalho:hover .seta {
  color: var(--ink);
}

.numero {
  display: grid;
  flex: none;
  place-items: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
  font-family: var(--font-serif);
  font-weight: 600;
}

.titulo {
  flex: 1;
  min-width: 0;
  font-family: var(--font-serif);
  font-size: 1.2rem;
  font-weight: 600;
}

.compacta .titulo {
  font-family: var(--font-sans);
  font-size: 0.98rem;
  font-weight: 400;
}

.dica {
  flex: none;
  color: var(--muted);
  font-size: 0.82rem;
  font-variant-numeric: tabular-nums;
}

.seta {
  flex: none;
  order: -1;
  color: var(--muted);
  transition: transform 0.15s ease;
}

.collapsible:not(.compacta) .seta {
  order: 0;
}

.aberto > .cabecalho .seta {
  transform: rotate(90deg);
}

.conteudo {
  padding: 0 1.4rem 1.4rem;
}

.compacta .conteudo {
  padding: 0.25rem 0 1rem 1.6rem;
}

@media (max-width: 640px) {
  .cabecalho {
    padding: 0.9rem 1rem;
  }

  .conteudo {
    padding: 0 1rem 1rem;
  }

  .compacta .conteudo {
    padding-left: 0.5rem;
  }
}
</style>
