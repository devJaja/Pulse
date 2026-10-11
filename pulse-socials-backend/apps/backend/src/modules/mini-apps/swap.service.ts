import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios from 'axios';

// Monad assets supported by Pulse.
export const MONAD_ASSETS = {
  MON: { code: 'MON', address: null, decimals: 18, coingeckoId: 'monad' },
  USDC: {
    code: 'USDC',
    address: process.env.MONAD_USDC_ADDRESS || null,
    decimals: 6,
    coingeckoId: 'usd-coin',
  },
  USDT: {
    code: 'USDT',
    address: process.env.MONAD_USDT_ADDRESS || null,
    decimals: 6,
    coingeckoId: 'tether',
  },
  SEEKER: { code: 'SEEKER', address: null, decimals: 18, coingeckoId: 'seeker' },
} as const;

export type SupportedToken = keyof typeof MONAD_ASSETS;

// Fallback USD prices (approximate) used only when both price sources fail.
const FALLBACK_PRICES: Record<string, number> = {
  MON: 2.5,
  USDC: 1,
  USDT: 1,
  SEEKER: 0.05,
};

interface DexScreenerPair {
  baseToken?: { symbol?: string; address?: string };
  priceUsd?: string;
}

@Injectable()
export class SwapService {
  private readonly logger = new Logger(SwapService.name);
  private readonly DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';
  private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';
  private priceCache: Map<string, { price: number; timestamp: number }> =
    new Map();
  private readonly CACHE_TTL = 60_000; // 1 minute cache

  /**
   * Get the Monad asset config for a token symbol.
   */
  private getAsset(symbol: string) {
    const asset = MONAD_ASSETS[symbol.toUpperCase() as SupportedToken];
    if (!asset) {
      throw new BadRequestException(`Unknown token: ${symbol}`);
    }
    return asset;
  }

  /**
   * Fetch a token's USD price from DexScreener (Monad pairs), with
   * CoinGecko as a fallback, then a static fallback price.
   */
  async getTokenPrice(tokenSymbol: string): Promise<number> {
    const symbol = tokenSymbol.toUpperCase();
    const cacheKey = `${symbol}_USD`;
    const cached = this.priceCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.price;
    }

    const asset = this.getAsset(symbol);

    // Stablecoins are 1:1 with USD.
    if (symbol === 'USDC' || symbol === 'USDT') {
      this.setCache(cacheKey, 1);
      return 1;
    }

    const price =
      (await this.fetchDexScreenerPrice(symbol)) ??
      (await this.fetchCoinGeckoPrice(asset.coingeckoId)) ??
      FALLBACK_PRICES[symbol];

    if (price > 0) {
      this.setCache(cacheKey, price);
      this.logger.log(`Got price for ${symbol}: $${price}`);
      return price;
    }

    this.logger.warn(`No price available for ${symbol}, using fallback`);
    return FALLBACK_PRICES[symbol] || 0;
  }

  /**
   * Look up a Monad asset price on DexScreener.
   */
  private async fetchDexScreenerPrice(symbol: string): Promise<number | null> {
    try {
      const { data } = await axios.get<{ pairs?: DexScreenerPair[] }>(
        `${this.DEXSCREENER_API}/pairs/monad`,
        { timeout: 5000 },
      );

      const pair = (data.pairs || []).find(
        (p) => p.baseToken?.symbol?.toUpperCase() === symbol,
      );

      if (pair && pair.priceUsd) {
        return parseFloat(pair.priceUsd);
      }
    } catch (error) {
      this.logger.warn(`DexScreener failed for ${symbol}: ${error.message}`);
    }
    return null;
  }

  /**
   * Fall back to CoinGecko simple price endpoint.
   */
  private async fetchCoinGeckoPrice(
    coingeckoId?: string,
  ): Promise<number | null> {
    if (!coingeckoId) return null;
    try {
      const { data } = await axios.get<Record<string, { usd?: number }>>(
        `${this.COINGECKO_API}/simple/price`,
        {
          params: { ids: coingeckoId, vs_currencies: 'usd' },
          timeout: 5000,
        },
      );
      const price = data[coingeckoId]?.usd;
      return typeof price === 'number' && price > 0 ? price : null;
    } catch (error) {
      this.logger.warn(`CoinGecko failed for ${coingeckoId}: ${error.message}`);
      return null;
    }
  }

  private setCache(key: string, price: number) {
    this.priceCache.set(key, { price, timestamp: Date.now() });
  }

  /**
   * Calculate an estimated swap between two supported Monad assets.
   * Prices are USD-based quotes; the actual on-chain trade would be
   * executed against a Monad DEX.
   */
  async calculateSwap(
    fromToken: string,
    toToken: string,
    fromAmount: number,
  ): Promise<{ toAmount: number; rate: number; priceImpact: string }> {
    if (fromAmount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
    if (fromToken === toToken) {
      throw new BadRequestException('Cannot swap same token');
    }

    const fromAsset = this.getAsset(fromToken);
    const toAsset = this.getAsset(toToken);
    this.logger.log(
      `Calculating swap: ${fromAmount} ${fromAsset.code} -> ${toAsset.code}`,
    );

    const fromPrice = await this.getTokenPrice(fromAsset.code);
    const toPrice = await this.getTokenPrice(toAsset.code);

    if (fromPrice <= 0 || toPrice <= 0) {
      throw new BadRequestException('Unable to calculate swap rate');
    }

    const rate = fromPrice / toPrice;
    const toAmount = fromAmount * rate;

    // Approximate simulated slippage for the DEX quote.
    const priceImpact = Math.min(2, fromAmount * 0.001).toFixed(3);

    this.logger.log(
      `Swap calculated: ${fromAmount} ${fromAsset.code} = ${toAmount} ${toAsset.code} (rate: ${rate})`,
    );

    return { toAmount, rate, priceImpact };
  }

  /**
   * Fetch current USD prices for all supported tokens.
   */
  async getAllTokenPrices(): Promise<Record<string, number>> {
    const entries = await Promise.all(
      Object.keys(MONAD_ASSETS).map(async (symbol) => {
        const price = await this.getTokenPrice(symbol);
        return [symbol, price] as const;
      }),
    );

    const prices: Record<string, number> = {};
    for (const [symbol, price] of entries) {
      prices[symbol] = price;
    }

    this.logger.log(`Token prices fetched: ${JSON.stringify(prices)}`);
    return prices;
  }
}
