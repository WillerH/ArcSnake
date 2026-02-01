"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SnakeGame } from "@/components/snake-game"
import { type SnakeNFT } from "@/lib/snake-data"
import { Play, AlertCircle } from "lucide-react"
import Image from "next/image"

/** Imagens padronizadas para a aba Play (nome da cobra → path). */
const PLAY_STANDARDIZED_IMAGES: Record<string, string> = {
  Rattlesnake: "/images/rattlesnake_standardized.png",
  "Coral Snake": "/images/coral_snake_standardized_371x237.png",
  "King Cobra": "/images/king_cobra_standardized_371x237.png",
  "Black Mamba": "/images/black_mamba_standardized_371x237.png",
}

interface PlayTabProps {
  isWalletConnected: boolean
  ownedSnakes: SnakeNFT[]
  onUpdateSnake: (snake: SnakeNFT) => void
}

export function PlayTab({ isWalletConnected, ownedSnakes, onUpdateSnake }: PlayTabProps) {
  const [selectedSnake, setSelectedSnake] = useState<SnakeNFT | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const userSnakes = ownedSnakes; // Declare userSnakes variable

  const handleGameEnd = (finalScore: number) => {
    if (selectedSnake) {
      const updatedSnake: SnakeNFT = {
        ...selectedSnake,
        energy: Math.max(0, selectedSnake.energy - 1),
        xp: selectedSnake.xp + finalScore,
        nextPlayTime: selectedSnake.energy <= 1 ? Date.now() + 1800000 : null,
      }
      onUpdateSnake(updatedSnake)
    }
    setIsPlaying(false)
  }

  if (!isWalletConnected) {
    return (
      <Card className="p-12 text-center border-border gradient-card glow-primary">
        <AlertCircle className="w-16 h-16 mx-auto mb-6 text-primary" />
        <h3 className="text-2xl font-bold mb-3 tracking-tight">Wallet Not Connected</h3>
        <p className="text-muted-foreground text-lg">Please connect your wallet to play with your NFT snakes.</p>
      </Card>
    )
  }

  if (ownedSnakes.length === 0) {
    return (
      <Card className="p-12 text-center border-border gradient-card glow-primary">
        <h3 className="text-2xl font-bold mb-3 tracking-tight">No Snakes Owned</h3>
        <p className="text-muted-foreground text-lg mb-6">
          You don't own any snake NFTs yet. Try Training Mode to practice!
        </p>
      </Card>
    )
  }

  if (isPlaying && selectedSnake) {
    return <SnakeGame snake={selectedSnake} onGameEnd={handleGameEnd} />
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-3 tracking-tight">Select Your Snake</h2>
        <p className="text-muted-foreground text-lg">Choose a snake with available energy to play</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ownedSnakes.map((snake) => {
          const canPlay = snake.energy > 0
          const minutesRemaining = snake.nextPlayTime ? Math.ceil((snake.nextPlayTime - Date.now()) / 60000) : 0

          return (
            <Card
              key={snake.id}
              className={`p-6 border-border gradient-card transition-all duration-300 ${
                canPlay ? "hover:border-primary hover:-translate-y-1 glow-primary cursor-pointer" : "opacity-60"
              }`}
            >
              <div
                className={`w-full h-36 rounded-xl mb-5 flex items-center justify-center overflow-hidden ${snake.bgColor} border border-border/50 transition-transform duration-200 hover:scale-105`}
              >
                <Image
                  src={PLAY_STANDARDIZED_IMAGES[snake.name] ?? snake.image}
                  alt={snake.name}
                  width={288}
                  height={144}
                  className="w-full h-full object-cover object-center"
                  unoptimized
                />
              </div>

              <h3 className="text-2xl font-bold mb-2 tracking-tight">{snake.name}</h3>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{snake.description}</p>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground font-medium">Level {snake.level}</span>
                  <span className={`font-bold ${snake.rarityColor}`}>{snake.rarity}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground font-medium">Multiplier</span>
                  <span className="font-bold text-primary">{snake.multiplier}x</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground font-medium">Energy</span>
                  <span className="font-bold">
                    {snake.energy}/{snake.maxEnergy}
                  </span>
                </div>
              </div>

              {canPlay ? (
                <Button
                  onClick={() => {
                    setSelectedSnake(snake)
                    setIsPlaying(true)
                  }}
                  className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-200 hover:scale-105 glow-primary py-6 font-semibold text-base"
                >
                  <Play className="w-5 h-5" />
                  Play Now
                </Button>
              ) : (
                <div className="text-center p-4 bg-muted/30 rounded-lg border border-border/50">
                  <p className="text-base text-muted-foreground font-medium">Next play in {minutesRemaining} minutes</p>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
