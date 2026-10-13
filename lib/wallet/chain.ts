import { createPublicClient, createWalletClient, defineChain, http } from 'viem';
import type { Account, Chain, Hex, PublicClient, Transport, WalletClient } from 'viem';

export const MONAD_TESTNET: Chain = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
    public: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
});

export const MONAD_MAINNET: Chain = defineChain({
  id: 143,
  name: 'Monad',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.monad.xyz'] },
    public: { http: ['https://rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://monadexplorer.com' },
  },
});

export type MonadNetworkKey = 'testnet' | 'mainnet';

export const MONAD_CHAINS: Record<MonadNetworkKey, Chain> = {
  testnet: MONAD_TESTNET,
  mainnet: MONAD_MAINNET,
};

export const MONAD_DEFAULT_RPCS: Record<MonadNetworkKey, string> = {
  testnet: 'https://testnet-rpc.monad.xyz',
  mainnet: 'https://rpc.monad.xyz',
};

export const MONAD_EXPLORERS: Record<MonadNetworkKey, string> = {
  testnet: 'https://testnet.monadexplorer.com',
  mainnet: 'https://monadexplorer.com',
};

export interface MonadConfig {
  network: MonadNetworkKey;
  chain: Chain;
  rpcUrl: string;
  explorerUrl: string;
  pulseTipsAddress: Hex | null;
  postRegistryAddress: Hex | null;
}

export function getMonadConfig(): MonadConfig {
  const network: MonadNetworkKey =
    process.env.EXPO_PUBLIC_MONAD_NETWORK === 'mainnet' ||
    process.env.EXPO_PUBLIC_MONAD_NETWORK === 'public'
      ? 'mainnet'
      : 'testnet';
  const chain = MONAD_CHAINS[network];
  const rpcUrl = process.env.EXPO_PUBLIC_MONAD_RPC_URL || MONAD_DEFAULT_RPCS[network];
  return {
    network,
    chain,
    rpcUrl,
    explorerUrl: MONAD_EXPLORERS[network],
    pulseTipsAddress: (process.env.EXPO_PUBLIC_PULSE_TIPS_ADDRESS ?? null) as Hex | null,
    postRegistryAddress: (process.env.EXPO_PUBLIC_POST_REGISTRY_ADDRESS ?? null) as Hex | null,
  };
}

export function getPublicClient(): PublicClient {
  const { chain, rpcUrl } = getMonadConfig();
  return createPublicClient({ chain, transport: http(rpcUrl) });
}

export function getWalletClient(
  account: Account,
): WalletClient<Transport, Chain, Account> {
  const { chain, rpcUrl } = getMonadConfig();
  return createWalletClient({ account, chain, transport: http(rpcUrl) });
}