export interface TokenConfig {
  symbol: string;
  name: string;
  icon: string;
  color: string;
  coingeckoId?: string;
  address?: string;
}

export const TOKENS: TokenConfig[] = [
  {
    symbol: 'MON',
    name: 'Monad',
    icon: '◈',
    color: 'bg-purple-600',
    coingeckoId: 'monad',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    icon: '₮',
    color: 'bg-green-600',
    coingeckoId: 'tether',
    address: process.env.EXPO_PUBLIC_MONAD_USDT_ADDRESS,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    icon: '$',
    color: 'bg-blue-500',
    coingeckoId: 'usd-coin',
    address: process.env.EXPO_PUBLIC_MONAD_USDC_ADDRESS,
  },
  {
    symbol: 'SEEKER',
    name: 'Seeker',
    icon: 'SK',
    color: 'bg-blue-600',
  },
];

export const getTokenBySymbol = (symbol: string): TokenConfig | undefined => {
  return TOKENS.find((token) => token.symbol === symbol);
};

export const getTokenIcon = (symbol: string): string => {
  return getTokenBySymbol(symbol)?.icon || '?';
};

export const getTokenColor = (symbol: string): string => {
  return getTokenBySymbol(symbol)?.color || 'bg-gray-600';
};
