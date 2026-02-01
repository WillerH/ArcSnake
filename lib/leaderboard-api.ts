/**
 * Leaderboard global: pontos de todos os jogadores que compraram NFT e jogaram.
 * Usa Supabase quando configurado (top 100); fallback localStorage (só visível localmente).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

export interface LeaderboardEntry {
  address: string
  score: number
  snake: string
  timestamp: number
}

const LEADERBOARD_STORAGE_KEY = "arcsnake_leaderboard_v1"
const LEADERBOARD_TABLE = "leaderboard"
const TOP_N = 100

function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  try {
    return createClient(url, anonKey)
  } catch {
    return null
  }
}

export function isGlobalLeaderboardConfigured(): boolean {
  return Boolean(
    typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

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

/**
 * Devolve o leaderboard: top 100 por score (Supabase) ou dados locais se não configurado.
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
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
        return []
      }
      if (!data || !Array.isArray(data)) return []
      return data.map((row: { address: string; score: number; snake: string; updated_at: string }) => ({
        address: row.address,
        score: Number(row.score),
        snake: row.snake ?? "",
        timestamp: new Date(row.updated_at).getTime(),
      }))
    } catch (e) {
      console.warn("[leaderboard] fetchLeaderboard error:", e)
      return []
    }
  }
  const entries = loadEntries()
  const byAddress = new Map<string, LeaderboardEntry>()
  for (const e of entries) {
    const key = e.address.toLowerCase()
    const current = byAddress.get(key)
    if (!current || current.score < e.score) byAddress.set(key, e)
  }
  return Array.from(byAddress.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N)
}

export function formatLeaderboardAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
