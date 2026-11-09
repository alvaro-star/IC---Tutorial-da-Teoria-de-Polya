<template>
  <main class="pagina pagina-estreita sobre">
    <header class="cabecalho-pagina">
      <p class="sobretitulo">Sobre</p>
      <h1>O projeto</h1>
      <p class="lead">
        Este tutorial acompanha o relatório final de Iniciação Científica
        <em>Enumeração de grafos via teoria de Pólya sob um ponto de vista computacional</em>.
      </p>
    </header>

    <dl class="ficha">
      <dt>Programa</dt>
      <dd>
        Iniciação Científica CNPq/UFGD 2024–2025 · PROPP / DINIC — Voluntário de Iniciação
        Científica Fluxo Contínuo (PIVIC-FC)
      </dd>
      <dt>Orientadora</dt>
      <dd>Irene Magalhães Craveiro — FACET</dd>
      <dt>Acadêmico</dt>
      <dd>Alvaro Vargaz Alvarez — FACET</dd>
      <dt>Vigência</dt>
      <dd>01/10/2025 a 30/09/2026</dd>
      <dt>Código</dt>
      <dd>
        <a
          href="https://github.com/alvaro-star/IC---Tutorial-da-Teoria-de-Polya"
          target="_blank"
          rel="noopener"
          >alvaro-star/IC---Tutorial-da-Teoria-de-Polya</a
        >
      </dd>
    </dl>
  </main>
</template>

<style scoped>
.ficha {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0;
  border-top: 1px solid var(--line);
}

.ficha dt,
.ficha dd {
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--line);
}

.ficha dt {
  padding-right: 2rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.ficha dd {
  overflow-wrap: anywhere;
}

@media (max-width: 560px) {
  .ficha {
    grid-template-columns: minmax(0, 1fr);
  }

  .ficha dt {
    padding-bottom: 0;
    border-bottom: none;
  }

  .ficha dd {
    padding-top: 0.2rem;
  }
}
</style>
