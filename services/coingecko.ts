class CoinGeckoService {
  private baseUrl = 'https://api.coingecko.com/api/v3';

  async getMONPrice(): Promise<number> {
    try {
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=monad&vs_currencies=usd`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        console.error('CoinGecko API error:', response.status);
        return 0;
      }
      
      const data = await response.json();
      const price = data.monad?.usd || 0;
      
      console.log('CoinGecko MON price:', price);
      return price;
    } catch (error) {
      console.error('CoinGecko price error:', error);
      return 0;
    }
  }

  async getMultiplePrices(coingeckoIds: string[]): Promise<Record<string, number>> {
    try {
      const ids = coingeckoIds.join(',');
      console.log('CoinGecko API request for IDs:', ids);
      
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${ids}&vs_currencies=usd`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      
      console.log('CoinGecko API response status:', response.status);
      
      if (!response.ok) {
        console.error('CoinGecko API error:', response.status, response.statusText);
        return {};
      }
      
      const data = await response.json();
      console.log('CoinGecko API raw data:', JSON.stringify(data, null, 2));
      
      const prices: Record<string, number> = {};
      
      for (const id of coingeckoIds) {
        prices[id] = data[id]?.usd || 0;
      }
      
      console.log('CoinGecko multiple prices result:', prices);
      return prices;
    } catch (error) {
      console.error('CoinGecko multiple prices error:', error);
      return {};
    }
  }
}

export const coinGeckoService = new CoinGeckoService();
