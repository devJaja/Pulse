import { Controller, Get, Query } from '@nestjs/common';
import { IndexerService } from './indexer.service';

@Controller('indexer')
export class IndexerController {
  constructor(private readonly indexerService: IndexerService) {}

  @Get('status')
  getStatus() {
    return this.indexerService.getStatus();
  }

  @Get('events')
  getEvents(
    @Query('type') type?: string,
    @Query('postId') postId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.indexerService.getRecentEvents(
      type,
      postId,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}
