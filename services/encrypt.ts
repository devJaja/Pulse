/**
 * Encrypt FHE Service (Monad) — MOBILE CLIENT MOCK
 *
 * Enables confidential tips in chat. The FHE/gRPC flow (Encrypt network)
 * runs fully on the Pulse backend; the mobile client simply submits the
 * tip through the normal chat tip endpoint.
 *
 * This module is a dependency-free, Monad-native stub kept for API
 * parity. It performs no network calls and holds no keys.
 */

export interface CiphertextId {
  id: string;
  accountAddress: string;
}

/**
 * Request an encrypted input "ciphertext" for a given MON amount.
 *
 * Mobile client: returns a deterministic placeholder id. The real
 * ciphertext is produced server-side.
 */
export function encryptAmount(amount: number | bigint): CiphertextId {
  const value = typeof amount === 'bigint' ? amount : BigInt(Math.round(amount));
  return {
    id: `mock_encrypt_${value.toString(16)}`,
    accountAddress: 'MOCK_CIPHERTEXT_ACCOUNT',
  };
}

/**
 * Execute a private tip.
 *
 * Mobile client: not executed on device — handled by the backend.
 */
export function executePrivateTip(): { txSignature: string } {
  return { txSignature: 'mock_private_tip_mobile' };
}

/**
 * Read a ciphertext off-chain on behalf of an authorised user.
 *
 * Mobile client: no-op placeholder.
 */
export function readCiphertext(): bigint {
  return BigInt(0);
}