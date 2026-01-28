# Conecta ao GitHub e dispara o deploy automaticamente:
# 1. Cria PR da branch deploy-remove-set-contract-address -> main
# 2. Faz merge do PR (dispara o workflow de deploy no main)
# Requer: gh cli instalado e logado (gh auth login)

$ErrorActionPreference = "Stop"
$branch = "deploy-remove-set-contract-address"
$repoRoot = if ($PSScriptRoot) { (Get-Item $PSScriptRoot).Parent.Parent.FullName } else { Get-Location }

Set-Location $repoRoot

Write-Host "Verificando gh..." -ForegroundColor Cyan
gh auth status 2>$null || { Write-Host "Erro: gh nao logado. Rode: gh auth login" -ForegroundColor Red; exit 1 }

Write-Host "Criando PR: $branch -> main..." -ForegroundColor Cyan
$pr = gh pr create --base main --head $branch --title "Deploy: Remove Set Contract Address UI" --body "Remove Set Contract Address UI; use env-only contract address (NEXT_PUBLIC_SNAKE_NFT_ADDRESS)." 2>&1
if ($LASTEXITCODE -ne 0) {
    if ($pr -match "already exists") {
        $prNum = (gh pr list --head $branch --base main --json number -q ".[0].number")
        if ($prNum) { Write-Host "PR ja existe: #$prNum" -ForegroundColor Yellow }
    } else { Write-Host $pr; exit 1 }
} else { Write-Host $pr }

$prNumber = if ($pr -match "pull/(\d+)") { $Matches[1] } else { (gh pr list --head $branch --base main --json number -q ".[0].number") }
if (-not $prNumber) { Write-Host "Nao foi possivel obter numero do PR." -ForegroundColor Red; exit 1 }

Write-Host "Fazendo merge do PR #$prNumber..." -ForegroundColor Cyan
gh pr merge $prNumber --merge --delete-branch 2>&1 | ForEach-Object { Write-Host $_ }
if ($LASTEXITCODE -ne 0) { Write-Host "Merge falhou (pode ser que precise aprovar no GitHub)." -ForegroundColor Yellow; exit 1 }

Write-Host "Deploy disparado. Veja: https://github.com/WillerH/ArcSnake/actions" -ForegroundColor Green
