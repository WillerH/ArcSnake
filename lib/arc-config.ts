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
};

export const SNAKE_NFT_ABI = [
  "function buy(uint256 id, uint256 amount) payable",
  "function prices(uint256 id) view returns (uint256)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])",
];

