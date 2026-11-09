import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import TeoriaView from '../Index.vue'

const montar = async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/explicacao', component: TeoriaView }],
  })
  await router.push('/explicacao')
  await router.isReady()
  const wrapper = mount(TeoriaView, { global: { plugins: [router] } })
  return { router, wrapper }
}

describe('Teoria — slides', () => {
  it('todos os slides desenham conteúdo, sem erros de LaTeX', async () => {
    const { router, wrapper } = await montar()
    const total = wrapper.findAll('select option').length
    expect(total).toBe(28)

    for (let slide = 1; slide <= total; slide++) {
      await router.replace({ query: { slide: String(slide) } })
      await flushPromises()
      const corpo = wrapper.find('.slide-corpo')
      const titulo = wrapper.find('.slide-cabecalho h2').text()
      expect(corpo.find('section').exists(), `slide ${slide}: ${titulo}`).toBe(true)
      expect(corpo.html(), `slide ${slide}: ${titulo}`).not.toContain('katex-error')
    }
  })

  it('o slide atual vem da URL (?slide=N, a contar de 1)', async () => {
    const { router, wrapper } = await montar()
    await router.replace({ query: { slide: '9' } })
    await flushPromises()
    expect(wrapper.find('.slide-cabecalho h2').text()).toContain('Caso 1')
  })
})
