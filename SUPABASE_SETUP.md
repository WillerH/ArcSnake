# Configurar Supabase para o Arc Snake (Leaderboard)

O Supabase é usado **apenas** para o leaderboard global (ranking de scores por carteira). Não há login com GitHub nem outros providers de auth — só a tabela `leaderboard`.

Se ainda não existe um projeto no Supabase, siga estes passos.

---

## 1. Criar um novo projeto no Supabase

1. Acesse **[https://supabase.com/dashboard](https://supabase.com/dashboard)** e faça login.
2. Clique em **"New project"**.
3. Preencha:
   - **Name:** por exemplo `arcsnake` ou `Arc Snake` (pode ser qualquer nome).
   - **Database Password:** crie e guarde uma senha forte (você vai precisar para aceder à base de dados).
   - **Region:** escolha a mais próxima (ex.: South America).
4. Clique em **"Create new project"** e espere o projeto ser criado (1–2 minutos).

---

## 2. Copiar URL e Anon Key

1. No menu lateral, vá a **Project Settings** (ícone de engrenagem).
2. Clique em **API**.
3. Copie:
   - **Project URL** (ex.: `https://xxxxxxxx.supabase.co`)
   - **anon public** (em "Project API keys") — é a chave pública, segura para o frontend.

---

## 3. Configurar o projeto Arc Snake (variáveis de ambiente)

1. Na raiz do projeto Arc Snake, crie ou edite o ficheiro **`.env.local`** (não commitar este ficheiro).
2. Adicione ou complete estas linhas com os valores que copiou:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Guarde o ficheiro e reinicie o servidor de desenvolvimento (`npm run dev`) se estiver a correr.

**Produção (deploy estático):** Para o ranking ser global no site publicado, as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` têm de existir **no momento do build**. Por exemplo, no GitHub Actions defina-as como secrets e use-as no passo de build; caso contrário o site em produção usará apenas ranking local (localStorage).

---

## 4. Criar a tabela e políticas do Leaderboard no Supabase

1. No Supabase Dashboard, no **mesmo projeto** que criou, vá a **SQL Editor**.
2. Clique em **"New query"**.
3. Copie **todo** o conteúdo do ficheiro **`supabase-leaderboard-schema.sql`** do projeto e cole no editor.
4. Clique em **"Run"** (ou Ctrl+Enter).

Se correr sem erros, a tabela `leaderboard` e as políticas RLS ficam criadas e o site passa a usar o ranking global (todas as carteiras) em vez do localStorage.

---

## Resumo

| Onde              | O que fazer |
|-------------------|-------------|
| Supabase Dashboard | Novo projeto → copiar **Project URL** e **anon public** |
| Projeto Arc Snake | `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Supabase SQL Editor | Executar o SQL de `supabase-leaderboard-schema.sql` |

Depois disto, o leaderboard no site usa esse projeto Supabase e mostra todas as carteiras no ranking.
