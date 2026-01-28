#!/bin/bash
# Conecta ao GitHub e dispara o deploy automaticamente:
# 1. Cria PR da branch deploy-remove-set-contract-address -> main
# 2. Faz merge do PR (dispara o workflow de deploy no main)
# Requer: gh cli instalado e logado (gh auth login)

set -e
BRANCH="deploy-remove-set-contract-address"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

echo "Verificando gh..."
gh auth status || { echo "Erro: gh não logado. Rode: gh auth login"; exit 1; }

echo "Criando PR: $BRANCH -> main..."
if ! PR_URL=$(gh pr create --base main --head "$BRANCH" --title "Deploy: Remove Set Contract Address UI" --body "Remove Set Contract Address UI; use env-only contract address (NEXT_PUBLIC_SNAKE_NFT_ADDRESS)." 2>&1); then
  if echo "$PR_URL" | grep -q "already exists"; then
    PR_NUM=$(gh pr list --head "$BRANCH" --base main --json number -q '.[0].number')
    echo "PR já existe: #$PR_NUM"
  else
    echo "$PR_URL"; exit 1
  fi
else
  echo "$PR_URL"
fi

PR_NUM=${PR_NUM:-$(gh pr list --head "$BRANCH" --base main --json number -q '.[0].number')}
if [ -z "$PR_NUM" ]; then echo "Não foi possível obter número do PR."; exit 1; fi

echo "Fazendo merge do PR #$PR_NUM..."
gh pr merge "$PR_NUM" --merge --delete-branch || { echo "Merge falhou (pode ser que precise aprovar no GitHub)."; exit 1; }

echo "Deploy disparado. Veja: https://github.com/WillerH/ArcSnake/actions"
