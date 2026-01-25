"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SnakeGame } from "@/components/snake-game"
import { SNAKE_TYPES } from "@/lib/snake-data"
import { Play, Info } from "lucide-react"

export function TrainingModeTab() {
  const [isPlaying, setIsPlaying] = useState(false)

  const trainingSnake = {
    ...SNAKE_TYPES[0],
    id: "training",
    xp: 0,
    energy: 999,
    maxEnergy: 999,
    nextPlayTime: null,
  }

  if (isPlaying) {
    return <SnakeGame snake={trainingSnake} onGameEnd={(_score) => setIsPlaying(false)} isTrainingMode />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Training Mode</h2>
        <p className="text-muted-foreground">Practice without using your NFT snakes</p>
      </div>

      <Card className="p-8 border-border/50 bg-card/50">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h3 className="font-semibold">Training Mode Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Free to play with no NFT required</li>
                <li>• Uses a default Corn Snake</li>
                <li>• Scores do not count toward leaderboard</li>
                <li>• No XP earned</li>
                <li>• Perfect for learning the game mechanics</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-block p-8 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl mb-4">
              <div className="text-8xl">{trainingSnake.emoji}</div>
            </div>
            <h3 className="text-xl font-bold mb-2">{trainingSnake.name}</h3>
            <p className="text-muted-foreground mb-6">{trainingSnake.description}</p>

            <Button
              onClick={() => setIsPlaying(true)}
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8"
            >
              <Play className="w-5 h-5" />
              Start Training
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
