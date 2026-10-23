import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto.js';
import { ChecksService } from './checks.service.js';
import { ChecksPageDto } from './dto/checks-page.dto.js';
import { StatsQueryDto } from './dto/stats-query.dto.js';
import { StatsDto } from './dto/stats.dto.js';

@ApiTags('Checks')
@Controller('monitors/:monitorId')
export class ChecksController {
  constructor(private readonly checksService: ChecksService) {}

  /** List check history of a monitor (newest first, paginated) */
  @Get('checks')
  findByMonitor(
    @Param('monitorId', ParseUUIDPipe) monitorId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<ChecksPageDto> {
    return this.checksService.findByMonitor(monitorId, query);
  }

  /** Uptime and response time stats of a monitor for a period */
  @Get('stats')
  getStats(
    @Param('monitorId', ParseUUIDPipe) monitorId: string,
    @Query() query: StatsQueryDto,
  ): Promise<StatsDto> {
    return this.checksService.getStats(monitorId, query);
  }
}
