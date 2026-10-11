import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { formatEther } from 'viem';
import { User, UserDocument } from '../../schemas/user.schema';
import { MonadService } from '../monad/monad.service';
import { NotificationsService } from '../notifications/notifications.service';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class BlockchainMonitorService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainMonitorService.name);
  private lastProcessedBlock: bigint | null = null;
  private readonly MAX_BLOCKS_PER_SCAN = 50n;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private monadService: MonadService,
    private notificationsService: NotificationsService,
    private firebaseService: FirebaseService,
  ) {}

  async onModuleInit() {
    this.logger.log('Blockchain Monitor Service initialized');
    // Start monitoring immediately
    await this.monitorIncomingTransactions();
  }

  /**
   * Monitor all user wallets for incoming transactions.
   * Runs every 30 seconds.
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async monitorIncomingTransactions() {
    try {
      // Only monitor users who can receive push notifications
      const users = await this.userModel
        .find({ expoPushToken: { $exists: true, $ne: null } })
        .select('walletAddress expoPushToken username')
        .lean();

      if (users.length === 0) {
        return;
      }

      this.logger.debug(
        `Monitoring ${users.length} wallets for incoming payments`,
      );

      const userByAddress = new Map<string, any>();
      for (const user of users) {
        if (user.walletAddress) {
          userByAddress.set(user.walletAddress.toLowerCase(), user);
        }
      }

      const client = this.monadService.getPublicClient();
      const latest = await client.getBlockNumber();

      // Baseline on first run so we never notify about historical activity.
      if (this.lastProcessedBlock === null) {
        this.lastProcessedBlock = latest;
        return;
      }

      let from = this.lastProcessedBlock + 1n;
      if (from > latest) {
        return;
      }
      if (latest - from > this.MAX_BLOCKS_PER_SCAN) {
        from = latest - this.MAX_BLOCKS_PER_SCAN;
      }

      for (let bn = from; bn <= latest; bn++) {
        const block = await client.getBlock({
          blockNumber: bn,
          includeTransactions: true,
        });

        for (const tx of block.transactions) {
          if (typeof tx === 'string') continue;
          const to = (tx.to || '').toLowerCase();
          const fromAddr = (tx.from || '').toLowerCase();
          const user = userByAddress.get(to);

          if (user && tx.value > 0n && fromAddr !== to) {
            await this.handleIncomingPayment(
              {
                from: tx.from,
                value: tx.value,
                hash: tx.hash,
              },
              user,
            );
          }
        }
      }

      this.lastProcessedBlock = latest;
    } catch (error) {
      this.logger.error(`Error monitoring payments: ${error.message}`);
    }
  }

  /**
   * Handle an incoming payment - send notification.
   */
  private async handleIncomingPayment(payment: any, user: any) {
    try {
      const amountMon = parseFloat(formatEther(payment.value ?? 0n));
      const senderAddress = payment.from;

      // Check if sender is a Pulse user
      const senderUser = await this.userModel
        .findOne({ walletAddress: senderAddress })
        .select('_id username name')
        .lean();

      let message: string;
      const notificationData: any = {
        recipient: user._id,
        type: 'payment_received',
        amount: amountMon,
        signature: payment.hash,
      };

      if (senderUser) {
        message = `${senderUser.username || senderUser.name} sent you ${amountMon.toFixed(4)} MON`;
        notificationData.sender = senderUser._id;
        notificationData.message = message;
      } else {
        message = `You received ${amountMon.toFixed(4)} MON from ${this.shortenAddress(senderAddress)}`;
        notificationData.message = message;
        notificationData.sender = user._id;
      }

      // Send push notification via Firebase
      if (user.expoPushToken) {
        await this.firebaseService.sendPushNotification(
          user.expoPushToken,
          'Payment Received',
          message,
          {
            signature: payment.hash,
            amount: amountMon.toString(),
            type: 'payment',
          },
        );
      }

      // Create in-app notification
      await this.notificationsService.createNotification(notificationData);

      this.logger.log(
        `Notified ${user.username} of incoming ${amountMon.toFixed(4)} MON`,
      );
    } catch (error) {
      this.logger.error(`Error handling incoming payment: ${error.message}`);
    }
  }

  /**
   * Shorten an address for display.
   */
  private shortenAddress(address: string): string {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Manually trigger a check for a specific wallet (useful for testing).
   */
  async checkWalletNow(walletAddress: string) {
    const user = await this.userModel
      .findOne({ walletAddress })
      .select('walletAddress expoPushToken username _id')
      .lean();

    if (!user) {
      throw new Error('User not found');
    }

    await this.monitorIncomingTransactions();
    return { message: 'Wallet checked successfully' };
  }
}
