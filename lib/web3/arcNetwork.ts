/**
 * Arc Testnet – helper reutilizável para detectar/trocar/adicionar rede na wallet (EIP-1193).
 * Dados oficiais: chainId 5042002, RPC, USDC, Explorer.
 * @see https://docs.arc.network/arc/references/connect-to-arc
 */

/** Chain ID da Arc Testnet em hex (lowercase para comparação). */
export const ARC_CHAIN_ID_HEX = "0x4cef52" as const

/** Config da rede para wallet_addEthereumChain (exatamente conforme spec). */
export const ARC_NETWORK_PARAMS = {
  chainId: ARC_CHAIN_ID_HEX,
  chainName: "Arc Testnet",
  rpcUrls: ["https://rpc.testnet.arc.network"],
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  blockExplorerUrls: ["https://testnet.arcscan.app"],
} as const

/** Tipo mínimo EIP-1193: request + eventos opcionais. */
export interface EIP1193Provider {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>
  on?: (event: string, callback: (...args: unknown[]) => void) => void
  removeListener?: (event: string, callback: (...args: unknown[]) => void) => void
}

/** Erro quando o usuário rejeita a troca/adição de rede (code 4001). */
export class ArcNetworkUserRejectedError extends Error {
  readonly code = 4001
  constructor() {
    super("User rejected network switch")
    this.name = "ArcNetworkUserRejectedError"
  }
}

/**
 * Retorna window.ethereum com type guard para EIP1193.
 */
export function getEthereum(): EIP1193Provider | null {
  if (typeof window === "undefined") return null
  const eth = (window as Window & { ethereum?: unknown }).ethereum
  if (!eth || typeof (eth as EIP1193Provider).request !== "function") return null
  return eth as EIP1193Provider
}

/**
 * Verifica se o chainId (hex) é Arc Testnet (normaliza para comparação).
 */
export function isArcNetwork(chainIdHex: string | undefined): boolean {
  if (!chainIdHex) return false
  const normalized = chainIdHex.toLowerCase().startsWith("0x") ? chainIdHex.toLowerCase() : `0x${chainIdHex.toLowerCase()}`
  return normalized === ARC_CHAIN_ID_HEX
}

/**
 * Garante que a wallet está na Arc Testnet: troca se necessário ou adiciona e troca (máx. 1 ciclo).
 * - Chama eth_chainId; se já for Arc, resolve.
 * - Senão tenta wallet_switchEthereumChain; se 4902 (rede não adicionada), chama wallet_addEthereumChain e depois wallet_switchEthereumChain de novo.
 * - Em 4001 (user rejected) lança ArcNetworkUserRejectedError para mensagem amigável.
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
