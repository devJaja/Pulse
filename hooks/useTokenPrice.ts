import { useQuery } from '@tanstack/react-query';
import { dexScreenerService } from '@/services/dexscreener';
import { coinGeckoService } from '@/services/coingecko';
import { TOKENS } from '@/lib/tokens';

export function useTokenPrice(address: string) {
  return useQuery({
    queryKey: ['token-price', address],
    queryFn: async () => {
      return dexScreenerService.getTokenByAddress(address);
    },
    enabled: !!address,
    refetchInterval: 30000, // 30 seconds
    staleTime: 20000, // 20 seconds
  });
}

export function useMONPrice() {
  return useQuery({
    queryKey: ['mon-price'],
    queryFn: async () => {
      // Try CoinGecko first (free, no auth required)
      try {
        const coinGeckoPrice = await coinGeckoService.getMONPrice();
        if (coinGeckoPrice > 0) {
          console.log('MON price from CoinGecko:', coinGeckoPrice);
          return coinGeckoPrice;
        }
      } catch (error) {
        console.error('CoinGecko price fetch failed:', error);
      }
      
      // Fallback to DexScreener
      try {
        const dexPrice = await dexScreenerService.getMONPrice();
        if (dexPrice > 0) {
          console.log('MON price from DexScreener:', dexPrice);
          return dexPrice;
        }
      } catch (error) {
        console.error('DexScreener price fetch failed:', error);
      }
      
      console.warn('All price sources failed, returning 0');
      return 0;
    },
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

export function useAllTokenPrices() {
  return useQuery({
    queryKey: ['all-token-prices'],
    queryFn: async () => {
      const prices: Record<string, number> = {};
      
      // Get CoinGecko IDs for tokens that have them
      const coingeckoIds = TOKENS.filter(t => t.coingeckoId).map(t => t.coingeckoId!);
      
      console.log('Fetching prices for tokens:', TOKENS.map(t => ({ symbol: t.symbol, coingeckoId: t.coingeckoId })));
      console.log('CoinGecko IDs to fetch:', coingeckoIds);
      
      try {
        const coingeckoPrices = await coinGeckoService.getMultiplePrices(coingeckoIds);
        console.log('CoinGecko response:', coingeckoPrices);
        
        // Map CoinGecko prices to token symbols
        for (const token of TOKENS) {
          if (token.coingeckoId && coingeckoPrices[token.coingeckoId]) {
            prices[token.symbol] = coingeckoPrices[token.coingeckoId];
            console.log(`Mapped ${token.symbol}: $${coingeckoPrices[token.coingeckoId]}`);
          }
        }
        
        console.log('All token prices after mapping:', prices);
      } catch (error) {
        console.error('Failed to fetch token prices:', error);
      }
      
      // Set default prices for stablecoins if not fetched
      if (!prices['USDT']) {
        prices['USDT'] = 1.0;
        console.log('Set default USDT price: $1.00');
      }
      if (!prices['USDC']) {
        prices['USDC'] = 1.0;
        console.log('Set default USDC price: $1.00');
      }
      if (!prices['SEEKER']) {
        prices['SEEKER'] = 0.0;
        console.log('Set default SEEKER price: $0.00');
      }
      
      console.log('Final token prices:', prices);
      return prices;
    },
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

export function useMultipleTokenPrices(addresses: string[]) {
  return useQuery({
    queryKey: ['token-prices', addresses.join(',')],
    queryFn: () => dexScreenerService.getMultipleTokenPrices(addresses),
    enabled: addresses.length > 0,
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

export function useTrendingTokens() {
  return useQuery({
    queryKey: ['trending-tokens'],
    queryFn: () => dexScreenerService.getTrendingTokens(),
    refetchInterval: 60000, // 1 minute
    staleTime: 45000,
  });
}

export function useTokenSearch(query: string) {
  return useQuery({
    queryKey: ['token-search', query],
    queryFn: () => dexScreenerService.searchTokens(query),
    enabled: query.length > 2,
    staleTime: 30000,
  });
}
