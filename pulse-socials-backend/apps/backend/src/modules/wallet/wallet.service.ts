import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import {
  Transaction,
  TransactionDocument,
} from '../../schemas/transaction.schema';
import { MonadService } from '../monad/monad.service';
import { SendFundsDto } from './dto/send-funds.dto';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private monadService: MonadService,
  ) {}

  async getBalance(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    try {
      return await this.monadService.getBalance(user.walletAddress);
    } catch (error) {
      this.logger.error(`Failed to get balance: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to get balance');
    }
  }

  async getSeekerBalance(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      balance: user.seekerBalance || 0,
      symbol: 'SEEKER',
    };
  }

  async getTransactions(userId: string, page: number = 1, limit: number = 20) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    try {
      const all = await this.monadService.getTransactions(
        user.walletAddress,
        page * limit,
      );

      // Paginate after fetching from the Monad RPC
      const start = (page - 1) * limit;
      return all.slice(start, start + limit);
    } catch (error) {
      this.logger.error(`Failed to get transactions: ${error.message}`);
      throw new BadRequestException('Failed to get transactions');
    }
  }

  async sendFunds(userId: string, sendFundsDto: SendFundsDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    if (!user.encryptedPrivateKey) {
      throw new BadRequestException(
        'This wallet is self-custodial — sign transactions in the app',
      );
    }

    try {
      if (!this.monadService.isPublicAddress(sendFundsDto.toAddress)) {
        throw new BadRequestException('Invalid recipient address');
      }

      let signature: string;

      if (user.dWalletId) {
        // ── Non-custodial path: Ika dWallet signing (pre-alpha mock) ──────
        const { signTransfer } = await import('../../services/ika.js');
        signature = await signTransfer({
          fromAddress: user.walletAddress,
          encryptedSecret: user.encryptedPrivateKey,
          toAddress: sendFundsDto.toAddress,
          amount: sendFundsDto.amount,
          memo: sendFundsDto.memo ?? '',
        });
        this.logger.log(`Ika signature committed for user ${userId}`);
      } else {
        // ── Custodial path ───────────────────────────────────────────────
        signature = await this.monadService.sendTransaction(
          user.walletAddress,
          user.encryptedPrivateKey,
          sendFundsDto.toAddress,
          sendFundsDto.amount,
          sendFundsDto.memo,
        );
      }

      await this.transactionModel.create({
        user: userId,
        signature,
        type: 'send',
        amount: sendFundsDto.amount,
        fromAddress: user.walletAddress,
        toAddress: sendFundsDto.toAddress,
        status: 'confirmed',
        memo: sendFundsDto.memo,
      });

      return {
        signature,
        amount: sendFundsDto.amount,
        toAddress: sendFundsDto.toAddress,
        status: 'confirmed',
      };
    } catch (error) {
      this.logger.error(`Failed to send funds: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to send funds');
    }
  }

  async sendFundsToUser(
    userId: string,
    username: string,
    amount: number,
    memo?: string,
  ) {
    const sender = await this.userModel.findById(userId);
    if (!sender) {
      throw new BadRequestException('Sender not found');
    }

    const recipient = await this.userModel.findOne({ username });
    if (!recipient) {
      throw new BadRequestException(`User @${username} not found`);
    }

    if (recipient._id.toString() === userId) {
      throw new BadRequestException('Cannot send to yourself');
    }

    try {
      const signature = await this.monadService.sendTransaction(
        sender.walletAddress,
        sender.encryptedPrivateKey,
        recipient.walletAddress,
        amount,
        memo || `Sent to @${username}`,
      );

      await this.transactionModel.create({
        user: userId,
        signature,
        type: 'send',
        amount,
        fromAddress: sender.walletAddress,
        toAddress: recipient.walletAddress,
        status: 'confirmed',
        memo: memo || `Sent to @${username}`,
      });

      return {
        signature,
        amount,
        recipient: {
          username: recipient.username,
          name: recipient.name,
          avatar: recipient.avatar,
          walletAddress: recipient.walletAddress,
        },
        status: 'confirmed',
      };
    } catch (error) {
      this.logger.error(`Failed to send funds to user: ${error.message}`);
      throw new BadRequestException(
        error.message || 'Failed to send funds to user',
      );
    }
  }

  async getTransactionDetails(userId: string, signature: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    try {
      return await this.monadService.getTransactionDetails(signature);
    } catch (error) {
      this.logger.error(`Failed to get transaction details: ${error.message}`);
      throw new BadRequestException('Failed to get transaction details');
    }
  }

  /**
   * One-time migration: return the private key of a legacy custodial account
   * and delete the server-held copy so the user becomes fully self-custodial.
   */
  async exportKey(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.encryptedPrivateKey) {
      throw new BadRequestException(
        'This account is already self-custodial — there is no server-held key to export',
      );
    }

    const privateKey = this.monadService.decryptPrivateKey(
      user.encryptedPrivateKey,
    );
    user.set('encryptedPrivateKey', undefined);
    await user.save();

    this.logger.log(
      `Exported and deleted server-held key for user ${userId} (self-custody migration)`,
    );

    return { privateKey, walletAddress: user.walletAddress };
  }
}
