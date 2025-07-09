# Guia de Commits: Conventional Commits

Este projeto recomenda o uso do padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/) para mensagens de commit. Isso facilita a colaboração, automação de changelogs e integração com ferramentas de CI/CD.

## Principais tipos de commit

- **feat:** nova funcionalidade
- **fix:** correção de bug
- **docs:** apenas documentação
- **style:** formatação (espaços, ponto e vírgula, etc), sem alteração de código
- **refactor:** refatoração de código, sem adicionar funcionalidade ou corrigir bug
- **perf:** melhoria de performance
- **test:** adição ou modificação de testes
- **chore:** tarefas de manutenção (build, dependências, configs, etc)
- **build:** mudanças no sistema de build ou dependências externas
- **ci:** mudanças em arquivos e scripts de CI/CD

## Estrutura da mensagem

```
<tipo>[escopo opcional]: <descrição curta>
```

**Exemplos:**

```
feat(ui): adiciona efeito glitch ao título
fix(ascii): corrige transparência nos caracteres
chore: remove arquivos não utilizados
```

- O **escopo** (entre parênteses) é opcional, mas pode ajudar a identificar a área afetada.
- A **descrição** deve ser curta, clara e no imperativo (ex: "adiciona", "corrige").

## Exemplo para este projeto

```
feat: adiciona transparência ao ASCII e glitch no título
```

---

Para mais detalhes, consulte: [conventionalcommits.org](https://www.conventionalcommits.org/pt-br/v1.0.0/) 