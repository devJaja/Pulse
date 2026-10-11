/**
 * Encrypt FHE Service (Monad)
 *
 * Enables confidential tips in chat. In the pre-alpha environment the
 * Encrypt FHE network is simulated by a self-contained mock that mirrors
 * the Encrypt client API.
 *
 * Pre-alpha goal:
 *   gRPC  : https://pre-alpha-dev-1.encrypt.ika-network.net:443
 *   Chain : Monad (native / ERC-20 transfers)
 *
 * The public surface (`encryptAmount`, `executePrivateTip`,
 * `readCiphertext`, `CiphertextId`) is stable — production wiring can
 * replace the internals without changing any callers.
 *
 * NOTE: No external dependencies — no encrypted-transfer gRPC client.
 */

import * as crypto from 'crypto';
import { type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Derived from the server-side encryption secret so ciphertext accounts are
// deterministic and verifiable, mirroring how the wallet secret is derived.
function privacySecret(): Buffer {
  const key =
    process.env.ENCRYPTION_KEY || 'change-me-change-me-change-me-change-me';
  return crypto.createHash('sha256').update(`pulse:encrypt:${key}`).digest();
}

export interface CiphertextId {
  id: Uint8Array;
  accountAddress: string; // Monad address used as the "ciphertext account"
}

/**
 * Create an encrypted input ciphertext for a given MON amount.
 *
 * In the mock the ciphertext is a deterministic secp256k1 account derived
 * from the amount and the server privacy secret — an opaque identifier
 * that simulates the Encrypt network's ciphertext account.
 */
export function encryptAmount(amount: number | bigint): CiphertextId {
  const value =
    typeof amount === 'bigint' ? amount : BigInt(Math.round(amount));

  const seed = crypto
    .createHash('sha256')
    .update(privacySecret())
    .update(Buffer.from(value.toString(16).padStart(16, '0'), 'hex'))
    .digest();

  const account = privateKeyToAccount(`0x${seed.toString('hex')}` as Hex);

  return {
    id: seed,
    accountAddress: account.address,
  };
}

/**
 * Execute a private tip.
 *
 * In the pre-alpha mock this returns a fake Monad transaction hash.
 * In production it would submit a confidential transfer to the Encrypt
 * network on Monad.
 */
export function executePrivateTip(): { txSignature: string } {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return { txSignature: `0x${randomBytes}` };
}

/**
 * Read a ciphertext off-chain on behalf of an authorised user.
 *
 * In pre-alpha this returns the plaintext directly (mock FHE).
 */
export function readCiphertext(): bigint {
  return BigInt(0);
}
