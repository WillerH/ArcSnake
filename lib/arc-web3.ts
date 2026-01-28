import { ethers } from "ethers";
import { SNAKE_NFT_ADDRESS } from "@/config/contracts";
import { ARC_TESTNET, SNAKE_NFT_ABI } from "@/lib/arc-config";

export type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
};

export function getEthereum(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return (window as Window & { ethereum?: EthereumProvider }).ethereum || null;
}

export function getContractAddress() {
  return SNAKE_NFT_ADDRESS;
}

export async function ensureArcNetwork(ethereum: EthereumProvider) {
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARC_TESTNET.chainHex }],
    });
  } catch (error) {
    const err = error as { code?: number };
    if (err.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: ARC_TESTNET.chainHex,
            chainName: ARC_TESTNET.chainName,
            nativeCurrency: ARC_TESTNET.nativeCurrency,
            rpcUrls: ARC_TESTNET.rpcUrls,
            blockExplorerUrls: ARC_TESTNET.blockExplorerUrls,
          },
        ],
      });
    } else {
      throw error;
    }
  }
}

export async function connectWallet() {
  const ethereum = getEthereum();
  if (!ethereum) {
    throw new Error("MetaMask not detected");
  }
  await ensureArcNetwork(ethereum);
  const accounts = (await ethereum.request({ method: "eth_requestAccounts" })) as string[];
  return accounts?.[0] || null;
}

export function getProvider() {
  const ethereum = getEthereum();
  if (!ethereum) {
    throw new Error("MetaMask not detected");
  }
  return new ethers.BrowserProvider(ethereum);
}

export async function getSigner() {
  const ethereum = getEthereum();
  if (!ethereum) {
    throw new Error("MetaMask not detected");
  }
  await ensureArcNetwork(ethereum);
  const provider = getProvider();
  return provider.getSigner();
}

export async function getSnakeContract() {
  const contractAddress = getContractAddress();
  if (!contractAddress) {
    throw new Error("Missing contract address");
  }
  const signer = await getSigner();
  return new ethers.Contract(contractAddress, SNAKE_NFT_ABI, signer);
}

export async function buySnake(id: number, amount: number) {
  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }
  const contract = await getSnakeContract();
  const price = (await contract.prices(id)) as bigint;
  const totalPrice = price * BigInt(amount);
  const tx = await contract.buy(id, amount, { value: totalPrice });
  return tx.wait();
}

export function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}


