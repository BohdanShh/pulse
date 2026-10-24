import { Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PaginationQueryDto } from '../../common/pagination/dtos/pagination-query.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { User } from '../users/entities/user.entity.js';
import { ChecksPageDto } from './dtos/checks-page.dto.js';
import { StatsQueryDto } from './dtos/stats-query.dto.js';
import { StatsDto } from './dtos/stats.dto.js';
import { Check } from './entities/check.entity.js';
import { ChecksService } from './services/checks.service.js';

@ApiTags('Checks')
@Controller('monitors/:monitorId')
export class ChecksController {
  constructor(private readonly checksService: ChecksService) {}

  /** Check the monitor right now and save the result */
  @Post('check')
  runCheck(
    @CurrentUser() user: User,
    @Param('monitorId', ParseUUIDPipe) monitorId: string,
  ): Promise<Check> {
    return this.checksService.runCheck(monitorId, user.id);
  }

  /** List check history of a monitor (newest first, paginated) */
  @Get('checks')
  findByMonitor(
    @CurrentUser() user: User,
    @Param('monitorId', ParseUUIDPipe) monitorId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<ChecksPageDto> {
    return this.checksService.findByMonitor(monitorId, user.id, query);
  }

  /** Uptime and response time stats of a monitor for a period */
  @Get('stats')
  getStats(
    @CurrentUser() user: User,
    @Param('monitorId', ParseUUIDPipe) monitorId: string,
    @Query() query: StatsQueryDto,
  ): Promise<StatsDto> {
    return this.checksService.getStats(monitorId, user.id, query);
  }
}
