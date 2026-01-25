import { Card } from "@/components/ui/card"
import { Trophy, Medal } from "lucide-react"

const mockLeaderboard = [
  { rank: 1, address: "0xA1B2...C9D8", score: 15420, snake: "Black Mamba" },
  { rank: 2, address: "0xF3E4...D5C6", score: 14850, snake: "Rattlesnake" },
  { rank: 3, address: "0xB7C8...E9F0", score: 13200, snake: "Black Mamba" },
  { rank: 4, address: "0xD9E0...F1A2", score: 12100, snake: "Boa Constrictor" },
  { rank: 5, address: "0xC5D6...E7F8", score: 11500, snake: "Rattlesnake" },
  { rank: 6, address: "0xA3B4...C5D6", score: 10800, snake: "Corn Snake" },
  { rank: 7, address: "0xE7F8...A9B0", score: 9750, snake: "Boa Constrictor" },
  { rank: 8, address: "0xB1C2...D3E4", score: 8900, snake: "Corn Snake" },
  { rank: 9, address: "0xF5E6...D7C8", score: 8200, snake: "Rattlesnake" },
  { rank: 10, address: "0xD3E4...F5A6", score: 7650, snake: "Boa Constrictor" },
]

export function LeaderboardTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Leaderboard</h2>
        <p className="text-muted-foreground">Top players on Arc Testnet</p>
        <p className="text-xs text-muted-foreground mt-1">
          ⛓️ Final scores will be submitted on-chain in future versions
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
              {mockLeaderboard.map((entry) => (
                <tr key={entry.rank} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {entry.rank === 1 && <Trophy className="w-5 h-5 text-yellow-500" />}
                      {entry.rank === 2 && <Medal className="w-5 h-5 text-gray-400" />}
                      {entry.rank === 3 && <Medal className="w-5 h-5 text-amber-600" />}
                      <span className="font-bold">{entry.rank}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm">{entry.address}</td>
                  <td className="p-4 font-bold text-primary">{entry.score.toLocaleString()}</td>
                  <td className="p-4 text-muted-foreground">{entry.snake}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
