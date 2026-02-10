"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, RefreshCw, AlertCircle } from "lucide-react"
import { fetchLeaderboard, formatLeaderboardAddress, isGlobalLeaderboardConfigured, type LeaderboardEntry } from "@/lib/leaderboard-api"

export function LeaderboardTab() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [source, setSource] = useState<"supabase" | "local">("local")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isGlobal = isGlobalLeaderboardConfigured()

  const load = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const result = await fetchLeaderboard()
      setEntries(result.entries)
      setSource(result.source)
      if (result.error) setLoadError(result.error)
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Leaderboard</h2>
          <p className="text-muted-foreground">
            {isGlobal
              ? "Global ranking – top 1000 players on Arc Testnet (best score per wallet). Scores are saved online."
              : "Local ranking – scores are saved only on this device. Set NEXT_PUBLIC_SUPABASE_* in .env.local and rebuild for global ranking."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={isLoading} className="shrink-0">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Failed to load global ranking: {loadError}. Check Supabase RLS (run supabase-fix-rls-public-read.sql) and connection.</span>
        </div>
      )}

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
