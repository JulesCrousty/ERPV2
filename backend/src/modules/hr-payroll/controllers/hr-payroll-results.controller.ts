import { Controller, Get, Param, Post } from '@nestjs/common';
import { HrPayrollResultsService } from '../services/hr-payroll-results.service';

@Controller('hr-payroll/results')
export class HrPayrollResultsController {
  constructor(private readonly resultsService: HrPayrollResultsService) {}

  @Get()
  findAll() {
    return this.resultsService.findAll();
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.resultsService.approve(Number(id));
  }

  @Post(':id/pay')
  markAsPaid(@Param('id') id: string) {
    return this.resultsService.markAsPaid(Number(id));
  }
}
