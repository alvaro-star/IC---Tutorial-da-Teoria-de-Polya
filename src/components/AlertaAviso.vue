<script setup lang="ts">
/**
 * Caixa de alerta. O texto vem pelo slot por omissão; botões ou ligações,
 * pelo slot `acoes`. `tipo` muda só a cor e o ícone.
 */
withDefaults(
  defineProps<{
    /** Título curto, em negrito, antes do texto. */
    titulo?: string
    /** `aviso` (amarelo) para riscos, `info` (azul) para notas neutras. */
    tipo?: 'aviso' | 'info'
  }>(),
  { titulo: undefined, tipo: 'aviso' },
)
</script>

<template>
  <div class="alerta" :class="tipo" :role="tipo === 'aviso' ? 'alert' : 'status'">
    <svg class="icone" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
      <template v-if="tipo === 'aviso'">
        <path
          d="M10 2.5 18.5 17h-17L10 2.5Z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linejoin="round"
        />
        <path d="M10 8v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <circle cx="10" cy="14.6" r="1" fill="currentColor" />
      </template>
      <template v-else>
        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.6" />
        <path d="M10 9v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <circle cx="10" cy="6.3" r="1" fill="currentColor" />
      </template>
    </svg>

    <div class="corpo">
      <p v-if="titulo" class="titulo">{{ titulo }}</p>
      <div class="texto"><slot /></div>
      <div v-if="$slots.acoes" class="acoes"><slot name="acoes" /></div>
    </div>
  </div>
</template>

<style scoped>
.alerta {
  display: flex;
  gap: 0.75rem;
  padding: 0.9rem 1.1rem;
  border: 1px solid;
  border-radius: var(--radius);
}

.aviso {
  border-color: var(--aviso-line);
  background: var(--aviso-soft);
}

.aviso .icone {
  color: var(--aviso);
}

.info {
  border-color: color-mix(in srgb, var(--accent) 30%, transparent);
  background: var(--accent-soft);
}

.info .icone {
  color: var(--accent);
}

.icone {
  flex: none;
  margin-top: 0.15rem;
}

.corpo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.titulo {
  font-weight: 600;
}

.texto {
  color: var(--ink-soft);
  font-size: 0.95rem;
}

.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.4rem;
}
</style>
