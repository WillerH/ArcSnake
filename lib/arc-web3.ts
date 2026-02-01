import { ethers } from "ethers";
import { SNAKE_NFT_ADDRESS } from "@/config/contracts";
import { ARC_TESTNET, SNAKE_NFT_ABI } from "@/lib/arc-config";
import { SNAKE_TYPES, type SnakeNFT } from "@/lib/snake-data";
import {
  ARC_CHAIN_ID_DECIMAL,
  ensureArcNetwork,
  getEthereum,
  type EIP1193Provider,
} from "@/lib/web3/arcNetwork";

export type { EIP1193Provider };
export { ensureArcNetwork, getEthereum };

export function getContractAddress() {
  return SNAKE_NFT_ADDRESS;
}

/**
 * Pede à wallet para mudar para Arc Testnet (ou adiciona a rede se ainda não existir).
 * Use antes de comprar ou quando a rede estiver errada.
 */
export async function switchToArcTestnet(): Promise<void> {
  const ethereum = getEthereum();
  if (!ethereum) {
    throw new Error("MetaMask not detected");
  }
  await ensureArcNetwork(ethereum);
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

/** Creates a new BrowserProvider each time so that after ensureArcNetwork the wallet state is reflected (ethers v6). */
export function getProvider() {
  const ethereum = getEthereum();
  if (!ethereum) {
    throw new Error("MetaMask not detected");
  }
  return new ethers.BrowserProvider(ethereum);
}

/** Ensures Arc Testnet, then creates a fresh provider and signer (no stale provider after switch). */
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

function getRpcProvider() {
  // Prefer a public RPC for read-only calls; avoids requiring unlocked wallet for reads.
  const rpcUrl = ARC_TESTNET.rpcUrls?.[0];
  if (!rpcUrl) {
    throw new Error("Missing RPC URL");
  }
  return new ethers.JsonRpcProvider(rpcUrl);
}

async function getReadOnlySnakeContract() {
  const contractAddress = getContractAddress();
  if (!contractAddress) {
    throw new Error("Missing contract address");
  }
  const provider = getRpcProvider();
  return new ethers.Contract(contractAddress, SNAKE_NFT_ABI, provider);
}

const SNAKE_MAX_ENERGY: Record<number, number> = {
  0: 5, // Rattlesnake
  1: 4, // Coral Snake
  2: 4, // King Cobra
  3: 3, // Black Mamba
};

/**
 * Fetch all Snake NFTs owned by an address directly from the contract (ERC-1155).
 * Uses balanceOfBatch for tokenIds in SNAKE_TYPES.
 */
export async function fetchMySnakes(ownerAddress: string): Promise<SnakeNFT[]> {
  if (!ownerAddress) {
    console.log("[fetchMySnakes] No owner address provided");
    return [];
  }

  const contractAddress = getContractAddress();
  console.log("[fetchMySnakes] Starting fetch", {
    ownerAddress,
    contractAddress,
    contractAddressLength: contractAddress?.length || 0,
    hasContractAddress: !!contractAddress,
  });

  if (!contractAddress) {
    console.error("[fetchMySnakes] Contract address is empty/missing");
    throw new Error("Contract address not configured");
  }

  try {
    const provider = getRpcProvider();
    const network = await provider.getNetwork();
    const chainIdMatches = network.chainId === ARC_CHAIN_ID_DECIMAL;
    console.log("[fetchMySnakes] Network info", {
      chainId: network.chainId.toString(),
      chainIdHex: network.chainId.toString(16),
      expectedChainId: ARC_CHAIN_ID_DECIMAL.toString(),
      chainIdMatches,
    });

    const contract = await getReadOnlySnakeContract();
    const tokenIds = SNAKE_TYPES.map((s) => s.tokenId);
    console.log("[fetchMySnakes] Checking tokenIds", { tokenIds });

    const accounts = tokenIds.map(() => ownerAddress);
    console.log("[fetchMySnakes] Calling balanceOfBatch", {
      contractAddress,
      ownerAddress,
      tokenIds,
      accountsCount: accounts.length,
    });

    const balances = (await contract.balanceOfBatch(accounts, tokenIds)) as bigint[];
    console.log("[fetchMySnakes] balanceOfBatch result", {
      balances: balances.map((b, i) => ({
        tokenId: tokenIds[i],
        balance: b.toString(),
        balanceNumber: Number(b),
        hasBalance: b > 0n,
      })),
    });

    const owned: SnakeNFT[] = [];
    for (let i = 0; i < tokenIds.length; i++) {
      const tokenId = tokenIds[i];
      const bal = balances[i] ?? 0n;
      if (bal > 0n) {
        const snakeType = SNAKE_TYPES.find((s) => s.tokenId === tokenId);
        if (!snakeType) {
          console.warn(`[fetchMySnakes] No snakeType found for tokenId ${tokenId}`);
          continue;
        }
        const maxEnergy = SNAKE_MAX_ENERGY[tokenId] ?? 5;
        const snake: SnakeNFT = {
          ...snakeType,
          id: `onchain-${ownerAddress}-${tokenId}`,
          xp: 0,
          energy: maxEnergy,
          maxEnergy,
          nextPlayTime: null,
        };
        owned.push(snake);
        console.log(`[fetchMySnakes] Added snake for tokenId ${tokenId}`, {
          tokenId,
          name: snake.name,
          balance: bal.toString(),
        });
      } else {
        console.log(`[fetchMySnakes] No balance for tokenId ${tokenId}`, {
          tokenId,
          balance: bal.toString(),
        });
      }
    }

    console.log("[fetchMySnakes] Final result", {
      ownedCount: owned.length,
      ownedSnakes: owned.map((s) => ({ tokenId: s.tokenId, name: s.name })),
    });

    return owned;
  } catch (error) {
    console.error("[fetchMySnakes] Error during fetch", {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      ownerAddress,
      contractAddress,
    });
    throw error;
  }
}

export async function buySnake(id: number, amount: number) {
  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }
  const ethereum = getEthereum();
  if (!ethereum) {
    throw new Error("MetaMask not detected");
  }
  await ensureArcNetwork(ethereum);
  const contract = await getSnakeContract();
  const price = (await contract.prices(id)) as bigint;
  const totalPrice = price * BigInt(amount);
  const tx = await contract.buy(id, amount, { value: totalPrice });
  return tx.wait();
}

export function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}


