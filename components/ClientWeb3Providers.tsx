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
import {
  ArcNetworkUserRejectedError,
  ensureArcNetwork,
  getEthereum,
} from "@/lib/web3/arcNetwork"

const ARC_NETWORK_REJECTED_MESSAGE =
  "Você precisa estar na Arc Testnet para continuar."

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
      await ensureArcNetwork(ethereum)
      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
        params: [],
      })) as string[]
      const acc = accounts?.[0] ?? null
      setAddress(acc ? String(acc) : null)
      return { success: !!acc, error: null }
    } catch (e) {
      if (e instanceof ArcNetworkUserRejectedError) {
        const err: WalletError = {
          code: "4001",
          message: e.message,
          userMessage: ARC_NETWORK_REJECTED_MESSAGE,
        }
        setConnectionError(err)
        return { success: false, error: err }
      }
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
    const accountsHandler = (accounts: unknown) => onAccounts(accounts)
    type EthWithEvents = typeof ethereum & {
      on?: (event: string, cb: (...args: unknown[]) => void) => void
      removeListener?: (event: string, cb: (...args: unknown[]) => void) => void
    }
    const eth = ethereum as EthWithEvents
    const cleanup: (() => void)[] = []
    if (typeof eth.on === "function") {
      eth.on("accountsChanged", accountsHandler)
      cleanup.push(() => eth.removeListener?.("accountsChanged", accountsHandler))
      const chainChangedHandler = () => {
        window.location.reload()
      }
      eth.on("chainChanged", chainChangedHandler)
      cleanup.push(() => eth.removeListener?.("chainChanged", chainChangedHandler))
    }
    return () => cleanup.forEach((fn) => fn())
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
