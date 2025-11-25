import { Body, Controller, Post } from '@nestjs/common';
import { HrPayrollCalculationService } from '../services/hr-payroll-calculation.service';
import { GeneratePayrollDto } from '../dto/generate-payroll.dto';

@Controller('hr-payroll/calculate')
export class HrPayrollController {
  constructor(private readonly payrollCalculationService: HrPayrollCalculationService) {}

  @Post()
  generate(@Body() dto: GeneratePayrollDto) {
    return this.payrollCalculationService.generatePayroll(dto.period_id, dto.employee_ids);
  }
}
