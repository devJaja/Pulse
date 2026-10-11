// Monad Network Configuration
export const monadConfig = {
  rpc: {
    mainnet: 'https://rpc.monad.xyz',
    testnet: 'https://testnet-rpc.monad.xyz',
  },
  explorer: {
    mainnet: 'https://monadexplorer.com',
    testnet: 'https://testnet.monadexplorer.com',
  },
  chainId: {
    mainnet: 143,
    testnet: 10143,
  },
  dexscreener: {
    baseUrl: 'https://api.dexscreener.com/latest/dex',
    chain: 'monad', // DexScreener chain id for default/popular Monad market pairs
  },
} as const;
