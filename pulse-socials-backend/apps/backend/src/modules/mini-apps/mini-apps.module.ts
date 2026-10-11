import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MiniAppsController } from './mini-apps.controller';
import { MiniAppsService } from './mini-apps.service';
import { SwapService } from './swap.service';
import { User, UserSchema } from '../../schemas/user.schema';
import { Swap, SwapSchema } from '../../schemas/swap.schema';
import { MonadModule } from '../monad/monad.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Swap.name, schema: SwapSchema },
    ]),
    MonadModule,
  ],
  controllers: [MiniAppsController],
  providers: [MiniAppsService, SwapService],
  exports: [MiniAppsService, SwapService],
})
export class MiniAppsModule {}
