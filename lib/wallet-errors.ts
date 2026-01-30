/**
 * Normalize wallet connection errors for user-friendly messages.
 */

export interface WalletError {
  code: string
  message: string
  userMessage: string
}

export function normalizeWalletError(error: unknown): WalletError {
  const err = error as { code?: string; message?: string }
  const code = err?.code ?? "UNKNOWN"
  const message = String(err?.message ?? error ?? "Unknown error")

  const userMessages: Record<string, string> = {
    "4001": "Connection was rejected",
    "4100": "Please unlock your wallet",
    "4200": "Wallet not found. Install MetaMask or Rabby.",
    "-32603": "Request failed. Try again or switch wallet.",
    UNKNOWN: "Something went wrong. Try again.",
  }

  return {
    code,
    message,
    userMessage: userMessages[code] ?? userMessages.UNKNOWN,
  }
}
