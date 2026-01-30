"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { PlayTab } from "@/components/play-tab"
import { MySnakesTab } from "@/components/my-snakes-tab"
import { LeaderboardTab } from "@/components/leaderboard-tab"
import { TrainingModeTab } from "@/components/training-mode-tab"
import { type SnakeNFT } from "@/lib/snake-data"
import { useWallet } from "@/components/ClientWeb3Providers"

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

  const handlePurchaseSnake = (snake: SnakeNFT) => {
    setOwnedSnakes((prev) => [...prev, snake])
  }

  const handleUpdateSnake = (updatedSnake: SnakeNFT) => {
    setOwnedSnakes((prev) =>
      prev.map((s) => (s.id === updatedSnake.id ? updatedSnake : s))
    )
  }

  return (
    <div className="min-h-screen bg-background">
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
          />
        )}
        {activeTab === "snakes" && (
          <MySnakesTab
            isWalletConnected={isConnected}
            ownedSnakes={ownedSnakes}
            onPurchaseSnake={handlePurchaseSnake}
          />
        )}
        {activeTab === "leaderboard" && <LeaderboardTab />}
        {activeTab === "training" && <TrainingModeTab />}
      </main>
    </div>
  )
}
