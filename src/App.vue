<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
      <RouterLink to="/polia-demonstration">Polia Demonstration</RouterLink>
    </nav>
  </header>

    <RouterView />
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  padding: 0.75rem 1.5rem;
}

nav {
  display: flex;
  gap: 1rem;
}

nav a {
  font-size: 0.95rem;
  color: var(--color-text);
  text-decoration: none;
}

nav a.router-link-exact-active {
  font-weight: 600;
  color: var(--color-text);
}
</style>
