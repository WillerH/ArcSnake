"use client"

import { useState, useEffect, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useConnect } from "wagmi";
import { WalletConnectErrorModal } from "@/components/wallet-connect-error-modal";
import { normalizeWalletError, type WalletError } from "@/lib/wallet-errors";

export function WalletConnectButton() {
  const { isConnected } = useAccount();
  const { error: connectError, reset: resetConnect } = useConnect();
  const [error, setError] = useState<WalletError | null>(null);
  const [showModal, setShowModal] = useState(false);
  const prevErrorRef = useRef<unknown>(null);

  // Check for provider availability
  const hasProvider = typeof window !== "undefined" && !!window.ethereum;

  useEffect(() => {
    // Only show modal if error changed and is not null
    if (connectError && connectError !== prevErrorRef.current) {
      const normalized = normalizeWalletError(connectError);
      setError(normalized);
      setShowModal(true);
      prevErrorRef.current = connectError;
    } else if (isConnected) {
      // Clear error when successfully connected
      setError(null);
      setShowModal(false);
      prevErrorRef.current = null;
    } else if (!hasProvider && !connectError) {
      // If no provider and no error yet, don't show modal immediately
      // RainbowKit will handle showing its own modal
    }
  }, [connectError, isConnected, hasProvider]);

  const handleRetry = () => {
    setShowModal(false);
    setError(null);
    resetConnect(); // Reset wagmi error state
    // User can click ConnectButton again to retry
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <ConnectButton showBalance={false} />
      {showModal && error && (
        <WalletConnectErrorModal
          error={error}
          onRetry={handleRetry}
          onClose={handleClose}
          onSwitchWallet={handleRetry}
        />
      )}
    </>
  );
}
