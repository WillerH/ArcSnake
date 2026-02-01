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

/**
 * Extrai uma mensagem legível de erros de compra (tx rejeitada, saldo insuficiente, revert, etc.).
 */
export function getPurchaseErrorMessage(error: unknown): string {
  if (error == null) return "Purchase failed. Please try again."

  const err = error as { code?: string | number; message?: string; reason?: string; data?: unknown }
  const code = err?.code
  const msg = String(err?.message ?? err?.reason ?? error).toLowerCase()

  // Rejeitado pelo utilizador na MetaMask
  if (code === 4001 || code === "4001" || msg.includes("user rejected") || msg.includes("user denied")) {
    return "Transaction was rejected. Please approve the transaction in your wallet to complete the purchase."
  }

  // Saldo insuficiente
  if (msg.includes("insufficient") || msg.includes("insufficient funds") || msg.includes("exceeds balance")) {
    return "Insufficient balance. Make sure you have enough USDC (or native token) on Arc Testnet to pay for this snake."
  }

  // Rede errada
  if (msg.includes("network") || msg.includes("chain") || msg.includes("wrong chain")) {
    return "Wrong network. Please switch to Arc Testnet in your wallet and try again."
  }

  // Revert do contrato (inclui reason se existir)
  if (msg.includes("revert") || msg.includes("execution reverted")) {
    const reason = err?.reason ?? (typeof err?.data === "string" ? err.data : null)
    if (reason) return `Transaction reverted: ${reason}`
    return "Transaction reverted. The contract rejected the purchase (e.g. wrong price or conditions). Check you are on Arc Testnet and have enough balance."
  }

  // Timeout / não minerada
  if (msg.includes("timeout") || msg.includes("replacement fee")) {
    return "Transaction is taking too long or was replaced. Please try again."
  }

  return err?.message ?? err?.reason ?? String(error)
}
