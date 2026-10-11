/**
 * Ika dWallet Service (Monad) — MOBILE CLIENT MOCK
 *
 * In production the mobile client never touches private key material;
 * wallet creation and signing are delegated to the Pulse backend via the
 * Ika dWallet (2PC-MPC) network.
 *
 * This module is a dependency-free, Monad-native stub kept for API
 * parity. It performs no network calls and holds no keys.
 */

export interface DWalletInfo {
  dWalletId: string;
  publicKey: string;
  attestation: string;
}

/**
 * Create a dWallet for a new user.
 *
 * Mobile returns a placeholder — the real dWallet is created server-side
 * through the backend's Ika integration.
 */
export function createDWallet(_seedMaterial: string): DWalletInfo {
  return {
    dWalletId: '',
    publicKey: '',
    attestation: '',
  };
}

/**
 * Sign and submit a transfer funded by the user's (encrypted) wallet.
 *
 * Mobile client: no-op placeholder. Actual signing flows through
 * `POST /api/wallet/send` on the backend.
 */
export async function signTransfer(_params: {
  fromAddress: string;
  encryptedSecret: string;
  toAddress: string;
  amount: number;
  memo?: string;
}): Promise<string> {
  throw new Error('Client-side signing is not supported — use the backend wallet API');
}

/**
 * Validate a Monad address.
 */
export function isDwalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}