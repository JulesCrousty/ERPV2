import { Module } from '@nestjs/common';
import { HrCoreModule } from './hr-core.module';
import { HrTimeModule } from '../hr-time/hr-time.module';

@Module({
  imports: [HrCoreModule, HrTimeModule],
})
export class HrModule {}
