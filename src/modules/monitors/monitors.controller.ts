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
  create(@Body() dto: CreateMonitorDto): Promise<Monitor> {
    return this.monitorsService.create(dto);
  }

  /** List all monitors */
  @Get()
  findAll(): Promise<Monitor[]> {
    return this.monitorsService.findAll();
  }

  /** Get a monitor by ID */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Monitor> {
    return this.monitorsService.findOne(id);
  }

  /** Update a monitor (only the fields that are sent) */
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMonitorDto): Promise<Monitor> {
    return this.monitorsService.update(id, dto);
  }

  /** Delete a monitor */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.monitorsService.remove(id);
  }
}
