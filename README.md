# Pulse

**Tips that pay the people who found the post early. Built for Monad.**

> Metropolis Hackathon · Track 03 — Social, Attention & Culture
> Team: <team name> · Primary contact: King ([@devJaja](https://github.com/devJaja)) · Org: [Epta-Node](https://github.com/Epta-Node)

| | |
|---|---|
| Live demo | <deployed app URL> |
| Demo video (3 min) | <YouTube / Loom URL> |
| Network | Monad testnet (chain ID 10143) |
| Contracts | See [Deployed Contracts](#deployed-contracts) |
| License | MIT |

---

## 1. The Problem

Social platforms capture the value that communities create. The people who spot a great post *before* it takes off, and whose early attention makes it discoverable, earn nothing. Creators, meanwhile, rely on ad splits or tips that arrive too slowly and cost too much to feel like part of the feed.

Two things have stopped this from working onchain:

1. **Latency and cost.** Tipping has to feel as instant as a "like", or nobody does it.
2. **Onboarding.** Social users do not identify as crypto users and will not manage seed phrases or gas.

## 2. The Solution

Pulse turns every post into a small, transparent revenue-sharing pool.

- A fan tips a post in MON.
- **70%** goes straight to the creator.
- **30%** goes to the post's **earlier supporters**, weighted by how early they tipped.
- Backers claim their earnings any time. Every split is visible onchain.

Discovering great content early is now rewarded, and creators get a reason to build a loyal base. Communities capture the value they create.

**Intended user:** a social media user who has never touched crypto. They sign up with email, get a custodial Monad wallet they never have to manage, tip with one tap, and watch earnings accrue in the feed.

### 2.1 Full Feature Set

Pulse is a complete mobile-first social app, not a single contract. The Pulse mechanism sits at the center of a full social, wallet and rewards experience.

**Status key:** 🆕 built during the hackathon · ♻️ pre-existing Pulse feature, re-wired to Monad during the hackathon · 🛣️ roadmap, not implemented.

| Area | Feature | What it does | Status |
|---|---|---|---|
| **Social** | Feed | Create posts, like, comment, reply and follow. New posts are anchored onchain via `PostRegistry` (best-effort) | ♻️ + 🆕 |
| | Profiles | Creator profiles, follower graph, backing history and post-level claimable rewards | ♻️ + 🆕 |
| **Pulse** | Post backing | Tip a post and become a backer, holding non-transferable shares in its pool that grow as the post gains tips | 🆕 |
| | Early-supporter rewards | 30% of every tip flows to earlier backers, weighted by how early they tipped, with one-tap `claim` in the post view | 🆕 |
| | Post tokenization | Creators can price a post; backer shares are non-transferable position records only (no tradable token) | 🆕 |
| **Payments** | Social tipping | Tips on posts and inside chats, settled in native MON through the deployed `PulseTips` 70/30 split | ♻️ + 🆕 |
| | Integrated wallet | MON balance, send, receive via QR, transaction history. Keys are held by the backend and unlocked with biometrics, so there is no seed-phrase anxiety | ♻️ |
| | Token swaps | Live quotes from DexScreener and CoinGecko with simulated slippage. On-chain router execution is roadmap | 🛣️ |
| | Live prices | Real-time prices from DexScreener and CoinGecko | ♻️ |
| **Messaging** | Real-time chat | Direct messaging with integrated crypto tips, delivered over Pusher | ♻️ |
| **Engagement** | Mini-apps | Spin, coin flip, dice, food and swap mini-apps. Rewards are credited by the backend hot wallet; randomness is server-side and not verifiable onchain | ♻️ |
| **Security** | Account security | Email verification, two-factor authentication (TOTP plus recovery codes), biometric login, recovery phrase support | ♻️ |
| | Passkey / gasless onboarding | Not implemented. Onboarding is email/password plus biometric unlock with a custodial wallet; passkey and sponsored gas are roadmap | 🛣️ |
| **Experience** | Localization | 12 languages (i18next), dark and light themes | ♻️ |
| | Notifications | Push notifications for tips, follows and replies | ♻️ |
| **Indexing** | Event indexer | Backend poller indexes `Tipped`, `Claimed` and `PostRegistered` logs into MongoDB and exposes them via `/indexer` | 🆕 |
| **Roadmap** | Non-custodial custody | dWallet-based custody (Ika) so a compromised backend cannot move funds | 🛣️ pre-alpha, simulated |
| | Confidential tips | Encrypted tip amounts (Encrypt, FHE) | 🛣️ pre-alpha, simulated |

> The roadmap integrations are pre-alpha and are **not** part of what is submitted for judging. The cryptographic guarantees in the current code are simulated.

## 3. Why Monad

Pulse is designed around Monad's properties, not just deployed on it.

| Pulse need | Why Monad fits |
|---|---|
| Tips must appear in the feed in real time | Sub-second blocks and fast finality make a tip feel like a like |
| Micro-tips (cents) must be viable | Low fees make small payments and per-tip splitting economical |
| A busy feed means many posts tipped at once | Parallel execution lets tips on *different* posts proceed concurrently |
| Existing tooling and wallets | Full EVM compatibility: Solidity, Foundry, viem, standard wallets |

**Honest note on contention:** tips to *different* posts touch independent state and parallelize well. Tips to one viral post share that post's pool state and are ordered. The per-tip logic is O(1) (see below), so even a hot post stays cheap. The [Tip Storm](#tip-storm-benchmark) demo measures both cases.

## 4. How It Works

### 4.1 Architecture

```
┌────────────────────────────────────────────────────────┐
│  Client (Expo / React Native, viem)                    │
│  Feed · Chat · Wallet · Swap · Mini-Apps · Profile     │
│  Tip · Back Post · Earnings · Settings (2FA, i18n)     │
│  Custodial wallet with biometric unlock            │
└───────────────┬───────────────────────┬────────────────┘
                │ REST + Pusher         │ JSON-RPC (viem)
                │ (realtime)            │ + event subscription
┌───────────────▼─────────────┐ ┌───────▼────────────────┐
│ Backend (NestJS · MongoDB)  │ │ Monad (EVM)            │
│ Auth, 2FA, profiles, chat,  │ │ PostRegistry           │
│ feed ordering, push         │ │ PulseTips              │
│ notifications, prices       │ │ (native MON)           │
│ (DexScreener / CoinGecko),  │◄┤                        │
│ event indexer               │ │ emits Tipped, Claimed, │
│                             │ │ PostRegistered         │
└─────────────────────────────┘ └────────────────────────┘
```

### 4.2 Contracts

**`PostRegistry`**
- `registerPost(bytes32 postId, string metadataUri)`
- `deactivatePost(bytes32 postId)`
- Stores the creator and a metadata URI, keyed by a `bytes32` id derived from the application post id. Post bodies live offchain; the id anchors them.

**`PulseTips`**
- `tip(uint256 postId, address creator) payable`
- `claim(uint256 postId)`
- `pending(uint256 postId, address backer) → uint256`

### 4.3 The Split Mechanism

On each tip of `amount`:

1. `creatorCut = amount * 70%`, sent to the creator immediately.
2. `backerCut = amount - creatorCut`, added to the post's backer pool.
3. The tipper receives **shares** that decay as the post accumulates tips:

   ```
   shares = amount * K / (K + totalTippedBefore)
   ```

   `K` is a per-post curve constant. The earlier you tip, the more shares each dollar buys.

4. The backer pool is distributed with a reward-per-share accumulator:

   ```
   accRewardPerShare += backerCut * 1e18 / totalShares   // totalShares measured BEFORE this tip
   pending(backer)    = shares[backer] * accRewardPerShare / 1e18 - rewardDebt[backer]
   ```

**Properties**
- **O(1) per tip.** No loops over backers, so gas stays flat as a post grows.
- **No self-dealing on your own tip.** A tipper's shares are added *after* the accumulator update, so they never earn from their own tip.
- **Creators hold no backer shares** on their own posts.
- **First tip:** with no earlier backers, the backer share goes to the creator.
- **Pull-based claims** avoid push-payment failures and reentrancy exposure.

### 4.4 Onboarding & Custody

Onboarding is currently **not** wallet-less. A new user signs up with email/password (plus optional TOTP 2FA); the backend provisions a custodial Monad wallet and encrypts the private key at rest (AES-256-CBC), and the user unlocks the app with biometrics. Tipping is then one tap, paid from that custodial balance — the user never sees a seed phrase or a gas prompt.

Passkey login and sponsored (gasless) transactions are **not implemented** and are on the roadmap. Testnet MON for gas can be dripped from the backend faucet when `BACKEND_SECRET` is configured.

## 5. Deployed Contracts

| Contract | Address | Explorer |
|---|---|---|
| PostRegistry | `0x4a6852164a2aC9108c387D8fb0BC47c35DD9BBfb` | [testnet.monadexplorer.com](https://testnet.monadexplorer.com/address/0x4a6852164a2aC9108c387D8fb0BC47c35DD9BBfb) |
| PulseTips | `0x7d603360E6B4eBea2B83e0B6100dAf2308B04962` | [testnet.monadexplorer.com](https://testnet.monadexplorer.com/address/0x7d603360E6B4eBea2B83e0B6100dAf2308B04962) |
| USDC | n/a — tips settle in native MON | — |

Deployed on Monad testnet (chainId `10143`).

**Sample transactions**

| Action | Tx hash |
|---|---|
| Deploy PostRegistry | `0x137f0c2be94421cd35b513554cf789181019cb0d18229a26bf5857c73ab6d6c8` |
| Deploy PulseTips | `0x3e3b35a5e07f924dd67001edee15984d67f25ef05760c562c2ad0d8f9ca5f570` |
| Tip (first backer, creator gets 100%) | `0x651a59726930058199a1f042f8599b30c937fdb5223a215605fca639de9c703e` |
| Tip (second backer, triggers the 70/30 split) | `0xfba7a5888eaa2977f9d6b1f13d49cad51c6dc645219c61777f6732be7336ef6` |
| Claim (backer withdraws 0.003 MON) | `0xc76cc2a54364873e4dd5933a5a264e90053b3c5d9902dc3ae386c9eada7c9d46` |

The tip→tip→claim hashes above are produced by `scripts/smoke-split.ts` (`pnpm --dir pulse-socials-backend/apps/backend exec ts-node scripts/smoke-split.ts`).

## 6. Tip Storm Benchmark

A script that fires N tips from N wallets in two scenarios:

- **Spread:** each wallet tips a different post.
- **Hot:** all wallets tip the same post.

Measured on Monad testnet (chainId 10143) against the deployed `PulseTips`, and on a local Anvil node for reference. Each run funds N fresh wallets and fires one tip per wallet concurrently.

| Environment | Scenario | Wallets | Time to all confirmed | Throughput | Avg gas / tip |
|---|---|---|---|---|---|
| Monad testnet | Spread (unique pool) | 20 | 7.68 s | 2.6 tips/s | 161,038 |
| Monad testnet | Hot (single pool) | 20 | 2.46 s | 8.1 tips/s | 155,498 |
| Anvil (local) | Spread (unique pool) | 20 | 0.26 s | 78.1 tips/s | 136,255 |
| Anvil (local) | Hot (single pool) | 20 | 0.21 s | 94.3 tips/s | 103,391 |

Notes: testnet figures include public-RPC round-trip latency and will vary per run; gas stays effectively flat as pool contention rises, which is the O(1) property in §4.3. A tip that opens a brand-new pool does slightly more work than one joining an existing pool.

Reproduce: `pnpm bench:storm` (defaults to a local Anvil run) or `pnpm bench:storm -- --target=monad --n=20` to hit the deployed testnet contract.

## 7. Getting Started

**Prerequisites:** Node 18+, pnpm 9+, [Foundry](https://book.getfoundry.sh/)

```bash
git clone <repo-url> && cd Pulse-App
pnpm install

# Contracts
cd contracts
cp ../.env.example .env     # or export MONAD_RPC_URL / PRIVATE_KEY
forge build
forge test -vv
forge script script/Deploy.s.sol --rpc-url $MONAD_RPC_URL --broadcast

# Backend (NestJS + MongoDB)
cd ../pulse-socials-backend/apps/backend
pnpm install
cp .env.example .env        # RPC, deployed contract addresses, JWT secret, Mongo URI
pnpm run build && pnpm run start:prod

# Mobile app (Expo) — run from the repository root
cd ../../..
pnpm start                  # 'a' Android · 'i' iOS · 'w' Web
```

Drop the deployed addresses (`PULSE_TIPS_ADDRESS`, `POST_REGISTRY_ADDRESS`) into the backend `.env`. Required variables are listed in each `.env.example`. **Never commit private keys.**

## 8. Testing

```bash
forge test            # unit + fuzz
forge coverage        # coverage report
```

Current results: **7 Foundry tests pass** (`forge test`) covering split math, early-supporter weighting, the first-tip edge case, claim correctness, zero/dust amounts, and the "nothing to claim" revert. The backend has a Jest smoke test (`pnpm test` in `pulse-socials-backend/apps/backend`). A `forge coverage` percentage is not published yet; run `forge coverage` in `contracts/` to reproduce.

## 9. Technology Stack

| Layer | Choice |
|---|---|
| Chain | Monad (EVM) |
| Contracts | Solidity, Foundry, OpenZeppelin |
| Client | React Native, Expo, Expo Router, NativeWind, TanStack Query, viem |
| Backend | NestJS, MongoDB, log-based event indexer |
| Realtime | Pusher (chat, live feed and tip updates) |
| Auth / wallet | Custodial Monad wallet (AES-encrypted keys), email/password, TOTP 2FA, biometrics |
| Prices | DexScreener, CoinGecko |
| Localization | i18next (12 languages) |
| Settlement | Native MON. No governance or platform token is used. |

## 10. Originality & Build Window

**Built during the hackathon period (Sept 1 – Oct 13, 2026):**
- All smart contracts (`PostRegistry`, `PulseTips`), tests, and deploy scripts
- The Pulse mechanism: backing, early-supporter shares, claims, and the in-app claim/earnings view
- The Monad integration across the whole app: wallet, tipping, and chat tips now settle on Monad; new posts are anchored via `PostRegistry`
- The log-based event indexer and the Tip Storm benchmark

**Pre-existing foundation, disclosed per rules:**
Pulse is built on an existing project (the successor to [Epta-Node/Pulse-social](https://github.com/Epta-Node/Pulse-social)) that originally targeted Stellar. The feature set in §2.1 comes from it. The table below says what existed before and what was added for this hackathon.

| Feature | Before the hackathon | Added during the hackathon |
|---|---|---|
| Feed, profiles, follow graph | Existing screens and backend | Posts anchored onchain via `PostRegistry` |
| Wallet | Stellar wallet and balances | Monad (MON) wallet, send, receive, history |
| Tipping | Stellar tips in posts and chat | MON tips settled by the deployed `PulseTips` 70/30 split, with on-chain backer claims |
| Swaps and prices | Stellar swaps | Monad asset config and DexScreener/CoinGecko price feeds (quotes only) |
| Chat | Pusher real-time chat | Monad-settled chat tips |
| Mini-apps | Existing games | Re-pointed to MON balances |
| Security, i18n, themes, notifications | Existing | Post-level claimable rewards; onboarded to the Monad wallet |
| Pulse mechanism, contracts, indexer, benchmark | None | Everything |

Reused files are listed in `docs/PRE_EXISTING.md`. Third-party libraries are attributed in `package.json` and `foundry.toml`. The commit history in this repository covers the build window.

## 11. AI Tooling Disclosure

AI coding assistants were used for scaffolding, test generation and documentation drafting. All contract logic was reviewed and tested by the team.

## 12. Security Notes & Known Limitations

- Contracts are **unaudited** hackathon code. Do not use with real funds beyond testing.
- Sybil backers: a creator can tip their own post from other wallets and become an "early backer". This only redistributes value from *later* tippers' backer cuts, so the creator cannot extract more than other people paid in, and the 70/30 split bounds what is at stake. Mitigations are on the roadmap.
- Post content is stored offchain; only an application id and metadata URI are anchored onchain.
- No privacy features are claimed. Tip amounts are public.
- Onboarding is custodial: the backend holds encrypted wallet keys. Passkey / gasless (`4.4`) is not implemented.
- Tips settle in native MON. USDC/USDT balances require token addresses to be configured (`MONAD_USDC_ADDRESS`); none are set here.
- The event indexer and the wallet monitor poll over JSON-RPC; they are not reorg-hardened.
- The swap mini-app returns priced quotes with simulated slippage; no onchain DEX router is integrated.
- Mini-game randomness is server-side (`Math.random`) and not verifiable.

## 13. Roadmap

- Per-creator curve parameters and supporter leaderboards
- Reputation-weighted shares to reduce sybil advantage
- Social graph and "backed by people you follow" discovery
- Passkey / embedded-wallet onboarding and sponsored (gasless) transactions
- USDC (and other ERC-20) tipping on top of the same split contract
- On-chain DEX router execution for the swap mini-app
- Verifiable on-chain randomness for mini-games
- Push notifications for claimable backer rewards
- Private tipping, exploring confidential-payment primitives (research only; not implemented)
- Audit and mainnet launch

## 14. Judging Criteria Map

| Criterion (20% each) | Where to look |
|---|---|
| Product Quality & Completeness | Live demo; the full app (§2.1) and the post → tip → split → claim flow in the video |
| Technical Excellence | §4.3 mechanism, O(1) accounting, §8 tests and invariants |
| Monad Integration | §3, §5 contract addresses and tx hashes, §6 benchmark |
| Track Fit & Problem Relevance | §1–2: social attention and creator value, non-crypto users |
| Innovation & Impact | Early-supporter revenue sharing for posts, in a single O(1) primitive |

## 15. Team

| Name | Role | GitHub |
|---|---|---|
| King | Blockchain & full-stack engineer | [@devJaja](https://github.com/devJaja) |
| <name> | <role> | <handle> |

## 16. License

MIT. See [LICENSE](./LICENSE).