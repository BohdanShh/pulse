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

import { CreateMonitorDto } from './dto/create-monitor.dto.js';
import { UpdateMonitorDto } from './dto/update-monitor.dto.js';
import { Monitor } from './entities/monitor.entity.js';
import { MonitorsService } from './monitors.service.js';

@Controller('monitors')
export class MonitorsController {
  constructor(private readonly monitorsService: MonitorsService) {}

  @Post()
  create(@Body() dto: CreateMonitorDto): Promise<Monitor> {
    return this.monitorsService.create(dto);
  }

  @Get()
  findAll(): Promise<Monitor[]> {
    return this.monitorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Monitor> {
    return this.monitorsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMonitorDto): Promise<Monitor> {
    return this.monitorsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.monitorsService.remove(id);
  }
}
