/**
 * Leaderboard global: pontos de todos os jogadores que compraram NFT e jogaram.
 * Usa Supabase quando configurado (top 1000); fallback localStorage (só visível localmente).
 */

import { getSupabaseClient } from "@/lib/supabase"

export interface LeaderboardEntry {
  address: string
  score: number
  snake: string
  timestamp: number
}

const LEADERBOARD_STORAGE_KEY = "arcsnake_leaderboard_v1"
const LEADERBOARD_TABLE = "leaderboard"
/** Máximo de carteiras no ranking global (todas que jogaram, ordenadas por melhor score). */
const TOP_N = 1000

export { isSupabaseConfigured as isGlobalLeaderboardConfigured } from "@/lib/supabase"

/**
 * Regista a pontuação de uma partida (jogador com NFT, fim de jogo).
 * Se Supabase configurado: upsert (melhor score por endereço). Senão: localStorage.
 */
export async function submitScore(address: string, score: number, snake: string): Promise<void> {
  if (!address || score < 0) return
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      const addr = address.toLowerCase()
      const { data: existing } = await supabase
        .from(LEADERBOARD_TABLE)
        .select("score")
        .eq("address", addr)
        .maybeSingle()
      if (existing != null && Number(existing.score) >= score) return
      const { error } = await supabase.from(LEADERBOARD_TABLE).upsert(
        {
          address: addr,
          score,
          snake,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "address" }
      )
      if (error) console.warn("[leaderboard] submitScore error:", error)
    } catch (e) {
      console.warn("[leaderboard] submitScore error:", e)
    }
    return
  }
  const entries = loadEntries()
  const existing = entries.findIndex((e) => e.address.toLowerCase() === address.toLowerCase())
  const entry: LeaderboardEntry = {
    address,
    score,
    snake,
    timestamp: Date.now(),
  }
  if (existing >= 0) {
    if (entries[existing].score < score) entries[existing] = entry
  } else {
    entries.push(entry)
  }
  saveEntries(entries)
}

function loadEntries(): LeaderboardEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LeaderboardEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveEntries(entries: LeaderboardEntry[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // ignore
  }
}

export type FetchLeaderboardResult = {
  entries: LeaderboardEntry[]
  source: "supabase" | "local"
  error?: string
}

/**
 * Devolve o leaderboard: TODAS as carteiras (ranking público), ordenadas por score (desc), até TOP_N.
 * Não filtra por carteira conectada — quem abre o site vê o ranking global.
 * Inclui source (supabase | local) e error para diagnóstico.
 */
export async function fetchLeaderboard(): Promise<FetchLeaderboardResult> {
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(LEADERBOARD_TABLE)
        .select("address, score, snake, updated_at")
        .order("score", { ascending: false })
        .limit(TOP_N)
      if (error) {
        console.warn("[leaderboard] fetchLeaderboard error:", error)
        return { entries: [], source: "supabase", error: error.message }
      }
      if (!data || !Array.isArray(data)) {
        return { entries: [], source: "supabase" }
      }
      const mapped = data.map((row: { address: string; score: number; snake: string; updated_at: string }) => ({
        address: row.address,
        score: Number(row.score),
        snake: row.snake ?? "",
        timestamp: row.updated_at ? new Date(row.updated_at).getTime() : 0,
      }))
      mapped.sort((a, b) => b.score - a.score)
      return { entries: mapped.slice(0, TOP_N), source: "supabase" }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.warn("[leaderboard] fetchLeaderboard error:", e)
      return { entries: [], source: "supabase", error: msg }
    }
  }
  const entries = loadEntries()
  const byAddress = new Map<string, LeaderboardEntry>()
  for (const e of entries) {
    const key = e.address.toLowerCase()
    const current = byAddress.get(key)
    if (!current || current.score < e.score) byAddress.set(key, e)
  }
  const list = Array.from(byAddress.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N)
  return { entries: list, source: "local" }
}

export function formatLeaderboardAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
