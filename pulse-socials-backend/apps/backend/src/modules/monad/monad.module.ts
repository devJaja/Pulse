import { Global, Module } from '@nestjs/common';
import { MonadService } from './monad.service';

@Global()
@Module({
  providers: [MonadService],
  exports: [MonadService],
})
export class MonadModule {}
