# Token Rates (Monad)

All token rates are relative to **MON**. The rate represents how many of the
target token you get for 1 MON (at current USD-equivalent prices).

## Fixed vs. Live Rates

- **USDC / USDT** are pegged at $1.00.
- **MON / SEEKER** use live prices from DexScreener (Monad pairs) with a
  CoinGecko fallback, then a static fallback rate.

### Reference prices (fallback)

| Token | USD price (fallback) |
|-------|----------------------|
| MON   | $0.12                |
| USDC  | $1.00                |
| USDT  | $1.00                |
| SEEKER| $0.05                |

## Example Calculations

#### 1. MON to USDC
- Swap: 1 MON → ? USDC
- `rate = 0.12 / 1 = 0.12`
- Result: 1 MON = 0.12 USDC

#### 2. USDC to MON
- Swap: 0.12 USDC → ? MON
- `rate = 1 / 0.12 = 8.33`
- Result: 0.12 USDC = 1 MON

#### 3. MON to SEEKER
- Swap: 1 MON → ? SEEKER
- `rate = 0.12 / 0.05 = 2.4`
- Result: 1 MON = 2.4 SEEKER

## Verification

- 1 MON should equal ~0.12 USDC
- 0.12 USDC should equal ~1 MON
- 1 MON should equal ~2.4 SEEKER

## Notes

- Rates are USD-equivalent quotes from DexScreener/CoinGecko, not an
  order-book mid. Actual execution uses Monad path payments on the DEX.
- USDC issuer: `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`
- USDT issuer: `GANGSGREXTQ3RGQJKFGN6TZX3XP3YV5TJMGLC3NKAD3QJKZJQTYFGZF`
- See `swap.service.ts` for the exact implementation.