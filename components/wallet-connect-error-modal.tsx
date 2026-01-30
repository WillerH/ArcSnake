"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { WalletError } from "@/lib/wallet-errors"

interface WalletConnectErrorModalProps {
  error: WalletError
  onRetry: () => void
  onClose: () => void
  onSwitchWallet: () => void
}

export function WalletConnectErrorModal({
  error,
  onRetry,
  onClose,
  onSwitchWallet,
}: WalletConnectErrorModalProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Wallet connection failed</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">{error.userMessage}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={onRetry} variant="default">
            Try again
          </Button>
          <Button onClick={onSwitchWallet} variant="outline">
            Switch wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
