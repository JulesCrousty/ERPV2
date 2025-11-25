import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrPayrollPeriod } from './entities/hr-payroll-period.entity';
import { HrPayrollRule } from './entities/hr-payroll-rule.entity';
import { HrPayrollEmployeeConfig } from './entities/hr-payroll-employee-config.entity';
import { HrPayrollInput } from './entities/hr-payroll-input.entity';
import { HrPayrollResult } from './entities/hr-payroll-result.entity';
import { HrPayrollResultLine } from './entities/hr-payroll-result-line.entity';
import { Company } from '../core/entities/company.entity';
import { User } from '../auth/entities/user.entity';
import { HrEmployee } from '../hr/entities/hr-employee.entity';
import { HrAbsence } from '../hr/entities/hr-absence.entity';
import { HrOvertimeEntry } from '../hr-time/entities/hr-overtime-entry.entity';
import { HrPayrollPeriodsService } from './services/hr-payroll-periods.service';
import { HrPayrollRulesService } from './services/hr-payroll-rules.service';
import { HrPayrollCalculationService } from './services/hr-payroll-calculation.service';
import { HrPayrollResultsService } from './services/hr-payroll-results.service';
import { HrPayrollPeriodsController } from './controllers/hr-payroll-periods.controller';
import { HrPayrollRulesController } from './controllers/hr-payroll-rules.controller';
import { HrPayrollController } from './controllers/hr-payroll.controller';
import { HrPayrollResultsController } from './controllers/hr-payroll-results.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrPayrollPeriod,
      HrPayrollRule,
      HrPayrollEmployeeConfig,
      HrPayrollInput,
      HrPayrollResult,
      HrPayrollResultLine,
      Company,
      User,
      HrEmployee,
      HrAbsence,
      HrOvertimeEntry,
    ]),
  ],
  providers: [
    HrPayrollPeriodsService,
    HrPayrollRulesService,
    HrPayrollCalculationService,
    HrPayrollResultsService,
  ],
  controllers: [
    HrPayrollPeriodsController,
    HrPayrollRulesController,
    HrPayrollController,
    HrPayrollResultsController,
  ],
  exports: [HrPayrollCalculationService],
})
export class HrPayrollModule {}
