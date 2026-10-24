import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { User } from '../users/entities/user.entity.js';
import { CreateMonitorDto } from './dtos/create-monitor.dto.js';
import { UpdateMonitorDto } from './dtos/update-monitor.dto.js';
import { Monitor } from './entities/monitor.entity.js';
import { MonitorsService } from './services/monitors.service.js';

@ApiTags('Monitors')
@Controller('monitors')
export class MonitorsController {
  constructor(private readonly monitorsService: MonitorsService) {}

  /** Create a monitor */
  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateMonitorDto): Promise<Monitor> {
    return this.monitorsService.create(user.id, dto);
  }

  /** List your monitors */
  @Get()
  findAll(@CurrentUser() user: User): Promise<Monitor[]> {
    return this.monitorsService.findAll(user.id);
  }

  /** Get a monitor by ID */
  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string): Promise<Monitor> {
    return this.monitorsService.findOne(id, user.id);
  }

  /** Update a monitor (only the fields that are sent) */
  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMonitorDto,
  ): Promise<Monitor> {
    return this.monitorsService.update(id, user.id, dto);
  }

  /** Delete a monitor */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.monitorsService.remove(id, user.id);
  }
}
