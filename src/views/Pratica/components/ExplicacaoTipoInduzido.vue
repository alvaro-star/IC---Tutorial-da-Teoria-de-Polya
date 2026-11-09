<script setup lang="ts">
import { computed } from 'vue'
import MathTex from '@/components/MathTex.vue'
import { tipoInduzidoDoTipo, type ContribuicaoPorComprimento } from '@/combinatoria/acaoInduzida'
import { mdc, mmc } from '@/combinatoria/comum/matematica'
import {
  formatarBlocos,
  formatarProdutoLatex,
  formatarTipoCiclicoLatex,
} from '@/combinatoria/formatadores'
import { representanteDoTipo } from '@/combinatoria/mathForms'

/**
 * A descrição breve de um tipo cíclico induzido: como σ* se define e como
 * T(σ*) se calcula só a partir de T(σ) — Teorema 1, com as contribuições
 * agrupadas pelas Observações 2 e 3. Usada dentro de cada linha do
 * InducedPartitionDisplay; só é montada quando a linha abre.
 */
const props = defineProps<{
  n: number
  /** O tipo cíclico de σ, expandido: ex. [3, 1, 1]. */
  tipoCiclico: number[]
  /** N(λ): quantas permutações têm este tipo. */
  quantidade: bigint
  /** T(σ*) em LaTeX, já calculado pela linha. */
  tipoInduzido: string
}>()

/** Um passo da explicação: de onde vem a contribuição e quanto vale. */
interface PassoDoCalculo {
  /** Texto curto: "2 ciclos de comprimento 3", "C(2,2) = 1 par de pontos fixos"… */
  origem: string
  /** O nome da regra aplicada. */
  regra: string
  /** A regra instanciada, em LaTeX. */
  formula: string
  /** O fator que entra no produto final, já com a repetição. */
  fator: string
  /** Só entre ciclos: quantos pares, em LaTeX (`\binom{3}{2} = 3`, `2 \cdot 1 = 2`). */
  contagem?: string
}

const formatarContribuicao = (c: ContribuicaoPorComprimento) =>
  formatarTipoCiclicoLatex(c.contribuicao)

/** Descreve uma contribuição agrupada (Observações 2 e 3) em linguagem corrente. */
const descreverPasso = (
  c: ContribuicaoPorComprimento,
  multiplicidade: Map<number, number>,
): PassoDoCalculo => {
  const valor = formatarContribuicao(c)
  const fator = c.vezes === 1 ? valor : String.raw`\left(${valor}\right)^{${c.vezes}}`

  if (c.tipo === 'interna') {
    const [j] = c.comprimentos as [number]
    const ciclos =
      c.vezes === 1 ? `1 ciclo de comprimento ${j}` : `${c.vezes} ciclos de comprimento ${j}`
    const formula =
      j === 2
        ? String.raw`X_2 \longmapsto X_1`
        : j % 2 === 1
          ? String.raw`X_{${j}} \longmapsto X_{${j}}^{\frac{${j}-1}{2}} = ${valor}`
          : String.raw`X_{${j}} \longmapsto X_{${j}/2}\,X_{${j}}^{\frac{${j}-2}{2}} = ${valor}`
    return {
      origem: `${ciclos} — arestas internas`,
      regra: j === 2 ? 'Observação 1' : 'Proposição 1',
      formula,
      fator,
    }
  }

  const [r, s] = c.comprimentos as [number, number]
  const k = multiplicidade.get(r)!
  const contagem =
    r === s
      ? String.raw`\binom{${k}}{2} = ${c.vezes}`
      : String.raw`${k} \cdot ${multiplicidade.get(s)!} = ${c.vezes}`
  const nome = r === s ? `ciclos de comprimento ${r}` : `ciclos de comprimentos ${r} e ${s}`
  return {
    origem: `${c.vezes === 1 ? 'par' : 'pares'} de ${nome} — arestas entre ciclos`,
    regra: 'Proposição 2',
    formula: String.raw`\operatorname{mmc}(${r},${s}) = ${mmc(r, s)},\; \operatorname{mdc}(${r},${s}) = ${mdc(r, s)} \;\Rightarrow\; X_{${r}}X_{${s}} \longmapsto ${valor}`,
    fator,
    contagem,
  }
}

const explicacao = computed(() => {
  const multiplicidade = new Map<number, number>()
  for (const j of props.tipoCiclico) multiplicidade.set(j, (multiplicidade.get(j) ?? 0) + 1)

  const { contribuicoes } = tipoInduzidoDoTipo(props.tipoCiclico)
  const passos = contribuicoes.map((c) => descreverPasso(c, multiplicidade))
  const tipoSigma = formatarTipoCiclicoLatex(
    [...multiplicidade.entries()].sort(([a], [b]) => a - b),
  )

  return {
    exemplo: formatarBlocos(representanteDoTipo(props.n, props.tipoCiclico)).replace(
      / /g,
      String.raw`\,`,
    ),
    tipoSigma,
    passos,
    produto: passos.length === 0 ? '1' : formatarProdutoLatex(passos.map((p) => p.fator)),
  }
})
</script>

<template>
  <div class="explicacao">
    <p>
      <strong>Como se define.</strong> Cada uma das
      {{ quantidade.toLocaleString('pt-BR') }} permutações deste tipo — por exemplo
      <MathTex :expr="`\\sigma = ${explicacao.exemplo}`" />, de tipo
      <MathTex :expr="`T(\\sigma) = ${explicacao.tipoSigma}`" /> — troca as arestas de lugar por
      <MathTex expr="\sigma^{*}(\{i,j\}) = \{\sigma(i), \sigma(j)\}" />. O tipo cíclico induzido
      <MathTex expr="T(\sigma^{*})" /> é o tipo dessa permutação das arestas, e é o mesmo para todas
      as permutações do tipo.
    </p>

    <p>
      <strong>Como se calcula.</strong> Pelo Teorema 1, só a partir dos comprimentos dos ciclos:
    </p>
    <p v-if="explicacao.passos.length === 0" class="nota">
      Com um único vértice não há arestas, logo <MathTex expr="T(\sigma^{*}) = 1" />.
    </p>
    <ol v-else class="passos">
      <li v-for="(passo, i) in explicacao.passos" :key="i">
        <span class="passo-origem">
          <MathTex v-if="passo.contagem" :expr="passo.contagem" />
          {{ passo.origem }}
        </span>
        <span class="passo-regra">{{ passo.regra }}:</span>
        <MathTex :expr="passo.formula" />
      </li>
    </ol>
    <p class="destaque">
      <MathTex :expr="`T(\\sigma^{*}) = ${explicacao.produto} = ${tipoInduzido}`" display />
    </p>
  </div>
</template>

<style scoped>
.explicacao {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: var(--largura-texto);
  margin-bottom: 1rem;
  color: var(--ink-soft);
}

.explicacao strong {
  color: var(--ink);
}

.passos {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-left: 1.3rem;
}

.passos li {
  min-width: 0;
}

.passo-origem {
  display: block;
  color: var(--ink);
  font-size: 0.92rem;
}

.passo-regra {
  margin-right: 0.4rem;
  color: var(--muted);
  font-size: 0.85rem;
}

.destaque {
  padding: 0.1rem 1rem;
  border-radius: var(--radius);
  background: var(--surface-sunken);
  color: var(--ink);
}

.nota {
  color: var(--muted);
  font-size: 0.85rem;
}
</style>
