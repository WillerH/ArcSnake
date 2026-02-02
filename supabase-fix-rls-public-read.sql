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
