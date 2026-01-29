"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { normalizeWalletError, type WalletError } from "@/lib/wallet-errors"
import { connectWallet as connectWalletArc } from "@/lib/arc-web3"

type ConnectResult = { success: boolean; error: WalletError | null }

export function useSimpleWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<WalletError | null>(null)
  const accountsChangedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

    // Listen for account changes (e.g. user switched account or disconnected in extension)
    if (window.ethereum) {
      const ethereum = window.ethereum

      const handler = (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          if (accountsChangedTimeoutRef.current) {
            clearTimeout(accountsChangedTimeoutRef.current)
            accountsChangedTimeoutRef.current = null
          }
          setAddress(accounts[0])
          return
        }
        // Empty array can be spurious when multiple extensions (e.g. Backpack) interact with window.ethereum.
        // Re-check eth_accounts after a short delay before disconnecting.
        if (accountsChangedTimeoutRef.current) clearTimeout(accountsChangedTimeoutRef.current)
        accountsChangedTimeoutRef.current = setTimeout(async () => {
          accountsChangedTimeoutRef.current = null
          try {
            const current = (await ethereum.request({ method: "eth_accounts" })) as string[]
            if (!current || current.length === 0) setAddress(null)
            else setAddress(current[0])
          } catch {
            setAddress(null)
          }
        }, 200)
      }

      ethereum.on("accountsChanged", handler)

      return () => {
        if (accountsChangedTimeoutRef.current) {
          clearTimeout(accountsChangedTimeoutRef.current)
          accountsChangedTimeoutRef.current = null
        }
        try {
          ethereum.removeListener("accountsChanged", handler)
        } catch (_) {}
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

