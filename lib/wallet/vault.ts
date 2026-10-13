import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ADDRESS_KEY = 'pulse.wallet.address';
const SECRET_KEY = 'pulse.wallet.secret';
const SECRET_KIND_KEY = 'pulse.wallet.secret.kind';

export type SecretKind = 'mnemonic' | 'private-key';

export interface StoredSecret {
  secret: string;
  kind: SecretKind;
}

const isWeb = Platform.OS === 'web';

const webStorage = {
  async get(key: string): Promise<string | null> {
    if (typeof localStorage === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
  async remove(key: string): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

async function secureGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function secureSet(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {}
}

async function secureRemove(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {}
}

const adapter = isWeb ? webStorage : { get: secureGet, set: secureSet, remove: secureRemove };

/**
 * On-device key vault for self-custody wallets.
 *
 * Native builds use the OS Keychain / Android Keystore via expo-secure-store so
 * the recovery phrase never leaves the device. On web (where a hardware-backed
 * secure store does not exist) it falls back to localStorage — fine for the
 * web demo, but treat the phrase as less protected there.
 */
export const walletVault = {
  isSecure: !isWeb,

  async saveSecret(secret: string, kind: SecretKind, address: string): Promise<void> {
    await adapter.set(SECRET_KEY, secret);
    await adapter.set(SECRET_KIND_KEY, kind);
    await adapter.set(ADDRESS_KEY, address);
  },

  async readSecret(): Promise<StoredSecret | null> {
    const [secret, kind] = await Promise.all([
      adapter.get(SECRET_KEY),
      adapter.get(SECRET_KIND_KEY),
    ]);
    if (!secret) return null;
    return { secret, kind: kind === 'private-key' ? 'private-key' : 'mnemonic' };
  },

  async readAddress(): Promise<string | null> {
    return adapter.get(ADDRESS_KEY);
  },

  async hasWallet(): Promise<boolean> {
    const [address, secret] = await Promise.all([
      adapter.get(ADDRESS_KEY),
      adapter.get(SECRET_KEY),
    ]);
    return !!address && !!secret;
  },

  async clear(): Promise<void> {
    await Promise.all([
      adapter.remove(SECRET_KEY),
      adapter.remove(SECRET_KIND_KEY),
      adapter.remove(ADDRESS_KEY),
    ]);
  },
};