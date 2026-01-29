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

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (typeof window === "undefined" || !window.ethereum) return

      try {
        const accounts = (await window.ethereum.request({
          method: "eth_accounts",
        })) as string[]
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0])
          console.log("[useSimpleWallet] Found existing connection", { address: accounts[0] })
        }
      } catch (err) {
        console.error("[useSimpleWallet] Error checking existing connection", err)
      }
    }

    checkExistingConnection()

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0])
        } else {
          setAddress(null)
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        }
      }
    }
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

