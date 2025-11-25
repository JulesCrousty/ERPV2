import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { HrPayrollPeriodsService } from '../services/hr-payroll-periods.service';
import { CreatePayrollPeriodDto } from '../dto/create-payroll-period.dto';

@Controller('hr-payroll/periods')
export class HrPayrollPeriodsController {
  constructor(private readonly periodsService: HrPayrollPeriodsService) {}

  @Post()
  create(@Body() dto: CreatePayrollPeriodDto) {
    return this.periodsService.openPeriod(dto);
  }

  @Post(':id/close')
  close(@Param('id') id: string) {
    return this.periodsService.closePeriod(Number(id));
  }

  @Get()
  findAll() {
    return this.periodsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.periodsService.findOne(Number(id));
  }
}
