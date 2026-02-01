-- Arc Snake Leaderboard: tabela e políticas para top 100 global.
-- Executar no SQL Editor do Supabase (Dashboard → SQL Editor).

-- Tabela: um registo por endereço (melhor score).
CREATE TABLE IF NOT EXISTS public.leaderboard (
  address text PRIMARY KEY,
  score bigint NOT NULL DEFAULT 0,
  snake text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para ordenar por score (top 100).
CREATE INDEX IF NOT EXISTS leaderboard_score_desc ON public.leaderboard (score DESC);

-- Permitir leitura pública (qualquer um pode ver o leaderboard).
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboard is publicly readable"
  ON public.leaderboard FOR SELECT
  USING (true);

-- Qualquer um pode inserir/atualizar (o app valida wallet + jogo NFT).
CREATE POLICY "Anyone can upsert leaderboard"
  ON public.leaderboard FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comentário
COMMENT ON TABLE public.leaderboard IS 'Arc Snake: melhor score por endereço (top 100).';
