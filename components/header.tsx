"use client"

import { Wallet } from "lucide-react"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import type { WalletError } from "@/lib/wallet-errors"

interface HeaderProps {
  walletAddress: string | null
  isConnected: boolean
  isConnecting: boolean
  connectWallet: () => Promise<{ success: boolean; error: WalletError | null }>
  disconnectWallet: () => void
  connectionError: WalletError | null
  clearError: () => void
}

export function Header({
  walletAddress: _walletAddress, // reserved for future use (e.g., display)
  isConnected,
  isConnecting,
  connectWallet,
  disconnectWallet,
  connectionError,
  clearError,
}: HeaderProps) {
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
          <WalletConnectButton
            isConnected={isConnected}
            isConnecting={isConnecting}
            connectWallet={connectWallet}
            disconnectWallet={disconnectWallet}
            connectionError={connectionError}
            clearError={clearError}
          />
        </div>
      </div>
    </header>
  )
}
