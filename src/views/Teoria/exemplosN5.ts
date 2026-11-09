/**
 * A execução manual do caso m = 5 (secção 4.3 do relatório): para cada
 * partição de 5, uma permutação representante, as contribuições das
 * Proposições 1 e 2 e o tipo cíclico induzido T(σ*) sobre as arestas de K_5.
 *
 * É a única fonte da página de explicação para a tabela de tipos induzidos,
 * para os slides de cada exemplo e para Z(G): as três vistas saem deste array
 * e não podem divergir. As expressões são LaTeX (para o `MathTex`).
 *
 * Verificação: a soma de `quantidade` é 5! = 120, e substituir cada X_i por
 * 1 + c^i em Z(G) dá 1, 1, 2, 4, 6, 6, 6, 4, 2, 1, 1 (34 grafos).
 */
import type { Ciclo } from '@/combinatoria/grafoDoCiclo'

export interface ExemploCalculo {
  /** A partição de 5, ex. "3+1+1". */
  particao: string
  /** N(λ): quantas permutações de S_5 têm este tipo cíclico. */
  quantidade: number
  /** A permutação representante, em ciclos. */
  sigma: Ciclo[]
  /** T(σ), em LaTeX. */
  tipo: string
  /** Um passo por ciclo — Caso 1 / Proposição 1. */
  internas: string[]
  /** Produto das contribuições internas; `null` quando não há nenhuma. */
  internasTotal: string | null
  /** Um passo por (classe de) par de ciclos — Caso 2 / Proposição 2. */
  pares: string[]
  /** Produto das contribuições entre ciclos; `null` quando não há pares. */
  paresTotal: string | null
  /** A multiplicação final que dá T(σ*). */
  produto: string
  /** T(σ*), em LaTeX. */
  resultado: string
  /** Comentário opcional, em texto corrido. */
  nota?: string
}

const semInternas = String.raw`\text{sem arestas internas}`

export const exemplosN5: ExemploCalculo[] = [
  {
    particao: '5',
    quantidade: 24,
    sigma: [[1, 2, 3, 4, 5]],
    tipo: 'X_5',
    internas: [
      String.raw`C_5=(1\,2\,3\,4\,5):\; 5 \text{ ímpar} \;\Rightarrow\; X_5 \longmapsto X_5^{\frac{5-1}{2}} = X_5^{2}`,
    ],
    internasTotal: 'X_5^{2}',
    pares: [],
    paresTotal: null,
    produto: 'X_5^{2}',
    resultado: 'X_5^{2}',
    nota:
      'As 10 arestas de um 5-ciclo dividem-se pelas distâncias 1 e 2 entre os ' +
      'vértices; cada classe é uma órbita de comprimento 5 — daí os dois ciclos de comprimento 5.',
  },
  {
    particao: '4+1',
    quantidade: 30,
    sigma: [[1], [2, 3, 4, 5]],
    tipo: 'X_1X_4',
    internas: [
      String.raw`C_1=(1):\; ${semInternas}`,
      String.raw`C_4=(2\,3\,4\,5):\; 4 \text{ par} \;\Rightarrow\; X_4 \longmapsto X_{4/2}\,X_4^{\frac{4-2}{2}} = X_2X_4`,
    ],
    internasTotal: 'X_2X_4',
    pares: [
      String.raw`(C_1,C_4):\; \operatorname{mmc}(1,4)=4,\; \operatorname{mdc}(1,4)=1 \;\Rightarrow\; X_1X_4 \longmapsto X_4`,
    ],
    paresTotal: 'X_4',
    produto: String.raw`X_2X_4 \cdot X_4 = X_2X_4^{2}`,
    resultado: 'X_2X_4^{2}',
  },
  {
    particao: '3+2',
    quantidade: 20,
    sigma: [
      [1, 2],
      [3, 4, 5],
    ],
    tipo: 'X_2X_3',
    internas: [
      String.raw`C_2=(1\,2):\; 2 \text{ par} \;\Rightarrow\; X_2 \longmapsto X_{2/2}\,X_2^{\frac{2-2}{2}} = X_1`,
      String.raw`C_3=(3\,4\,5):\; 3 \text{ ímpar} \;\Rightarrow\; X_3 \longmapsto X_3^{\frac{3-1}{2}} = X_3`,
    ],
    internasTotal: 'X_1X_3',
    pares: [
      String.raw`(C_2,C_3):\; \operatorname{mmc}(2,3)=6,\; \operatorname{mdc}(2,3)=1 \;\Rightarrow\; X_2X_3 \longmapsto X_6`,
    ],
    paresTotal: 'X_6',
    produto: String.raw`X_1 \cdot X_3 \cdot X_6 = X_1X_3X_6`,
    resultado: 'X_1X_3X_6',
  },
  {
    particao: '3+1+1',
    quantidade: 20,
    sigma: [[1], [2], [3, 4, 5]],
    tipo: 'X_1^{2}X_3',
    internas: [
      String.raw`C_1^{(1)}=(1),\; C_1^{(2)}=(2):\; ${semInternas}`,
      String.raw`C_3=(3\,4\,5):\; 3 \text{ ímpar} \;\Rightarrow\; X_3 \longmapsto X_3^{\frac{3-1}{2}} = X_3`,
    ],
    internasTotal: 'X_3',
    pares: [
      String.raw`(C_1^{(1)},C_1^{(2)}):\; \operatorname{mmc}(1,1)=1,\; \operatorname{mdc}(1,1)=1 \;\Rightarrow\; X_1X_1 \longmapsto X_1`,
      String.raw`(C_1^{(1)},C_3),\; (C_1^{(2)},C_3):\; \operatorname{mmc}(1,3)=3,\; \operatorname{mdc}(1,3)=1 \;\Rightarrow\; X_1X_3 \longmapsto X_3 \text{ (duas vezes)}`,
    ],
    paresTotal: 'X_1X_3^{2}',
    produto: String.raw`X_3 \cdot X_1 \cdot X_3^{2} = X_1X_3^{3}`,
    resultado: 'X_1X_3^{3}',
    nota: 'A aresta {1,2} liga os dois pontos fixos e não se move: é a origem do fator X₁.',
  },
  {
    particao: '2+2+1',
    quantidade: 15,
    sigma: [[1, 2], [3, 4], [5]],
    tipo: 'X_1X_2^{2}',
    internas: [
      String.raw`C_2^{(1)}=(1\,2),\; C_2^{(2)}=(3\,4):\; X_2 \longmapsto X_1 \text{ cada} \;\Rightarrow\; X_1^{2}`,
      String.raw`C_1=(5):\; ${semInternas}`,
    ],
    internasTotal: 'X_1^{2}',
    pares: [
      String.raw`(C_2^{(1)},C_2^{(2)}):\; \operatorname{mmc}(2,2)=2,\; \operatorname{mdc}(2,2)=2 \;\Rightarrow\; X_2X_2 \longmapsto X_2^{2}`,
      String.raw`(C_2^{(1)},C_1),\; (C_2^{(2)},C_1):\; \operatorname{mmc}(2,1)=2,\; \operatorname{mdc}(2,1)=1 \;\Rightarrow\; X_2X_1 \longmapsto X_2 \text{ (duas vezes)}`,
    ],
    paresTotal: 'X_2^{4}',
    produto: String.raw`X_1^{2} \cdot X_2^{4} = X_1^{2}X_2^{4}`,
    resultado: 'X_1^{2}X_2^{4}',
  },
  {
    particao: '2+1+1+1',
    quantidade: 10,
    sigma: [[1, 2], [3], [4], [5]],
    tipo: 'X_1^{3}X_2',
    internas: [
      String.raw`C_2=(1\,2):\; X_2 \longmapsto X_1 \text{ (Observação 1)}`,
      String.raw`C_1^{(1)},\,C_1^{(2)},\,C_1^{(3)}:\; ${semInternas}`,
    ],
    internasTotal: 'X_1',
    pares: [
      String.raw`(C_2,C_1^{(i)}),\; i=1,2,3:\; \operatorname{mmc}(2,1)=2,\; \operatorname{mdc}(2,1)=1 \;\Rightarrow\; X_2 \text{ cada} \;\Rightarrow\; X_2^{3}`,
      String.raw`(C_1^{(i)},C_1^{(j)}),\; i<j:\; \operatorname{mmc}(1,1)=1,\; \operatorname{mdc}(1,1)=1 \;\Rightarrow\; X_1 \text{ cada} \;\Rightarrow\; X_1^{3}`,
    ],
    paresTotal: 'X_1^{3}X_2^{3}',
    produto: String.raw`X_1 \cdot X_1^{3}X_2^{3} = X_1^{4}X_2^{3}`,
    resultado: 'X_1^{4}X_2^{3}',
  },
  {
    particao: '1+1+1+1+1',
    quantidade: 1,
    sigma: [[1], [2], [3], [4], [5]],
    tipo: 'X_1^{5}',
    internas: [String.raw`C_1^{(1)},\dots,C_1^{(5)}:\; ${semInternas}`],
    internasTotal: null,
    pares: [
      String.raw`\tbinom{5}{2}=10 \text{ pares}:\; \operatorname{mmc}(1,1)=\operatorname{mdc}(1,1)=1 \;\Rightarrow\; X_1X_1 \longmapsto X_1 \text{ cada}`,
    ],
    paresTotal: 'X_1^{10}',
    produto: 'X_1^{10}',
    resultado: 'X_1^{10}',
    nota: 'A identidade fixa todas as 10 arestas.',
  },
]
