import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CollapsibleSection from '@/components/CollapsibleSection.vue'

describe('CollapsibleSection — alerta de lista grande', () => {
  it('acima de 600 registros, só monta o conteúdo depois de confirmar', async () => {
    const w = mount(CollapsibleSection, {
      props: { titulo: 'x', registros: 601n },
      slots: { default: '<p class="conteudo-real">ok</p>' },
    })
    expect(w.find('[role=alert]').text()).toContain('601')
    expect(w.find('.conteudo-real').exists()).toBe(false)
    await w.findAll('.acoes button')[0]!.trigger('click')
    expect(w.find('.conteudo-real').exists()).toBe(true)
  })

  it('até 600 registros, abre direto', () => {
    const w = mount(CollapsibleSection, {
      props: { titulo: 'x', registros: 600 },
      slots: { default: '<p class="conteudo-real">ok</p>' },
    })
    expect(w.find('.conteudo-real').exists()).toBe(true)
  })
})
