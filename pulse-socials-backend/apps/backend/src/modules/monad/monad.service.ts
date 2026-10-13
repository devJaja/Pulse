import { Injectable, Logger } from '@nestjs/common';
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  formatEther,
  formatUnits,
  http,
  isAddress,
  isHex,
  keccak256,
  parseEther,
  toHex,
  type Chain,
  type Hex,
  type PublicClient,
} from 'viem';
import {
  generatePrivateKey,
  privateKeyToAccount,
  type PrivateKeyAccount,
} from 'viem/accounts';
import * as crypto from 'crypto';

export interface MonadAssetBalance {
  code: string;
  contract: string;
  balance: number;
}

interface Erc20Token {
  code: string;
  address: Hex;
  decimals: number;
}

const ERC20_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;

/**
 * PulseTips — 70/30 escrow tipping contract.
 * 70% of every tip goes to the post creator, 30% accrues to earlier
 * supporters who can withdraw it with {claim}.
 */
export const PULSE_TIPS_ABI = [
  {
    type: 'function',
    name: 'tip',
    stateMutability: 'payable',
    inputs: [
      { name: 'postId', type: 'uint256' },
      { name: 'creator', type: 'address' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'claim',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'postId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'pending',
    stateMutability: 'view',
    inputs: [
      { name: 'postId', type: 'uint256' },
      { name: 'backer', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'sharesOf',
    stateMutability: 'view',
    inputs: [
      { name: 'postId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getPool',
    stateMutability: 'view',
    inputs: [{ name: 'postId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'creator', type: 'address' },
          { name: 'totalShares', type: 'uint256' },
          { name: 'totalTipped', type: 'uint256' },
          { name: 'accRewardPerShare', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'creatorOf',
    stateMutability: 'view',
    inputs: [{ name: 'postId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'event',
    name: 'Tipped',
    inputs: [
      { name: 'postId', type: 'uint256', indexed: true },
      { name: 'backer', type: 'address', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'creatorCut', type: 'uint256', indexed: false },
      { name: 'backerCut', type: 'uint256', indexed: false },
      { name: 'shares', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'Claimed',
    inputs: [
      { name: 'postId', type: 'uint256', indexed: true },
      { name: 'backer', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'CreatorRegistered',
    inputs: [
      { name: 'postId', type: 'uint256', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
    ],
  },
] as const;

/**
 * PostRegistry — on-chain anchoring of posts.
 * Each post is keyed by the bytes32 keccak of its application-side id.
 */
export const POST_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'registerPost',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'postId', type: 'bytes32' },
      { name: 'metadataUri', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'isRegistered',
    stateMutability: 'view',
    inputs: [{ name: 'postId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'creatorOf',
    stateMutability: 'view',
    inputs: [{ name: 'postId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'event',
    name: 'PostRegistered',
    inputs: [
      { name: 'postId', type: 'bytes32', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'metadataUri', type: 'string', indexed: false },
    ],
  },
] as const;

const CHAIN_IDS: Record<string, number> = {
  testnet: 10143,
  mainnet: 143,
};

const DEFAULT_RPCS: Record<string, string> = {
  testnet: 'https://testnet-rpc.monad.xyz',
  mainnet: 'https://rpc.monad.xyz',
};

const DEFAULT_EXPLORERS: Record<string, string> = {
  testnet: 'https://testnet.monadexplorer.com',
  mainnet: 'https://monadexplorer.com',
};

/**
 * Monad blockchain service.
 *
 * Custodial wallet model: private keys are AES-256-CBC encrypted at rest and
 * only decrypted in-process when signing. All chain interaction goes through
 * viem against the Monad JSON-RPC endpoint.
 */
@Injectable()
export class MonadService {
  private readonly logger = new Logger(MonadService.name);
  private readonly network: 'testnet' | 'mainnet';
  private readonly rpcUrl: string;
  private readonly explorerUrl: string;
  private readonly explorerApiUrl: string;
  private readonly chain: Chain;
  private readonly publicClient: PublicClient;
  private readonly ENCRYPTION_KEY: Buffer;
  private readonly erc20Tokens: Erc20Token[];
  private readonly airdropAmount: number;
  private readonly pulseTipsAddress: Hex | null;
  private readonly postRegistryAddress: Hex | null;

  constructor() {
    this.network =
      process.env.MONAD_NETWORK === 'mainnet' ||
      process.env.MONAD_NETWORK === 'public'
        ? 'mainnet'
        : 'testnet';

    this.rpcUrl =
      process.env.MONAD_RPC_URL || DEFAULT_RPCS[this.network];
    this.explorerUrl =
      process.env.MONAD_EXPLORER_URL || DEFAULT_EXPLORERS[this.network];
    this.explorerApiUrl = process.env.MONAD_EXPLORER_API_URL || '';

    const chainId = process.env.MONAD_CHAIN_ID
      ? parseInt(process.env.MONAD_CHAIN_ID, 10)
      : CHAIN_IDS[this.network];

    this.chain = defineChain({
      id: chainId,
      name: this.network === 'mainnet' ? 'Monad' : 'Monad Testnet',
      nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
      rpcUrls: { default: { http: [this.rpcUrl] } },
      blockExplorers: {
        default: { name: 'MonadExplorer', url: this.explorerUrl },
      },
      testnet: this.network === 'testnet',
    });

    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(this.rpcUrl),
    });

    const encryptionKey =
      process.env.ENCRYPTION_KEY ||
      '0000000000000000000000000000000000000000000000000000000000000000';
    this.ENCRYPTION_KEY = Buffer.from(encryptionKey, 'hex');

    this.erc20Tokens = (
      [
        { code: 'USDC', env: 'MONAD_USDC_ADDRESS', decimals: 6 },
        { code: 'USDT', env: 'MONAD_USDT_ADDRESS', decimals: 6 },
      ] as const
    )
      .filter((t) => isAddress(process.env[t.env] || ''))
      .map((t) => ({
        code: t.code,
        address: process.env[t.env] as Hex,
        decimals: t.decimals,
      }));

    this.airdropAmount = Number(process.env.AIRDROP_AMOUNT ?? '1');

    this.pulseTipsAddress = isAddress(process.env.PULSE_TIPS_ADDRESS || '')
      ? (process.env.PULSE_TIPS_ADDRESS as Hex)
      : null;
    this.postRegistryAddress = isAddress(
      process.env.POST_REGISTRY_ADDRESS || '',
    )
      ? (process.env.POST_REGISTRY_ADDRESS as Hex)
      : null;

    this.logger.log(
      `Connected to Monad ${this.network} (chainId ${chainId}) via ${this.rpcUrl}`,
    );
    if (this.pulseTipsAddress) {
      this.logger.log(`PulseTips tipping contract: ${this.pulseTipsAddress}`);
    } else {
      this.logger.warn(
        'PULSE_TIPS_ADDRESS not set — tips fall back to plain native transfers (no 70/30 split)',
      );
    }
  }

  getPublicClient(): PublicClient {
    return this.publicClient;
  }

  getChain(): Chain {
    return this.chain;
  }

  getNetwork(): 'testnet' | 'mainnet' {
    return this.network;
  }

  getChainId(): number {
    return this.chain.id;
  }

  getPulseTipsAddress(): string | null {
    return this.pulseTipsAddress;
  }

  getPostRegistryAddress(): string | null {
    return this.postRegistryAddress;
  }

  /**
   * Derive the uint256 pool id used by PulseTips from an application-side
   * identifier (a MongoDB post id, or a synthetic key for chat tips).
   * The same derivation is used by PostRegistry (bytes32), so both contracts
   * key on the identical value.
   */
  poolId(seed: string): bigint {
    return BigInt(keccak256(toHex(seed)));
  }

  getExplorerUrl(): string {
    return this.explorerUrl;
  }

  isPublicAddress(value: string): boolean {
    return typeof value === 'string' && isAddress(value);
  }

  /**
   * Returns the backend hot account used as the fee payer / faucet for
   * internal transfers (signup drips, mini-app payouts, daily claims).
   * Reads a 0x-prefixed secp256k1 private key from BACKEND_SECRET.
   */
  getBackendAccount(): PrivateKeyAccount | null {
    const secret = process.env.BACKEND_SECRET;
    if (!secret || !isHex(secret) || secret.length !== 66) {
      return null;
    }
    try {
      return privateKeyToAccount(secret as Hex);
    } catch {
      return null;
    }
  }

  /**
   * Generate a new Monad (secp256k1) account; the private key is encrypted
   * before storage.
   */
  generateWallet(): { publicKey: string; encryptedPrivateKey: string } {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    const encryptedPrivateKey = this.encrypt(privateKey);

    this.logger.log(`Generated new Monad wallet: ${account.address}`);
    return { publicKey: account.address, encryptedPrivateKey };
  }

  /**
   * Decrypt a server-held private key. Used only for the one-time migration
   * where a legacy custodial account exports its key to the user's device,
   * after which the encrypted copy is deleted.
   */
  decryptPrivateKey(encrypted: string): string {
    return this.decrypt(encrypted);
  }

  /**
   * Get the native MON balance plus configured ERC-20 balances.
   */
  async getBalance(address: string) {
    try {
      const wei = await this.publicClient.getBalance({
        address: address as Hex,
      });
      const native = Number(formatEther(wei));

      const assets: MonadAssetBalance[] = [];
      for (const token of this.erc20Tokens) {
        try {
          const raw = (await this.publicClient.readContract({
            address: token.address,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address as Hex],
          })) as bigint;
          assets.push({
            code: token.code,
            contract: token.address,
            balance: Number(formatUnits(raw, token.decimals)),
          });
        } catch (err) {
          this.logger.warn(
            `Failed to read ${token.code} balance for ${address}: ${err.message}`,
          );
        }
      }

      return {
        walletAddress: address,
        balance: native,
        balanceWei: wei.toString(),
        assets,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get balance for ${address}: ${error.message}`,
      );
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Send native MON from a stored, encrypted private key.
   */
  async sendTransaction(
    fromAddress: string,
    fromEncryptedSecret: string,
    toAddress: string,
    amount: number,
    memo?: string,
  ): Promise<string> {
    try {
      if (!this.isPublicAddress(toAddress)) {
        throw new Error('Invalid recipient address');
      }

      const privateKey = this.decrypt(fromEncryptedSecret) as Hex;
      const account = privateKeyToAccount(privateKey);
      if (account.address.toLowerCase() !== fromAddress.toLowerCase()) {
        throw new Error('Wallet key mismatch with stored address');
      }

      const balance = await this.getBalance(fromAddress);
      if (balance.balance < amount) {
        throw new Error('Insufficient balance');
      }

      const walletClient = createWalletClient({
        account,
        chain: this.chain,
        transport: http(this.rpcUrl),
      });

      const hash = await walletClient.sendTransaction({
        to: toAddress as Hex,
        value: parseEther(String(amount)),
        data: memo ? toHex(memo) : undefined,
      });

      this.logger.log(`Transaction submitted: ${hash}`);
      return hash;
    } catch (error) {
      this.logger.error(`Transaction failed: ${error.message}`);
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  /**
   * Send a tip through the PulseTips 70/30 escrow contract.
   *
   * The sender signs the `tip(postId, creator)` call, so the creator and any
   * accumulated early-backer rewards are handled on-chain. When no
   * PULSE_TIPS_ADDRESS is configured the tip degrades to a plain 100% native
   * transfer so the app keeps working before the contract is deployed.
   */
  async sendTip(
    fromAddress: string,
    fromEncryptedSecret: string,
    poolId: bigint,
    creatorAddress: string,
    amount: number,
    memo?: string,
  ): Promise<string> {
    if (!this.isPublicAddress(creatorAddress)) {
      throw new Error('Invalid recipient address');
    }

    if (!this.pulseTipsAddress) {
      this.logger.warn(
        'PULSE_TIPS_ADDRESS not configured — falling back to plain MON transfer',
      );
      return this.sendTransaction(
        fromAddress,
        fromEncryptedSecret,
        creatorAddress,
        amount,
        memo,
      );
    }

    try {
      const privateKey = this.decrypt(fromEncryptedSecret) as Hex;
      const account = privateKeyToAccount(privateKey);
      if (account.address.toLowerCase() !== fromAddress.toLowerCase()) {
        throw new Error('Wallet key mismatch with stored address');
      }

      const balance = await this.getBalance(fromAddress);
      if (balance.balance < amount) {
        throw new Error('Insufficient balance');
      }

      const walletClient = createWalletClient({
        account,
        chain: this.chain,
        transport: http(this.rpcUrl),
      });

      const hash = await walletClient.writeContract({
        address: this.pulseTipsAddress,
        abi: PULSE_TIPS_ABI,
        functionName: 'tip',
        args: [poolId, creatorAddress as Hex],
        value: parseEther(String(amount)),
      });

      this.logger.log(`Tip submitted via PulseTips: ${hash}`);
      return hash;
    } catch (error) {
      this.logger.error(`Tip transaction failed: ${error.message}`);
      throw new Error(`Tip transaction failed: ${error.message}`);
    }
  }

  /**
   * Rewards currently claimable by a supporter of a given pool, in wei.
   */
  async pendingTip(poolId: bigint, backer: string): Promise<bigint> {
    if (!this.pulseTipsAddress) return 0n;
    return (await this.publicClient.readContract({
      address: this.pulseTipsAddress,
      abi: PULSE_TIPS_ABI,
      functionName: 'pending',
      args: [poolId, backer as Hex],
    })) as bigint;
  }

  /**
   * Withdraw accrued early-backer rewards for a pool.
   */
  async claimTip(
    fromAddress: string,
    fromEncryptedSecret: string,
    poolId: bigint,
  ): Promise<string> {
    if (!this.pulseTipsAddress) {
      throw new Error('PULSE_TIPS_ADDRESS is not configured');
    }

    try {
      const privateKey = this.decrypt(fromEncryptedSecret) as Hex;
      const account = privateKeyToAccount(privateKey);
      if (account.address.toLowerCase() !== fromAddress.toLowerCase()) {
        throw new Error('Wallet key mismatch with stored address');
      }

      const walletClient = createWalletClient({
        account,
        chain: this.chain,
        transport: http(this.rpcUrl),
      });

      const hash = await walletClient.writeContract({
        address: this.pulseTipsAddress,
        abi: PULSE_TIPS_ABI,
        functionName: 'claim',
        args: [poolId],
      });

      this.logger.log(`Claim submitted via PulseTips: ${hash}`);
      return hash;
    } catch (error) {
      this.logger.error(`Claim transaction failed: ${error.message}`);
      throw new Error(`Claim transaction failed: ${error.message}`);
    }
  }

  /**
   * Anchor a post on-chain via PostRegistry (best-effort). Keyed by the same
   * bytes32 id used by PulseTips. Returns the tx hash, or null when the
   * registry is not configured.
   */
  async anchorPost(
    fromAddress: string,
    fromEncryptedSecret: string,
    poolId: bigint,
    metadataUri: string,
  ): Promise<string | null> {
    if (!this.postRegistryAddress) return null;

    const privateKey = this.decrypt(fromEncryptedSecret) as Hex;
    const account = privateKeyToAccount(privateKey);
    if (account.address.toLowerCase() !== fromAddress.toLowerCase()) {
      throw new Error('Wallet key mismatch with stored address');
    }

    const walletClient = createWalletClient({
      account,
      chain: this.chain,
      transport: http(this.rpcUrl),
    });

    const hash = await walletClient.writeContract({
      address: this.postRegistryAddress,
      abi: POST_REGISTRY_ABI,
      functionName: 'registerPost',
      args: [toHex(poolId, { size: 32 }), metadataUri],
    });

    this.logger.log(`Post anchored via PostRegistry: ${hash}`);
    return hash;
  }

  /**
   * Whether a post id has been anchored in PostRegistry.
   */
  async isPostRegistered(poolId: bigint): Promise<boolean> {
    if (!this.postRegistryAddress) return false;
    return (await this.publicClient.readContract({
      address: this.postRegistryAddress,
      abi: POST_REGISTRY_ABI,
      functionName: 'isRegistered',
      args: [toHex(poolId, { size: 32 })],
    })) as boolean;
  }

  /**
   * Get an account's transaction history. Native EVM chains do not expose an
   * account index over JSON-RPC, so this proxies the explorer's
   * Blockscout and Etherscan-compatible API when configured.
   */
  async getTransactions(address: string, limit = 20) {
    if (!this.explorerApiUrl) {
      this.logger.warn(
        'MONAD_EXPLORER_API_URL not set — transaction history unavailable',
      );
      return [];
    }

    try {
      const url = `${this.explorerApiUrl}?module=account&action=txlist&address=${encodeURIComponent(
        address,
      )}&sort=desc&page=1&offset=${limit}`;
      const res = await fetch(url);
      const data: any = await res.json();

      if (data.status !== '1' || !Array.isArray(data.result)) {
        return [];
      }

      return data.result.map((tx: any) => ({
        signature: tx.hash,
        type:
          (tx.to || '').toLowerCase() === address.toLowerCase()
            ? 'receive'
            : 'send',
        amount: Number(formatEther(BigInt(tx.value || '0'))),
        fromAddress: tx.from,
        toAddress: tx.to,
        status: tx.txreceipt_status === '1' ? 'confirmed' : 'failed',
        blockTime: tx.timeStamp
          ? new Date(Number(tx.timeStamp) * 1000).toISOString()
          : null,
        fee: Number(
          formatEther(BigInt(tx.gasUsed || '0') * BigInt(tx.gasPrice || '0')),
        ),
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get transaction history for ${address}: ${error.message}`,
      );
      throw new Error(`Failed to get history: ${error.message}`);
    }
  }

  /**
   * Get a single transaction and its receipt.
   */
  async getTransactionDetails(signature: string) {
    try {
      const hash = signature as Hex;
      const tx = await this.publicClient.getTransaction({ hash });
      const receipt = await this.publicClient
        .getTransactionReceipt({ hash })
        .catch(() => null);
      const block = tx.blockNumber
        ? await this.publicClient.getBlock({ blockNumber: tx.blockNumber })
        : null;

      const memo =
        tx.input && tx.input !== '0x' ? this.hexToUtf8(tx.input) : null;

      return {
        signature: tx.hash,
        successful: receipt?.status === 'success',
        sourceAccount: tx.from,
        ledger: tx.blockNumber ? Number(tx.blockNumber) : null,
        createdAt: block
          ? new Date(Number(block.timestamp) * 1000).toISOString()
          : null,
        fee: Number(
          formatEther((receipt?.gasUsed ?? 0n) * (tx.gasPrice ?? 0n)),
        ),
        memo,
        payments: tx.to
          ? [
              {
                type: 'native',
                from: tx.from,
                to: tx.to,
                amount: Number(formatEther(tx.value)),
                assetType: 'native',
                assetCode: 'MON',
                assetIssuer: null,
              },
            ]
          : [],
      };
    } catch (error) {
      this.logger.error(`Failed to get transaction: ${error.message}`);
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }

  /**
   * Verify a transaction exists on-chain.
   */
  async verifyTransaction(signature: string): Promise<boolean> {
    try {
      await this.publicClient.getTransactionReceipt({
        hash: signature as Hex,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Drip testnet MON from the backend hot wallet (functionally replaces the
   * Monad hot-wallet drip used for signup bonuses and mini-app payouts).
   */
  async requestAirdrop(address: string): Promise<string> {
    if (this.network === 'mainnet' && process.env.ALLOW_MAINNET_AIRDROP !== 'true') {
      throw new Error('Airdrops are not available on mainnet');
    }

    if (!this.isPublicAddress(address)) {
      throw new Error('Invalid recipient address');
    }

    const account = this.getBackendAccount();
    if (!account) {
      throw new Error('Backend signing key (BACKEND_SECRET) is not configured');
    }

    const walletClient = createWalletClient({
      account,
      chain: this.chain,
      transport: http(this.rpcUrl),
    });

    const hash = await walletClient.sendTransaction({
      to: address as Hex,
      value: parseEther(String(this.airdropAmount)),
    });

    this.logger.log(`Airdrop successful: ${hash}`);
    return hash;
  }

  private hexToUtf8(hex: string): string {
    try {
      return Buffer.from(hex.replace(/^0x/, ''), 'hex').toString('utf8');
    } catch {
      return hex;
    }
  }

  /**
   * Encrypt a private key using AES-256-CBC.
   */
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      this.ENCRYPTION_KEY,
      iv,
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt a private key.
   */
  private decrypt(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      this.ENCRYPTION_KEY,
      iv,
    );

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
