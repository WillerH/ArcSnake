/**
 * Arc Testnet – reusable helper to detect/switch/add network in the wallet (EIP-1193).
 * Official data: chainId 5042002, RPC, USDC, Explorer.
 * @see https://docs.arc.network/arc/references/connect-to-arc
 */

/** Arc Testnet chain ID in hex (lowercase for comparison). */
export const ARC_CHAIN_ID_HEX = "0x4cef52" as const

/** Network config for wallet_addEthereumChain (exactly per spec). */
export const ARC_NETWORK_PARAMS = {
  chainId: ARC_CHAIN_ID_HEX,
  chainName: "Arc Testnet",
  rpcUrls: ["https://rpc.testnet.arc.network"],
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  blockExplorerUrls: ["https://testnet.arcscan.app"],
} as const

/** Minimal EIP-1193 type: request + optional events. */
export interface EIP1193Provider {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>
  on?: (event: string, callback: (...args: unknown[]) => void) => void
  removeListener?: (event: string, callback: (...args: unknown[]) => void) => void
}

/** Error when the user rejects the network switch/add (code 4001). */
export class ArcNetworkUserRejectedError extends Error {
  readonly code = 4001
  constructor() {
    super("User rejected network switch")
    this.name = "ArcNetworkUserRejectedError"
  }
}

/**
 * Returns window.ethereum with type guard for EIP-1193.
 */
export function getEthereum(): EIP1193Provider | null {
  if (typeof window === "undefined") return null
  const eth = (window as Window & { ethereum?: unknown }).ethereum
  if (!eth || typeof (eth as EIP1193Provider).request !== "function") return null
  return eth as EIP1193Provider
}

/**
 * Returns true if chainId (hex) is Arc Testnet (normalized for comparison).
 */
export function isArcNetwork(chainIdHex: string | undefined): boolean {
  if (!chainIdHex) return false
  const normalized = chainIdHex.toLowerCase().startsWith("0x") ? chainIdHex.toLowerCase() : `0x${chainIdHex.toLowerCase()}`
  return normalized === ARC_CHAIN_ID_HEX
}

/**
 * Ensures the wallet is on Arc Testnet: switches if needed, or adds and switches (max 1 cycle).
 * - Calls eth_chainId; if already Arc, resolves.
 * - Otherwise tries wallet_switchEthereumChain; if 4902 (chain not added), calls wallet_addEthereumChain then wallet_switchEthereumChain again.
 * - On 4001 (user rejected) throws ArcNetworkUserRejectedError for a friendly message.
 */
export async function ensureArcNetwork(ethereum: EIP1193Provider): Promise<void> {
  const currentChainId = (await ethereum.request({ method: "eth_chainId" })) as string | undefined
  if (isArcNetwork(currentChainId)) return

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARC_CHAIN_ID_HEX }],
    })
  } catch (error) {
    const err = error as { code?: number }
    if (err.code === 4001) {
      throw new ArcNetworkUserRejectedError()
    }
    if (err.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [ARC_NETWORK_PARAMS],
      })
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ARC_CHAIN_ID_HEX }],
        })
      } catch (switchAfterAdd) {
        const switchErr = switchAfterAdd as { code?: number }
        if (switchErr.code === 4001) {
          throw new ArcNetworkUserRejectedError()
        }
        throw switchAfterAdd
      }
    } else {
      throw error
    }
  }
}
