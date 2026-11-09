// Mensagens de commit no formato Conventional Commits: `tipo: descrição`
// (feat, fix, docs, chore, refactor, style, test, perf, build, ci, revert).
// O corpo pode ser longo e em português; só o cabeçalho é validado à risca.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0],
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
}
