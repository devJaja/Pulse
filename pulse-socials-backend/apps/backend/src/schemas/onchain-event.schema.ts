import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OnchainEventDocument = OnchainEvent & Document;

/**
 * A decoded on-chain log from the PulseTips / PostRegistry contracts,
 * persisted by the IndexerService so the app can query tipping activity
 * without hitting the RPC on every request.
 */
@Schema({ timestamps: true })
export class OnchainEvent {
  @Prop({ required: true })
  chainId: number;

  @Prop({ required: true })
  contract: string;

  @Prop({ required: true })
  eventName: string;

  @Prop({ required: true })
  blockNumber: number;

  @Prop({ required: true })
  txHash: string;

  @Prop({ required: true })
  logIndex: number;

  @Prop({ type: Object })
  args: Record<string, any>;

  @Prop()
  postId?: string; // application-side post id when resolvable
}

export const OnchainEventSchema = SchemaFactory.createForClass(OnchainEvent);

OnchainEventSchema.index({ txHash: 1, logIndex: 1 }, { unique: true });
OnchainEventSchema.index({ eventName: 1, blockNumber: -1 });
OnchainEventSchema.index({ postId: 1, createdAt: -1 });
