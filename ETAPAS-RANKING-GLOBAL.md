# Etapas para o ranking global funcionar (todas as carteiras)

Siga estas etapas por ordem. A etapa **B** é a que corrige “só ver a minha carteira”.

---

## A. Supabase: projeto e tabela

1. **[supabase.com/dashboard](https://supabase.com/dashboard)** → criar projeto (se ainda não tiver).
2. **Project Settings** → **API** → copiar **Project URL** e **anon public**.
3. **SQL Editor** → New query → colar todo o conteúdo de **`supabase-leaderboard-schema.sql`** → Run.

---

## B. Supabase: políticas RLS (ranking público – todas as carteiras)

Se o ranking só mostra a **tua** carteira, é aqui que se corrige.

1. No Supabase: **SQL Editor** → **New query**.
2. Copie **todo** o bloco SQL abaixo e cole no editor.
3. Clique em **Run**.

```sql
-- Corrige o leaderboard para mostrar TODAS as carteiras publicamente.
DROP POLICY IF EXISTS "Leaderboard is publicly readable" ON public.leaderboard;
DROP POLICY IF EXISTS "Anyone can upsert leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "Anyone can update leaderboard" ON public.leaderboard;

CREATE POLICY "Leaderboard is publicly readable"
  ON public.leaderboard FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can upsert leaderboard"
  ON public.leaderboard FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can update leaderboard"
  ON public.leaderboard FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
```

---

## C. Local: variáveis de ambiente

1. Na raiz do projeto, ficheiro **`.env.local`** (não commitar).
2. Adicione (com os valores do Supabase):

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Reinicie `npm run dev` se estiver a correr.

---

## D. Produção (GitHub Pages): variáveis no repositório

Para o site publicado usar o ranking global:

1. No GitHub: repositório **Arc Snake** → **Settings** → **Secrets and variables** → **Actions**.
2. Aba **Variables** → **New repository variable**.
3. Crie:
   - Nome: **`NEXT_PUBLIC_SUPABASE_URL`** | Valor: o Project URL do Supabase.
   - Nome: **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** | Valor: a chave anon public do Supabase.
4. Guarde. No próximo push para `main`, o build usará estas variáveis e o ranking em produção será global.

---

## Resumo

| Etapa | Onde | O que fazer |
|-------|------|-------------|
| A | Supabase | Criar projeto, copiar URL/anon key, executar `supabase-leaderboard-schema.sql` |
| B | Supabase SQL Editor | Executar o SQL acima (políticas RLS para leitura pública) |
| C | Projeto local | `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| D | GitHub repo | Settings → Actions → Variables: adicionar as duas variáveis |

Depois de B, o ranking no Supabase passa a mostrar **todas** as carteiras. Depois de D, o site em produção também usa esse ranking global.

---

## Diagnóstico no site

No separador **Leaderboard** o site mostra:

- **Source: Supabase (global)** – está a usar o ranking do Supabase (todas as carteiras).
- **Source: local storage** – está a usar só dados locais (ranking global não está ativo). Em produção, define as variáveis no GitHub (etapa D).
- **Mensagem de erro** – o Supabase respondeu com erro (ex.: RLS). Executa o SQL da etapa B no Supabase.

Usa o botão **Refresh** para voltar a carregar o ranking.
-- Corrige o leaderboard para mostrar TODAS as carteiras publicamente.
-- Se o ranking só mostra a tua carteira, executa isto no Supabase (SQL Editor).
-- Isto garante que qualquer pessoa (anon) pode LER todas as linhas da tabela leaderboard.

-- 1. Remover políticas que possam restringir a leitura
DROP POLICY IF EXISTS "Leaderboard is publicly readable" ON public.leaderboard;
DROP POLICY IF EXISTS "Anyone can upsert leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "Anyone can update leaderboard" ON public.leaderboard;

-- 2. Leitura pública: anon e authenticated veem TODAS as linhas (ranking global)
CREATE POLICY "Leaderboard is publicly readable"
  ON public.leaderboard
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 3. Inserir: qualquer um pode inserir (submeter score)
CREATE POLICY "Anyone can upsert leaderboard"
  ON public.leaderboard
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 4. Atualizar: qualquer um pode atualizar (atualizar melhor score)
CREATE POLICY "Anyone can update leaderboard"
  ON public.leaderboard
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

