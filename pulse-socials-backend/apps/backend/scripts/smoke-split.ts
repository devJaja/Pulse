/**
 * End-to-end PulseTips smoke test on Monad: tip -> tip (split) -> claim.
 * Prints the three tx hashes so they can be cited in the README.
 *
 * Usage: ts-node scripts/smoke-split.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  parseEther,
  formatEther,
  type Hex,
} from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const TIP_ABI = [
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
] as const;

function readContractEnv(): Record<string, string> {
  const envPath = path.join(__dirname, '../../../../contracts/.env');
  const out: Record<string, string> = {};
  if (!fs.existsSync(envPath)) return out;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withRetry<T>(fn: () => Promise<T>, tries = 8): Promise<T> {
  let last: any;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      await sleep(1500 * (i + 1));
    }
  }
  throw last;
}

async function main() {
  const env = { ...readContractEnv(), ...process.env };
  const rpcUrl = env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz';
  const tipsAddress = env.PULSE_TIPS_ADDRESS as Hex;
  const funderKey = (process.env.BENCH_KEY || env.PRIVATE_KEY) as Hex;
  if (!tipsAddress || !funderKey) {
    throw new Error('Missing PULSE_TIPS_ADDRESS / PRIVATE_KEY');
  }

  const chain = defineChain({
    id: 10143,
    name: 'Monad Testnet',
    nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl] } },
  });
  const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });

  const creator = privateKeyToAccount(funderKey);
  const backer = privateKeyToAccount(generatePrivateKey());
  const second = privateKeyToAccount(generatePrivateKey());

  const creatorClient = createWalletClient({
    account: creator,
    chain,
    transport: http(rpcUrl),
  });

  console.log(`creator : ${creator.address}`);
  console.log(`backer  : ${backer.address}`);

  // Fund the two ephemeral tippers.
  for (const w of [backer, second]) {
    const h = await withRetry(() =>
      creatorClient.sendTransaction({
        to: w.address,
        value: parseEther('0.05'),
        chain,
      }),
    );
    await withRetry(() =>
      publicClient.waitForTransactionReceipt({ hash: h }),
    );
  }

  const poolId = BigInt(Date.now());
  const backerClient = createWalletClient({
    account: backer,
    chain,
    transport: http(rpcUrl),
  });
  const secondClient = createWalletClient({
    account: second,
    chain,
    transport: http(rpcUrl),
  });

  // Backer tips first -> creator gets 100% (no earlier backers).
  const tip1 = await withRetry(() =>
    backerClient.writeContract({
      address: tipsAddress,
      abi: TIP_ABI,
      functionName: 'tip',
      args: [poolId, creator.address],
      value: parseEther('0.01'),
      account: backer,
      chain,
    }),
  );
  await withRetry(() =>
    publicClient.waitForTransactionReceipt({ hash: tip1 }),
  );

  // Second tipper tips -> 70/30 split, backer accrues 30% of 0.01.
  const tip2 = await withRetry(() =>
    secondClient.writeContract({
      address: tipsAddress,
      abi: TIP_ABI,
      functionName: 'tip',
      args: [poolId, creator.address],
      value: parseEther('0.01'),
      account: second,
      chain,
    }),
  );
  await withRetry(() =>
    publicClient.waitForTransactionReceipt({ hash: tip2 }),
  );

  const pending = (await withRetry(() =>
    publicClient.readContract({
      address: tipsAddress,
      abi: TIP_ABI,
      functionName: 'pending',
      args: [poolId, backer.address],
    }),
  )) as bigint;

  // Backer claims accrued rewards.
  const claimTx = await withRetry(() =>
    backerClient.writeContract({
      address: tipsAddress,
      abi: TIP_ABI,
      functionName: 'claim',
      args: [poolId],
      account: backer,
      chain,
    }),
  );
  const claimReceipt = await withRetry(() =>
    publicClient.waitForTransactionReceipt({ hash: claimTx }),
  );

  console.log('\n=========== PulseTips smoke test ===========');
  console.log(`poolId           : ${poolId}`);
  console.log(`tip #1 (backer)  : ${tip1}`);
  console.log(`tip #2 (split)   : ${tip2}`);
  console.log(`pending (backer) : ${formatEther(pending)} MON`);
  console.log(`claim tx         : ${claimTx}`);
  console.log(`claim status     : ${claimReceipt.status}`);
  console.log('===========================================\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
