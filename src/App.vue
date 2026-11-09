<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

// O percurso do tutorial, na ordem em que deve ser lido.
const links = [
  { para: '/', rotulo: 'Início' },
  { para: '/explicacao', rotulo: 'Teoria', passo: 1 },
  { para: '/polia-demonstration', rotulo: 'Prática', passo: 2 },
  { para: '/about', rotulo: 'Sobre' },
]
</script>

<template>
  <header class="topo">
    <div class="topo-interno">
      <RouterLink to="/" class="marca" aria-label="Início">
        <span class="marca-simbolo" aria-hidden="true">P</span>
        <span>Pólya <span class="marca-sub">· tutorial</span></span>
      </RouterLink>

      <nav aria-label="Navegação principal">
        <RouterLink v-for="link in links" :key="link.para" :to="link.para">
          <span v-if="link.passo" class="passo" aria-hidden="true">{{ link.passo }}</span>
          {{ link.rotulo }}
        </RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />

  <footer class="rodape">
    <div class="rodape-interno">
      Enumeração de grafos via teoria de Pólya · Iniciação Científica UFGD
    </div>
  </footer>
</template>

<style scoped>
.topo {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(8px);
}

.topo-interno {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: var(--largura-pagina);
  min-height: var(--altura-topo);
  margin: 0 auto;
  padding: 0 1.5rem;
}

.marca {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.marca-simbolo {
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: var(--accent);
  color: var(--on-accent);
  font-size: 0.95rem;
}

.marca-sub {
  font-weight: 400;
  color: var(--muted);
}

nav {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
}

nav a {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.7rem;
  border-radius: var(--radius-sm);
  color: var(--ink-soft);
  font-size: 0.92rem;
  text-decoration: none;
  white-space: nowrap;
}

nav a:hover {
  color: var(--ink);
  background: var(--surface-sunken);
}

nav a.router-link-exact-active {
  color: var(--ink);
  font-weight: 600;
}

.passo {
  display: grid;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
}

.router-link-exact-active .passo {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--on-accent);
}

.rodape {
  margin-top: auto;
  border-top: 1px solid var(--line);
}

.rodape-interno {
  max-width: var(--largura-pagina);
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  color: var(--muted);
  font-size: 0.85rem;
}

@media (max-width: 640px) {
  .topo-interno {
    padding: 0 1rem;
  }

  .marca-sub {
    display: none;
  }

  nav a {
    padding: 0.4rem 0.5rem;
  }
}
</style>
