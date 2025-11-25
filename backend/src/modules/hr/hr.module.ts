import { Module } from '@nestjs/common';
import { HrCoreModule } from './hr-core.module';

@Module({
  imports: [HrCoreModule],
})
export class HrModule {}
