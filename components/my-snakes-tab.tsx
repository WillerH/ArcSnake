"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { SNAKE_TYPES, type SnakeNFT, type SnakeType } from "@/lib/snake-data"
import { buySnake, switchToArcTestnet } from "@/lib/arc-web3"
import { SNAKE_NFT_ADDRESS } from "@/config/contracts"
import { getPurchaseErrorMessage } from "@/lib/wallet-errors"
import { AlertCircle } from "lucide-react"
import React from "react"
import Image from "next/image"

interface MySnakesTabProps {
  isWalletConnected: boolean
  ownedSnakes: SnakeNFT[]
  onPurchaseSnake: (snake: SnakeNFT) => void | Promise<void>
  isLoadingSnakes?: boolean
  snakesLoadError?: string | null
  onReloadSnakes?: () => void
}

const SNAKE_MAX_ENERGY: Record<string, number> = {
  Rattlesnake: 5,
  "Coral Snake": 4,
  "King Cobra": 4,
  "Black Mamba": 3,
}

const isContractConfigured = Boolean(SNAKE_NFT_ADDRESS)

export function MySnakesTab({
  isWalletConnected,
  ownedSnakes,
  onPurchaseSnake,
  isLoadingSnakes = false,
  snakesLoadError = null,
  onReloadSnakes,
}: MySnakesTabProps) {
  const [purchasingSnake, setPurchasingSnake] = React.useState<string | null>(null)
  const ownedTokenIds = React.useMemo(() => new Set(ownedSnakes.map((snake) => snake.tokenId)), [ownedSnakes])

  React.useEffect(() => {
    console.log("[MySnakesTab] Received ownedSnakes", {
      count: ownedSnakes.length,
      isLoadingSnakes,
      hasError: !!snakesLoadError,
      snakes: ownedSnakes.map((s) => ({ tokenId: s.tokenId, name: s.name, id: s.id })),
    })
  }, [ownedSnakes, isLoadingSnakes, snakesLoadError])

  const handlePurchase = async (snake: SnakeType) => {
    if (!isWalletConnected || !isContractConfigured) return
    setPurchasingSnake(snake.name)
    try {
      await switchToArcTestnet()
      await buySnake(snake.tokenId, 1)
      const maxEnergy = SNAKE_MAX_ENERGY[snake.name] || 5
      const newSnake: SnakeNFT = {
        ...snake,
        id: `purchased-${snake.tokenId}-${Date.now()}`,
        xp: 0,
        xpToNextLevel: snake.xpToNextLevel || 200,
        energy: maxEnergy,
        maxEnergy: maxEnergy,
        nextPlayTime: null,
      }
      await onPurchaseSnake(newSnake)
      alert(`Successfully purchased ${snake.name} for ${snake.price} USDC! Your snake has full energy.`)
    } catch (error) {
      // Most common: user cancelled the "Switch to Arc Testnet" or "Add network" pop-up (code 4001).
      // Or: wallet returned a network/chain error without showing the pop-up (e.g. wrong provider).
      console.error("Purchase error:", error)
      const message = getPurchaseErrorMessage(error)
      alert(message)
    } finally {
      setPurchasingSnake(null)
    }
  }

  if (!isWalletConnected) {
    return (
      <Card className="p-12 text-center border-border gradient-card glow-primary">
        <AlertCircle className="w-16 h-16 mx-auto mb-6 text-primary" />
        <h3 className="text-2xl font-bold mb-3 tracking-tight">Wallet Not Connected</h3>
        <p className="text-muted-foreground text-lg">Please connect your wallet to view your snake NFTs.</p>
      </Card>
    )
  }

  if (!isContractConfigured) {
    return (
      <Card className="p-12 text-center border-border gradient-card glow-primary">
        <AlertCircle className="w-16 h-16 mx-auto mb-6 text-destructive" />
        <h3 className="text-2xl font-bold mb-3 tracking-tight">Contract address not configured</h3>
        <p className="text-muted-foreground text-lg">
          The Snake NFT contract address is not set. Purchases are disabled. Please contact the site operator.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold mb-3 tracking-tight">NFT Marketplace</h3>
          <p className="text-muted-foreground text-lg mb-6">Purchase snake NFTs with USDC</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SNAKE_TYPES.map((snake) => {
            const isPurchasing = purchasingSnake === snake.name
            const missingPrereq = snake.tokenId > 0 && ![...Array(snake.tokenId).keys()].every((id) => ownedTokenIds.has(id))

            return (
              <Card
                key={snake.name}
                className="p-5 border-border gradient-card hover:border-primary hover:-translate-y-2 glow-primary transition-all duration-300 overflow-hidden"
              >
                <div className="relative w-full aspect-[3/4] rounded-xl mb-4 overflow-hidden border border-border/50 group">
                  <Image
                    src={snake.image || "/placeholder.svg"}
                    alt={snake.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-lg font-bold tracking-tight">{snake.name}</h4>
                      <span className={`text-sm font-bold ${snake.rarityColor}`}>{snake.rarity}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{snake.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Multiplier</span>
                    <span className="font-bold text-primary">{snake.multiplier}x</span>
                  </div>

                  <div className="pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-muted-foreground font-medium text-sm">Price</span>
                      <span className="text-xl font-bold text-primary">{snake.price} USDC</span>
                    </div>

                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5 font-semibold glow-primary transition-all duration-200"
                      onClick={() => handlePurchase(snake)}
                      disabled={isPurchasing || missingPrereq}
                    >
                      {isPurchasing ? "Purchasing..." : missingPrereq ? "Unlock previous rarity" : "Buy NFT"}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="border-t border-border/50 pt-8">
        <h3 className="text-2xl font-bold mb-6 tracking-tight">Your Owned Snakes</h3>

        {isLoadingSnakes && (
          <Card className="p-8 mb-6 text-center border-border gradient-card glow-primary">
            <h4 className="text-xl font-semibold mb-2 tracking-tight">Loading your snakes…</h4>
            <p className="text-muted-foreground text-sm">Fetching your Snake NFTs from the blockchain.</p>
          </Card>
        )}

        {snakesLoadError && (
          <Card className="p-8 mb-6 text-center border-border gradient-card glow-primary">
            <AlertCircle className="w-10 h-10 mx-auto mb-4 text-destructive" />
            <h4 className="text-xl font-semibold mb-2 tracking-tight">Could not load your snakes</h4>
            <p className="text-muted-foreground text-sm mb-4">
              {snakesLoadError}
            </p>
            {onReloadSnakes && (
              <Button className="mx-auto" size="sm" onClick={onReloadSnakes}>
                Try again
              </Button>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              The marketplace above is still available. You can purchase new snakes even if your owned snakes list
              could not be loaded.
            </p>
          </Card>
        )}

        {!snakesLoadError && !isLoadingSnakes && ownedSnakes.length === 0 && (
          <Card className="p-8 text-center border-border gradient-card glow-primary">
            <h4 className="text-xl font-semibold mb-2 tracking-tight">No snakes owned yet</h4>
            <p className="text-muted-foreground text-sm">
              You don&apos;t own any snake NFTs yet. Use the marketplace above to purchase your first snake.
            </p>
          </Card>
        )}

        {ownedSnakes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ownedSnakes.map((snake) => {
              const xpProgress = snake.xpToNextLevel ? (snake.xp / snake.xpToNextLevel) * 100 : 0

              return (
                <Card
                  key={snake.id}
                  className="p-5 border-border gradient-card hover:border-primary hover:-translate-y-2 glow-primary transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div className="relative w-full aspect-[3/4] rounded-xl mb-4 overflow-hidden border border-border/50 group">
                    <Image
                      src={snake.image || "/placeholder.svg"}
                      alt={snake.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-bold tracking-tight">{snake.name}</h3>
                        <span className={`text-sm font-bold ${snake.rarityColor}`}>{snake.rarity}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{snake.description}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground block text-xs">Level</span>
                        <p className={`font-bold ${snake.rarityColor}`}>{snake.level}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Multiplier</span>
                        <p className="font-bold text-white">{snake.multiplier}x</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Energy</span>
                        <p className="font-bold text-white">
                          {snake.energy}/{snake.maxEnergy}
                        </p>
                      </div>
                    </div>

                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
