-- Arc Snake Leaderboard: tabela e políticas para ranking global (todas as carteiras).
-- Executar no SQL Editor do Supabase (Dashboard → SQL Editor).
-- Se o ranking só mostrar uma carteira, confira que estas políticas existem e estão ativas.

-- Tabela: um registo por endereço (melhor score).
CREATE TABLE IF NOT EXISTS public.leaderboard (
  address text PRIMARY KEY,
  score bigint NOT NULL DEFAULT 0,
  snake text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para ordenar por score (ranking global).
CREATE INDEX IF NOT EXISTS leaderboard_score_desc ON public.leaderboard (score DESC);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem (para reaplicar corretamente).
DROP POLICY IF EXISTS "Leaderboard is publicly readable" ON public.leaderboard;
DROP POLICY IF EXISTS "Anyone can upsert leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "Anyone can update leaderboard" ON public.leaderboard;

-- Leitura pública: anon e authenticated podem ver TODAS as linhas (todas as carteiras no ranking).
CREATE POLICY "Leaderboard is publicly readable"
  ON public.leaderboard
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Inserir/atualizar: qualquer um pode fazer upsert (o app valida wallet + jogo NFT).
CREATE POLICY "Anyone can upsert leaderboard"
  ON public.leaderboard
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update leaderboard"
  ON public.leaderboard
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.leaderboard IS 'Arc Snake: melhor score por endereço (ranking global, top 1000).';
