import { createRouter, createWebHistory } from 'vue-router'
import InicioView from '@/views/Inicio/Index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: InicioView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/Sobre/Index.vue'),
    },
    {
      path: '/polia-demonstration',
      name: 'polia-demonstration',
      component: () => import('@/views/Pratica/Index.vue'),
    },
    {
      path: '/explicacao',
      name: 'explicacao',
      component: () => import('@/views/Teoria/Index.vue'),
    },
  ],
})

export default router
