/**
 * Tip Storm — PulseTips throughput & cost benchmark.
 *
 * Fires N concurrent `tip()` calls at the PulseTips escrow contract in two
 * regimes:
 *   - "spread": every tip targets a different post pool
 *   - "hot":    every tip targets the same post pool (max contention, so the
 *               early-backer 30% reward distribution path is exercised)
 *
 * Usage:
 *   ts-node scripts/bench-storm.ts --target=anvil --n=50
 *   ts-node scripts/bench-storm.ts --target=monad --n=20
 *
 * --target=monad reads MONAD_RPC_URL / PULSE_TIPS_ADDRESS from the
 * environment or ../../contracts/.env, and a funded key from BENCH_KEY (else
 * the contracts/.env PRIVATE_KEY).
 */
import { spawn, type ChildProcess } from 'child_process';
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
import {
  generatePrivateKey,
  privateKeyToAccount,
} from 'viem/accounts';

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
] as const;

const ANVIL_PK =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as Hex;

const ANVIL_CHAIN = defineChain({
  id: 31337,
  name: 'Anvil',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['http://127.0.0.1:8545'] } },
});

const MONAD_CHAIN = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'],
    },
  },
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseArgs() {
  const out: Record<string, string> = {};
  for (const arg of process.argv.slice(2)) {
    const m = arg.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
    else out[arg.replace(/^--/, '')] = 'true';
  }
  return out;
}

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

async function waitForRpc(client: any, tries = 80) {
  for (let i = 0; i < tries; i++) {
    try {
      await client.getBlockNumber();
      return;
    } catch {
      await sleep(250);
    }
  }
  throw new Error('RPC did not become ready');
}

interface ScenarioResult {
  name: string;
  n: number;
  elapsedMs: number;
  tps: number;
  ok: number;
  failed: number;
  avgGas: number;
  avgFeeMon: number;
  avgLatencyMs: number;
}

async function runScenario(opts: {
  name: string;
  wallets: any[];
  chain: any;
  rpcUrl: string;
  publicClient: any;
  tipsAddress: Hex;
  creator: Hex;
  tipAmount: string;
  poolFor: (i: number) => bigint;
}): Promise<ScenarioResult> {
  const {
    name,
    wallets,
    chain,
    rpcUrl,
    publicClient,
    tipsAddress,
    creator,
    tipAmount,
    poolFor,
  } = opts;

  const clients = wallets.map((w) =>
    createWalletClient({ account: w, chain, transport: http(rpcUrl) }),
  );

  const t0 = Date.now();
  const settled = await Promise.allSettled(
    wallets.map(async (_w, i) => {
      const s = Date.now();
      const hash = await clients[i].writeContract({
        address: tipsAddress,
        abi: TIP_ABI,
        functionName: 'tip',
        args: [poolFor(i), creator],
        value: parseEther(tipAmount),
        account: wallets[i],
        chain,
      });
      const r: any = await publicClient.waitForTransactionReceipt({ hash });
      const fee =
        r.gasUsed * (r.effectiveGasPrice ?? r.gasPrice ?? 0n);
      return {
        ok: r.status === 'success',
        gas: Number(r.gasUsed),
        fee,
        ms: Date.now() - s,
      };
    }),
  );
  const elapsedMs = Date.now() - t0;

  const ok = settled
    .filter((s) => s.status === 'fulfilled' && (s as any).value.ok)
    .map((s) => (s as any).value);
  const failed = settled.length - ok.length;

  const avgGas = ok.length
    ? ok.reduce((a, b) => a + b.gas, 0) / ok.length
    : 0;
  const avgFee =
    ok.length
      ? ok.reduce((a, b) => a + b.fee, 0n) / BigInt(ok.length)
      : 0n;
  const avgLatencyMs = ok.length
    ? ok.reduce((a, b) => a + b.ms, 0) / ok.length
    : 0;

  return {
    name,
    n: wallets.length,
    elapsedMs,
    tps: wallets.length / (elapsedMs / 1000),
    ok: ok.length,
    failed,
    avgGas,
    avgFeeMon: Number(formatEther(avgFee)),
    avgLatencyMs,
  };
}

function printResults(target: string, results: ScenarioResult[]) {
  console.log('\n================ Tip Storm results ================');
  console.log(`target: ${target}`);
  for (const r of results) {
    console.log(`\n[${r.name}]`);
    console.log(`  tips             : ${r.ok}/${r.n} ok, ${r.failed} failed`);
    console.log(`  wall time        : ${(r.elapsedMs / 1000).toFixed(2)}s`);
    console.log(`  throughput       : ${r.tps.toFixed(1)} tips/sec`);
    console.log(`  avg confirm time : ${(r.avgLatencyMs / 1000).toFixed(2)}s`);
    console.log(`  avg gas / tip    : ${Math.round(r.avgGas).toLocaleString()}`);
    console.log(`  avg cost / tip   : ${r.avgFeeMon.toFixed(8)} (native)`);
  }
  console.log('===================================================\n');
}

async function main() {
  const args = parseArgs();
  const target = args.target || 'anvil';
  const N = parseInt(args.n || '20', 10);
  const TIP = args.tip || '0.005';
  const FUND = args.fund || '0.08';

  let anvil: ChildProcess | null = null;
  let chain: any;
  let rpcUrl: string;
  let funderKey: Hex;
  let tipsAddress: Hex;

  const artifactPath = path.join(
    __dirname,
    '../../../../contracts/out/PulseTips.sol/PulseTips.json',
  );

  if (target === 'anvil') {
    chain = ANVIL_CHAIN;
    rpcUrl = 'http://127.0.0.1:8545';

    console.log('Starting anvil...');
    anvil = spawn('anvil', ['--port', '8545', '--silent'], {
      stdio: 'ignore',
    });

    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });
    await waitForRpc(publicClient);

    if (!fs.existsSync(artifactPath)) {
      throw new Error(
        `Missing ${artifactPath}. Run \`forge build\` in ./contracts first.`,
      );
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

    funderKey = ANVIL_PK;
    const funder = privateKeyToAccount(funderKey);
    const wc = createWalletClient({
      account: funder,
      chain,
      transport: http(rpcUrl),
    });
    const hash = await wc.deployContract({
      abi: artifact.abi,
      bytecode: artifact.bytecode.object as Hex,
      chain,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    tipsAddress = receipt.contractAddress as Hex;
    console.log(`PulseTips deployed to ${tipsAddress}`);
  } else {
    const env = { ...readContractEnv(), ...process.env };
    rpcUrl = env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz';
    chain = MONAD_CHAIN;
    funderKey = (process.env.BENCH_KEY || env.PRIVATE_KEY) as Hex;
    tipsAddress = env.PULSE_TIPS_ADDRESS as Hex;

    if (!funderKey || !funderKey.startsWith('0x')) {
      throw new Error(
        'Missing funder key: set BENCH_KEY or PRIVATE_KEY in contracts/.env',
      );
    }
    if (!tipsAddress || !tipsAddress.startsWith('0x')) {
      throw new Error('Missing PULSE_TIPS_ADDRESS');
    }
    console.log(`Benchmarking Monad at ${rpcUrl} (PulseTips ${tipsAddress})`);
  }

  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const wallets = Array.from({ length: N }, () =>
    privateKeyToAccount(generatePrivateKey()),
  );
  const creator = privateKeyToAccount(generatePrivateKey())
    .address as Hex;

  // Fund every ephemeral wallet so they can pay value + gas.
  const funder = privateKeyToAccount(funderKey);
  const funderClient = createWalletClient({
    account: funder,
    chain,
    transport: http(rpcUrl),
  });

  console.log(`Funding ${N} wallets with ${FUND} native each...`);
  for (const w of wallets) {
    const h = await funderClient.sendTransaction({
      to: w.address,
      value: parseEther(FUND),
      chain,
    });
    await publicClient.waitForTransactionReceipt({ hash: h });
  }
  console.log('Funding complete.\n');

  const common = {
    wallets,
    chain,
    rpcUrl,
    publicClient,
    tipsAddress,
    creator,
    tipAmount: TIP,
  };

  const spread = await runScenario({
    ...common,
    name: 'spread (unique pool per tip)',
    poolFor: (i) => BigInt(i + 1),
  });

  // Give the network a beat between storms.
  await sleep(1000);

  const hot = await runScenario({
    ...common,
    name: 'hot (single contended pool)',
    poolFor: () => 1n,
  });

  printResults(target, [spread, hot]);

  if (anvil) {
    anvil.kill('SIGTERM');
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
