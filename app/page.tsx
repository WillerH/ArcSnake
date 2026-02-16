"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { PlayTab } from "@/components/play-tab"
import { MySnakesTab } from "@/components/my-snakes-tab"
import { LeaderboardTab } from "@/components/leaderboard-tab"
import { TrainingModeTab } from "@/components/training-mode-tab"
import { type SnakeNFT } from "@/lib/snake-data"
import { useWallet } from "@/components/ClientWeb3Providers"
import { fetchMySnakes } from "@/lib/arc-web3"

type Tab = "play" | "snakes" | "leaderboard" | "training"

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("play")
  const {
    address,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    connectionError,
    clearError,
  } = useWallet()
  const [ownedSnakes, setOwnedSnakes] = useState<SnakeNFT[]>([])
  const [isLoadingSnakes, setIsLoadingSnakes] = useState(false)
  const [snakesLoadError, setSnakesLoadError] = useState<string | null>(null)

  const loadOwnedSnakes = useCallback(async () => {
    if (!address) {
      setOwnedSnakes([])
      setSnakesLoadError(null)
      return
    }
    setIsLoadingSnakes(true)
    setSnakesLoadError(null)
    try {
      const snakes = await fetchMySnakes(address)
      setOwnedSnakes(snakes)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load snakes"
      setSnakesLoadError(message)
      setOwnedSnakes([])
    } finally {
      setIsLoadingSnakes(false)
    }
  }, [address])

  useEffect(() => {
    if (!address) {
      setOwnedSnakes([])
      setSnakesLoadError(null)
      return
    }
    loadOwnedSnakes()
  }, [address, loadOwnedSnakes])

  const handlePurchaseSnake = (snake: SnakeNFT) => {
    setOwnedSnakes((prev) => [...prev, snake])
  }

  const handleUpdateSnake = (updatedSnake: SnakeNFT) => {
    setOwnedSnakes((prev) =>
      prev.map((s) => (s.id === updatedSnake.id ? updatedSnake : s))
    )
  }

  return (
    <div className="min-h-screen">
      <Header
        walletAddress={address ?? null}
        isConnected={isConnected}
        isConnecting={isConnecting}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        connectionError={connectionError}
        clearError={clearError}
      />

      <main className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="flex flex-wrap gap-3 mb-12 border-b border-border pb-1">
          {[
            { id: "play", label: "Play" },
            { id: "snakes", label: "Buy Snake" },
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
          <Link
            href="/about"
            className="px-8 py-4 font-semibold text-base transition-all duration-200 relative rounded-t-lg text-muted-foreground hover:text-foreground hover:bg-card/10"
          >
            About
          </Link>
        </div>

        {/* Tab Content */}
        {activeTab === "play" && (
          <PlayTab
            isWalletConnected={isConnected}
            ownedSnakes={ownedSnakes}
            onUpdateSnake={handleUpdateSnake}
            walletAddress={address ?? null}
          />
        )}
        {activeTab === "snakes" && (
          <MySnakesTab
            isWalletConnected={isConnected}
            ownedSnakes={ownedSnakes}
            onPurchaseSnake={handlePurchaseSnake}
            isLoadingSnakes={isLoadingSnakes}
            snakesLoadError={snakesLoadError}
            onReloadSnakes={loadOwnedSnakes}
          />
        )}
        {activeTab === "leaderboard" && <LeaderboardTab />}
        {activeTab === "training" && <TrainingModeTab />}
      </main>
    </div>
  )
}
