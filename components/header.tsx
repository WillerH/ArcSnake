"use client"

import { Wallet } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"

interface HeaderProps {
  walletAddress: string | null
}

export function Header({ walletAddress }: HeaderProps) {
  return (
    <header className="border-b border-border gradient-header backdrop-blur-md sticky top-0 z-50 shadow-xl">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center glow-primary-strong transition-transform hover:scale-105 duration-200">
            <div className="text-3xl font-bold text-background">🐍</div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent tracking-tight">
            Arc Snake
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Wallet className="w-5 h-5 text-primary" />
          <ConnectButton showBalance={false} />
        </div>
      </div>
    </header>
  )
}
