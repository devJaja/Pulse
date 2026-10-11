import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  MonadService,
  PULSE_TIPS_ABI,
  POST_REGISTRY_ABI,
} from '../monad/monad.service';
import {
  OnchainEvent,
  OnchainEventDocument,
} from '../../schemas/onchain-event.schema';
import { Post, PostDocument } from '../../schemas/post.schema';

/**
 * IndexerService continuously reads PulseTips (`Tipped`, `Claimed`,
 * `CreatorRegistered`) and PostRegistry (`PostRegistered`) logs and persists
 * decoded events in MongoDB, keying each event back to the application post
 * where possible. This is the queryable, self-hosted index the app uses for
 * tipping activity and claimable-reward notifications.
 */
@Injectable()
export class IndexerService implements OnModuleInit {
  private readonly logger = new Logger(IndexerService.name);
  private lastProcessedBlock: bigint | null = null;
  private readonly MAX_BLOCKS_PER_SCAN = 300n;

  private readonly pulseTipsEvents = (PULSE_TIPS_ABI as readonly any[]).filter(
    (item) => item.type === 'event',
  );
  private readonly postRegistryEvents = (
    POST_REGISTRY_ABI as readonly any[]
  ).filter((item) => item.type === 'event');

  constructor(
    @InjectModel(OnchainEvent.name)
    private eventModel: Model<OnchainEventDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private monadService: MonadService,
  ) {}

  async onModuleInit() {
    const latest = await this.eventModel
      .findOne()
      .sort({ blockNumber: -1 })
      .select('blockNumber')
      .lean()
      .catch(() => null);

    if (latest) {
      this.lastProcessedBlock = BigInt(latest.blockNumber);
    } else if (process.env.INDEXER_START_BLOCK) {
      this.lastProcessedBlock = BigInt(process.env.INDEXER_START_BLOCK) - 1n;
    }

    this.logger.log(
      `Indexer initialized (resume from ${this.lastProcessedBlock ?? 'head'})`,
    );
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async indexLogs() {
    const pulseTips = this.monadService.getPulseTipsAddress();
    const postRegistry = this.monadService.getPostRegistryAddress();
    if (!pulseTips && !postRegistry) {
      return;
    }

    try {
      const client = this.monadService.getPublicClient();
      const latest = await client.getBlockNumber();

      if (this.lastProcessedBlock === null) {
        // Baseline to the chain head so we never crawl all of history.
        this.lastProcessedBlock = latest;
        return;
      }

      let from = this.lastProcessedBlock + 1n;
      if (from > latest) return;
      if (latest - from > this.MAX_BLOCKS_PER_SCAN) {
        from = latest - this.MAX_BLOCKS_PER_SCAN;
      }

      const logs: any[] = [];

      if (pulseTips) {
        const tipLogs = (await client.getLogs({
          address: pulseTips as `0x${string}`,
          events: this.pulseTipsEvents as any,
          fromBlock: from,
          toBlock: latest,
        })) as any[];
        logs.push(...tipLogs);
      }

      if (postRegistry) {
        const registryLogs = (await client.getLogs({
          address: postRegistry as `0x${string}`,
          events: this.postRegistryEvents as any,
          fromBlock: from,
          toBlock: latest,
        })) as any[];
        logs.push(...registryLogs);
      }

      let stored = 0;
      for (const log of logs) {
        if (await this.persistLog(log)) stored += 1;
      }

      if (stored > 0) {
        this.logger.log(
          `Indexed ${stored} on-chain event(s) in blocks ${from}-${latest}`,
        );
      }

      this.lastProcessedBlock = latest;
    } catch (error) {
      this.logger.error(`Indexer scan failed: ${error.message}`);
    }
  }

  private async persistLog(log: any): Promise<boolean> {
    const eventName = String(log.eventName ?? 'Unknown');
    const args = (log.args ?? {}) as Record<string, any>;

    // Resolve the application-side post id from the bytes32/uint256 pool id.
    let postId: string | undefined;
    if (args.postId !== undefined && args.postId !== null) {
      try {
        const hex = `0x${BigInt(args.postId)
          .toString(16)
          .padStart(64, '0')}`;
        const post = await this.postModel
          .findOne({ onchainPostId: hex })
          .select('_id')
          .lean();
        if (post) postId = post._id.toString();
      } catch {
        // Non-fatal: event is still indexed without a post link.
      }
    }

    const serialised: Record<string, any> = {};
    for (const [key, value] of Object.entries(args)) {
      serialised[key] = typeof value === 'bigint' ? value.toString() : value;
    }

    try {
      await this.eventModel.updateOne(
        { txHash: log.transactionHash, logIndex: log.logIndex },
        {
          $setOnInsert: {
            chainId: this.monadService.getChainId(),
            contract: String(log.address ?? ''),
            eventName,
            blockNumber: Number(log.blockNumber),
            txHash: log.transactionHash,
            logIndex: log.logIndex,
            args: serialised,
            postId,
          },
        },
        { upsert: true },
      );
      return true;
    } catch (error) {
      if (error?.code === 11000) return false; // already indexed
      this.logger.warn(`Failed to persist ${eventName}: ${error.message}`);
      return false;
    }
  }

  async getRecentEvents(eventName?: string, postId?: string, limit = 50) {
    const query: Record<string, any> = {};
    if (eventName) query.eventName = eventName;
    if (postId) query.postId = postId;

    return this.eventModel
      .find(query)
      .sort({ blockNumber: -1, logIndex: -1 })
      .limit(Math.min(limit, 200))
      .lean();
  }

  async getStatus() {
    const [counts, latest] = await Promise.all([
      this.eventModel.aggregate([
        { $group: { _id: '$eventName', count: { $sum: 1 } } },
      ]),
      this.eventModel
        .findOne()
        .sort({ blockNumber: -1 })
        .select('blockNumber')
        .lean(),
    ]);

    return {
      network: this.monadService.getNetwork(),
      chainId: this.monadService.getChainId(),
      contracts: {
        pulseTips: this.monadService.getPulseTipsAddress(),
        postRegistry: this.monadService.getPostRegistryAddress(),
      },
      lastProcessedBlock: this.lastProcessedBlock?.toString() ?? null,
      highestIndexedBlock: latest?.blockNumber ?? null,
      counts: counts.reduce<Record<string, number>>(
        (acc, item) => ({ ...acc, [item._id]: item.count }),
        {},
      ),
    };
  }
}
