/**
 * Mapeia erros de conexão de wallet para mensagens amigáveis
 */

export interface WalletError {
  code?: number | string;
  message: string;
  friendlyMessage: string;
  action?: "retry" | "install" | "unlock";
}

export function normalizeWalletError(error: unknown): WalletError {
  const err = error as { code?: number | string; message?: string; reason?: string };

  const message = err.message || err.reason || String(error);
  const code = err.code;

  // 4001: User rejected request
  if (code === 4001 || message.toLowerCase().includes("user rejected") || message.toLowerCase().includes("user denied")) {
    return {
      code: 4001,
      message,
      friendlyMessage: "Você cancelou a conexão.",
      action: "retry",
    };
  }

  // -32002: Request already pending
  if (code === -32002 || message.toLowerCase().includes("pending") || message.toLowerCase().includes("already processing")) {
    return {
      code: -32002,
      message,
      friendlyMessage: "Já existe uma solicitação pendente na sua wallet. Abra a extensão e confirme.",
      action: "retry",
    };
  }

  // Wallet locked / unlock
  if (message.toLowerCase().includes("locked") || message.toLowerCase().includes("unlock") || message.toLowerCase().includes("please unlock")) {
    return {
      code: "LOCKED",
      message,
      friendlyMessage: "Sua wallet está bloqueada. Desbloqueie e tente novamente.",
      action: "unlock",
    };
  }

  // Provider not found
  if (
    message.toLowerCase().includes("not detected") ||
    message.toLowerCase().includes("no provider") ||
    message.toLowerCase().includes("no ethereum") ||
    message.toLowerCase().includes("provider not found") ||
    code === "NO_PROVIDER"
  ) {
    return {
      code: "NO_PROVIDER",
      message,
      friendlyMessage: "Nenhuma wallet detectada. Instale MetaMask ou Rabby para continuar.",
      action: "install",
    };
  }

  // Generic error
  return {
    code: code || "UNKNOWN",
    message,
    friendlyMessage: "Não foi possível conectar à wallet. Verifique se ela está desbloqueada e tente novamente.",
    action: "retry",
  };
}
