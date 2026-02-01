/**
 * Arc Testnet – dados oficiais para adicionar/mudar rede na wallet.
 * @see https://docs.arc.network/arc/references/connect-to-arc
 *
 * Add Arc Testnet (MetaMask): Network name, RPC URL, Chain ID 5042002, Currency USDC, Explorer.
 * Gas: USDC como token nativo (18 decimals).
 * Faucet: https://faucet.circle.com
 */
export const ARC_TESTNET = {
  chainId: 5042002,
  chainHex: "0x4CEF52",
  chainName: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: [
    "https://rpc.testnet.arc.network",
    "https://rpc.blockdaemon.testnet.arc.network",
    "https://rpc.drpc.testnet.arc.network",
    "https://rpc.quicknode.testnet.arc.network",
  ],
  blockExplorerUrls: ["https://testnet.arcscan.app"],
} as const;

/** Faucet oficial para obter USDC na Arc Testnet. */
export const ARC_TESTNET_FAUCET_URL = "https://faucet.circle.com";

export const SNAKE_NFT_ABI = [
  "function buy(uint256 id, uint256 amount) payable",
  "function prices(uint256 id) view returns (uint256)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])",
];

