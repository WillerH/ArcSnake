"use client"

import { useEffect, useState } from "react"
import { WalletConnectErrorModal } from "@/components/wallet-connect-error-modal"
import type { WalletError } from "@/lib/wallet-errors"

interface WalletConnectButtonProps {
  isConnected: boolean
  isConnecting: boolean
  connectWallet: () => Promise<{ success: boolean; error: WalletError | null }>
  disconnectWallet: () => void
  connectionError: WalletError | null
  clearError: () => void
}

export function WalletConnectButton({
  isConnected,
  isConnecting,
  connectWallet,
  disconnectWallet,
  connectionError,
  clearError,
}: WalletConnectButtonProps) {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (connectionError) {
      setShowModal(true)
    }
  }, [connectionError])

  const handleConnectClick = async () => {
    const result = await connectWallet()
    if (!result.success && result.error) {
      // Error will be handled via connectionError/normalizeWalletError
      setShowModal(true)
    }
  }

  const handleRetry = async () => {
    clearError()
    setShowModal(false)
    await handleConnectClick()
  }

  const handleClose = () => {
    setShowModal(false)
  }

  const renderLabel = () => {
    if (isConnecting) return "Connecting..."
    if (isConnected) return "Wallet connected"
    return "Connect wallet"
  }

  return (
    <>
      <button
        type="button"
        onClick={isConnected ? disconnectWallet : handleConnectClick}
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow hover:bg-primary/90 transition-colors"
      >
        {renderLabel()}
      </button>

      {showModal && connectionError && (
        <WalletConnectErrorModal
          error={connectionError}
          onRetry={handleRetry}
          onClose={handleClose}
          onSwitchWallet={handleRetry}
        />
      )}
    </>
  )
}
