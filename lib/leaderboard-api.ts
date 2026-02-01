/**
 * Leaderboard: pontos reais de jogadores que compraram NFT e jogaram.
 * Armazenamento local (chave nova = lista resetada, só conta a partir de agora).
 */

const LEADERBOARD_STORAGE_KEY = "arcsnake_leaderboard_v1"

export interface LeaderboardEntry {
  address: string
  score: number
  snake: string
  timestamp: number
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
 * Regista a pontuação de uma partida (jogador com NFT, fim de jogo).
 * Mantém o melhor score por endereço.
 */
export function submitScore(address: string, score: number, snake: string): void {
  if (!address || score < 0) return
  const entries = loadEntries()
  const existing = entries.findIndex((e) => e.address.toLowerCase() === address.toLowerCase())
  const entry: LeaderboardEntry = {
    address,
    score,
    snake,
    timestamp: Date.now(),
  }
  if (existing >= 0) {
    if (entries[existing].score < score) {
      entries[existing] = entry
    }
  } else {
    entries.push(entry)
  }
  saveEntries(entries)
}

/**
 * Devolve o leaderboard: melhor score por jogador, ordenado por score (desc).
 */
export function fetchLeaderboard(): LeaderboardEntry[] {
  const entries = loadEntries()
  const byAddress = new Map<string, LeaderboardEntry>()
  for (const e of entries) {
    const key = e.address.toLowerCase()
    const current = byAddress.get(key)
    if (!current || current.score < e.score) {
      byAddress.set(key, e)
    }
  }
  return Array.from(byAddress.values()).sort((a, b) => b.score - a.score)
}

export function formatLeaderboardAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
