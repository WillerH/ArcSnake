"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Download, Wallet } from "lucide-react";
import type { WalletError } from "@/lib/wallet-errors";

interface WalletConnectErrorModalProps {
  error: WalletError | null;
  onRetry: () => void;
  onClose: () => void;
  onSwitchWallet?: () => void;
}

export function WalletConnectErrorModal({
  error,
  onRetry,
  onClose,
  onSwitchWallet,
}: WalletConnectErrorModalProps) {
  if (!error) return null;

  const isInstall = error.action === "install";
  const isUnlock = error.action === "unlock";

  return (
    <Dialog open={!!error} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <DialogTitle className="text-xl">Wallet Connection Issue</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            {error.friendlyMessage}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          {isInstall && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Install a wallet:</p>
              <div className="flex flex-col gap-2">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Download className="w-4 h-4" />
                  Install MetaMask
                </a>
                <a
                  href="https://rabby.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Download className="w-4 h-4" />
                  Install Rabby
                </a>
              </div>
            </div>
          )}

          {isUnlock && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm">
                <strong>How to unlock:</strong>
              </p>
              <ol className="text-sm mt-2 space-y-1 list-decimal list-inside">
                <li>Open your wallet extension (MetaMask/Rabby)</li>
                <li>Enter your password to unlock</li>
                <li>Click "Try again" below</li>
              </ol>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={onRetry}
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>
            {onSwitchWallet && (
              <Button
                onClick={onSwitchWallet}
                variant="outline"
                className="flex-1"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Switch wallet
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
