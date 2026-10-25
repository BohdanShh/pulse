import { Module } from '@nestjs/common';

import { StatusChangeListener } from './listeners/status-change.listener.js';

@Module({
  providers: [StatusChangeListener],
})
export class AlertsModule {}
