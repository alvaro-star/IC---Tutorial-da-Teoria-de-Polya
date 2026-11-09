<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MathTex from '@/components/MathTex.vue'
import AlertaAviso from '@/components/AlertaAviso.vue'
import { contarParticoes } from '@/combinatoria/contarParticoes'
import { LIMITE_DE_REGISTROS } from '@/limites'
import {
  ciclosDaAcaoInduzida,
  ciclosDaPermutacao,
  classesDeArestas,
  contribuicaoPrevista,
  type ClasseDeArestas,
  imagensDasArestas,
  lerPermutacao,
} from '@/combinatoria/acaoInduzida'
import { tipoCiclico } from '@/combinatoria/comum/matematica'
import {
  formatarArestaLatex,
  formatarBlocos,
  formatarCicloDeArestasLatex,
  formatarCicloLatex,
  formatarConjuntoDeArestasLatex,
  formatarProdutoLatex,
  formatarDuasLinhasLatex,
  formatarImagensDaArestaLatex,
  formatarSomaLatex,
  formatarTipoCiclicoLatex,
} from '@/combinatoria/formatadores'
import { gerarParticoesKPartes } from '@/combinatoria/gerarParticoesKPartes'
import { expandirPartes, representanteDoTipo } from '@/combinatoria/mathForms'

/**
 * A ação induzida σ* sobre as arestas de K_N: o utilizador escolhe σ e a
 * secção mostra σ como função, a aplicação de σ a cada aresta e o resultado —
 * σ* em ciclos de arestas e o seu tipo cíclico T(σ*).
 */
const props = defineProps<{ N: number }>()

const n = computed(() => Math.max(0, Math.floor(props.N)))

// O menu de exemplos tem p(N) opções. Acima do limite, as partições só são
// geradas depois de o utilizador confirmar o alerta.
const numeroDeTipos = computed(() => contarParticoes(n.value))
const tiposPesados = computed(() => numeroDeTipos.value > LIMITE_DE_REGISTROS)
const tiposLiberados = ref(false)
watch(n, () => {
  tiposLiberados.value = false
})

const particoes = computed(() =>
  n.value < 1 || (tiposPesados.value && !tiposLiberados.value)
    ? []
    : gerarParticoesKPartes(n.value, n.value),
)

/** Um exemplo por omissão: (1 2)(3 … N) — para N = 5, o (1 2)(3 4 5) dos slides. */
const sigmaPorOmissao = (m: number): string => {
  if (m < 1) return ''
  const tipo = m >= 4 ? [2, m - 2] : m === 3 ? [2, 1] : [m]
  return formatarBlocos(representanteDoTipo(m, tipo))
}

// `texto` é o campo; `aplicado` é o σ em uso — só muda ao aplicar.
const texto = ref(sigmaPorOmissao(n.value))
const aplicado = ref(texto.value)

watch(n, (m) => {
  texto.value = sigmaPorOmissao(m)
  aplicado.value = texto.value
})

const aplicar = () => {
  aplicado.value = texto.value
}

const escolherTipo = (evento: Event) => {
  const campo = evento.target as HTMLSelectElement
  const particao = particoes.value[Number(campo.value)]
  if (particao === undefined) return
  texto.value = formatarBlocos(representanteDoTipo(n.value, expandirPartes(particao)))
  aplicado.value = texto.value
  campo.value = ''
}

const leitura = computed(() => lerPermutacao(aplicado.value, n.value))

/** Tudo o que a explicação desenha; `null` quando σ não é válida. */
const resultado = computed(() => {
  if (!leitura.value.ok) return null
  const { sigma } = leitura.value
  const ciclosSigma = ciclosDaPermutacao(sigma, n.value)
  const ciclosInduzidos = ciclosDaAcaoInduzida(sigma, n.value)
  const linhas = imagensDasArestas(sigma, n.value)

  return {
    sigmaLatex: formatarBlocos(ciclosSigma).replace(/ /g, String.raw`\,`),
    duasLinhas: formatarDuasLinhasLatex(sigma, n.value),
    tipoSigma: formatarTipoCiclicoLatex(tipoCiclico(ciclosSigma)),
    linhas,
    fixas: linhas.filter((linha) => linha.fixa).length,
    ciclosInduzidos: ciclosInduzidos.map(formatarCicloDeArestasLatex),
    tipoInduzido: formatarTipoCiclicoLatex(tipoCiclico(ciclosInduzidos)),
    numeroDeCiclos: ciclosInduzidos.length,
  }
})

/**
 * A regra da teoria que dá a contribuição de uma classe, já instanciada com os
 * comprimentos dos ciclos de σ, em LaTeX.
 */
const regraDaClasse = (classe: ClasseDeArestas, prevista: string): string => {
  if (classe.tipo === 'entre') {
    const [r, s] = classe.ciclos.map((ciclo) => ciclo.length)
    const [[mmc, mdc]] = contribuicaoPrevista(classe) as [[number, number]]
    return String.raw`\operatorname{mmc}(${r},${s}) = ${mmc},\; \operatorname{mdc}(${r},${s}) = ${mdc} \;\Rightarrow\; X_{${r}}X_{${s}} \longmapsto ${prevista}`
  }
  const j = classe.ciclos[0]!.length
  if (j === 2) return String.raw`X_2 \longmapsto X_1`
  if (j % 2 === 1)
    return String.raw`${j} \text{ ímpar} \;\Rightarrow\; X_{${j}} \longmapsto X_{${j}}^{\frac{${j}-1}{2}} = ${prevista}`
  return String.raw`${j} \text{ par} \;\Rightarrow\; X_{${j}} \longmapsto X_{${j}/2}\,X_{${j}}^{\frac{${j}-2}{2}} = ${prevista}`
}

const nomeDaRegra = (classe: ClasseDeArestas): string => {
  if (classe.tipo === 'entre') return 'Proposição 2'
  return classe.ciclos[0]!.length === 2 ? 'Observação 1' : 'Proposição 1'
}

/** O texto do passo 4: D_N² dividido pelas classes dos ciclos de σ. */
const porClasses = computed(() => {
  if (!leitura.value.ok) return null
  const { sigma } = leitura.value
  const ciclosSigma = ciclosDaPermutacao(sigma, n.value)

  const classes = classesDeArestas(sigma, n.value).map((classe) => {
    const prevista = formatarTipoCiclicoLatex(contribuicaoPrevista(classe))
    return {
      tipo: classe.tipo,
      ciclos: classe.ciclos.map(formatarCicloLatex),
      comprimentos: classe.ciclos.map((ciclo) => ciclo.length),
      quantidade: classe.arestas.length,
      arestas: formatarConjuntoDeArestasLatex(classe.arestas),
      ciclosInduzidos: classe.ciclosInduzidos.map(formatarCicloDeArestasLatex).join(''),
      prevista,
      regra: regraDaClasse(classe, prevista),
      nomeDaRegra: nomeDaRegra(classe),
    }
  })

  return {
    classes,
    pontosFixos: ciclosSigma.filter((ciclo) => ciclo.length === 1).map(formatarCicloLatex),
    produto: formatarProdutoLatex(classes.map((classe) => classe.prevista)),
  }
})

const totalDeArestas = computed(() => (n.value * (n.value - 1)) / 2)

const definicao = String.raw`\sigma^{*}(\{i,j\}) = \{\sigma(i),\, \sigma(j)\}`
</script>

<template>
  <div class="acao-induzida">
    <div class="intro">
      <p>
        Uma permutação <MathTex expr="\sigma \in S_N" /> troca os vértices de lugar. Como cada
        aresta é um par de vértices, <MathTex expr="\sigma" /> também troca as arestas de lugar:
      </p>
      <p class="destaque"><MathTex :expr="definicao" display /></p>
      <p>
        Aplicando <MathTex expr="\sigma^{*}" /> a todos os pares de <MathTex expr="D_N^{2}" />,
        obtém-se outra vez <MathTex expr="D_N^{2}" />: nenhuma aresta se perde nem se repete. Assim,
        <MathTex expr="\sigma^{*}" /> é uma permutação das
        <MathTex :expr="`\\binom{${n}}{2} = ${totalDeArestas}`" /> arestas.
      </p>
    </div>

    <form class="escolha" @submit.prevent="aplicar">
      <label for="campo-sigma">Permutação <MathTex expr="\sigma" />, escrita em ciclos</label>
      <div class="escolha-linha">
        <input
          id="campo-sigma"
          v-model="texto"
          type="text"
          placeholder="(1 2)(3 4 5)"
          spellcheck="false"
          autocomplete="off"
        />
        <button type="submit" class="botao botao-primario">Aplicar</button>
      </div>
      <AlertaAviso v-if="tiposPesados && !tiposLiberados" titulo="Lista muito grande">
        O menu de exemplos teria {{ numeroDeTipos.toLocaleString('pt-BR') }} tipos cíclicos.
        Gerá-los todos pode deixar a sua máquina lenta.
        <template #acoes>
          <button type="button" class="botao" @click="tiposLiberados = true">
            Carregar mesmo assim
          </button>
        </template>
      </AlertaAviso>
      <label v-else class="escolha-tipo">
        ou um exemplo de cada tipo cíclico:
        <select @change="escolherTipo">
          <option value="">escolher…</option>
          <option v-for="(particao, i) in particoes" :key="i" :value="i">
            {{ formatarSomaLatex(particao) }}
          </option>
        </select>
      </label>
      <p class="escolha-dica">
        Os vértices que não aparecem ficam fixos: em N = 4, (1 3) é (1 3)(2)(4).
      </p>
      <p v-if="!leitura.ok" class="erro" role="alert">{{ leitura.erro }}</p>
    </form>

    <template v-if="resultado">
      <h3>1) <MathTex expr="\sigma" /> como função</h3>
      <p>
        <MathTex :expr="`\\sigma = ${resultado.sigmaLatex}`" />, de tipo
        <MathTex :expr="`T(\\sigma) = ${resultado.tipoSigma}`" />. Em cima cada vértice
        <MathTex expr="i" />, em baixo a sua imagem <MathTex expr="\sigma(i)" />:
      </p>
      <p class="destaque"><MathTex :expr="`\\sigma = ${resultado.duasLinhas}`" display /></p>

      <h3>2) <MathTex expr="\sigma" /> aplicada a cada aresta</h3>
      <p v-if="totalDeArestas === 0" class="nota">Com um único vértice não há arestas.</p>
      <template v-else>
        <p>
          Para cada aresta <MathTex expr="\{i,j\}" />, troca-se cada extremo pela sua imagem
          <MathTex expr="\sigma(i)" />, lida no passo 1 — por exemplo
          <MathTex expr="\sigma(1) = 2" /> quer dizer que o 1 vai para o 2. Como a aresta é um
          conjunto, <MathTex expr="\{3,1\} = \{1,3\}" />: o resultado escreve-se com o menor
          elemento primeiro.
        </p>
        <div class="tabela-rolagem">
          <table class="tabela">
            <thead>
              <tr>
                <th>aresta <MathTex expr="\{i,j\}" /></th>
                <th><MathTex expr="\{\sigma(i),\, \sigma(j)\}" /></th>
                <th><MathTex expr="\sigma^{*}(\{i,j\})" /></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="linha in resultado.linhas"
                :key="linha.aresta.join('-')"
                :class="{ fixa: linha.fixa }"
              >
                <td><MathTex :expr="formatarArestaLatex(linha.aresta)" /></td>
                <td>
                  <MathTex :expr="formatarImagensDaArestaLatex(linha.aresta, linha.imagens)" />
                </td>
                <td>
                  <MathTex :expr="formatarArestaLatex(linha.imagem)" />
                  <span v-if="linha.fixa" class="marca-fixa">fixa</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="nota">
          {{ resultado.fixas }} de {{ totalDeArestas }}
          {{ totalDeArestas === 1 ? 'aresta fica fixa' : 'arestas ficam fixas' }}
          — são os ciclos de comprimento 1 de <MathTex expr="\sigma^{*}" />.
        </p>
      </template>

      <h3>3) Resultado: <MathTex expr="\sigma^{*}" /> em ciclos</h3>
      <template v-if="totalDeArestas > 0">
        <p>
          Seguindo cada aresta pela tabela até voltar ao início, as {{ totalDeArestas }} arestas
          dividem-se em {{ resultado.numeroDeCiclos }}
          {{ resultado.numeroDeCiclos === 1 ? 'ciclo' : 'ciclos' }}:
        </p>
        <ul class="ciclos">
          <li v-for="(ciclo, i) in resultado.ciclosInduzidos" :key="i">
            <MathTex :expr="ciclo" />
          </li>
        </ul>
      </template>
      <p class="resultado">
        <span class="caixa">
          <MathTex :expr="`T(\\sigma^{*}) = ${resultado.tipoInduzido}`" />
        </span>
      </p>

      <template v-if="porClasses && totalDeArestas > 0">
        <h3>4) Só a partir dos ciclos de <MathTex expr="\sigma" /></h3>
        <p>
          O mesmo resultado sai sem a tabela, olhando apenas para a descrição de
          <MathTex :expr="`\\sigma = ${resultado.sigmaLatex}`" /> em ciclos. Cada aresta ou tem os
          dois extremos no mesmo ciclo de <MathTex expr="\sigma" />, ou liga dois ciclos diferentes;
          e <MathTex expr="\sigma^{*}" /> nunca leva uma aresta de uma destas classes para outra. O
          conjunto <MathTex expr="D_N^{2}" /> divide-se assim em
          {{ porClasses.classes.length }}
          {{ porClasses.classes.length === 1 ? 'classe' : 'classes' }}, e cada uma contribui com o
          seu próprio tipo cíclico.
        </p>
        <p v-if="porClasses.pontosFixos.length" class="nota">
          {{ porClasses.pontosFixos.length === 1 ? 'O ponto fixo' : 'Os pontos fixos' }}
          <MathTex :expr="porClasses.pontosFixos.join('\\,')" /> não
          {{ porClasses.pontosFixos.length === 1 ? 'tem' : 'têm' }} arestas internas: só
          {{ porClasses.pontosFixos.length === 1 ? 'aparece' : 'aparecem' }} nas arestas entre
          ciclos.
        </p>

        <ol class="classes">
          <li v-for="(classe, i) in porClasses.classes" :key="i" class="classe">
            <p class="classe-titulo">
              <template v-if="classe.tipo === 'interna'">
                Arestas dentro de <MathTex :expr="classe.ciclos[0]!" /> —
                <MathTex :expr="`\\binom{${classe.comprimentos[0]}}{2} = ${classe.quantidade}`" />
                {{ classe.quantidade === 1 ? 'aresta' : 'arestas' }}
              </template>
              <template v-else>
                Arestas entre <MathTex :expr="classe.ciclos[0]!" /> e
                <MathTex :expr="classe.ciclos[1]!" /> —
                <MathTex
                  :expr="`${classe.comprimentos[0]} \\cdot ${classe.comprimentos[1]} = ${classe.quantidade}`"
                />
                {{ classe.quantidade === 1 ? 'aresta' : 'arestas' }}
              </template>
            </p>
            <dl class="classe-passos">
              <dt>Conjunto</dt>
              <dd><MathTex :expr="classe.arestas" /></dd>
              <dt>Permutação</dt>
              <dd><MathTex :expr="`\\sigma^{*} = ${classe.ciclosInduzidos}`" /></dd>
              <dt>Tipo cíclico</dt>
              <dd>{{ classe.nomeDaRegra }}: <MathTex :expr="classe.regra" /></dd>
            </dl>
          </li>
        </ol>

        <p>Multiplicando as contribuições de todas as classes:</p>
        <p class="destaque">
          <MathTex
            :expr="`T(\\sigma^{*}) = ${porClasses.produto} = ${resultado.tipoInduzido}`"
            display
          />
        </p>
        <p class="nota">
          É o mesmo <MathTex expr="T(\sigma^{*})" /> do passo 3, obtido agora só a partir de
          <MathTex :expr="`T(\\sigma) = ${resultado.tipoSigma}`" /> — é isto que o Teorema 1 dos
          slides de teoria generaliza.
        </p>
      </template>
    </template>
  </div>
</template>

<style scoped>
.acao-induzida {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.intro {
  max-width: var(--largura-texto);
  color: var(--ink-soft);
}

.intro p {
  margin-bottom: 0.5rem;
}

.destaque {
  margin: 0.25rem 0;
  padding: 0.25rem 1rem;
  border-radius: var(--radius);
  background: var(--surface-sunken);
  color: var(--ink);
}

h3 {
  margin-top: 0.75rem;
  font-size: 1.1rem;
}

.escolha {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface-sunken);
}

.escolha label {
  font-size: 0.9rem;
  font-weight: 500;
}

.escolha-linha {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.escolha-linha input {
  flex: 1;
  min-width: 12rem;
  max-width: 24rem;
  font-family: var(--font-mono);
}

.escolha-tipo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  font-weight: 400 !important;
  color: var(--ink-soft);
}

.escolha-dica,
.nota {
  color: var(--muted);
  font-size: 0.85rem;
}

.erro {
  color: var(--erro);
  font-size: 0.9rem;
}

.tabela-rolagem {
  max-height: 28rem;
  overflow: auto;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.tabela {
  width: 100%;
  border-collapse: collapse;
}

.tabela th,
.tabela td {
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--line);
  text-align: center;
  white-space: nowrap;
}

.tabela th {
  position: sticky;
  top: 0;
  background: var(--surface);
  color: var(--ink-soft);
  font-size: 0.9rem;
  font-weight: 600;
}

.tabela tbody tr:last-child td {
  border-bottom: none;
}

.tabela tr.fixa td {
  background: var(--accent-soft);
}

.marca-fixa {
  margin-left: 0.5rem;
  padding: 0.05rem 0.45rem;
  border-radius: 999px;
  background: var(--accent);
  color: var(--on-accent);
  font-size: 0.72rem;
  font-weight: 600;
}

.ciclos {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ciclos li {
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface);
}

.resultado {
  margin-top: 0.25rem;
}

.classes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.classe {
  padding: 0.9rem 1.1rem;
  border: 1px solid var(--line);
  border-left: 3px solid var(--accent);
  border-radius: 0 var(--radius) var(--radius) 0;
  background: var(--surface);
}

.classe-titulo {
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.classe-passos {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 0.35rem 1rem;
}

.classe-passos dt {
  color: var(--muted);
  font-size: 0.85rem;
  line-height: 1.9;
}

.classe-passos dd {
  min-width: 0;
}

@media (max-width: 560px) {
  .classe-passos {
    grid-template-columns: minmax(0, 1fr);
  }

  .classe-passos dt {
    line-height: 1.4;
  }
}

.caixa {
  display: inline-block;
  padding: 0.4rem 0.9rem;
  border: 1.5px solid var(--accent);
  border-radius: var(--radius-sm);
  background: var(--accent-soft);
  font-size: 1.1rem;
}
</style>
