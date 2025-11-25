import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateFiPeriodControlDto } from '../dto/create-fi-period-control.dto';
import { UpdateFiPeriodControlDto } from '../dto/update-fi-period-control.dto';
import { FiPeriodControlService } from '../services/fi-period-control.service';

@Controller('fi/period-control')
export class FiPeriodControlController {
  constructor(private readonly fiPeriodControlService: FiPeriodControlService) {}

  @Post()
  create(@Body() dto: CreateFiPeriodControlDto) {
    return this.fiPeriodControlService.create(dto);
  }

  @Get()
  findAll(
    @Query('company_id') companyId?: string,
    @Query('fiscal_year_id') fiscalYearId?: string,
  ) {
    return this.fiPeriodControlService.findAll({
      company_id: companyId ? Number(companyId) : undefined,
      fiscal_year_id: fiscalYearId ? Number(fiscalYearId) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fiPeriodControlService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFiPeriodControlDto) {
    return this.fiPeriodControlService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fiPeriodControlService.remove(id);
  }
}
