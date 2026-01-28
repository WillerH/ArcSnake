# Deploy — Arc Snake (arcsnake.xyz)

Deploy automático para **Cloudflare Pages** via GitHub Actions a cada push em `main`.

## Pré-requisitos

- Conta no [Cloudflare](https://dash.cloudflare.com) (para Pages)
- Repositório no GitHub com a branch `main`

---

## Configuração em ~2 minutos

### 1. Cloudflare: criar projeto Pages

1. Em [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** (ou “Direct Upload”).
2. Se for **Direct Upload**, crie um projeto Pages com o nome **`arcsnake`** (o workflow usa `--project-name=arcsnake`). Você não precisa conectar o Git no dashboard; o GitHub Actions sobe o build.

### 2. GitHub: Secrets e Variables

No repositório: **Settings** → **Secrets and variables** → **Actions**.

#### Secrets (Settings → Secrets and variables → Actions → **Secrets**)

| Nome | Descrição | Onde pegar |
|------|-----------|------------|
| `CLOUDFLARE_API_TOKEN` | Token da API Cloudflare | Cloudflare Dashboard → Meu perfil → API Tokens → Create Token → modelo “Edit Cloudflare Workers” ou “Cloudflare Pages Edit” |
| `CLOUDFLARE_ACCOUNT_ID` | ID da conta Cloudflare | Cloudflare Dashboard → Workers & Pages → à direita em “Account ID” (ou Overview de qualquer site) |

#### Variables (Settings → Secrets and variables → Actions → **Variables**)

| Nome | Descrição |
|------|-----------|
| `NEXT_PUBLIC_SNAKE_NFT_ADDRESS` | Endereço do contrato Snake NFT (ex.: `0x…`) usado no build. Se não for definido, o site mostra “Contract address not configured” na aba My Snakes. |

**Resumo:** 2 **Secrets** (token + account id) e 1 **Variable** (endereço do contrato).

---

## Como o deploy passa a acontecer

1. O workflow está em **`.github/workflows/deploy-cloudflare.yml`**.
2. Ele roda em **todo push (ou merge) na branch `main`**.
3. Passos:
   - `npm ci` e `npm run build` (com `NEXT_PUBLIC_SNAKE_NFT_ADDRESS` vindo da Variable).
   - `wrangler pages deploy ./out --project-name=arcsnake` envia o conteúdo de `./out` para o projeto **arcsnake** no Cloudflare Pages.
4. Depois do deploy, o site fica em `https://arcsnake.pages.dev` (ou no domínio custom que você configurar em **Custom domains** no projeto Pages, ex.: **arcsnake.xyz**).

---

## Como setar `NEXT_PUBLIC_SNAKE_NFT_ADDRESS`

- **No GitHub:**  
  **Settings** → **Secrets and variables** → **Actions** → **Variables** → **New repository variable**  
  Nome: `NEXT_PUBLIC_SNAKE_NFT_ADDRESS`  
  Valor: endereço do contrato (ex.: `0x1234…`).

- **Localmente (opcional):**  
  Crie `.env.local` na raiz do projeto:

  ```env
  NEXT_PUBLIC_SNAKE_NFT_ADDRESS=0x...
  ```

  Isso só afeta `npm run build` / `next dev` na sua máquina; no deploy o valor usado é o da **Variable** do GitHub.

---

## Build estático

O projeto usa `output: "export"` em `next.config.mjs`, então:

- `npm run build` gera a pasta **`out`** (export estático).
- O workflow faz deploy do conteúdo de **`out`** para o Cloudflare Pages.

Não é necessário rodar `next export` à parte; o script `build` já produz o export.
