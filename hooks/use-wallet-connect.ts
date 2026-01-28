"use client"

import { useState, useCallback, useEffect } from "react";
import { useConnect, useDisconnect } from "wagmi";
import { normalizeWalletError, type WalletError } from "@/lib/wallet-errors";

export function useWalletConnect() {
  const { connect, connectors, isPending, error: wagmiError } = useConnect();
  const { disconnect } = useDisconnect();
  const [connectionError, setConnectionError] = useState<WalletError | null>(null);

  const connectWallet = useCallback(
    async (connectorId?: string) => {
      setConnectionError(null);

      // Check if provider exists
      if (typeof window === "undefined" || !window.ethereum) {
        const error = normalizeWalletError(new Error("No provider detected"));
        setConnectionError(error);
        return { success: false, error };
      }

      try {
        // Use first available connector (usually MetaMask) or specified one
        const connector = connectorId
          ? connectors.find((c) => c.id === connectorId)
          : connectors.find((c) => c.id === "metaMask") || connectors[0];

        if (!connector) {
          const error = normalizeWalletError(new Error("No connector available"));
          setConnectionError(error);
          return { success: false, error };
        }

        // Attempt connection
        connect({ connector });

        // Note: wagmi handles the connection asynchronously
        // The error will be available via wagmiError after the attempt
        return { success: true, error: null };
      } catch (error) {
        const normalized = normalizeWalletError(error);
        setConnectionError(normalized);
        return { success: false, error: normalized };
      }
    },
    [connect, connectors]
  );

  // Update connectionError when wagmiError changes
  useEffect(() => {
    if (wagmiError) {
      const normalized = normalizeWalletError(wagmiError);
      setConnectionError(normalized);
    }
  }, [wagmiError]);

  const clearError = useCallback(() => {
    setConnectionError(null);
  }, []);

  return {
    connectWallet,
    disconnect,
    connectionError,
    clearError,
    isConnecting: isPending,
    connectors,
  };
}
