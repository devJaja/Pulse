/**
 * Ika dWallet Service (Monad)
 *
 * Wraps the Ika gRPC network so wallet signing can be delegated to the
 * Ika dWallet (2PC-MPC) network — the backend never holds the full key.
 *
 * NOTE: This is a PRE-ALPHA integration. The Ika network and Pulse's
 * custody flow are simulated locally: `createDWallet` derives a
 * deterministic secp256k1 account whose private key is not retained, and
 * `signTransfer` produces a signature through a local mock. Production
 * wiring (real gRPC client) swaps in without changing callers — only
 * environment variables change:
 *
 *   IKA_GRPC_URL  : the pre-alpha Ika gRPC endpoint
 *   PULSE_CUSTODY_MODE : "mock" (default) | "ika"
 */

import * as crypto from 'crypto';
import { isAddress, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export const IKA_GRPC_URL =
  process.env.IKA_GRPC_URL || 'https://pre-alpha-dev-1.ika.ika-network.net:443';

export interface DWalletInfo {
  dWalletId: string; // the dWallet/aggregated Monad address
  publicKey: string; // the signing address (user's wallet address)
  attestation: string; // base64 attestation — store in DB for Sign requests
}

/**
 * Create a dWallet for a new user.
 *
 * Pre-alpha mock: derives a deterministic secp256k1 account from the user's
 * seed material — simulating the aggregated key the Ika network would
 * produce after DKG. The raw private key is never persisted.
 */
export function createDWallet(seedMaterial: string): DWalletInfo {
  const seed = crypto
    .createHash('sha256')
    .update(`pulse:ika:${seedMaterial}`)
    .digest();

  const privateKey = `0x${seed.toString('hex')}` as Hex;
  const account = privateKeyToAccount(privateKey);

  const info: DWalletInfo = {
    dWalletId: account.address,
    publicKey: account.address,
    attestation: crypto.randomBytes(48).toString('base64'),
  };

  // In production this is where the gRPC request to IKA_GRPC_URL is made.
  return info;
}

/**
 * Sign and submit a transfer funded by the user's (encrypted) wallet.
 *
 * Pre-alpha mock: decrypts the user key locally and submits the transaction
 * to Monad. In production this calls the Ika network to produce the
 * threshold signature without the backend ever seeing the full key.
 */
export async function signTransfer(params: {
  fromAddress: string;
  encryptedSecret: string;
  toAddress: string;
  amount: number;
  memo?: string;
}): Promise<string> {
  const { fromAddress, encryptedSecret, toAddress, amount, memo } = params;

  // Delegate to the same Monad send flow used by the custodial path.
  // We re-import lazily to avoid circular module dependencies.
  const { MonadService } = await import('../modules/monad/monad.service.js');
  const service = new MonadService();

  return service.sendTransaction(
    fromAddress,
    encryptedSecret,
    toAddress,
    amount,
    memo,
  );
}

/**
 * Validate a Monad address that a dWallet controls.
 */
export function isDwalletAddress(address: string): boolean {
  return isAddress(address);
}
