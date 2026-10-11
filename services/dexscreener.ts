import { Token, TokenDetail } from '@/types/token';

class DexScreenerService {
  private baseUrl = 'https://api.dexscreener.com/latest/dex';

  async getTokenByAddress(address: string): Promise<TokenDetail | null> {
    try {
      const response = await fetch(`${this.baseUrl}/tokens/${address}`);
      const data = await response.json();
      
      if (!data.pairs || data.pairs.length === 0) {
        return null;
      }
      
      const pair = data.pairs[0];
      return this.mapPairToToken(pair);
    } catch (error) {
      console.error('DexScreener error for address', address, ':', error);
      return null;
    }
  }

  async searchTokens(query: string): Promise<Token[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      return (data.pairs || []).slice(0, 20).map(this.mapPairToToken);
    } catch (error) {
      console.error('DexScreener search error:', error);
      return [];
    }
  }

  async getTrendingTokens(): Promise<Token[]> {
    try {
      const response = await fetch(`${this.baseUrl}/pairs/monad`);
      const data = await response.json();
      
      if (!data.pairs || data.pairs.length === 0) {
        return this.getPopularTokens();
      }
      
      const tokens = (data.pairs || [])
        .filter((pair: any) => pair.baseToken?.address && pair.priceUsd)
        .slice(0, 20)
        .map(this.mapPairToToken);
      
      return tokens;
    } catch (error) {
      console.error('DexScreener trending error:', error);
      return this.getPopularTokens();
    }
  }

  async getMONPrice(): Promise<number> {
    try {
      const monToken = await this.getTokenByAddress('MON');
      const price = monToken?.price || 0;
      console.log('DexScreener MON price:', price, 'Full data:', monToken);
      return price;
    } catch (error) {
      console.error('DexScreener MON price error:', error);
      return 0;
    }
  }

  async getMultipleTokenPrices(addresses: string[]): Promise<Map<string, TokenDetail>> {
    const priceMap = new Map<string, TokenDetail>();
    
    const promises = addresses.map(address => this.getTokenByAddress(address));
    const results = await Promise.all(promises);
    
    results.forEach((token, index) => {
      if (token) {
        priceMap.set(addresses[index], token);
      }
    });
    
    return priceMap;
  }

  private async getPopularTokens(): Promise<Token[]> {
    const popularTokens = [
      'MON', // Monad (native)
      process.env.EXPO_PUBLIC_MONAD_USDC_ADDRESS || '', // Monad USDC
      process.env.EXPO_PUBLIC_MONAD_USDT_ADDRESS || '', // Monad USDT
    ].filter(Boolean);

    const tokens: Token[] = [];
    for (const address of popularTokens) {
      const token = await this.getTokenByAddress(address);
      if (token) tokens.push(token);
    }
    return tokens;
  }

  private mapPairToToken(pair: any): any {
    const token = pair.baseToken;
    return {
      address: token.address,
      symbol: token.symbol || '',
      name: token.name || '',
      decimals: 18,
      logoURI: pair.info?.imageUrl,
      price: parseFloat(pair.priceUsd || '0'),
      priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
      priceChange1h: parseFloat(pair.priceChange?.h1 || '0'),
      priceChange6h: parseFloat(pair.priceChange?.h6 || '0'),
      volume24h: parseFloat(pair.volume?.h24 || '0'),
      volumeChange24h: 0,
      marketCap: parseFloat(pair.marketCap || '0'),
      liquidity: parseFloat(pair.liquidity?.usd || '0'),
      supply: 0,
      fdv: parseFloat(pair.fdv || '0'),
      txCount24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
      buyCount24h: pair.txns?.h24?.buys || 0,
      sellCount24h: pair.txns?.h24?.sells || 0,
    };
  }
}

export const dexScreenerService = new DexScreenerService();
