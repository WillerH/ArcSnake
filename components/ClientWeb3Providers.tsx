"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import {
  normalizeWalletError,
  type WalletError,
} from "@/lib/wallet-errors"

type WalletContextValue = {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  connectWallet: () => Promise<{ success: boolean; error: WalletError | null }>
  disconnectWallet: () => void
  connectionError: WalletError | null
  clearError: () => void
}

const WalletContext = createContext<WalletContextValue | null>(null)

function getEthereum() {
  if (typeof window === "undefined") return null
  return (window as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } })
    .ethereum ?? null
}

export function ClientWeb3Providers({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<WalletError | null>(null)

  const clearError = useCallback(() => setConnectionError(null), [])

  const connectWallet = useCallback(async (): Promise<{
    success: boolean
    error: WalletError | null
  }> => {
    const ethereum = getEthereum()
    if (!ethereum) {
      const err = normalizeWalletError({ code: "4200", message: "No provider" })
      setConnectionError(err)
      return { success: false, error: err }
    }
    setIsConnecting(true)
    setConnectionError(null)
    try {
      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
        params: [],
      })) as string[]
      const acc = accounts?.[0] ?? null
      setAddress(acc ? String(acc) : null)
      return { success: !!acc, error: null }
    } catch (e) {
      const err = normalizeWalletError(e)
      setConnectionError(err)
      return { success: false, error: err }
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setAddress(null)
    setConnectionError(null)
  }, [])

  useEffect(() => {
    const ethereum = getEthereum()
    if (!ethereum) return
    const onAccounts = (accounts: unknown) => {
      const acc = Array.isArray(accounts) ? accounts[0] : null
      setAddress(acc ? String(acc) : null)
    }
    ethereum.request({ method: "eth_accounts", params: [] }).then((accounts) => {
      onAccounts(accounts as string[])
    })
    const handler = (accounts: unknown) => onAccounts(accounts)
    type EthWithEvents = typeof ethereum & {
      on?: (event: string, cb: (accounts: unknown) => void) => void
      removeListener?: (event: string, cb: (accounts: unknown) => void) => void
    }
    const eth = ethereum as EthWithEvents
    if (typeof eth.on === "function") {
      eth.on("accountsChanged", handler)
      return () => {
        eth.removeListener?.("accountsChanged", handler)
      }
    }
  }, [])

  const value: WalletContextValue = {
    address,
    isConnected: !!address,
    isConnecting,
    connectWallet,
    disconnectWallet,
    connectionError,
    clearError,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("useWallet must be used within ClientWeb3Providers")
  return ctx
}
