import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

// Formatação é do Prettier (`npm run format`); o ESLint só cuida da qualidade.
export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,

  {
    name: 'app/convencoes',
    rules: {
      // Convenção do projeto: funções são arrow functions guardadas em `const`.
      // `func-style` proíbe `function foo() {}`; a regra abaixo proíbe
      // `const foo = function () {}` — só geradores (`function*`) escapam,
      // porque não podem ser arrow functions.
      'func-style': ['error', 'expression'],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'VariableDeclarator > FunctionExpression[generator=false]',
          message: 'Use uma arrow function: `const foo = () => {}`.',
        },
      ],
      'prefer-arrow-callback': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],

      // Props com nome matemático (`N`) são intencionais.
      'vue/prop-name-casing': 'off',
      'vue/attribute-hyphenation': ['warn', 'always', { ignore: ['N'] }],
      'vue/multi-word-component-names': 'off',
    },
  },

  skipFormatting,
)
