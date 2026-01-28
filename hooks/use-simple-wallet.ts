"use client"

import { useCallback, useEffect, useState } from "react"
import { normalizeWalletError, type WalletError } from "@/lib/wallet-errors"
import { connectWallet as connectWalletArc } from "@/lib/arc-web3"

type ConnectResult = { success: boolean; error: WalletError | null }

export function useSimpleWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<WalletError | null>(null)

  const isConnected = !!address

  const connectWallet = useCallback(async (): Promise<ConnectResult> => {
    setConnectionError(null)
    setIsConnecting(true)

    try {
      const addr = await connectWalletArc()
      if (!addr) {
        const error = normalizeWalletError(new Error("No account returned from wallet"))
        setConnectionError(error)
        return { success: false, error }
      }

      setAddress(addr)
      return { success: true, error: null }
    } catch (err) {
      const error = normalizeWalletError(err)
      setConnectionError(error)
      return { success: false, error }
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setAddress(null)
    setConnectionError(null)
  }, [])

  const clearError = useCallback(() => {
    setConnectionError(null)
  }, [])

  // Optional: log connection changes for debugging
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[useSimpleWallet] state changed", {
      address,
      isConnected,
      hasError: !!connectionError,
      error: connectionError,
    })
  }, [address, isConnected, connectionError])

  return {
    address,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    connectionError,
    clearError,
  }
}

