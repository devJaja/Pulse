import { bytesToHex, getAddress, isAddress } from 'viem';
import type { Hex } from 'viem';
import {
  english,
  generateMnemonic,
  mnemonicToAccount,
  privateKeyToAccount,
} from 'viem/accounts';
import { validateMnemonic } from '@scure/bip39';

export interface GeneratedWallet {
  mnemonic: string;
  address: string;
  privateKey: string;
}

export function generateMnemonicAndAddress(): { mnemonic: string; address: string } {
  const mnemonic = generateMnemonic(english, 128);
  return { mnemonic, address: getAddress(mnemonicToAccount(mnemonic).address) };
}

export function derivePrivateKey(mnemonic: string): Hex {
  const account = mnemonicToAccount(mnemonic);
  const hdKey = account.getHdKey();
  if (!hdKey.privateKey) {
    throw new Error('Unable to derive private key from recovery phrase');
  }
  return bytesToHex(hdKey.privateKey);
}

export function walletFromMnemonic(mnemonic: string): GeneratedWallet {
  const normalized = mnemonic.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!validateMnemonic(normalized, english)) {
    throw new Error('Invalid recovery phrase. Check the word order and spelling.');
  }
  const account = mnemonicToAccount(normalized);
  return {
    mnemonic: normalized,
    address: getAddress(account.address),
    privateKey: derivePrivateKey(normalized),
  };
}

export function isValidMnemonic(mnemonic: string): boolean {
  return validateMnemonic(mnemonic.trim().toLowerCase().replace(/\s+/g, ' '), english);
}

export function accountFromPrivateKey(privateKey: string) {
  return privateKeyToAccount(privateKey as Hex);
}

export function isValidPrivateKey(privateKey: string): boolean {
  try {
    accountFromPrivateKey(privateKey);
    return true;
  } catch {
    return false;
  }
}

export function isValidAddress(value: string): boolean {
  return isAddress(value);
}