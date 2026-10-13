import { create } from 'zustand';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { getAddress } from 'viem';
import type { Account, Hex } from 'viem';
import { mnemonicToAccount, privateKeyToAccount } from 'viem/accounts';
import {
  derivePrivateKey,
  generateMnemonicAndAddress,
  isValidPrivateKey,
  isValidMnemonic,
  walletFromMnemonic,
} from '@/lib/wallet/account';
import { walletVault } from '@/lib/wallet/vault';

export interface WalletSession {
  mnemonic: string;
  address: string;
}

interface WalletState {
  address: string | null;
  hasWallet: boolean;
  unlocked: boolean;
  pendingBackup: string | null;
  bootstrap: () => Promise<void>;
  createWallet: () => Promise<WalletSession>;
  confirmBackup: () => void;
  importWallet: (mnemonic: string) => Promise<string>;
  importPrivateKey: (privateKey: string) => Promise<string>;
  revealMnemonic: () => Promise<string>;
  revealPrivateKey: () => Promise<string>;
  getSigner: () => Promise<Account>;
  authenticate: () => Promise<boolean>;
  clearWallet: () => Promise<void>;
}

async function authenticateBiometrics(): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  const hasHardware = await LocalAuthentication.hasHardwareAsync().catch(() => false);
  if (!hasHardware) {
    // No biometric hardware: the device passcode is the only lock, skip the prompt.
    return true;
  }

  const types = await LocalAuthentication.supportedAuthenticationTypesAsync().catch(() => []);
  const enrolled = await LocalAuthentication.isEnrolledAsync().catch(() => false);
  if (types.length === 0 && !enrolled) {
    return true;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock your Pulse wallet',
    cancelLabel: 'Cancel',
    fallbackLabel: 'Use passcode',
    disableDeviceFallback: false,
  });
  return result.success;
}

function accountFromSecret(secret: string, kind: 'mnemonic' | 'private-key'): Account {
  return kind === 'mnemonic'
    ? mnemonicToAccount(secret)
    : (privateKeyToAccount(secret as Hex) as Account);
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  hasWallet: false,
  unlocked: false,
  pendingBackup: null,

  async bootstrap() {
    const address = await walletVault.readAddress();
    if (address) {
      set({ address, hasWallet: true });
    } else {
      set({ address: null, hasWallet: false });
    }
  },

  async createWallet() {
    // Reuse an existing device wallet instead of generating a new one.
    if (get().address && get().hasWallet) {
      const stored = await walletVault.readSecret();
      if (stored?.kind === 'mnemonic') {
        return { mnemonic: stored.secret, address: get().address as string };
      }
    }

    const { mnemonic, address } = generateMnemonicAndAddress();
    await walletVault.saveSecret(mnemonic, 'mnemonic', address);
    set({ address, hasWallet: true, pendingBackup: mnemonic });
    return { mnemonic, address };
  },

  confirmBackup() {
    set({ pendingBackup: null });
  },

  async importWallet(mnemonic) {
    if (!isValidMnemonic(mnemonic)) {
      throw new Error('Invalid recovery phrase. Check the word order and spelling.');
    }
    const { address, mnemonic: normalized } = walletFromMnemonic(mnemonic);
    await walletVault.saveSecret(normalized, 'mnemonic', address);
    set({ address, hasWallet: true, unlocked: true });
    return address;
  },

  async importPrivateKey(privateKey) {
    if (!isValidPrivateKey(privateKey)) {
      throw new Error('Invalid private key. It must be a 0x-prefixed 64-character hex string.');
    }
    const account = privateKeyToAccount(privateKey.trim() as Hex);
    const address = getAddress(account.address);
    await walletVault.saveSecret(privateKey.trim(), 'private-key', address);
    set({ address, hasWallet: true, unlocked: true });
    return address;
  },

  async revealMnemonic() {
    const stored = await walletVault.readSecret();
    if (!stored) throw new Error('No wallet found on this device');
    if (stored.kind !== 'mnemonic') {
      throw new Error('This wallet was imported with a private key, not a recovery phrase.');
    }
    if (!get().unlocked) {
      const ok = await get().authenticate();
      if (!ok) throw new Error('Authentication cancelled');
    }
    set({ unlocked: true });
    return stored.secret;
  },

  async revealPrivateKey() {
    const stored = await walletVault.readSecret();
    if (!stored) throw new Error('No wallet found on this device');
    if (!get().unlocked) {
      const ok = await get().authenticate();
      if (!ok) throw new Error('Authentication cancelled');
    }
    set({ unlocked: true });
    if (stored.kind === 'private-key') return stored.secret;
    return derivePrivateKey(stored.secret);
  },

  async getSigner() {
    if (!get().unlocked) {
      const ok = await get().authenticate();
      if (!ok) throw new Error('Authentication cancelled');
    }
    const stored = await walletVault.readSecret();
    if (!stored) throw new Error('No wallet found on this device');
    set({ unlocked: true });
    return accountFromSecret(stored.secret, stored.kind);
  },

  async authenticate() {
    return authenticateBiometrics();
  },

  async clearWallet() {
    await walletVault.clear();
    set({ address: null, hasWallet: false, unlocked: false, pendingBackup: null });
  },
}));