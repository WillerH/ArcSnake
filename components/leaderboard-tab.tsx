"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Trophy, Medal } from "lucide-react"
import {
  fetchLeaderboard,
  formatLeaderboardAddress,
  isGlobalLeaderboardConfigured,
  type LeaderboardEntry,
} from "@/lib/leaderboard-api"

export function LeaderboardTab() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchLeaderboard()
      setEntries(data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const onStorage = () => load()
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [load])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Leaderboard</h2>
        <p className="text-muted-foreground">
          Top 100 players on Arc Testnet (scores from NFT games)
          {!isGlobalLeaderboardConfigured() && (
            <span className="block text-xs mt-1 text-amber-600 dark:text-amber-400">
              Configure Supabase (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) to show scores from all players.
            </span>
          )}
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium">Daily</button>
        <button className="px-6 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80">
          Weekly
        </button>
      </div>

      <Card className="overflow-hidden border-border/50 bg-card/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left p-4 font-semibold">Rank</th>
                <th className="text-left p-4 font-semibold">Player</th>
                <th className="text-left p-4 font-semibold">Score</th>
                <th className="text-left p-4 font-semibold">Snake</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No scores yet. Play with your NFT snake to appear here!
                  </td>
                </tr>
              ) : (
                entries.map((entry, index) => (
                  <tr
                    key={`${entry.address}-${entry.score}-${entry.timestamp}`}
                    className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                        {index === 1 && <Medal className="w-5 h-5 text-gray-400" />}
                        {index === 2 && <Medal className="w-5 h-5 text-amber-600" />}
                        <span className="font-bold">{index + 1}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm">{formatLeaderboardAddress(entry.address)}</td>
                    <td className="p-4 font-bold text-primary">{entry.score.toLocaleString()}</td>
                    <td className="p-4 text-muted-foreground">{entry.snake}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
