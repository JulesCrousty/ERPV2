import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { HrPayrollRulesService } from '../services/hr-payroll-rules.service';
import { CreatePayrollRuleDto } from '../dto/create-payroll-rule.dto';

@Controller('hr-payroll/rules')
export class HrPayrollRulesController {
  constructor(private readonly rulesService: HrPayrollRulesService) {}

  @Post()
  create(@Body() dto: CreatePayrollRuleDto) {
    return this.rulesService.create(dto);
  }

  @Get()
  findAll() {
    return this.rulesService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreatePayrollRuleDto>) {
    return this.rulesService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rulesService.remove(Number(id));
  }
}
