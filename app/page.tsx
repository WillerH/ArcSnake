"use client"

import { useCallback, useEffect, useState } from "react"
import React from "react"
import { Header } from "@/components/header"
import { PlayTab } from "@/components/play-tab"
import { MySnakesTab } from "@/components/my-snakes-tab"
import { LeaderboardTab } from "@/components/leaderboard-tab"
import { TrainingModeTab } from "@/components/training-mode-tab"
import { type SnakeNFT } from "@/lib/snake-data"
import { useAccount } from "wagmi"
import { fetchMySnakes, getContractAddress } from "@/lib/arc-web3"
import { SNAKE_NFT_ADDRESS } from "@/config/contracts"

type Tab = "play" | "snakes" | "leaderboard" | "training"

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("play")
  const { address, isConnected } = useAccount()
  const [ownedSnakes, setOwnedSnakes] = useState<SnakeNFT[]>([])
  const [isLoadingSnakes, setIsLoadingSnakes] = useState(false)
  const [snakesLoadError, setSnakesLoadError] = useState<string | null>(null)

  // Log initial state for debugging - runs immediately on mount
  React.useEffect(() => {
    const contractAddr = getContractAddress()
    console.log("🐍 [Arc Snake Debug] Component loaded", {
      contractAddress: contractAddr,
      contractAddressFromEnv: SNAKE_NFT_ADDRESS,
      hasContractAddress: !!contractAddr,
      contractAddressLength: contractAddr?.length || 0,
      isConnected,
      address,
      ownedSnakesCount: ownedSnakes.length,
      timestamp: new Date().toISOString(),
    })
  }, [isConnected, address, ownedSnakes.length])

  // Log on mount (runs once)
  React.useEffect(() => {
    console.log("🐍 [Arc Snake Debug] Page mounted - logs enabled")
  }, [])

  const reloadOwnedSnakes = useCallback(async () => {
    console.log("[reloadOwnedSnakes] Called", { address, isConnected })
    if (!address) {
      console.log("[reloadOwnedSnakes] No address, clearing snakes")
      setOwnedSnakes([])
      setIsLoadingSnakes(false)
      setSnakesLoadError(null)
      return
    }
    try {
      setIsLoadingSnakes(true)
      setSnakesLoadError(null)
      console.log("[reloadOwnedSnakes] Starting fetch for", address)
      const snakes = await fetchMySnakes(address)
      console.log("[reloadOwnedSnakes] Fetch completed", {
        snakesCount: snakes.length,
        snakes: snakes.map((s) => ({ tokenId: s.tokenId, name: s.name })),
      })
      setOwnedSnakes(snakes)
    } catch (e) {
      console.error("[reloadOwnedSnakes] Failed to fetch snakes onchain", {
        error: e,
        errorMessage: e instanceof Error ? e.message : String(e),
        address,
      })
      // IMPORTANT: don't lie to the user by showing "No Snakes Owned" on transient RPC failures.
      // Keep the previous list and show an error UI with a retry button instead.
      setSnakesLoadError("Não foi possível carregar suas NFTs agora. Verifique a rede e tente novamente.")
    } finally {
      setIsLoadingSnakes(false)
    }
  }, [address])

  const handlePurchaseSnake = async (_snake: SnakeNFT) => {
    // After mint, always re-fetch from chain (source of truth).
    await reloadOwnedSnakes()
  }

  const handleUpdateSnake = (updatedSnake: SnakeNFT) => {
    setOwnedSnakes((prev) =>
      prev.map((s) => (s.id === updatedSnake.id ? updatedSnake : s))
    )
  }

  // On connect / address change, always load owned snakes from chain.
  useEffect(() => {
    console.log("[useEffect] Wallet connection state changed", {
      isConnected,
      address,
      willFetch: isConnected && !!address,
    })
    if (!isConnected) {
      console.log("[useEffect] Not connected, clearing snakes")
      setOwnedSnakes([])
      setIsLoadingSnakes(false)
      setSnakesLoadError(null)
      return
    }
    if (address) {
      console.log("[useEffect] Connected with address, triggering reloadOwnedSnakes")
      void reloadOwnedSnakes()
    } else {
      console.log("[useEffect] Connected but no address yet, waiting...")
    }
  }, [isConnected, address, reloadOwnedSnakes])

  return (
    <div className="min-h-screen bg-background">
      <Header walletAddress={address ?? null} />

      <main className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="flex flex-wrap gap-3 mb-12 border-b border-border pb-1">
          {[
            { id: "play", label: "Play" },
            { id: "snakes", label: "My Snakes" },
            { id: "leaderboard", label: "Leaderboard" },
            { id: "training", label: "Training Mode" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-8 py-4 font-semibold text-base transition-all duration-200 relative rounded-t-lg ${
                activeTab === tab.id
                  ? "text-primary bg-card/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/10"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-secondary glow-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "play" && (
          <PlayTab
            isWalletConnected={isConnected}
            ownedSnakes={ownedSnakes}
            onUpdateSnake={handleUpdateSnake}
            isLoadingSnakes={isLoadingSnakes}
            snakesLoadError={snakesLoadError}
            onReloadSnakes={reloadOwnedSnakes}
          />
        )}
        {activeTab === "snakes" && (
          <MySnakesTab
            isWalletConnected={isConnected}
            ownedSnakes={ownedSnakes}
            onPurchaseSnake={handlePurchaseSnake}
            isLoadingSnakes={isLoadingSnakes}
            snakesLoadError={snakesLoadError}
            onReloadSnakes={reloadOwnedSnakes}
          />
        )}
        {activeTab === "leaderboard" && <LeaderboardTab />}
        {activeTab === "training" && <TrainingModeTab />}
      </main>
    </div>
  )
}
