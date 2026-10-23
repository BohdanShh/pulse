import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto.js';
import { ChecksService } from './checks.service.js';
import { ChecksPageDto } from './dto/checks-page.dto.js';

@ApiTags('Checks')
@Controller('monitors/:monitorId/checks')
export class ChecksController {
  constructor(private readonly checksService: ChecksService) {}

  /** List check history of a monitor (newest first, paginated) */
  @Get()
  findByMonitor(
    @Param('monitorId', ParseUUIDPipe) monitorId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<ChecksPageDto> {
    return this.checksService.findByMonitor(monitorId, query);
  }
}
