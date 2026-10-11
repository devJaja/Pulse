import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IndexerService } from './indexer.service';
import { IndexerController } from './indexer.controller';
import {
  OnchainEvent,
  OnchainEventSchema,
} from '../../schemas/onchain-event.schema';
import { Post, PostSchema } from '../../schemas/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OnchainEvent.name, schema: OnchainEventSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [IndexerController],
  providers: [IndexerService],
  exports: [IndexerService],
})
export class IndexerModule {}
