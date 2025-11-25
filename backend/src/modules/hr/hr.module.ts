import { Module } from '@nestjs/common';
import { HrCoreModule } from './hr-core.module';
import { HrTimeModule } from '../hr-time/hr-time.module';
import { HrPayrollModule } from '../hr-payroll/hr-payroll.module';

@Module({
  imports: [HrCoreModule, HrTimeModule, HrPayrollModule],
})
export class HrModule {}
